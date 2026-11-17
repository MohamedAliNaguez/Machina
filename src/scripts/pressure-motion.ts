// A finite brand illustration, never a claim of machine operation or measured pressure.
const artwork = document.querySelector<HTMLElement>('[data-pressure-art]');
if (artwork) {
  const root = artwork;
  const stage = root.querySelector<HTMLElement>('[data-pressure-stage]')!;
  const image = root.querySelector<HTMLImageElement>('img')!;
  const hero = root.closest<HTMLElement>('.pressure-hero')!;
  const replay = hero.querySelector<HTMLButtonElement>('[data-pressure-replay]')!;
  const loader = document.querySelector<HTMLElement>('[data-site-loader]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  const animations = new Set<Animation>();
  let played = false;
  let ready = false;
  let inView = false;
  let run = 0;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let introExpired = false;
  let replayRequested = false;

  function enabled() {
    return !reduced.matches && !contrast.matches;
  }
  function stop() {
    run++;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    root.dataset.motion = enabled() ? 'settled' : 'reduced';
    replay.disabled = false;
  }
  function animate(target: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) {
    if (!target) return;
    const animation = target.animate(frames, options);
    animations.add(animation);
    return animation;
  }

  async function play() {
    if (!enabled() || document.hidden || root.dataset.motion === 'running') return;
    if (!image.complete || !image.naturalWidth) return;
    played = true;
    stop();
    const thisRun = run;
    root
      .querySelector('[data-pressure-source]')
      ?.setAttribute('href', image.currentSrc || image.src);
    root.dataset.motion = 'running';
    replay.disabled = true;
    // First the compressor works; the word then stores and releases a little visual strain.
    animate(
      stage,
      [
        { transform: 'translateY(8px) scale(.985, .99)', offset: 0 },
        { transform: 'translateY(0) scale(1)', offset: 0.18 },
        { transform: 'scale(.974, 1.035)', offset: 0.61 },
        { transform: 'scale(1.006, .995)', offset: 0.76 },
        { transform: 'scale(.998, 1.003)', offset: 0.87 },
        { transform: 'none', offset: 1 },
      ],
      { duration: 3800, easing: 'cubic-bezier(.22,.65,.3,1)' },
    );

    const working = [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.86 },
      { opacity: 0, offset: 1 },
    ];
    animate(root.querySelector('[data-pressure-mechanics]'), working, {
      duration: 2400,
      fill: 'both',
    });
    animate(
      root.querySelector('[data-pressure-piston="left"]'),
      [0, 2, 24, 2, 24, 2, 14, 0].map((y) => ({ transform: `translateY(${y}px)` })),
      { duration: 2200, delay: 100, easing: 'ease-in-out', fill: 'both' },
    );
    animate(
      root.querySelector('[data-pressure-piston="right"]'),
      [0, 24, 2, 24, 2, 24, 8, 0].map((y) => ({ transform: `translateY(${y}px)` })),
      { duration: 2200, delay: 100, easing: 'ease-in-out', fill: 'both' },
    );

    animate(root.querySelector('[data-pressure-mixer]'), working, {
      duration: 2300,
      delay: 450,
      fill: 'both',
    });
    animate(
      root.querySelector('[data-pressure-rotor]'),
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(540deg)' }],
      { duration: 2300, delay: 450, easing: 'cubic-bezier(.3,.15,.35,1)', fill: 'both' },
    );

    animate(
      root.querySelector('[data-pressure-transfer]'),
      [
        { strokeDasharray: '70 1200', strokeDashoffset: '0', opacity: 0, offset: 0 },
        { strokeDasharray: '100 1200', strokeDashoffset: '0', opacity: 0.65, offset: 0.08 },
        { strokeDasharray: '100 1200', strokeDashoffset: '-1090', opacity: 0.65, offset: 0.84 },
        { strokeDasharray: '20 1200', strokeDashoffset: '-1170', opacity: 0, offset: 1 },
      ],
      { duration: 1400, delay: 350, easing: 'ease-in-out', fill: 'both' },
    );
    animate(
      root.querySelector('[data-pressure-discharge]'),
      [
        { opacity: 0, transform: 'translateY(-2px)' },
        { opacity: 0.8, transform: 'translateY(1px)', offset: 0.3 },
        { opacity: 0.25, transform: 'translateY(4px)', offset: 0.6 },
        { opacity: 0, transform: 'translateY(9px)' },
      ],
      { duration: 950, delay: 1550, fill: 'both' },
    );

    animate(
      root.querySelector('[data-pressure-sheen]'),
      [
        { transform: 'translateX(0)', opacity: 0 },
        { opacity: 0.62, offset: 0.18 },
        { opacity: 0.62, offset: 0.82 },
        { transform: 'translateX(2300px)', opacity: 0 },
      ],
      { duration: 1700, delay: 1750, easing: 'ease-in-out', fill: 'both' },
    );

    await Promise.allSettled([...animations].map((animation) => animation.finished));
    if (thisRun === run) stop();
  }

  function maybeStart() {
    if (!ready || played || !inView || !enabled() || document.hidden) return;
    if (loader && !loader.hidden && !introExpired) return;
    void play();
  }
  const introObserver = new MutationObserver(maybeStart);
  if (loader) introObserver.observe(loader, { attributes: true, attributeFilter: ['hidden'] });
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (!inView && root.dataset.motion === 'running') stop();
      if (inView && replayRequested) {
        replayRequested = false;
        void play();
      } else maybeStart();
    },
    { threshold: 0.35 },
  );
  visibilityObserver.observe(root);

  function preferenceChanged() {
    replay.hidden = !enabled();
    if (!enabled()) {
      replayRequested = false;
      stop();
    } else maybeStart();
  }
  reduced.addEventListener('change', preferenceChanged);
  contrast.addEventListener('change', preferenceChanged);
  replay.addEventListener('click', () => {
    if (inView) void play();
    else {
      replayRequested = true;
      root.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      replayRequested = false;
      stop();
    } else maybeStart();
  });
  window.addEventListener('pagehide', () => {
    stop();
    clearTimeout(deadline);
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      played = true;
      stop();
    }
  });

  async function initialize() {
    try {
      await image.decode();
    } catch {
      // An unavailable illustration must never delay text, controls or navigation.
      return;
    }
    ready = true;
    replay.hidden = !enabled();
    // Never let a broken intro hold the illustration's state machine indefinitely.
    deadline = setTimeout(() => {
      introExpired = true;
      maybeStart();
      introObserver.disconnect();
    }, 4500);
    maybeStart();
  }
  if (document.readyState === 'complete') void initialize();
  else window.addEventListener('load', () => void initialize(), { once: true });
}
