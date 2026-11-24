// Independently authored visual approximation from owner-supplied photographs.
// Arbitrary modelling units: these are not measured product dimensions.
import * as T from 'three';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';

const folder = 'meshy_output/cement-bulker';
const target = `${folder}/technicsan-cement-bulker.glb`;
if (
  await access(target)
    .then(() => true)
    .catch(() => false)
)
  throw new Error('Model already exists; choose a new output before rebuilding.');
await mkdir(folder, { recursive: true });
const scene = new T.Scene();
const mat = (color, metalness = 0, roughness = 0.45) =>
  new T.MeshStandardMaterial({ color, metalness, roughness });
const white = mat('#f4f5f1', 0.18, 0.3),
  black = mat('#191e20', 0.05, 0.72),
  silver = mat('#b4bfc3', 0.8, 0.26),
  red = mat('#ba231c'),
  blue = mat('#126394');
function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new T.Mesh(geometry, material);
  object.position.set(...position);
  object.rotation.set(...rotation);
  scene.add(object);
  return object;
}
const box = (size, material, position, rotation) =>
  mesh(new T.BoxGeometry(...size), material, position, rotation);
const cylinder = (radius, height, material, position, rotation) =>
  mesh(new T.CylinderGeometry(radius, radius, height, 32), material, position, rotation);
const pipe = (points, radius, material) =>
  mesh(
    new T.TubeGeometry(
      new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
      64,
      radius,
      8,
      false,
    ),
    material,
  );

// Continuous upper barrel and variable-depth lower belly.
const positions = [],
  indices = [],
  rings = 48,
  segments = 64;
for (let i = 0; i <= rings; i++) {
  const x = -4.65 + (i / rings) * 9.3;
  const belly = 0.88 + 0.9 * Math.max(0, 1 - Math.abs(x + 0.3) / 4.7);
  for (let j = 0; j <= segments; j++) {
    const a = (j / segments) * Math.PI * 2;
    positions.push(x, 2.72 + Math.sin(a) * (Math.sin(a) >= 0 ? 1.08 : belly), Math.cos(a) * 1.12);
  }
}
for (let i = 0; i < rings; i++)
  for (let j = 0; j < segments; j++) {
    const a = i * (segments + 1) + j,
      b = a + segments + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
const body = new T.BufferGeometry();
body.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
body.setIndex(indices);
body.computeVertexNormals();
mesh(body, white);
for (const x of [-4.65, 4.65]) {
  const cap = mesh(new T.SphereGeometry(1, 48, 24), white, [x, 2.72, 0]);
  cap.scale.set(0.3, 1.08, 1.12);
}
for (const z of [-0.82, 0.82]) box([9.8, 0.18, 0.14], white, [0, 1.22, z]);
for (const x of [-4.5, -2.5, 0, 2, 4.5]) box([0.14, 0.17, 1.8], white, [x, 1.22, 0]);
for (const x of [1.45, 2.65, 3.85]) {
  cylinder(0.105, 2.35, black, [x, 0.66, 0], [Math.PI / 2, 0, 0]);
  for (const side of [-1, 1]) {
    for (const z of [0.92, 1.24]) {
      cylinder(0.64, 0.28, black, [x, 0.66, side * z], [Math.PI / 2, 0, 0]);
      cylinder(0.43, 0.285, silver, [x, 0.66, side * z], [Math.PI / 2, 0, 0]);
    }
    const z = side * 1.395;
    cylinder(0.21, 0.08, black, [x, 0.66, z], [Math.PI / 2, 0, 0]);
    for (let a = 0; a < 10; a++) {
      const r = (a / 10) * Math.PI * 2;
      cylinder(
        0.027,
        0.03,
        silver,
        [x + Math.cos(r) * 0.29, 0.66 + Math.sin(r) * 0.29, z + side * 0.025],
        [Math.PI / 2, 0, 0],
      );
    }
    box([1.08, 0.07, 0.46], white, [x, 1.36, side * 1.16]);
  }
}
for (const side of [-1, 1]) {
  box([0.14, 0.85, 0.14], black, [-3.15, 0.68, side * 0.75]);
  box([0.48, 0.08, 0.4], black, [-3.15, 0.25, side * 0.75]);
  pipe(
    [
      [-4.4, 1.65, side * 1.12],
      [-2.8, 1.42, side * 1.21],
      [0, 1.28, side * 1.24],
      [3.8, 1.65, side * 1.22],
      [4.5, 1.85, side * 1.13],
    ],
    0.065,
    side === 1 ? blue : white,
  );
  pipe(
    [
      [-4.45, 2.1, side * 0.98],
      [-2.5, 1.8, side * 1.15],
      [0, 1.16, side * 1.15],
      [3.6, 1.75, side * 1.1],
      [4.6, 2, side * 0.96],
    ],
    0.043,
    white,
  );
  box([1.4, 0.1, 0.12], white, [-2.6, 0.7, side * 0.98]);
  for (const x of [-3.1, -2.55, -2]) box([0.07, 0.65, 0.07], white, [x, 0.99, side * 0.98]);
  box([0.4, 0.78, 0.18], red, [-2.9, 1.62, side * 0.98]);
}
for (const x of [-3.2, 0, 3.1]) {
  cylinder(0.34, 0.1, black, [x, 3.81, 0]);
  cylinder(0.33, 0.12, white, [x, 3.9, 0]);
  for (let a = 0; a < 8; a++) {
    const r = (a / 8) * Math.PI * 2;
    cylinder(0.023, 0.055, silver, [x + Math.cos(r) * 0.28, 4.0, Math.sin(r) * 0.28]);
  }
  pipe(
    [
      [x - 0.15, 4.0, 0],
      [x - 0.15, 4.12, 0],
      [x + 0.15, 4.12, 0],
      [x + 0.15, 4.0, 0],
    ],
    0.018,
    black,
  );
}
box([0.18, 0.3, 2.6], white, [4.85, 0.85, 0]);
for (const side of [-1, 1]) box([0.05, 0.17, 0.4], red, [4.96, 0.9, side * 0.88]);
box([0.06, 0.18, 0.72], mat('#dec827'), [4.96, 0.9, 0]);
box([0.85, 0.13, 1.6], white, [-4.8, 1.36, 0]);
box([0.6, 0.48, 0.55], red, [-4.8, 1.67, 0]);
cylinder(0.3, 0.15, black, [-4.8, 1.74, 0.36], [Math.PI / 2, 0, 0]);
for (const r of [0.1, 0.18, 0.26])
  mesh(new T.TorusGeometry(r, 0.012, 6, 40), silver, [-4.8, 1.74, 0.45]);
pipe(
  [
    [-4.7, 1.8, 0.1],
    [-4.4, 2, 0.8],
    [-4.3, 2.7, 1],
    [-4.3, 3.5, 0.7],
  ],
  0.045,
  black,
);

// Exact approved logo, rendered from the repository vector master.
const logo = await sharp(await readFile('public/brand/technicsan-compact.svg'))
  .resize({ width: 2048 })
  .png()
  .toBuffer();
const decal = mat('#ffffff', 0, 0.65);
decal.userData.logo = true;
for (const side of [-1, 1]) {
  const g = new T.PlaneGeometry(4.2, 0.7, 12, 12),
    p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + 3.02;
    p.setXYZ(i, p.getX(i), y, Math.sqrt(Math.max(0.01, 1.12 ** 2 - (y - 2.72) ** 2)) + 0.014);
  }
  g.computeVertexNormals();
  const object = mesh(g, decal);
  if (side === -1) object.rotation.y = Math.PI;
}

