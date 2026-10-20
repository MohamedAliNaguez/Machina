/** Small, input-driven movement; the complete homepage also works without JavaScript. */
const stage = document.querySelector<HTMLElement>('[data-theatre]');
if (stage) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let x = 0;
  let y = 0;
  let visible = true;

  const reset = () => {
    x = 0;
    y = 0;
    stage.style.removeProperty('--stage-x');
    stage.style.removeProperty('--stage-y');
    stage.style.removeProperty('--stage-light');
  };
  const paint = () => {
    frame = 0;
    if (reducedMotion.matches || !visible) return;
    const rect = stage.getBoundingClientRect();
    const scroll = Math.min(1, Math.max(0, -rect.top / rect.height));
    stage.style.setProperty('--stage-x', `${x * 7}px`);
    stage.style.setProperty('--stage-y', `${y * 4 + scroll * 12}px`);
    stage.style.setProperty('--stage-light', `${1 + x * 0.035}`);
  };
  const schedule = () => {
    if (!frame && visible && !reducedMotion.matches) frame = requestAnimationFrame(paint);
  };
  stage.addEventListener('pointermove', (event) => {
    if (!pointer.matches || reducedMotion.matches) return;
    const rect = stage.getBoundingClientRect();
    x = (event.clientX - rect.left) / rect.width - 0.5;
    y = (event.clientY - rect.top) / rect.height - 0.5;
    schedule();
  });
  stage.addEventListener('pointerleave', () => {
    x = 0;
    y = 0;
    schedule();
  });
  window.addEventListener('scroll', schedule, { passive: true });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) reset();
    else schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
    else schedule();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  }).observe(stage);
}
