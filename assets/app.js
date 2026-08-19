(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('ios-kb-theme');
  const systemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = savedTheme || (systemLight ? 'light' : 'dark');

  const hiddenStyle = document.createElement('style');
  hiddenStyle.textContent = '[hidden]{display:none!important}';
  document.head.appendChild(hiddenStyle);

  const themeButton = document.querySelector('[data-theme-toggle]');
  const updateThemeButton = () => {
    if (!themeButton) return;
    const light = root.dataset.theme === 'light';
    themeButton.setAttribute('aria-label', light ? 'Увімкнути темну тему' : 'Увімкнути світлу тему');
    themeButton.innerHTML = light
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 15.3A8.4 8.4 0 0 1 8.7 4a8.5 8.5 0 1 0 11.3 11.3Z"/></svg>';
  };
  updateThemeButton();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ios-kb-theme', root.dataset.theme);
    updateThemeButton();
  });

  const search = document.querySelector('[data-search]');
  const cards = [...document.querySelectorAll('[data-module]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const empty = document.querySelector('[data-empty]');
  let activeCategory = 'all';

  const applyFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const categoryMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
      const queryMatch = !query || card.textContent.toLowerCase().includes(query);
      const visible = categoryMatch && queryMatch;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (empty) empty.style.display = shown ? 'none' : 'block';
  };

  search?.addEventListener('input', applyFilters);
  filters.forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    filters.forEach(item => item.classList.toggle('active', item === button));
    applyFilters();
  }));
})();
