(() => {
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

// Additive module appendix loader. Keeps existing module HTML untouched.
(() => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const isSwiftConcurrencyPage =
    path.endsWith('/modules/swift-concurrency') ||
    path.endsWith('/modules/swift-concurrency/index.html');

  if (!isSwiftConcurrencyPage) return;

  const cancellationKicker = [...document.querySelectorAll('.learn-only .kicker')]
    .find((element) => element.textContent.trim().startsWith('06 · Cancellation'));
  const insertionPoint = cancellationKicker?.closest('.section-head');

  if (!insertionPoint) return;

  const appendixURL = new URL('executors-runtime-fragment.html', window.location.href);

  fetch(appendixURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load Swift Concurrency appendix: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      insertionPoint.insertAdjacentHTML('beforebegin', html);
    })
    .catch((error) => {
      console.warn(error);
    });
})();
