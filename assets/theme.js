(() => {
  if (!document.querySelector('link[href*="mobile-header.css"]')) {
    const mobileHeaderStyles = document.createElement('link');
    mobileHeaderStyles.rel = 'stylesheet';
    mobileHeaderStyles.href = '../../assets/mobile-header.css';
    document.head.appendChild(mobileHeaderStyles);
  }

  const storageKey = 'ios-kb-theme';
  const themeToggle = document.getElementById('theme');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem(storageKey);
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const initialTheme = savedTheme || systemTheme;

  themeToggle.checked = initialTheme === 'light';

  themeToggle.addEventListener('change', () => {
    localStorage.setItem(storageKey, themeToggle.checked ? 'light' : 'dark');
  });
})();
