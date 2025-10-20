/* dropdown.js - Vanilla JS dropdown */
(function (global) {
  'use strict';

  const SEL = {
    root:  '.dropdown',
    btn:   '.dropdown_button',
    list:  '.dropdown_list',
    opt:   '.dropdown_option',
    val:   '.dropdown_value'
  };

  // 열린 드롭다운의 리스너/스크롤 부모 저장
  const listeners = new WeakMap();

  // 스크롤 부모(overflow-y: auto|scroll) 찾기
  function getScrollParent(el) {
    let p = el.parentElement;
    while (p) {
      const oy = getComputedStyle(p).overflowY;
      if (oy === 'auto' || oy === 'scroll') return p;
      p = p.parentElement;
    }
    return window;
  }

  function detachListeners(dd) {
    const info = listeners.get(dd);
    if (!info) return;
    const { sp, onScroll, onResize } = info;
    if (sp && onScroll) sp.removeEventListener('scroll', onScroll);
    if (sp && sp.classList) sp.classList.remove('scroll-parent-dd');
    if (onResize) window.removeEventListener('resize', onResize);
    listeners.delete(dd);
  }

  function closeAll(except) {
    document.querySelectorAll(SEL.root).forEach(dd => {
      if (except && dd === except) return;
      detachListeners(dd);
      dd.removeAttribute('aria-open');
      dd.classList.remove('is-above');
      const btn = dd.querySelector(SEL.btn);
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  // 열기 전에 방향/최대높이 계산
  function computeDirectionAndHeight(dd) {
    const btn  = dd.querySelector(SEL.btn);
    const list = dd.querySelector(SEL.list);
    if (!btn || !list) return;

    // 측정을 위해 잠시 표시
    list.style.display = 'block';
    list.style.visibility = 'hidden';
    list.style.maxHeight = '';

    if (!list.hasAttribute('tabindex')) list.setAttribute('tabindex', '-1');

    const btnRect = btn.getBoundingClientRect();

    const sp = (function () {
      const s = getScrollParent(dd);
      if (s !== window) s.classList.add('scroll-parent-dd');
      return s;
    })();

    const spRect = (sp === window)
      ? { top: 0, bottom: window.innerHeight }
      : sp.getBoundingClientRect();

    const spaceBelow = spRect.bottom - btnRect.bottom;
    const spaceAbove = btnRect.top - spRect.top;
    const desired    = list.offsetHeight;

    const openAbove  = (spaceBelow < Math.min(desired, 220)) && (spaceAbove > spaceBelow);

    const avail = (openAbove ? spaceAbove : spaceBelow) - 8;
    const maxH  = Math.max(120, Math.min(220, avail));

    dd.classList.toggle('is-above', openAbove);
    list.style.maxHeight = `${maxH}px`;

    // 표시 복구
    list.style.visibility = '';
    list.style.display = '';
  }

  function open(dd) {
    computeDirectionAndHeight(dd);
    dd.setAttribute('aria-open', 'true');

    const btn  = dd.querySelector(SEL.btn);
    const list = dd.querySelector(SEL.list);
    if (btn)  btn.setAttribute('aria-expanded', 'true');
    if (list) list.focus();

    const sp = (function () {
      const s = getScrollParent(dd);
      if (s !== window) s.classList.add('scroll-parent-dd');
      return s;
    })();

    const onScroll = () => computeDirectionAndHeight(dd);
    const onResize = () => computeDirectionAndHeight(dd);

    sp.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    listeners.set(dd, { sp, onScroll, onResize });
  }

  function close(dd) {
    detachListeners(dd);
    dd.removeAttribute('aria-open');
    dd.classList.remove('is-above');

    const btn = dd.querySelector(SEL.btn);
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  }

  function setValue(dd, li) {
    const value = (li.dataset.value != null) ? li.dataset.value : li.textContent.trim();
    const text  = li.textContent.trim();

    dd.querySelectorAll(SEL.opt).forEach(el => el.setAttribute('aria-selected', 'false'));
    li.setAttribute('aria-selected', 'true');

    let hidden = dd.querySelector('input[type="hidden"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = dd.dataset.name || 'dropdown';
      dd.appendChild(hidden);
    }
    hidden.value = value;

    const val = dd.querySelector(SEL.val);
    if (val) val.textContent = text;

    dd.classList.remove('is-placeholder');
    dd.setAttribute('data-selected', 'true');
  }

  function moveActive(dd, dir) {
    const items = Array.from(dd.querySelectorAll(SEL.opt));
    if (!items.length) return;

    const cur = dd.querySelector(`${SEL.opt}.is-active`);
    const idx = cur ? items.indexOf(cur) : -1;
    const next = (idx === -1)
      ? (dir > 0 ? 0 : items.length - 1)
      : Math.max(0, Math.min(items.length - 1, idx + dir));

    items.forEach(el => el.classList.remove('is-active'));
    const t = items[next];
    t.classList.add('is-active');
    t.scrollIntoView({ block: 'nearest' });
  }

  function init() {
    document.querySelectorAll(SEL.root).forEach(dd => {
      const selected = dd.querySelector(`${SEL.opt}[aria-selected="true"]`);
      const val = dd.querySelector(SEL.val);
      const btn = dd.querySelector(SEL.btn);

      if (selected) {
        setValue(dd, selected);
      } else if (val) {
        val.textContent = val.dataset.placeholder || '선택하세요';
        dd.classList.add('is-placeholder');
        dd.removeAttribute('data-selected');
      }
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  // 이벤트 위임 (문서 단일 바인딩)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest(SEL.btn);
    const opt = e.target.closest(SEL.opt);

    if (btn) {
      e.preventDefault();
      const dd = btn.closest(SEL.root);
      const isOpen = dd.hasAttribute('aria-open');
      closeAll(dd);
      isOpen ? close(dd) : open(dd);
      return;
    }

    if (opt) {
      const dd = opt.closest(SEL.root);
      setValue(dd, opt);
      close(dd);
      return;
    }

    // 외부 클릭 닫기
    if (!e.target.closest(SEL.root)) closeAll();
  });

  document.addEventListener('keydown', (e) => {
    const focus = document.activeElement;
    const dd = focus ? focus.closest(SEL.root) : null;
    if (!dd) return;

    const isBtn  = focus.matches(SEL.btn);
    const isOpen = dd.hasAttribute('aria-open');

    if (isBtn && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      isOpen ? close(dd) : (closeAll(dd), open(dd));
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(dd, +1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(dd, -1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      let act = dd.querySelector(`${SEL.opt}.is-active`) || dd.querySelector(SEL.opt);
      if (act) { setValue(dd, act); close(dd); }
    } else if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault(); close(dd);
    }
  });

  // DOM 준비 후 자동 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 공개 API
  global.Dropdown = {
    init,
    closeAll: () => closeAll()
  };

})(window);
