export function initCatalogue() {
  const root = document.querySelector<HTMLElement>('[data-catalogue]');
  if (!root) return;
  const tr = root.dataset.locale === 'tr';
  const search = root.querySelector<HTMLInputElement>('#machine-search')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-clear-search]')!;
  const filters = [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-machine-card]')];
  const toggle = root.querySelector<HTMLButtonElement>('[data-filter-toggle]');
  const panel = root.querySelector<HTMLElement>('.filter-panel');
  const fold = (value: string) =>
    value
      .toLocaleLowerCase(tr ? 'tr-TR' : 'en-GB')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i');
  const selectedValues = (key: string) =>
    filters
      .filter((f) => f.dataset.filter === key && (!(f instanceof HTMLInputElement) || f.checked))
      .map((f) => f.value)
      .filter(Boolean);
  const get = (key: string) => selectedValues(key)[0] || '';
  let composing = false;
  function readUrl() {
    const params = new URLSearchParams(location.search);
    search.value = (params.get('q') || '').slice(0, 100);
    filters.forEach((f) => {
      const candidate = params.get(f.dataset.filter!) || '';
      if (f instanceof HTMLInputElement) f.checked = candidate.split(',').includes(f.value);
      else f.value = [...f.options].some((o) => o.value === candidate) ? candidate : '';
    });
  }
  function apply(persist = true) {
    const used = get('kind') === 'used';
    root!
      .querySelectorAll<HTMLElement>('[data-used-filter]')
      .forEach((field) => (field.hidden = !used));
    if (!used)
      filters
        .filter((f) => ['year', 'hours'].includes(f.dataset.filter!))
        .forEach((f) => (f.value = ''));
    const query = fold(search.value.trim()),
      category = selectedValues('category');
    let count = 0;
    cards.forEach((card) => {
      const d = card.dataset;
      const matches =
        (!query || fold(d.search || '').includes(query)) &&
        (!get('kind') || d.kind === get('kind')) &&
        (!category.length || category.includes(d.category || '')) &&
        (!get('brand') || d.brand === get('brand')) &&
        (!get('year') || Number(d.year) >= Number(get('year'))) &&
        (!get('hours') || Number(d.hours) <= Number(get('hours')));
      card.hidden = !matches;
      if (matches) count++;
    });
    root!.querySelector('[data-results-count]')!.textContent =
      count +
      ' ' +
      (root!.dataset.samples === 'true'
        ? tr
          ? 'örnek ilan'
          : 'sample listings'
        : tr
          ? 'makine'
          : count === 1
            ? 'machine'
            : 'machines');
    root!.querySelector<HTMLElement>('[data-empty]')!.hidden = count !== 0;
    const current = root!.querySelector('[data-filter-current]');
    if (current)
      current.textContent =
        get('kind') === 'new'
          ? tr
            ? 'Yeni modeller'
            : 'New models'
          : used
            ? tr
              ? 'İkinci el makineler'
              : 'Used machines'
            : tr
              ? 'Tüm makineler'
              : 'All equipment';
    root!
      .querySelectorAll<HTMLButtonElement>('[data-kind-route]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.kindRoute === get('kind'))),
      );
    clear.hidden = !search.value;
    if (persist) {
      const params = new URLSearchParams();
      if (search.value.trim()) params.set('q', search.value.trim());
      ['kind', 'category', 'brand', 'year', 'hours'].forEach((key) => {
        const values = selectedValues(key);
        if (values.length) params.set(key, values.join(','));
      });
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
  filters.forEach((f) => f.addEventListener('change', () => apply()));
  clear.addEventListener('click', () => {
    search.value = '';
    apply();
    search.focus();
  });
  root.querySelectorAll('[data-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      filters.forEach((f) => {
        if (f instanceof HTMLInputElement)
          f.checked = f.dataset.filter === 'kind' && f.value === '';
        else f.value = '';
      });
      search.value = '';
      apply();
      search.focus();
    }),
  );
  root.querySelectorAll<HTMLButtonElement>('[data-kind-route]').forEach((button) =>
    button.addEventListener('click', () => {
      filters
        .filter((f) => f.dataset.filter === 'kind' && f instanceof HTMLInputElement)
        .forEach((f) => ((f as HTMLInputElement).checked = f.value === button.dataset.kindRoute));
      apply();
    }),
  );
  window.addEventListener('popstate', () => {
    readUrl();
    apply(false);
  });
  readUrl();
  apply(false);
}
