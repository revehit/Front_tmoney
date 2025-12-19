/* ======================================================
 * main.js (Vanilla JS | A11y/WCAG | Modular Functions)
 * ====================================================== */

/* ========== 1. 공통 유틸 ========== */
function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}
function inkColor() {
  return isDark() ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";
}
function outsideClick(triggerEl, floatingEl, onClose) {
  function handler(e) {
    if (!floatingEl.contains(e.target) && !triggerEl.contains(e.target)) {
      onClose && onClose();
      remove();
    }
  }
  function onKey(e) {
    if (e.key === "Escape") {
      onClose && onClose();
      remove();
    }
  }
  function remove() {
    document.removeEventListener("click", handler, true);
    document.removeEventListener("keydown", onKey, true);
  }
  setTimeout(() => {
    document.addEventListener("click", handler, true);
    document.addEventListener("keydown", onKey, true);
  }, 0);
}
function trapFocus(container) {
  const FOCUSABLE = [
    "a[href]", "area[href]", "button:not([disabled])", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])", "[contenteditable='true']"
  ];
  const nodes = () => Array.from(container.querySelectorAll(FOCUSABLE.join(",")));
  function onKey(e) {
    if (e.key !== "Tab") return;
    const list = nodes();
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  }
  container.addEventListener("keydown", onKey);
  return () => container.removeEventListener("keydown", onKey);
}

/* ========== 2. GSAP 텍스트 페이드 ========== */
// 파일 상단(전역)
let tlTextFill = null;
function initTextFillAnimation() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  const root = document.querySelector(".transform-txt");
  if (!root) return;

  // 1) 기존 타임라인/트윈 정리
  if (tlTextFill) {
    if (tlTextFill.scrollTrigger) tlTextFill.scrollTrigger.kill();
    tlTextFill.kill();
    tlTextFill = null;
  }
  const spans = root.querySelectorAll("span");
  gsap.killTweensOf(spans); // 이전 트윈 충돌 방지

  // 2) 시작색(공통) 재설정
  gsap.set(spans, { color: "rgba(0,0,0,.2)", overwrite: "auto" });

  // 3) 목표색(현재 테마) 결정
  const ink = inkColor(); // isDark() ? white : black

  // 4) 새 타임라인 생성
  tlTextFill = gsap.timeline({
    defaults: { overwrite: "auto" },
    scrollTrigger:
      typeof ScrollTrigger !== "undefined"
        ? {
            trigger: root,              // 문자열 대신 노드 사용 추천
            start: "top bottom",
            end: "bottom center",
            scrub: 3,
            invalidateOnRefresh: true,  // 리프레시마다 값 재계산
            fastScrollEnd: true
          }
        : undefined
  });

  spans.forEach((span, i) => {
    tlTextFill.to(span, { color: ink, duration: 0.5 }, i * 0.1);
  });

  // 5) 현재 스크롤 위치 기준으로 즉시 반영
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

/* (권장) 테마 변경 이벤트 바인딩 예시 */
function bindThemeReactivityForTextFill() {
  window.addEventListener("themechange", initTextFillAnimation);

  // data-theme 직접 변경 폴백
  const mo = new MutationObserver((muts) => {
    if (muts.some(m => m.attributeName === "data-theme")) initTextFillAnimation();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

// 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindThemeReactivityForTextFill();
    initTextFillAnimation();
  }, { once: true });
} else {
  bindThemeReactivityForTextFill();
  initTextFillAnimation();
}


/* ========== 3. 비디오 자동재생 ========== */
function initVideoAutoPlay() {
  const video = document.querySelector(".img3");
  if (!video) return;
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return;

  video.setAttribute("muted", "");
  video.muted = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("preload", "metadata");
  video.setAttribute("aria-label", video.getAttribute("aria-label") || "배경 영상");

  const playAttempt = () => {
    const p = video.play();
    if (p?.catch) {
      p.catch(() => {
        const oncePlay = () => {
          video.play().finally(() => {
            document.removeEventListener("click", oncePlay, { capture: true });
            document.removeEventListener("keydown", oncePlay, { capture: true });
          });
        };
        document.addEventListener("click", oncePlay, { capture: true, once: true });
        document.addEventListener("keydown", oncePlay, { capture: true, once: true });
      });
    }
  };
  if (video.readyState >= 2) playAttempt();
  else video.addEventListener("canplay", playAttempt, { once: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) video.pause();
    else playAttempt();
  });
}

