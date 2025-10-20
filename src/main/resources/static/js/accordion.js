/*!
 * Accordion (A11y) - vanilla JS
 * - data-behavior="single" | "multiple"
 * - 닫힘 시 위로 슬라이드 업, 열림 시 페이드+높이 전환
 * - 공개 API: window.Accordion.init(root), initAll()
 */
(function (win, doc) {
  "use strict";

  function qs(sel, root = doc) { return root.querySelector(sel); }
  function qsa(sel, root = doc) { return Array.from(root.querySelectorAll(sel)); }

  // ==== height helpers ====
  function setPanelHeight(panel, open) {
    panel.style.height = open ? "auto" : "0px";
  }

  function animatePanel(panel, open) {
    panel.classList.remove("is-opening", "is-closing");
    panel.classList.add(open ? "is-opening" : "is-closing");

    // measure
    panel.hidden = false;
    const start = panel.style.height || (open ? "0px" : panel.scrollHeight + "px");
    const end   = open ? (panel.scrollHeight + "px") : "0px";

    // transition start
    panel.style.height = start;
    panel.offsetHeight; // reflow
    panel.style.transition = "height .22s ease";
    panel.style.height = end;

    function onEnd() {
      panel.style.transition = "";
      panel.style.height = open ? "auto" : "0px";
      panel.hidden = !open;
      panel.classList.remove("is-opening", "is-closing");
      panel.removeEventListener("transitionend", onEnd);
    }
    panel.addEventListener("transitionend", onEnd);
  }

  function setExpanded(item, btn, panel, open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    item.classList.toggle("is-open", open);
    animatePanel(panel, open);
  }

  function toggleItem(root, btn) {
    const items = qsa(".acc-item", root);
    const item  = btn.closest(".acc-item");
    const panel = qs(".acc-panel", item);
    const willOpen = btn.getAttribute("aria-expanded") !== "true";
    const single = (root.getAttribute("data-behavior") || "").toLowerCase() === "single";

    if (single && willOpen) {
      items.forEach(it => {
        if (it === item) return;
        const b = qs(".acc-trigger", it);
        const p = qs(".acc-panel", it);
        if (b && p && b.getAttribute("aria-expanded") === "true") {
          setExpanded(it, b, p, false);
        }
      });
    }
    setExpanded(item, btn, panel, willOpen);
  }

  function bind(root) {
    const items = qsa(".acc-item", root);

    // 초기 높이 세팅
    items.forEach(item => {
      const btn = qs(".acc-trigger", item);
      const panel = qs(".acc-panel", item);
      const open = btn && btn.getAttribute("aria-expanded") === "true";
      if (!btn || !panel) return;
      setPanelHeight(panel, open);
      if (!open) panel.hidden = true;
    });

    // 클릭
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-trigger");
      if (!btn || !root.contains(btn)) return;
      toggleItem(root, btn);
    });

    // 키보드(상/하 이동 & Enter/Space/Escape)
    root.addEventListener("keydown", (e) => {
      const btn = e.target.closest(".acc-trigger");
      if (!btn || !root.contains(btn)) return;

      const list = qsa(".acc-item .acc-trigger", root);
      const idx = list.indexOf(btn);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          (list[Math.min(idx + 1, list.length - 1)] || list[idx]).focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          (list[Math.max(idx - 1, 0)] || list[idx]).focus();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          toggleItem(root, btn);
          break;
        case "Escape": {
          const isOpen = btn.getAttribute("aria-expanded") === "true";
          if (!isOpen) return;
          e.preventDefault();
          const item = btn.closest(".acc-item");
          const panel = qs(".acc-panel", item);
          setExpanded(item, btn, panel, false);
          btn.focus();
          break;
        }
      }
    });
  }

  // 공개 API
  const API = {
    init(root) {
      if (!root || root.__accordionBound) return;
      root.__accordionBound = true;
      bind(root);
    },
    initAll(selector = ".accordion") {
      qsa(selector).forEach(API.init);
    }
  };

  win.Accordion = API;

  // DOM 준비 후 자동 초기화
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", () => API.initAll());
  } else {
    API.initAll();
  }
})(window, document);
