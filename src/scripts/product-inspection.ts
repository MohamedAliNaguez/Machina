import type { ModelViewerElement } from '@google/model-viewer';

const dialog = document.querySelector<HTMLDialogElement>('[data-product-inspection]');
if (dialog) {
  const root = dialog;
  const tr = root.dataset.locale === 'tr';
  const text = (a: string, b: string) => (tr ? a : b);
  const host = root.querySelector<HTMLElement>('[data-inspection-host]')!;
  const reference = root.querySelector<HTMLElement>('[data-inspection-reference]')!;
  const status = root.querySelector<HTMLElement>('[data-inspection-status]')!;
  const load = root.querySelector<HTMLButtonElement>('[data-inspection-load]');
  const points: { title: string; description: string }[] = JSON.parse(root.dataset.points || '[]');
  const hotspots: { position: string; normal: string; title: { en: string; tr: string } }[] =
    JSON.parse(root.dataset.hotspots || '[]');
  let viewer: ModelViewerElement | undefined;
  let returnTo: HTMLElement | null = null;
  let overflow = '';
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let loadAttempt = 0;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setPoint = (i: number) => {
    const point = points[i];
    if (!point) return;
    root
      .querySelectorAll<HTMLElement>('[data-inspection-point]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(Number(button.dataset.inspectionPoint) === i)),
      );
    root.querySelector('[data-inspection-point-title]')!.textContent = point.title;
    root.querySelector('[data-inspection-point-description]')!.textContent = point.description;
  };
  root.addEventListener('click', (event) => {
    const point = (event.target as HTMLElement).closest<HTMLElement>('[data-inspection-point]');
    if (point) setPoint(Number(point.dataset.inspectionPoint));
  });
  function close() {
    root.close();
  }
  document.querySelectorAll<HTMLButtonElement>('[data-inspection-open]').forEach((button) => {
    button.addEventListener('click', () => {
      returnTo = button;
      overflow = document.body.style.overflow;
      root.showModal();
      document.body.style.overflow = 'hidden';
      if (!reduced()) root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
      root.querySelector<HTMLButtonElement>('[data-inspection-close]')?.focus();
    });
  });
  root
    .querySelectorAll('[data-inspection-close]')
    .forEach((button) => button.addEventListener('click', close));
  root.addEventListener('close', () => {
    document.body.style.overflow = overflow;
    returnTo?.focus();
  });
  const fail = () => {
    loadAttempt++;
    clearTimeout(timeout);
    viewer?.remove();
    viewer = undefined;
    reference.hidden = false;
    root
      .querySelectorAll<HTMLButtonElement>(
        '[data-inspection-view],[data-inspection-mode],[data-inspection-zoom],[data-inspection-reset]',
      )
      .forEach((button) => (button.disabled = true));
    if (load) {
      load.hidden = false;
      load.disabled = false;
      load.textContent = text('Yeniden deneyin', 'Try again');
    }
    status.textContent = text(
      '3D model yüklenemedi. Referans görseli görüntüleniyor.',
      'The model could not load. The reference image remains available.',
    );
  };
  // No library or model is downloaded unless an approved model is registered and the buyer requests it.
  load?.addEventListener('click', async () => {
    if (viewer || !root.dataset.modelSrc) return;
    load.disabled = true;
    const attempt = ++loadAttempt;
    status.textContent = text('3D model hazırlanıyor…', 'Preparing the 3D model…');
    timeout = setTimeout(fail, 30000);
    try {
      await import('@google/model-viewer');
      if (attempt !== loadAttempt) return;
      viewer = document.createElement('model-viewer') as ModelViewerElement;
      viewer.alt = root.querySelector('#inspection-title')!.textContent || 'Product 3D model';
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('touch-action', 'none');
      viewer.setAttribute('disable-pan', '');
      viewer.setAttribute('camera-orbit', '35deg 75deg auto');
      viewer.setAttribute('shadow-intensity', '1');
      viewer.setAttribute('environment-image', 'neutral');
      viewer.setAttribute('interaction-prompt', 'none');
      hotspots.forEach((point, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.slot = `hotspot-${i}`;
        button.className = 'inspection-hotspot';
        button.dataset.position = point.position;
        button.dataset.normal = point.normal;
        button.dataset.inspectionPoint = String(i);
        button.setAttribute('aria-label', point.title[tr ? 'tr' : 'en']);
        button.textContent = String(i + 1).padStart(2, '0');
        viewer!.append(button);
      });
      viewer.addEventListener(
        'load',
        () => {
          if (attempt !== loadAttempt) return;
          clearTimeout(timeout);
          reference.hidden = true;
          load.hidden = true;
          root.querySelector('[data-inspection-label]')!.textContent = text('3D MODEL', '3D MODEL');
          status.textContent = text(
            'Döndürmek için sürükleyin · Yakınlaştırmak için kaydırın veya sıkıştırın',
            'Drag to rotate · Scroll or pinch to zoom',
          );
          root
            .querySelectorAll<HTMLButtonElement>(
              '[data-inspection-view],[data-inspection-mode],[data-inspection-zoom],[data-inspection-reset]',
            )
            .forEach((button) => (button.disabled = false));
        },
        { once: true },
      );
      viewer.addEventListener('error', fail, { once: true });
      viewer.src = root.dataset.modelSrc;
      host.replaceChildren(viewer);
    } catch {
      fail();
    }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-inspection-view]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!viewer) return;
      viewer.cameraOrbit = button.dataset.inspectionView!;
      root
        .querySelectorAll('[data-inspection-view]')
        .forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (reduced()) viewer.jumpCameraToGoal();
    }),
  );
  root.querySelectorAll<HTMLButtonElement>('[data-inspection-mode]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!viewer) return;
      const pan = button.dataset.inspectionMode === 'pan';
      viewer.toggleAttribute('disable-pan', !pan);
      root
        .querySelectorAll('[data-inspection-mode]')
        .forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      status.textContent = pan
        ? text(
            'Kaydırmak için Shift tuşuyla sürükleyin veya iki parmağınızı kullanın',
            'Shift-drag or use two fingers to pan',
          )
        : text(
            'Döndürmek için sürükleyin · Yakınlaştırmak için kaydırın',
            'Drag to rotate · Scroll to zoom',
          );
    }),
  );
  root.querySelectorAll<HTMLButtonElement>('[data-inspection-zoom]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!viewer) return;
      const orbit = viewer.getCameraOrbit();
      viewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius * (button.dataset.inspectionZoom === 'in' ? 0.8 : 1.25)}m`;
      if (reduced()) viewer.jumpCameraToGoal();
    }),
  );
  root.querySelector('[data-inspection-reset]')?.addEventListener('click', () => {
    if (!viewer) return;
    viewer.cameraTarget = 'auto auto auto';
    viewer.cameraOrbit = '35deg 75deg auto';
    viewer.fieldOfView = 'auto';
    if (reduced()) viewer.jumpCameraToGoal();
  });
}
