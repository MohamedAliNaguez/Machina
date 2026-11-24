import {
  canopyNodes,
  canopyStems,
  ribbonAt,
  bendCurve,
  arcSampler,
  clamp,
  ease,
} from '../lib/canopy-geometry';

const scene = document.querySelector<HTMLElement>('[data-living-canopy]');
if (scene) {
  const root = scene;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  const stems = [...root.querySelectorAll<SVGGElement>('[data-canopy-stem]')];
  const limbs = [...root.querySelectorAll<SVGGElement>('[data-canopy-limb]')];
  const labels = [...root.querySelectorAll<HTMLAnchorElement>('[data-canopy-label]')];
  const crown = root.querySelector<SVGGElement>('[data-canopy-crown]')!;
  const duration = 11000;
  let elapsed = 0,
    life = 0,
    last = 0,
    frame = 0;
  let visible = true;
  let branchRenderer:
    { render: (progress: number, time: number) => void; dispose: () => void } | undefined;
  const disabled = () => reduced.matches || contrast.matches;
  function applyRibbon(group: SVGGElement, shape: ReturnType<typeof ribbonAt>) {
    group.querySelector('[data-surface]')!.setAttribute('d', shape.surface);
    group.querySelector('[data-fold]')!.setAttribute('d', shape.fold);
    group.querySelector('[data-edge]')!.setAttribute('d', shape.edge);
  }
  function render(progress: number) {
    stems.forEach((group, i) => {
      const stem = canopyStems[i];
      const growth = ease(clamp(progress * 1.55 - i * 0.055));
      const bend = disabled() ? 0 : Math.sin(life / 3300 + i * 0.6) * 1.1 * growth;
      applyRibbon(group, ribbonAt(bendCurve(stem.curve, bend), growth, stem.width, stem.tip));
    });
    limbs.forEach((group, i) => {
      const node = canopyNodes[i];
      const growth = ease(clamp((progress - (i === 0 ? 0 : 0.075 + i * 0.105)) / 0.22));
      const bend = disabled() ? 0 : Math.sin(life / 2700 + i * 0.7) * 2.1 * growth;
      const curve = bendCurve(node.curve, bend);
      applyRibbon(
        group.querySelector<SVGGElement>('[data-canopy-ribbon]')!,
        ribbonAt(curve, growth, node.width, 12),
      );
      const unfold = ease(clamp((growth - 0.35) / 0.65));
      const product = group.querySelector<SVGGElement>('[data-canopy-product]')!;
      const tip = arcSampler(curve)(growth);
      const rotation = (1 - unfold) * (i % 2 ? -6 : 6);
      const scale = unfold * (1 + Math.sin(unfold * Math.PI) * 0.015);
      product.setAttribute(
        'transform',
        `translate(${tip[0].toFixed(2)} ${tip[1].toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${scale.toFixed(4)})`,
      );
      product.style.opacity = String(unfold);
      const foliage = group.querySelector<SVGGElement>('[data-canopy-foliage]');
      const bloom = ease(clamp((growth - 0.15) / 0.85));
      foliage?.setAttribute(
        'transform',
        `translate(${tip[0].toFixed(2)} ${tip[1].toFixed(2)}) rotate(${(bend * 0.2).toFixed(2)}) scale(${bloom.toFixed(4)})`,
      );
      labels[i].style.opacity = String(ease(clamp((growth - 0.84) / 0.16)));
      labels[i].style.transform = `translateY(${((1 - unfold) * 10).toFixed(2)}px)`;
      group.dataset.growth = growth.toFixed(3);
    });
    const canopy = ease(clamp((progress - 0.7) / 0.3));
    crown.style.opacity = String(canopy);
    crown.setAttribute(
      'transform',
      `translate(1020 40) rotate(${disabled() ? 0 : Math.sin(life / 2400) * 0.7}) scale(${canopy}) translate(-1020 -40)`,
    );
    root.dataset.progress = progress.toFixed(4);
    branchRenderer?.render(progress, disabled() ? 0 : life);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  function tick(now: number) {
    frame = 0;
    if (disabled() || !visible || document.hidden) {
      last = 0;
      return;
    }
    const intro = document.querySelector<HTMLElement>('[data-site-loader]');
    if (intro && !intro.hidden) {
      last = now;
      frame = requestAnimationFrame(tick);
      return;
    }
    if (root.dataset.renderer === 'loading') {
      last = now;
      frame = requestAnimationFrame(tick);
      return;
    }
    const delta = last ? Math.min(60, now - last) : 0;
    last = now;
    elapsed = Math.min(duration, elapsed + delta);
    life += delta;
    render(elapsed / duration);
    root.dataset.animation = elapsed < duration ? 'growing' : 'living';
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (!frame && !disabled() && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function preference() {
    stop();
    if (disabled()) {
      render(1);
      root.dataset.animation = 'reduced';
    } else {
      render(elapsed / duration);
      start();
    }
  }
  root.dataset.enhanced = 'true';
  root.dataset.animation = 'growing';
  document.addEventListener('visibilitychange', () => {
    stop();
    start();
  });
  reduced.addEventListener('change', preference);
  contrast.addEventListener('change', preference);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stop();
      else start();
    },
    { threshold: 0.05 },
  ).observe(root);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  preference();
  if (!contrast.matches) {
    root.dataset.renderer = 'loading';
    import('./canopy-webgl.js')
      .then(async ({ createCanopyRenderer }) => {
        try {
          branchRenderer = await createCanopyRenderer(root);
          render(disabled() ? 1 : elapsed / duration);
        } catch {
          root.dataset.renderer = 'svg';
        }
      })
      .catch(() => {
        root.dataset.renderer = 'svg';
      });
  }
}
