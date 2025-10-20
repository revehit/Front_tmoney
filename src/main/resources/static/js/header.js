/* =========================================================
 * header.js  (vanilla JS | A11y/WCAG | Cross-Browser)
 * ========================================================= */

/* ---------- 유틸 ---------- */
// 바깥 클릭/ESC로 닫기
function bindDismiss({container, trigger, onClose}) {
  function handleClick(e) {
    if (!container.contains(e.target) && !trigger.contains(e.target)) {
      onClose(); cleanup();
    }
  }
  function handleKey(e) {
    if (e.key === 'Escape') { onClose(); cleanup(); }
  }
  function cleanup() {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKey, true);
  }
  setTimeout(() => {
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKey, true);
  }, 0);
}

// 포커스 가능한 요소 쿼리
const FOCUSABLE = [
  'a[href]','area[href]','button:not([disabled])','input:not([disabled])',
  'select:not([disabled])','textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])','[contenteditable="true"]'
].join(',');

// 간단 포커스 트랩
function trapFocus(container) {
  function onKey(e) {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(container.querySelectorAll(FOCUSABLE));
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

// 바디 스크롤 락(현재 스크롤 보존)
const ScrollLock = (() => {
  let locked = false, scrollY = 0;
  return {
    lock() {
      if (locked) return;
      scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      locked = true;
    },
    unlock() {
      if (!locked) return;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      locked = false;
    }
  };
})();

/* ---------- 1) 헤더 GNB : hover + 키보드 + ARIA ---------- */
function setupHeaderHover() {
  const header = document.getElementById('header');
  const nav = header ? header.querySelector('nav') : null;
  const items = nav ? Array.from(nav.querySelectorAll('li')) : [];
  if (!header || !nav || !items.length) return;

  // 초기 ARIA 정비
  items.forEach(li => {
    const btn = li.querySelector('a, button');
    const sub = li.querySelector('.submenu, .depth2, ul ul');
    if (btn && sub) {
      li.setAttribute('aria-haspopup', 'true');
      li.setAttribute('aria-expanded', 'false');
      sub.setAttribute('role', 'menu');
      sub.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  function openItem(li) {
    items.forEach(el => {
      el.classList.remove('on');
      el.setAttribute('aria-expanded', 'false');
      const s = el.querySelector('.submenu, .depth2, ul ul');
      const b = el.querySelector('a, button');
      if (s) s.setAttribute('aria-hidden', 'true');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    li.classList.add('on');
    li.setAttribute('aria-expanded', 'true');
    const s = li.querySelector('.submenu, .depth2, ul ul');
    const b = li.querySelector('a, button');
    if (s) s.setAttribute('aria-hidden', 'false');
    if (b) b.setAttribute('aria-expanded', 'true');
    header.classList.add('menu-on');
  }

  function closeAll() {
    items.forEach(el => {
      el.classList.remove('on');
      el.setAttribute('aria-expanded', 'false');
      const s = el.querySelector('.submenu, .depth2, ul ul');
      const b = el.querySelector('a, button');
      if (s) s.setAttribute('aria-hidden', 'true');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    header.classList.remove('menu-on');
  }

  // 마우스 접근
  items.forEach(li => li.addEventListener('mouseenter', () => openItem(li)));
  header.addEventListener('mouseleave', closeAll, {passive:true});

  // 키보드 접근(대상: 1뎁스 버튼/링크)
  const tops = Array.from(nav.querySelectorAll('.gnb-list > li > a, .gnb-list > li > button'));
  tops.forEach((btn, i) => {
    const li = btn.closest('li');
    const panel = li ? li.querySelector('.submenu, .depth2, ul ul') : null;

    btn.addEventListener('keydown', e => {
      const key = e.key;
      if (key === 'Enter' || key === ' ') {
        if (panel) { openItem(li); e.preventDefault(); }
      } else if (key === 'ArrowRight') {
        const next = tops[i+1] || tops[0]; next.focus(); e.preventDefault();
      } else if (key === 'ArrowLeft') {
        const prev = tops[i-1] || tops[tops.length-1]; prev.focus(); e.preventDefault();
      } else if (key === 'ArrowDown' && panel) {
        const first = panel.querySelector(FOCUSABLE); first && first.focus(); e.preventDefault();
      } else if (key === 'Escape') {
        closeAll(); btn.focus();
      }
    });

    panel && panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeAll(); btn.focus(); e.preventDefault(); }
    });

    panel && panel.addEventListener('focusout', e => {
      if (!panel.contains(e.relatedTarget) && e.relatedTarget !== btn) closeAll();
    });
  });
}

/* ---------- 2) 테마 버튼 상태 동기화(header-theme-bind) ---------- */
function setupThemeBind() {
  function updateThemeBtnUI() {
    const btn = document.querySelector('.btn-contrast');
    if (!btn || !window.Theme || !window.Theme.getMode) return;
    const mode = window.Theme.getMode(); // 'light' | 'dark'
    btn.textContent = (mode === 'light') ? 'OFF' : 'ON';
    btn.setAttribute('aria-pressed', String(mode === 'dark'));
    const live = document.getElementById('themeStatus');
    if (live) live.textContent = `현재 테마는 ${mode} 모드`;
  }
  function bind() {
    const btn = document.querySelector('.btn-contrast');
    if (!btn || !window.Theme || !window.Theme.toggleMode) return;
    btn.addEventListener('click', () => window.Theme.toggleMode());
  }
  window.addEventListener('themechange', updateThemeBtnUI);
  bind(); updateThemeBtnUI();
}

/* ---------- 3) 화면 배율(텍스트 사이즈) 컨트롤 ---------- */
function setupZoom() {
  const root = document.getElementById('pageRoot') || document.documentElement;
  const plus  = document.querySelector('.btn-text-plus');
  const minus = document.querySelector('.btn-text-minus');
  const status = document.getElementById('txtSizeStatus');

  const supportsZoom = ('zoom' in root.style);
  let level = 1.0; const MIN = 0.8, MAX = 1.5;

  function announce() { if (status) status.textContent = `화면 배율 ${Math.round(level*100)}%`; }
  function applyZoom() {
    if (supportsZoom) {
      root.style.zoom = level;
      root.style.transform = ''; root.style.transformOrigin = ''; root.style.width = '';
    } else {
      root.style.transform = `scale(${level})`;
      root.style.transformOrigin = 'top left';
      root.style.width = (100/level) + '%';
    }
    announce();
  }

  plus && plus.addEventListener('click', () => { level = Math.min(MAX, +(level+0.1).toFixed(2)); applyZoom(); });
  minus && minus.addEventListener('click', () => { level = Math.max(MIN, +(level-0.1).toFixed(2)); applyZoom(); });
  applyZoom();
}

/* ---------- 4) 사이트맵 토글 버튼(.btn-menu) ---------- */
function setupSitemapToggle() {
  const btn = document.querySelector('.btn-menu');
  const sitemap = document.getElementById('sitemap');
  if (!btn || !sitemap) return;

  btn.addEventListener('click', e => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    sitemap.classList.toggle('is-open', !expanded);
  });
}

/* ---------- 5) All Menu(전체메뉴) : 열기/닫기 + 스크롤락 ---------- */
function setupAllMenu() {
  const header = document.getElementById('header');
  const btn = document.querySelector('.btn-menu');       // 같은 버튼을 재사용하는 구조
  const panel = document.querySelector('.allMenu');      // 전체메뉴 패널
  if (!header || !btn || !panel) return;

  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-hidden','true');

  let opened = false;
  let untrap = null;

  function open() {
    if (opened) return;
    header.classList.add('all');
    btn.classList.add('openmenu');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    const first = panel.querySelector(FOCUSABLE) || panel;
    first.focus();
    ScrollLock.lock();
    untrap = trapFocus(panel);
    bindDismiss({
      container: panel,
      trigger: btn,
      onClose: close
    });
    opened = true;
  }

  function close() {
    if (!opened) return;
    header.classList.remove('all');
    btn.classList.remove('openmenu');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    if (untrap) untrap();
    ScrollLock.unlock();
    btn.focus();
    opened = false;
  }

  btn.addEventListener('click', e => {
    e.preventDefault();
    (opened ? close() : open());
  });
}

/* ---------- init ---------- */
function initHeader() {
  setupHeaderHover();
  setupThemeBind();
  setupZoom();
  setupSitemapToggle();
  setupAllMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader, {once:true});
} else {
  initHeader();
}
