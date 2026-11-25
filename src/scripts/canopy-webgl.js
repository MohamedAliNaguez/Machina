import * as THREE from 'three';
import skins from '../data/history-skins.json';
import {
  canopyNodes,
  canopyStems,
  arcSampler,
  bendCurve,
  ease,
  clamp,
} from '../lib/canopy-geometry';
import { withBase } from '../lib/paths';

/** Independently skinned CGI surfaces; every branch is a deforming mesh, not a page image. */
export async function createCanopyRenderer(root) {
  const mobile = matchMedia('(max-width: 900px)').matches;
  const host = root.querySelector('.living-visual'),
    svg = root.querySelector('.living-tree');
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'living-branch-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(0, 1536, 765, 0, 1, 3000);
  camera.position.set(0, 0, 1500);
  camera.lookAt(0, 0, 0);
  const loader = new THREE.TextureLoader();
  let textures;
  try {
    textures = await Promise.all(
      ['trunk-skin', ...canopyNodes.slice(1).map((_, i) => 'branch-skin-' + (i + 1))].map(
        async (name) => {
          const texture = await loader.loadAsync(
            withBase('/images/history/' + name + (mobile ? '-mobile' : '') + '.webp'),
          );
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          return texture;
        },
      ),
    );
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  // Upload textures in separate tasks so one first frame cannot monopolize input.
  for (const texture of textures) {
    renderer.initTexture(texture);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const columns = mobile ? 60 : 88,
    rows = mobile ? 16 : 20;
  function makeSurface(name, index, trunk) {
    const geometry = new THREE.BufferGeometry(),
      positions = new Float32Array((columns + 1) * (rows + 1) * 3),
      uv = [],
      indices = [];
    for (let y = 0; y <= rows; y++)
      for (let x = 0; x <= columns; x++) uv.push(x / columns, y / rows);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        const a = y * (columns + 1) + x,
          b = a + columns + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({
      map: textures[index],
      transparent: true,
      alphaTest: 0.035,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = trunk ? 10 : 2;
    scene.add(mesh);
    return { name, index, trunk, geometry, positions, mesh, material };
  }
  const surfaces = [
    makeSurface('trunk-skin', 0, true),
    ...canopyNodes.slice(1).map((_, i) => makeSurface('branch-skin-' + (i + 1), i + 1, false)),
  ];
  // Precompile without stalling the first displayed frame when the GPU supports it.
  try {
    await renderer.compileAsync(scene, camera);
  } catch (error) {
    surfaces.forEach((surface) => {
      surface.geometry.dispose();
      surface.material.dispose();
    });
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    throw error;
  }
  function profile(values, t) {
    const x = clamp(t) * 80,
      i = Math.min(79, Math.floor(x));
    return values[i] + (values[i + 1] - values[i]) * (x - i);
  }
  function render(progress, life) {
    for (const surface of surfaces) {
      const { trunk, index, positions, geometry } = surface;
      const node = trunk ? canopyStems[0] : canopyNodes[index];
      const growth = trunk
        ? ease(clamp(progress * 1.55))
        : ease(clamp((progress - (0.075 + index * 0.105)) / 0.22));
      const sway =
        Math.sin(life / (trunk ? 3300 : 2700) + (trunk ? 0 : index * 0.7)) *
        (trunk ? 1.1 : 2.1) *
        growth;
      const sample = arcSampler(bendCurve(node.curve, sway)),
        meta = skins[surface.name];
      const right = trunk || node.curve[3][0] > node.curve[0][0];
      let length = 0,
        previous = sample(0);
      for (let i = 1; i <= 20; i++) {
        const p = sample(i / 20);
        length += Math.hypot(p[0] - previous[0], p[1] - previous[1]);
        previous = p;
      }
      const span = trunk ? 560 : (meta.height / meta.width) * length * 0.94;
      surface.mesh.visible = growth > 0.001;
      const frames = Array.from({ length: trunk ? rows + 1 : columns + 1 }, (_, i) => {
        const along = trunk ? i / rows : right ? i / columns : 1 - i / columns;
        const t = along * growth,
          p = sample(t),
          a = sample(Math.max(0, t - 0.001)),
          b = sample(Math.min(1, t + 0.001));
        const dx = b[0] - a[0],
          dy = b[1] - a[1],
          m = Math.hypot(dx, dy) || 1;
        return { along, p, dx, dy, m };
      });
      for (let y = 0; y <= rows; y++)
        for (let x = 0; x <= columns; x++) {
          const u = x / columns,
            v = y / rows;
          const { along, p, dx, dy, m } = frames[trunk ? y : x];
          let px, py;
          if (trunk) {
            const offset = (u - 0.5) * span * (0.25 + 0.75 * growth);
            px =
              825 +
              offset +
              35 * v * growth +
              Math.sin(v * Math.PI) * -10 * growth +
              Math.sin(life / 3300 + v * 2) * v * 1.1;
            py = 620 - v * 610 * growth;
          } else {
            const offset = (v - profile(meta.spine, u)) * span * (0.4 + 0.6 * growth);
            const handed = right ? -1 : 1;
            px = p[0] - (dy / m) * offset * handed;
            py = p[1] + (dx / m) * offset * handed;
          }
          const k = (y * (columns + 1) + x) * 3;
          positions[k] = px;
          positions[k + 1] = 765 - py;
          positions[k + 2] =
            Math.sin(along * Math.PI) * 8 + Math.sin(life / 3000 + along * 3 + index) * 0.8;
        }
      geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  const resize = () => {
    const box = svg.getBoundingClientRect();
    renderer.setSize(Math.max(1, box.width), Math.max(1, box.height), false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(svg);
  resize();
  host.prepend(renderer.domElement);
  root.dataset.renderer = 'webgl';
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    root.dataset.renderer = 'svg';
    renderer.domElement.style.display = 'none';
  });
  return {
    render,
    dispose() {
      observer.disconnect();
      surfaces.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