/* ========== 4. 헤더 메뉴 ========== */
function initHeaderMenu() {
  const header = document.querySelector("#header");
  const nav = header?.querySelector("nav");
  const lis = nav ? Array.from(nav.querySelectorAll("li")) : [];
  if (!header || !nav || !lis.length) return;

  function openItem(li) {
    lis.forEach((el) => {
      el.classList.remove("on");
      el.setAttribute("aria-expanded", "false");
      const s = el.querySelector(".submenu, .depth2, ul ul");
      const b = el.querySelector("a, button");
      if (s) s.setAttribute("aria-hidden", "true");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    li.classList.add("on");
    li.setAttribute("aria-expanded", "true");
    const sub = li.querySelector(".submenu, .depth2, ul ul");
    const btn = li.querySelector("a, button");
    if (sub) sub.setAttribute("aria-hidden", "false");
    if (btn) btn.setAttribute("aria-expanded", "true");
    header.classList.add("menu-on");
  }
  function closeAll() {
    lis.forEach((el) => {
      el.classList.remove("on");
      el.setAttribute("aria-expanded", "false");
      const s = el.querySelector(".submenu, .depth2, ul ul");
      const b = el.querySelector("a, button");
      if (s) s.setAttribute("aria-hidden", "true");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    header.classList.remove("menu-on");
  }

  lis.forEach((li) => li.addEventListener("mouseenter", () => openItem(li)));
  header.addEventListener("mouseleave", closeAll, { passive: true });

  nav.addEventListener("keydown", (e) => {
    const li = e.target?.closest("li");
    if (!li) return;
    if (["Enter", " "].includes(e.key)) {
      const hasSub = li.querySelector(".submenu, .depth2, ul ul");
      if (hasSub) {
        openItem(li);
        e.preventDefault();
      }
    }
    if (e.key === "Escape") {
      closeAll();
      const btn = li.querySelector("a, button");
      btn?.focus();
    }
  });
}

/* ========== 5. 다이얼로그 토글 ========== */
function initDialogToggle() {
  const trigger = document.querySelector(".btn-float");
  const dialog = document.querySelector(".dialog");
  if (!trigger || !dialog) return;

  dialog.setAttribute("role", dialog.getAttribute("role") || "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-hidden", "true");
  let untrap = null;

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dialog.classList.add("on");
    dialog.setAttribute("aria-hidden", "false");
    const first = dialog.querySelector("button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])") || dialog;
    first.focus();
    untrap = trapFocus(dialog);
    outsideClick(trigger, dialog, () => {
      dialog.classList.remove("on");
      dialog.setAttribute("aria-hidden", "true");
      if (untrap) untrap();
      trigger.focus();
    });
  });
}

/* ========== 6. 테마 변경 반응 ========== */
function initThemeReactivity() {
  window.addEventListener("themechange", initTextFillAnimation);
  const mo = new MutationObserver((muts) => {
    if (muts.some((m) => m.attributeName === "data-theme")) initTextFillAnimation();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

/* ========== 7-1. 섹션1 스와이퍼(메인 비주얼) ========== */
function initSection1Swiper() {
  const container = document.querySelector(".section1 .swiper");
  const controls  = document.querySelector(".section1 .section1-controls");
  if (!container || !controls || typeof Swiper === "undefined") return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const dotsHost   = controls.querySelector(".dots");
  const toggleBtn  = controls.querySelector(".toggle");
  const iconPause  = toggleBtn.querySelector(".icon-slider-pause");
  const iconPlay   = toggleBtn.querySelector(".icon-slider-play");
  const liveEl     = controls.querySelector("#section1-status");
  let userPaused   = reduceMotion ? true : false;

  // 캐러셀 ARIA
  container.setAttribute("role", "region");
  container.setAttribute("aria-roledescription", "carousel");
  container.setAttribute("aria-label", "메인 비주얼 배너");

  // Swiper 초기화
  const swiper = new Swiper(container, {
    loop: true,
    speed: 700,
    fadeEffect: { crossFade: true },
    watchOverflow: true,
    allowTouchMove: true,
    autoplay: reduceMotion ? false : { delay: 3800, disableOnInteraction: false },
    pagination: {
      el: dotsHost,
      clickable: true,
      bulletElement: "button",
      renderBullet: (i, className) =>
        `<button type="button" class="${className} dot" role="tab"
                 aria-controls="section1-slide-${i + 1}"
                 aria-label="${i + 1}번째 배너로 이동"></button>`,
    },
    a11y: false
  });

  // ✅ 토글 상태 갱신
  function updateToggleVisual() {
    const running = !!swiper.autoplay?.running;
    const paused  = !running;
    toggleBtn.setAttribute("aria-pressed", String(paused));
    toggleBtn.setAttribute("aria-label", paused ? "자동재생 재생" : "자동재생 일시정지");
    controls.classList.toggle("is-paused", paused);
    iconPause.style.display = paused ? "none" : "inline-block";
    iconPlay.style.display  = paused ? "inline-block" : "none";
  }

  // ✅ 현재 슬라이드 안내 (스크린리더)
  function announce() {
    const idx   = (swiper.realIndex ?? 0) + 1;
    const total = swiper.pagination?.bullets?.length || 0;
    liveEl.textContent = `현재 슬라이드 ${idx} / ${total}`;
  }

  // ✅ 토글 클릭
  toggleBtn.addEventListener("click", () => {
    if (swiper.autoplay?.running) {
      swiper.autoplay.stop();
      userPaused = true;
    } else {
      if (!reduceMotion) swiper.autoplay.start();
      userPaused = false;
    }
    updateToggleVisual();
  });

  // ✅ dots 키보드 조작
  dotsHost.addEventListener("keydown", (e) => {
    const isBullet = e.target?.classList?.contains("swiper-pagination-bullet");
    if (!isBullet) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.target.click();
    }
  });

  // ✅ 포커스 접근성 제어
  controls.addEventListener("focusin", () => {
    if (swiper.autoplay?.running) swiper.autoplay.stop();
    updateToggleVisual();
  });
  controls.addEventListener("focusout", () => {
    if (!userPaused && !reduceMotion) swiper.autoplay?.start();
    updateToggleVisual();
  });

  // ✅ 탭 전환 시 가시성 제어
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (swiper.autoplay?.running) swiper.autoplay.stop();
    } else {
      if (!userPaused && !reduceMotion) swiper.autoplay?.start();
    }
    updateToggleVisual();
  });

  // ✅ 초기화
  swiper.on("init", () => {
    if (reduceMotion && swiper.autoplay?.running) swiper.autoplay.stop();
    announce();
    updateToggleVisual();
  });
  swiper.on("slideChangeTransitionStart", announce);

  if (typeof swiper.init === "function") swiper.init();
}

/* ========== 7. 섹션6 스와이퍼 ========== */
function initSection6Swiper() {
  const container = document.querySelector(".section6 .swiper");
  if (!container || typeof Swiper === "undefined") return;

  const swiper = new Swiper(container, {
    // 기본(모바일) 설정
    slidesPerView: 1.2,   // 한 번에 보이는 슬라이드 개수
    spaceBetween: 16,      // 슬라이드 간 간격
    slidesPerGroup: 1,     // ✅ 버튼/드래그 시 항상 1칸씩 이동
    loop: false,
    watchOverflow: true,

    // 레이아웃 변경 감지
    observer: true,
    observeParents: true,
    observeSlideChildren: true,

    keyboard: { enabled: true },

    navigation: {
      nextEl: ".section6-next",
      prevEl: ".section6-prev",
    },

    pagination: {
      el: ".section6-pagination",
      type: "fraction",
      renderFraction: (currentClass, totalClass) => `
        <span class="${currentClass}" aria-label="현재 슬라이드"></span>
        <span class="slash" aria-hidden="true">/</span>
        <span class="${totalClass}" aria-label="전체 슬라이드 수"></span>
      `,
    },

    // 해상도별로 슬라이드 개수 고정 (원하는 값으로 조정 가능)
    breakpoints: {
      500: {
        slidesPerView: 1.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1430: {
        slidesPerView: 3,
        spaceBetween: 32,
      },
    },

    // 리사이즈 시 강제 업데이트
    on: {
      resize(swiperInstance) {
        swiperInstance.update();
      },
    },
  });

  // 접근성 설정
  const slides = container.querySelectorAll(".swiper-slide");
  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", `슬라이드 ${i + 1} / ${slides.length}`);
  });

  const nextBtn = document.querySelector(".section6-next");
  const prevBtn = document.querySelector(".section6-prev");
  [nextBtn, prevBtn].forEach((btn) => {
    if (!btn) return;
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute(
      "aria-label",
      btn.classList.contains("section6-next") ? "다음 슬라이드" : "이전 슬라이드"
    );
    btn.addEventListener("keydown", (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        btn.click();
      }
    });
  });

  const fraction = document.querySelector(".section6-pagination");
  if (fraction) {
    fraction.setAttribute("aria-live", "polite");
    fraction.setAttribute("role", "status");
  }
}


/* ========== 8. 초기화 ========== */
function initMain() {
  initVideoAutoPlay();
  initHeaderMenu();
  initDialogToggle();
  initThemeReactivity();
  initTextFillAnimation();
  initSection1Swiper();
  initSection6Swiper();
}

/* ========== 9. DOM 로드 시 실행 ========== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMain);
} else {
  initMain();
}
