// A one-second first-visit introduction. Content remains usable without this script.
const loader = document.querySelector<HTMLElement>('[data-site-loader]');
if (loader) {
  const root = loader;
  const sessionKey = 'machina:steel-loader:v2';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const previewTrigger = document.querySelector<HTMLButtonElement>('[data-preview-steel-loader]');
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
  let finished = false;
  let preview = false;
  let shownAt = 0;
  const previewBackground: HTMLElement[] = [];

  function hide(reason: string, immediate = false) {
    if (finished) return;
    finished = true;
    clearTimeout(readyTimer);
    clearTimeout(deadline);
    root.dataset.result = reason;
    if (!root.hidden && !immediate && !reducedMotion.matches) {
      root.dataset.state = 'closing';
      cleanupTimer = setTimeout(() => {
        root.hidden = true;
        root.dataset.state = 'idle';
      }, 170);
    } else {
      root.hidden = true;
      root.dataset.state = 'idle';
    }
    if (preview) {
      delete document.body.dataset.steelPreview;
      previewBackground.splice(0).forEach((element) => {
        element.inert = false;
      });
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
      root.removeAttribute('aria-label');
      previewTrigger?.focus({ preventScroll: true });
    }
    preview = false;
  }

  function show(isPreview = false) {
    if (finished && !isPreview) return;
    clearTimeout(cleanupTimer);
    preview = isPreview;
    root.dataset.state = isPreview ? 'preview' : 'loading';
    root.querySelector('[data-loader-status]')!.textContent = isPreview
      ? root.dataset.previewText!
      : root.dataset.introText!;
    root.querySelectorAll<HTMLImageElement>('[data-loader-src]').forEach((image) => {
      image.addEventListener(
        'error',
        () => {
          image.style.visibility = 'hidden';
        },
        { once: true },
      );
      image.src = image.dataset.loaderSrc!;
    });
    root.hidden = false;
    shownAt = performance.now();
    root.dataset.displayed = 'true';
    if (isPreview) {
      document.body.dataset.steelPreview = 'true';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', root.dataset.previewText!);
      [...document.body.children].forEach((element) => {
        if (
          element instanceof HTMLElement &&
          element !== root &&
          !element.inert &&
          element.tagName !== 'SCRIPT' &&
          element.tagName !== 'STYLE'
        ) {
          previewBackground.push(element);
          element.inert = true;
        }
      });
      root
        .querySelector<HTMLButtonElement>('[data-loader-dismiss]')
        ?.focus({ preventScroll: true });
    }
  }

  // Explicit design-review playback is separate from real page readiness and never stores a visit.
  previewTrigger?.addEventListener('click', () => {
    clearTimeout(readyTimer);
    clearTimeout(deadline);
    finished = false;
    show(true);
  });
  root
    .querySelector('[data-loader-dismiss]')
    ?.addEventListener('click', () => hide('dismissed', true));
  document.addEventListener('keydown', (event) => {
    if (root.hidden) return;
    if (event.key === 'Escape' || (!preview && event.key === 'Tab')) hide('keyboard', true);
    if (preview && event.key === 'Tab') {
      // The review has a single focusable control. Keep focus on its explicit exit.
      event.preventDefault();
      root.querySelector<HTMLButtonElement>('[data-loader-dismiss]')?.focus();
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!root.hidden && !preview && event.target instanceof Node && !root.contains(event.target))
      hide('interaction', true);
  });
  document.addEventListener(
    'wheel',
    () => {
      if (!root.hidden && !preview) hide('interaction', true);
    },
    { passive: true },
  );
  document.addEventListener(
    'touchstart',
    () => {
      if (!root.hidden && !preview) hide('interaction', true);
    },
    { passive: true },
  );
  window.addEventListener('pagehide', () => {
    hide('navigation', true);
    root.hidden = true;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      root.hidden = true;
      root.dataset.state = 'idle';
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && !preview) hide('reduced-motion', true);
  });
  document.addEventListener('visibilitychange', () => {
    root.dataset.pageHidden = String(document.hidden);
    if (document.hidden && !preview) hide('background', true);
  });

  if (root.dataset.automatic === 'true') {
    let visited = false;
    try {
      visited = sessionStorage.getItem(sessionKey) === 'seen';
      sessionStorage.setItem(sessionKey, 'seen');
    } catch {
      // Storage restrictions must not turn every internal navigation into an introduction.
      visited = !!document.referrer && new URL(document.referrer).origin === location.origin;
    }
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (visited || reducedMotion.matches || navigation?.type === 'back_forward') {
      hide(visited ? 'session-skipped' : 'motion-or-history-skipped', true);
    } else {
      show();
      deadline = setTimeout(() => hide('timeout'), 2000);
      const checkReadiness = () => {
        const images = [...document.querySelectorAll<HTMLImageElement>('main img')].filter(
          (image) => {
            const bounds = image.getBoundingClientRect();
            return image.loading !== 'lazy' && bounds.top < innerHeight && bounds.bottom > 0;
          },
        );
        const decoding = images.map((image) => image.decode().catch(() => undefined));
        const fonts = document.fonts?.ready || Promise.resolve();
        // Failed images resolve as well: unavailable media must never hold the page hostage.
        void Promise.allSettled([...decoding, fonts]).then(() => {
          if (finished || preview) return;
          const remaining = Math.max(0, 1000 - (performance.now() - shownAt));
          readyTimer = setTimeout(() => hide('ready'), remaining);
        });
      };
      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', checkReadiness, { once: true });
      else checkReadiness();
    }
  }
}
