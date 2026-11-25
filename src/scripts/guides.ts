export function initGuideFilters() {
  const root = document.querySelector<HTMLElement>('[data-guide-hub]');
  if (!root) return;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-guide-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-guide-card]')];
  const search = root.querySelector<HTMLInputElement>('[data-guide-search]');
  let family = '';
  const apply = () => {
    const query = (search?.value || '').trim().toLocaleLowerCase(document.documentElement.lang);
    let count = 0;
    cards.forEach((card) => {
      card.hidden =
        !!(family && card.dataset.family !== family) ||
        !card.dataset.search?.toLocaleLowerCase(document.documentElement.lang).includes(query);
      if (!card.hidden) count++;
    });
    buttons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.guideFilter === family)),
    );
    const counter = root.querySelector('[data-guide-count]');
    if (counter)
      counter.textContent = `${count} ${document.documentElement.lang === 'tr' ? 'rehber' : count === 1 ? 'guide' : 'guides'}`;
    const empty = root.querySelector<HTMLElement>('[data-guide-empty]');
    if (empty) empty.hidden = count > 0;
  };
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      family = b.dataset.guideFilter || '';
      apply();
    }),
  );
  search?.addEventListener('input', apply);
}
