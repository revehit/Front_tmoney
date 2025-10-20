/* tabs-current.js */
(function () {
  'use strict';

  function normalize(path) {
    const p = (path || '').replace(/\/+$/, '');
    return p === '' ? '/' : p;
  }

  function pickActive(links, here) {
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      // 해시/JS 링크는 제외 (중복 매칭 방지)
      if (/^(#|javascript:)/i.test(href)) continue;

      const path = normalize(new URL(href, location.origin).pathname);
      if (path === here) return a;     // 최초 매칭 즉시 반환
    }
    return null;
  }

  function syncContainer(container) {
    const links = container.querySelectorAll('.tab[href]');
    if (!links.length) return;

    const here = normalize(location.pathname);
    const preset = container.querySelector('.tab.is-active[href]'); // 사전 지정 보존용
    const active = pickActive(links, here) || preset;
    if (!active) return; // 매칭/프리셋 없으면 변경 안 함

    links.forEach(a => {
      a.classList.remove('is-active');
      a.removeAttribute('aria-current');
    });
    active.classList.add('is-active');
    active.setAttribute('aria-current', 'page');
  }

  function init() {
    document.querySelectorAll('.tabs').forEach(syncContainer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
