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
  const items = nav ? Array.from(nav.querySelectorAll('.gnb-list > li')) : [];
  if (!header || !nav || !items.length) return;

  // ❗ SCSS 쪽에 이거 추가되어 있어야 함
  // #header { --dynamic-after-height: 0px; }
  // #header::after { height: var(--dynamic-after-height, 0); }

  // 0. ::after height 동적 계산 함수
  function updateHeaderAfterHeight() {
    const depthBoxes = header.querySelectorAll('.depth-box');
    if (!depthBoxes.length) {
      header.style.setProperty('--dynamic-after-height', '0px');
      return;
    }

    const headerRect = header.getBoundingClientRect();
    let maxBottom = 0;

    depthBoxes.forEach(box => {
      // display:none 이면 0 나올 수 있으니, 일단 전부 포함
      const rect = box.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    });

    // SCSS의 #header::after { top: 143px; } 과 동일하게 맞추기
    const AFTER_TOP = 143;
    const EXTRA = 30; // 여유 공간

    const height = Math.max(
      0,
      maxBottom - headerRect.top - AFTER_TOP + EXTRA
    );

    header.style.setProperty('--dynamic-after-height', `${height}px`);
  }

  // li 안의 버튼/링크 + depth-box 가져오기
  items.forEach(li => {
    const btn = li.querySelector('button[role="menuitem"], a[role="menuitem"]');
    const sub = li.querySelector('.depth-box');
    if (btn && sub) {
      li.setAttribute('aria-haspopup', 'true');
      li.setAttribute('aria-expanded', 'false');
      sub.setAttribute('role', 'group');
      sub.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  function openAll(activeLi) {
    // 1) 활성 li 하이라이트
    items.forEach(el => {
      if (el === activeLi) el.classList.add('on');
      else el.classList.remove('on');
    });

    // 2) header에 menu-on 클래스 → CSS에서 모든 depth-box 보이게 처리
    header.classList.add('menu-on');

    // 3) 모든 depth-box ARIA 상태를 "열림"으로
    items.forEach(el => {
      const sub = el.querySelector('.depth-box');
      const btn = el.querySelector('button[role="menuitem"], a[role="menuitem"]');
      if (sub) sub.setAttribute('aria-hidden', 'false');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
      }
      el.setAttribute('aria-expanded', 'true');
    });

    // 4) ::after height 동적 계산 (레이아웃 반영 후 계산되도록 약간 딜레이)
    setTimeout(updateHeaderAfterHeight, 0);
  }

  function closeAll() {
    items.forEach(el => {
      el.classList.remove('on');
      el.setAttribute('aria-expanded', 'false');
      const sub = el.querySelector('.depth-box');
      const btn = el.querySelector('button[role="menuitem"], a[role="menuitem"]');
      if (sub) sub.setAttribute('aria-hidden', 'true');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    header.classList.remove('menu-on');

    // 닫을 때는 after 높이 0으로
    header.style.setProperty('--dynamic-after-height', '0px');
  }

  // 마우스 hover
  items.forEach(li => {
    li.addEventListener('mouseenter', () => {
      openAll(li);  // 어떤 li든 hover하면 전체 depth-box 오픈 + 해당 li만 on
    });
  });
  header.addEventListener('mouseleave', () => {
    closeAll();
  }, { passive: true });

  // 키보드 접근(1뎁스)
  const tops = Array.from(
    nav.querySelectorAll('.gnb-list > li > a[role="menuitem"], .gnb-list > li > button[role="menuitem"]')
  );

  tops.forEach((btn, i) => {
    const li = btn.closest('li');
    btn.addEventListener('keydown', e => {
      const key = e.key;
      if (key === 'Enter' || key === ' ') {
        openAll(li);
        e.preventDefault();
      } else if (key === 'ArrowRight') {
        const next = tops[i + 1] || tops[0];
        next.focus();
        e.preventDefault();
      } else if (key === 'ArrowLeft') {
        const prev = tops[i - 1] || tops[tops.length - 1];
        prev.focus();
        e.preventDefault();
      } else if (key === 'ArrowDown') {
        // 현재 li의 depth-box 첫 포커스 요소로
        const sub = li.querySelector('.depth-box');
        const first = sub ? sub.querySelector(FOCUSABLE) : null;
        if (sub && first) {
          openAll(li);
          first.focus();
          e.preventDefault();
        }
      } else if (key === 'Escape') {
        closeAll();
        btn.focus();
        e.preventDefault();
      }
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
  const btn = document.querySelector('.btn-menu');
  const panel = document.getElementById('sitemap');
  const dimmed = document.querySelector('.sitemap-dimmed'); // dimmed 엘리먼트
  if (!header || !btn || !panel || !dimmed) return;

  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-hidden','true');

  let opened = false;
  let untrap = null;

  function syncUI(isOpen){
    btn.setAttribute('aria-expanded', String(isOpen));
    panel.classList.toggle('is-open', isOpen);
    dimmed.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    header.classList.toggle('all', isOpen);
    btn.classList.toggle('openmenu', isOpen);
  }

  function open(){
    if (opened) return;
    syncUI(true);
    const first = panel.querySelector('a,button,input,select,textarea,[tabindex]') || panel;
    first && first.focus();
    ScrollLock.lock();
    untrap = trapFocus(panel);
    opened = true;
  }

  function close(){
    if (!opened) return;
    syncUI(false);
    if (untrap) untrap();
    ScrollLock.unlock();
    btn.focus();
    opened = false;
  }

  // 메뉴 열기 (닫기는 .btn-close 전용)
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (!opened) open();
  });

  // 닫기 버튼 이벤트 바인딩 (비동기 대응 포함)
  function bindCloseBtn() {
    const closeBtn = panel.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => { e.preventDefault(); close(); });
      return true;
    }
    return false;
  }

  if (!bindCloseBtn()) {
    const observer = new MutationObserver(() => { if (bindCloseBtn()) observer.disconnect(); });
    observer.observe(panel, { childList: true, subtree: true });
  }

  // dimmed 클릭 시 닫지 않음 (원하면 닫히게 수정 가능)
}

/* ---------- 6) Sitemap Collapse (Accordion) ---------- */
function setupSitemapCollapse() {
  const root = document.getElementById('sitemap');
  if (!root) return;

  const items = Array.from(root.querySelectorAll('.collapse .collapse-item'));

  // 높이 애니메이션 유틸
  function openPanel(li, trigger, panel) {
    if (li.classList.contains('is-open')) return;

    // 1) 다른 모든 열린 패널 닫기 (항상 단일 열림)
    items.forEach(sib => {
      if (sib !== li && sib.classList.contains('is-open')) {
        const sibTrigger = sib.querySelector('.collapse-trigger') || sib.querySelector('a');
        const sibPanel   = sib.querySelector('.depth2');
        sibTrigger && sibPanel && closePanel(sib, sibTrigger, sibPanel);
      }
    });

    // 2) 열기 준비
    trigger.setAttribute('aria-expanded', 'true');
    li.classList.add('is-open');         // 상태 클래스
    li.classList.add('open');            // (기존 훅과 호환)

    // 숨김 해제 후 높이 측정
    panel.hidden = false;                // display 되도록 먼저 노출
    panel.style.display = 'block';       // 사파리 호환
    panel.style.overflow = 'hidden';
    panel.style.height = '0px';

    const target = panel.scrollHeight;   // 자연 높이
    // 리플로우 강제 후 애니메이션
    panel.getBoundingClientRect();
    panel.style.transition = 'height .24s ease';
    panel.style.height = target + 'px';

    // 종료 정리
    function done() {
      panel.style.height = '';
      panel.style.overflow = '';
      panel.style.transition = '';
      panel.removeEventListener('transitionend', done);
    }
    panel.addEventListener('transitionend', done, { once: true });
  }

  function closePanel(li, trigger, panel) {
    if (!li.classList.contains('is-open')) return;

    trigger.setAttribute('aria-expanded', 'false');
    li.classList.remove('is-open');
    li.classList.remove('open');

    // 현재 높이를 고정 → 0으로 애니메이션
    const start = panel.scrollHeight;
    panel.style.height = start + 'px';
    panel.style.overflow = 'hidden';
    panel.style.transition = 'height .24s ease';

    // 리플로우 강제 후 0으로
    panel.getBoundingClientRect();
    panel.style.height = '0px';

    function done() {
      panel.style.transition = '';
      panel.style.height = '';
      panel.style.overflow = '';
      panel.style.display = '';  // 원상복구
      panel.hidden = true;       // 최종적으로 숨김 처리
      panel.removeEventListener('transitionend', done);
    }
    panel.addEventListener('transitionend', done, { once: true });
  }

  items.forEach((li, idx) => {
    let trigger = li.querySelector('.collapse-trigger');
    if (!trigger) {
      const firstChild = li.firstElementChild;
      if (firstChild && firstChild.tagName && firstChild.tagName.toLowerCase() === 'a') {
        trigger = firstChild;
      }
    }
    const panel = li.querySelector('.depth2');
    if (!trigger || !panel) return;

    // ID/접근성
    if (!panel.id) panel.id = `sm-panel-${idx}`;
    trigger.setAttribute('aria-controls', panel.id);

    // 초기 상태 세팅
    const initialOpen = trigger.getAttribute('aria-expanded') === 'true' || li.classList.contains('open') || li.classList.contains('is-open');
    if (initialOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      li.classList.add('is-open', 'open');
      panel.hidden = false;
      panel.style.height = ''; // 자연 높이
    } else {
      trigger.setAttribute('aria-expanded', 'false');
      li.classList.remove('is-open', 'open');
      panel.hidden = true;
    }

    // 토글 핸들러
    const onToggle = (e) => {
      // a 링크일 경우 탐색 방지(토글용으로 쓰는 경우)
      if (trigger.tagName.toLowerCase() === 'a') e.preventDefault();
      const isOpen = li.classList.contains('is-open');
      isOpen ? closePanel(li, trigger, panel) : openPanel(li, trigger, panel);
    };

    trigger.addEventListener('click', onToggle);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(e); }
    });
  });
}

/* ---------- init ---------- */
function initHeader() {
  setupHeaderHover();
  setupThemeBind();
  setupZoom();
  setupSitemapToggle();
  setupAllMenu();
  setupSitemapCollapse();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader, {once:true});
} else {
  initHeader();
}
