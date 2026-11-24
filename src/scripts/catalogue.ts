export function initCatalogue() {
  const root = document.querySelector<HTMLElement>('[data-catalogue]');
  if (!root) return;
  const tr = root.dataset.locale === 'tr';
  const search = root.querySelector<HTMLInputElement>('#machine-search')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-clear-search]')!;
  const filters = [...root.querySelectorAll<HTMLInputElement>('[data-filter="category"]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-machine-card]')];
  const toggle = root.querySelector<HTMLButtonElement>('[data-filter-toggle]');
  const panel = root.querySelector<HTMLElement>('.filter-panel');
  const fold = (value: string) =>
    value
      .toLocaleLowerCase(tr ? 'tr-TR' : 'en-GB')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i');
  let composing = false;
  function readUrl() {
    const params = new URLSearchParams(location.search);
    search.value = (params.get('q') || '').slice(0, 100);
    const selected = (params.get('category') || '').split(',');
    filters.forEach((filter) => (filter.checked = selected.includes(filter.value)));
  }
  function apply(persist = true) {
    const query = fold(search.value.trim());
    const categories = filters.filter((filter) => filter.checked).map((filter) => filter.value);
    const matching = cards.filter(
      (card) =>
        (!query || fold(card.dataset.search || '').includes(query)) &&
        (!categories.length || categories.includes(card.dataset.category || '')),
    );
    root!
      .querySelector('[data-all-categories]')
      ?.setAttribute('aria-pressed', String(categories.length === 0));
    const count = matching.length;
    const displayed = new Set(matching);
    cards.forEach((card) => (card.hidden = !displayed.has(card)));
    root!.querySelector('[data-results-count]')!.textContent =
      count + (tr ? ' sonuç' : count === 1 ? ' result' : ' results');
    root!.querySelector<HTMLElement>('[data-empty]')!.hidden = count !== 0;
    const current = root!.querySelector('[data-filter-current]');
    if (current)
      current.textContent = categories.length
        ? `${categories.length} ${tr ? 'ürün grubu seçildi' : 'product types selected'}`
        : root!.dataset.fixedCategoryName || (tr ? 'Tüm ürünler' : 'All products');
    clear.hidden = !search.value;
    if (persist) {
      const params = new URLSearchParams();
      if (search.value.trim()) params.set('q', search.value.trim());
      if (categories.length) params.set('category', categories.join(','));
      history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
      document
        .querySelector('meta[name="robots"]')
        ?.setAttribute(
          'content',
          params.size
            ? 'noindex,follow'
            : document.documentElement.dataset.indexing || 'noindex,follow',
        );
      const link = document.querySelector<HTMLAnchorElement>('.languages a');
      if (link) {
        const target = new URL(link.href);
        target.search = params.toString();
        link.href = target.href;
      }
    }
  }

  root.querySelector('[data-all-categories]')?.addEventListener('click', () => {
    filters.forEach((filter) => (filter.checked = false));
    apply();
  });
  const close = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    panel?.classList.remove('is-open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    panel?.classList.toggle('is-open', open);
  });
  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      toggle?.focus();
    }
  });
  search.addEventListener('compositionstart', () => (composing = true));
  search.addEventListener('compositionend', () => {
    composing = false;
    apply();
  });
  search.addEventListener('input', () => {
    if (!composing) apply();
  });
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !composing) {
      event.preventDefault();
      apply();
    }
  });
  filters.forEach((filter) => filter.addEventListener('change', () => apply()));
  clear.addEventListener('click', () => {
    search.value = '';
    apply();
    search.focus();
  });
  root.querySelectorAll('[data-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      filters.forEach((filter) => (filter.checked = false));
      search.value = '';
      apply();
      search.focus();
    }),
  );
  window.addEventListener('popstate', () => {
    readUrl();
    apply(false);
  });
  readUrl();
  apply();
}
