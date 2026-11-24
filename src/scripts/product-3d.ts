import type { ModelViewerElement } from '@google/model-viewer';

for (const root of document.querySelectorAll<HTMLElement>('[data-product-3d]')) {
  const tr = root.dataset.locale === 'tr';
  const load = root.querySelector<HTMLButtonElement>('[data-3d-load]')!;
  const poster = root.querySelector<HTMLElement>('[data-3d-poster]')!;
  const host = root.querySelector<HTMLElement>('[data-3d-host]')!;
  const toolbar = root.querySelector<HTMLElement>('[data-3d-toolbar]')!;
  const status = root.querySelector<HTMLElement>('[data-3d-status]')!;
  const stage = root.querySelector<HTMLElement>('[data-3d-stage]')!;
  let viewer: ModelViewerElement | undefined;
  let loading = false;
  const mobile = matchMedia('(max-width: 700px)');
  const homeOrbit = () => (mobile.matches ? '25deg 78deg 115%' : '25deg 78deg 75%');
  mobile.addEventListener('change', () =>
    requestAnimationFrame(() => {
      if (!viewer) return;
      viewer.cameraOrbit = homeOrbit();
      void viewer.updateComplete.then(() => viewer?.jumpCameraToGoal());
    }),
  );

  const fail = () => {
    viewer?.remove();
    viewer = undefined;
    loading = false;
    poster.hidden = false;
    toolbar.hidden = true;
    load.disabled = false;
    load.textContent = tr ? 'Yeniden deneyin' : 'Try again';
    status.textContent = tr
      ? '3D model yüklenemedi. Referans görseli görüntüleniyor.'
      : 'The 3D model could not load. The reference image is still available.';
  };
  load.addEventListener('click', async () => {
    if (loading || viewer) return;
    loading = true;
    load.disabled = true;
    load.textContent = tr ? 'Yükleniyor…' : 'Loading…';
    status.textContent = tr ? '3D model hazırlanıyor' : 'Preparing the 3D model';
    try {
      await import('@google/model-viewer');
      viewer = document.createElement('model-viewer') as ModelViewerElement;
      viewer.setAttribute(
        'alt',
        tr
          ? 'TECHNICSAN çimento silobası 3D görsel çalışması'
          : '3D visual study of the TECHNICSAN cement bulker',
      );
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('touch-action', 'pan-y');
      viewer.setAttribute('camera-orbit', homeOrbit());
      viewer.setAttribute('shadow-intensity', '1');
      viewer.setAttribute('shadow-softness', '1');
      viewer.setAttribute('environment-image', 'neutral');
      viewer.setAttribute('interaction-prompt', 'none');
      viewer.setAttribute('loading', 'eager');
      viewer.addEventListener('progress', (event) => {
        const progress = Math.round(
          (event as unknown as CustomEvent<{ totalProgress: number }>).detail.totalProgress * 100,
        );
        load.textContent = `${tr ? 'Yükleniyor' : 'Loading'} ${progress}%`;
      });
      viewer.addEventListener(
        'load',
        () => {
          loading = false;
          poster.hidden = true;
          toolbar.hidden = false;
          status.textContent = tr
            ? 'Döndürmek için sürükleyin · Yakınlaştırmak için kaydırın veya sıkıştırın'
            : 'Drag to rotate · Scroll or pinch to zoom';
          viewer?.focus({ preventScroll: true });
        },
        { once: true },
      );
      viewer.addEventListener('error', fail, { once: true });
      viewer.src = root.dataset.modelSrc!;
      host.replaceChildren(viewer);
    } catch {
      fail();
    }
  });
  root.querySelector('[data-3d-reset]')?.addEventListener('click', () => {
    if (!viewer) return;
    viewer.cameraOrbit = homeOrbit();
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
    viewer.removeAttribute('auto-rotate');
    root.querySelector('[data-3d-rotate]')?.setAttribute('aria-pressed', 'false');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) viewer.jumpCameraToGoal();
  });
  root.querySelector('[data-3d-rotate]')?.addEventListener('click', (event) => {
    if (!viewer) return;
    const button = event.currentTarget as HTMLButtonElement;
    const on = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(on));
    viewer.toggleAttribute('auto-rotate', on);
  });
  root.querySelector('[data-3d-scene]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const dark = root.dataset.scene !== 'dark';
    root.dataset.scene = dark ? 'dark' : 'light';
    button.setAttribute('aria-pressed', String(dark));
  });
  const fullscreen = root.querySelector<HTMLButtonElement>('[data-3d-fullscreen]')!;
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    if (document.fullscreenElement === stage) await document.exitFullscreen();
    else await stage.requestFullscreen().catch(() => undefined);
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent =
      document.fullscreenElement === stage
        ? tr
          ? 'Tam ekrandan çık'
          : 'Exit fullscreen'
        : tr
          ? 'Tam ekran'
          : 'Fullscreen';
  });
}
