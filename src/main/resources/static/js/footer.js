/* =========================================================
 * footer.js (Vanilla JS | A11y/WCAG | Cross-Browser)
 * - #goTop 노출/숨김 + 푸터 겹침 방지 + 부드러운 맨위 스크롤
 * ========================================================= */

/* ===== 유틸 ===== */
function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
}
function getOffsetTop(el) {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  return rect.top + getScrollTop();
}
function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* ===== 부드러운 스크롤 (폴백 포함) ===== */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function smoothScrollToTop(duration = 600) {
  // 접근성: 감소된 모션 선호 시 즉시 이동
  if (prefersReducedMotion()) { window.scrollTo(0, 0); return; }

  // 브라우저가 CSS 스무스 스크롤 지원 시
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  // JS 폴백
  const start = getScrollTop();
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const y = Math.round(start * (1 - easeOutCubic(t)));
    window.scrollTo(0, y);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ===== GoTop 컨트롤러 ===== */
function createGoTopController({
  btnSelector = '#goTop',
  footerSelector = '#footer',
  baseBottom = 40,   // 기본 bottom(px)
  buffer = 20,       // 푸터와 여유거리(px)
  showThreshold = 1  // 표시 임계치(px)
} = {}) {
  const btn = document.querySelector(btnSelector);
  const footer = document.querySelector(footerSelector);
  if (!btn) return; // 버튼 없으면 종료

  // 접근성/역할 보강
  if (btn.tagName.toLowerCase() === 'a') {
    btn.setAttribute('role', btn.getAttribute('role') || 'button');
    btn.setAttribute('tabindex', btn.getAttribute('tabindex') || '0');
  }
  if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', '맨 위로 이동');

  // 상태 업데이트 (rAF로 스로틀)
  let ticking = false;
  function update() {
    const scrollTop = getScrollTop();
    const winH = getWindowHeight();
    const footerTop = getOffsetTop(footer);
    const btnRect = btn.getBoundingClientRect();
    const btnH = btnRect.height || 0;

    // 1) 노출/숨김
    if (scrollTop > showThreshold) btn.classList.add('on');
    else btn.classList.remove('on');

    // 2) 푸터 겹침 방지
    //   footerTop - (스크롤상단 + 창높이) < 0  → 겹침 구간
    const bottomFreeSpace = footerTop - (scrollTop + winH);
    if (bottomFreeSpace < 0) {
      // 푸터 위로 자연스럽게 밀어올림
      const compensate = Math.abs(bottomFreeSpace) + buffer;
      btn.style.bottom = (baseBottom + compensate) + 'px';
    } else {
      btn.style.bottom = baseBottom + 'px';
    }
    ticking = false;
  }
  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  // 이벤트 바인딩
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  // 클릭/키보드 조작
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollToTop(600);
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      smoothScrollToTop(600);
    }
  });

  // 초기 1회 업데이트
  requestUpdate();
}

/* ===== 초기화 ===== */
function initFooterUI() {
  createGoTopController({
    btnSelector: '#goTop',
    footerSelector: '#footer',
    baseBottom: 40,
    buffer: 20,
    showThreshold: 1
  });
}

/* ===== DOM 로드 ===== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooterUI, { once: true });
} else {
  initFooterUI();
}
