/* /assets/js/theme.js : light <-> dark 전환만 */
(function () {
  const STORAGE_KEY = 'app.theme'; // 'light' | 'dark'
  const HTML = document.documentElement;

  function getMode() {
    const v = localStorage.getItem(STORAGE_KEY);
    return (v === 'light' || v === 'dark') ? v : 'light'; // 기본값 light
  }

  function applyTheme(mode) {
    HTML.setAttribute('data-theme', mode);
    requestAnimationFrame(() => HTML.classList.add('theme-mounted'));
    window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
  }

  function setMode(mode) {
    const next = (mode === 'light' || mode === 'dark') ? mode : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    return next;
  }

  function toggleMode() {
    const cur = getMode();
    return setMode(cur === 'light' ? 'dark' : 'light');
  }

  function init() {
    applyTheme(getMode());
  }

  window.Theme = { init, setMode, getMode, toggleMode };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