// Minimal GLB writer for the authored geometry; no Meshy model or encrypted preview is used.
const gltf = {
  asset: { version: '2.0', generator: 'TECHNICSAN independently authored photo approximation' },
  scene: 0,
  scenes: [{ nodes: [] }],
  nodes: [],
  meshes: [],
  materials: [],
  buffers: [{ byteLength: 0 }],
  bufferViews: [],
  accessors: [],
  images: [],
  textures: [],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
};
const chunks = [];
let length = 0;
function append(bytes, target) {
  const b = Buffer.from(bytes.buffer ?? bytes, bytes.byteOffset ?? 0, bytes.byteLength);
  const pad = (4 - (length % 4)) % 4;
  if (pad) {
    chunks.push(Buffer.alloc(pad));
    length += pad;
  }
  const id = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: length,
    byteLength: b.length,
    ...(target ? { target } : {}),
  });
  chunks.push(b);
  length += b.length;
  return id;
}
function attribute(a, type) {
  const view = append(a.array, 34962);
  const item = { bufferView: view, componentType: 5126, count: a.count, type };
  if (type === 'VEC3') {
    item.min = [Infinity, Infinity, Infinity];
    item.max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < a.count; i++)
      for (let j = 0; j < 3; j++) {
        const n = a.array[i * 3 + j];
        item.min[j] = Math.min(item.min[j], n);
        item.max[j] = Math.max(item.max[j], n);
      }
  }
  gltf.accessors.push(item);
  return gltf.accessors.length - 1;
}
const imageView = append(logo);
gltf.images.push({ bufferView: imageView, mimeType: 'image/png' });
gltf.textures.push({ sampler: 0, source: 0 });
const materials = new Map();
scene.updateMatrixWorld(true);
scene.traverse((object) => {
  if (!object.isMesh) return;
  let mi = materials.get(object.material);
  if (mi === undefined) {
    mi = gltf.materials.length;
    materials.set(object.material, mi);
    const m = object.material;
    gltf.materials.push({
      pbrMetallicRoughness: {
        baseColorFactor: [m.color.r, m.color.g, m.color.b, 1],
        metallicFactor: m.metalness,
        roughnessFactor: m.roughness,
        ...(m.userData.logo ? { baseColorTexture: { index: 0 } } : {}),
      },
      ...(m.userData.logo ? { alphaMode: 'BLEND' } : {}),
    });
  }
  const g = (
    object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()
  ).applyMatrix4(object.matrixWorld);
  const attributes = {
    POSITION: attribute(g.attributes.position, 'VEC3'),
    NORMAL: attribute(g.attributes.normal, 'VEC3'),
  };
  if (g.attributes.uv) {
    for (let i = 0; i < g.attributes.uv.count; i++)
      g.attributes.uv.setY(i, 1 - g.attributes.uv.getY(i));
    attributes.TEXCOORD_0 = attribute(g.attributes.uv, 'VEC2');
  }
  const id = gltf.meshes.length;
  gltf.meshes.push({ primitives: [{ attributes, material: mi }] });
  gltf.scenes[0].nodes.push(gltf.nodes.length);
  gltf.nodes.push({ mesh: id });
});
gltf.buffers[0].byteLength = length;
let json = Buffer.from(JSON.stringify(gltf));
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
let bin = Buffer.concat(chunks);
bin = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + bin.length, 8);
header.writeUInt32LE(json.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const bh = Buffer.alloc(8);
bh.writeUInt32LE(bin.length);
bh.writeUInt32LE(0x004e4942, 4);
await writeFile(target, Buffer.concat([header, json, bh, bin]));
console.log(`Authored local approximation: ${target}`);
