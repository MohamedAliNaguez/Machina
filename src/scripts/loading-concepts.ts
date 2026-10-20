// Review controls only: never intercepts navigation or holds the website behind a loader.
const surfaces = [...document.querySelectorAll<HTMLElement>('.animation-surface')];
const toggles = [...document.querySelectorAll<HTMLButtonElement>('[data-toggle]')];
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches;

function syncControls() {
  document.body.dataset.paused = String(paused || document.hidden);
  toggles.forEach((button) => {
    button.textContent = paused ? 'Play animations' : 'Pause animations';
    button.setAttribute('aria-pressed', String(paused));
    button.disabled = preference.matches;
  });
  const status = document.querySelector('[data-motion-status]');
  if (status)
    status.textContent = preference.matches
      ? 'Reduced motion is enabled on your device. The concepts are shown as still designs.'
      : '';
}

surfaces.forEach((surface) => {
  surface.dataset.playing = 'true';
});
toggles.forEach((button) =>
  button.addEventListener('click', () => {
    paused = !paused;
    syncControls();
  }),
);
document.querySelectorAll('[data-replay]').forEach((button) => {
  button.addEventListener('click', () => {
    if (preference.matches) return;
    surfaces.forEach((surface) =>
      surface.getAnimations({ subtree: true }).forEach((animation) => {
        animation.currentTime = 0;
      }),
    );
    paused = false;
    syncControls();
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((button) => {
  const dialog = document.getElementById(`dialog-${button.dataset.open}`) as HTMLDialogElement;
  button.addEventListener('click', () => {
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    surfaces.forEach((surface) => {
      surface.dataset.suspended = String(!dialog.contains(surface));
    });
    dialog
      .querySelector<HTMLElement>('.animation-surface')
      ?.getAnimations({ subtree: true })
      .forEach((animation) => {
        animation.currentTime = 0;
      });
  });
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    surfaces.forEach((surface) => {
      surface.dataset.suspended = 'false';
    });
    button.focus();
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      (entry.target as HTMLElement).dataset.offscreen = String(!entry.isIntersecting);
    });
  },
  { threshold: 0.05 },
);
surfaces.forEach((surface) => observer.observe(surface));
document.addEventListener('visibilitychange', syncControls);
preference.addEventListener('change', () => {
  paused = preference.matches;
  syncControls();
});
syncControls();
