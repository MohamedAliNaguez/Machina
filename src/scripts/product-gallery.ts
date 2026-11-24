interface GalleryPhoto {
  src: string;
  alt: string;
  placeholder: boolean;
}
const gallery = document.querySelector<HTMLDialogElement>('[data-product-gallery]');
if (gallery) {
  const dialog = gallery;
  const photos: GalleryPhoto[] = JSON.parse(dialog.dataset.photos || '[]');
  const main = document.querySelector<HTMLImageElement>('#product-main-image')!;
  const opener = document.querySelector<HTMLAnchorElement>('[data-gallery-open]');
  const view = dialog.querySelector<HTMLImageElement>('[data-gallery-view]')!;
  const outgoing = dialog.querySelector<HTMLImageElement>('[data-gallery-outgoing]')!;
  const stage = dialog.querySelector<HTMLElement>('[data-gallery-stage]')!;
  const count = dialog.querySelector<HTMLElement>('[data-gallery-count]')!;
  const error = dialog.querySelector<HTMLElement>('[data-gallery-error]')!;
  const zoomButton = dialog.querySelector<HTMLButtonElement>('[data-gallery-zoom]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0,
    request = 0,
    closing = false;
  let previousOverflow = '',
    previousPadding = '';
  let focusReturn: HTMLElement | null = null;
  let zoomed = false,
    panX = 0,
    panY = 0,
    suppressClickUntil = 0;
  let drag: { x: number; y: number; panX: number; panY: number } | undefined;
  const animations = new Set<Animation>();
  const cancelAnimations = () => {
    animations.forEach((a) => a.cancel());
    animations.clear();
    outgoing.hidden = true;
  };
  function resetZoom() {
    zoomed = false;
    panX = panY = 0;
    drag = undefined;
    delete dialog.dataset.zoomed;
    delete dialog.dataset.dragging;
    view.style.transform = '';
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.setAttribute('aria-label', dialog.dataset.zoomIn!);
    zoomButton.title = dialog.dataset.zoomIn!;
  }
  function paintZoom() {
    view.style.transform = `translate3d(${panX}px,${panY}px,0) scale(1.8)`;
  }
  function toggleZoom() {
    if (
      !dialog.open ||
      !view.naturalWidth ||
      view.hidden ||
      closing ||
      stage.getAttribute('aria-busy') === 'true'
    )
      return;
    const visualTransform = getComputedStyle(view).transform;
    cancelAnimations();
    if (zoomed) {
      resetZoom();
      if (!reduced.matches)
        animations.add(
          view.animate([{ transform: visualTransform }, { transform: 'none' }], {
            duration: 300,
            easing: 'cubic-bezier(.16,1,.3,1)',
          }),
        );
      return;
    }
    zoomed = true;
    dialog.dataset.zoomed = 'true';
    zoomButton.setAttribute('aria-pressed', 'true');
    zoomButton.setAttribute('aria-label', dialog.dataset.zoomOut!);
    zoomButton.title = dialog.dataset.zoomOut!;
    paintZoom();
    if (!reduced.matches)
      animations.add(
        view.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.8)' }], {
          duration: 320,
          easing: 'cubic-bezier(.16,1,.3,1)',
        }),
      );
  }
  zoomButton.addEventListener('click', toggleZoom);
  view.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil || event.detail > 1) return;
    toggleZoom();
  });
  function sync(photo: GalleryPhoto) {
    main.src = photo.src;
    main.alt = photo.alt;
    const selectedCaption = document.querySelector('[data-product-caption]');
    if (selectedCaption) selectedCaption.textContent = photo.alt;
    if (opener) opener.href = photo.src;
    main.closest('.product-visual')?.classList.toggle('product-visual-pending', photo.placeholder);
    const caption = main
      .closest('.product-visual')
      ?.querySelector<HTMLElement>('.photography-pending');
    if (caption) caption.hidden = !photo.placeholder;
    document
      .querySelectorAll<HTMLButtonElement>('[data-product-photo]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.productPhoto === photo.src)),
      );
  }
  async function select(next: number, direction = 1) {
    if (closing) return;
    resetZoom();
    const ticket = ++request;
    index = (next + photos.length) % photos.length;
    const target = index,
      photo = photos[target];
    if (!photo) return;
    if (!dialog.open) {
      sync(photo);
      return;
    }
    stage.setAttribute('aria-busy', 'true');
    zoomButton.disabled = true;
    const preload = new Image();
    preload.src = photo.src;
    let failed = false;
    try {
      await preload.decode();
    } catch {
      failed = true;
    }
    if (ticket !== request || !dialog.open) return;
    cancelAnimations();
    error.hidden = !failed;
    zoomButton.disabled = failed;
    error.textContent = failed ? dialog.dataset.error || '' : '';
    if (!failed) {
      outgoing.hidden = !view.getAttribute('src');
      if (!outgoing.hidden) outgoing.src = view.src;
      view.src = photo.src;
      view.alt = photo.alt;
      view.hidden = false;
      if (!reduced.matches && !outgoing.hidden) {
        const travel = direction * 42;
        animations.add(
          outgoing.animate(
            [
              { transform: 'translateX(0) scale(1)', opacity: 1 },
              { transform: `translateX(${-travel * 0.65}px) scale(.985)`, opacity: 0 },
            ],
            { duration: 300, easing: 'ease-out', fill: 'forwards' },
          ),
        );
        const arrival = view.animate(
          [
            { transform: `translateX(${travel}px) scale(1.025)`, opacity: 0 },
            { transform: 'translateX(0)', opacity: 1 },
          ],
          { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
        animations.add(arrival);
        void arrival.finished
          .then(() => {
            if (ticket === request) cancelAnimations();
          })
          .catch(() => {});
      } else {
        outgoing.hidden = true;
        if (!reduced.matches) {
          animations.add(
            view.animate(
              [
                { opacity: 0, transform: 'scale(.96)' },
                { opacity: 1, transform: 'scale(1)' },
              ],
              { duration: 440, easing: 'cubic-bezier(.16,1,.3,1)' },
            ),
          );
          const dock = dialog.querySelector<HTMLElement>('.product-lightbox-footer')!;
          animations.add(
            dock.animate(
              [
                { opacity: 0, transform: 'translate(-50%,12px)' },
                { opacity: 1, transform: 'translate(-50%,0)' },
              ],
              { duration: 340, delay: 70, easing: 'cubic-bezier(.16,1,.3,1)' },
            ),
          );
        }
      }
      sync(photo);
    } else {
      view.hidden = true;
    }
    count.textContent = `${target + 1} / ${photos.length}`;
    dialog
      .querySelectorAll<HTMLButtonElement>('[data-gallery-index]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(Number(button.dataset.galleryIndex) === target)),
      );
    stage.removeAttribute('aria-busy');
    // Warm the next photograph without downloading the entire gallery.
    if (!failed && photos.length > 1) {
      const adjacent = new Image();
      adjacent.src = photos[(target + 1) % photos.length].src;
    }
  }
  opener?.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!photos.length || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    focusReturn = document.activeElement instanceof HTMLElement ? document.activeElement : opener;
    previousOverflow = document.body.style.overflow;
    previousPadding = document.body.style.paddingRight;
    const gutter = innerWidth - document.documentElement.clientWidth;
    if (gutter > 0)
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gutter}px`;
    document.body.style.overflow = 'hidden';
    closing = false;
    resetZoom();
    zoomButton.disabled = true;
    dialog.showModal();
    const selected = photos.findIndex(
      (photo) => new URL(photo.src, location.href).href === main.src,
    );
    view.removeAttribute('src');
    void select(selected < 0 ? 0 : selected);
    if (!reduced.matches)
      animations.add(
        dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' }),
      );
  });
  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    ++request;
    cancelAnimations();
    if (reduced.matches) {
      dialog.close();
      return;
    }
    const fade = dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 });
    animations.add(fade);
    void fade.finished.then(() => dialog.close()).catch(() => dialog.close());
  }
  dialog.querySelector('[data-gallery-close]')?.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    ++request;
    cancelAnimations();
    closing = false;
    resetZoom();
    stage.removeAttribute('aria-busy');
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPadding;
    focusReturn?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog
    .querySelector('[data-gallery-previous]')
    ?.addEventListener('click', () => void select(index - 1, -1));
  dialog
    .querySelector('[data-gallery-next]')
    ?.addEventListener('click', () => void select(index + 1, 1));
  dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-index]').forEach((button) =>
    button.addEventListener('click', () => {
      const next = Number(button.dataset.galleryIndex);
      void select(next, next < index ? -1 : 1);
    }),
  );
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      void select(index + (event.key === 'ArrowLeft' ? -1 : 1), event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === '0') resetZoom();
  });
  let touch: { x: number; y: number } | undefined;
  stage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) touch = undefined;
    if (zoomed && event.isPrimary && event.button === 0) {
      cancelAnimations();
      drag = { x: event.clientX, y: event.clientY, panX, panY };
      dialog.dataset.dragging = 'true';
      stage.setPointerCapture(event.pointerId);
      return;
    }
    if (event.pointerType === 'touch' && event.isPrimary)
      touch = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || !zoomed) return;
    panX = Math.max(
      -stage.clientWidth * 0.4,
      Math.min(stage.clientWidth * 0.4, drag.panX + event.clientX - drag.x),
    );
    panY = Math.max(
      -stage.clientHeight * 0.4,
      Math.min(stage.clientHeight * 0.4, drag.panY + event.clientY - drag.y),
    );
    if (Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) > 6)
      suppressClickUntil = performance.now() + 350;
    paintZoom();
  });
  stage.addEventListener('pointerup', (event) => {
    if (drag) {
      const moved = Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y);
      drag = undefined;
      delete dialog.dataset.dragging;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (moved < 6) {
        toggleZoom();
        suppressClickUntil = performance.now() + 350;
      }
      return;
    }
    if (!touch) return;
    const dx = event.clientX - touch.x,
      dy = event.clientY - touch.y;
    touch = undefined;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil = performance.now() + 350;
      void select(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  });
  stage.addEventListener('pointercancel', () => {
    touch = undefined;
    drag = undefined;
    delete dialog.dataset.dragging;
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) cancelAnimations();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-product-photo]').forEach((button) =>
    button.addEventListener('click', () => {
      const next = photos.findIndex((photo) => photo.src === button.dataset.productPhoto);
      if (next >= 0) void select(next, next < index ? -1 : 1);
    }),
  );
}
