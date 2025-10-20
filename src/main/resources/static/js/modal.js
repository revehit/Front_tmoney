/* modal.js (SCSS 기준) */
(function () {
  'use strict';

  let active = null;
  let lastFocused = null;
  const FOCUSABLE = 'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el || active === el) return;

    lastFocused = document.activeElement;

    el.setAttribute('aria-hidden', 'false');   // SCSS 규칙과 동기화
    document.body.classList.add('body-lock');  // 스크롤 잠금
    active = el;

    const prefer = el.querySelector('[data-modal-default]') ||
                   el.querySelector(FOCUSABLE) ||
                   el.querySelector('.modal-container');
    prefer && prefer.focus();
  }

  function closeModal() {
    if (!active) return;
    active.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('body-lock');
    active = null;
    lastFocused && lastFocused.focus();
    lastFocused = null;
  }

  // 위임: 열기/닫기/백드롭
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal-open]');
    if (openBtn) {
      e.preventDefault();
      openModal(openBtn.getAttribute('data-modal-open'));
      return;
    }
    if (e.target.closest('[data-modal-close]')) {
      e.preventDefault();
      closeModal();
      return;
    }
    if (active && e.target.classList.contains('modal-overlay')) closeModal();
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 퍼블리싱 단계에서 submit 버튼으로 열고 싶다면(선택)
  document.addEventListener('submit', (e) => {
    const s = e.submitter;
    if (s && s.hasAttribute('data-modal-open')) {
      e.preventDefault();
      openModal(s.getAttribute('data-modal-open'));
    }
  });
})();
