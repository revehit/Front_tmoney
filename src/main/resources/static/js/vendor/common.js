$(document).ready(function () {
  // dropzone
  $(function () {
    // 요소
    const $dz   = $('#dropzone');     // 드롭존 div
    const $inp  = $('#fileInput');    // <input type="file" multiple>
    const $list = $('#fileList');     // <ul> 텍스트 출력
    const $btn  = $('#btnPick');      // "파일 선택" 버튼(id는 예시)

    // 0) 문서 전체: 파일 열림 방지(최후방어)
    $(document).on('dragover drop', function(e){
      e.preventDefault(); e.stopPropagation();
    });

    // 1) 드롭존: 기본동작 모두 방지 + 하이라이트 토글(옵션)
    const prevent = e => { e.preventDefault(); e.stopPropagation(); };
    $dz.on('dragenter dragover dragleave drop', prevent);
    $dz.on('dragenter dragover', () => $dz.addClass('is-dragover'));
    $dz.on('dragleave drop',   () => $dz.removeClass('is-dragover'));

    // 2) 버튼/드롭존 클릭으로 파일 선택창 열기
    $btn.on('click', () => $inp.trigger('click'));
    $dz.on('click',  () => $inp.trigger('click'));

    // 3) 파일 선택
    $inp.on('change', renderList);

    // 4) 드래그&드롭
    $dz.on('drop', function(e){
      const dropped = e.originalEvent.dataTransfer?.files || [];
      if (!dropped.length) return;

      // (옵션) 기존 선택 + 드롭 파일 병합
      const dt = new DataTransfer();
      Array.from($inp[0].files || []).forEach(f => dt.items.add(f));
      Array.from(dropped).forEach(f   => dt.items.add(f));
      $inp[0].files = dt.files;

      renderList();
    });

    // 5) 리스트 렌더: 파일명.확장자 텍스트
    function renderList(){
      $list.empty();
      const files = $inp[0]?.files;
      if (!files || !files.length) {
        $list.append('<li>선택된 파일이 없습니다.</li>');
        return;
      }
      Array.from(files).forEach(f=>{
        const ext = (f.name.lastIndexOf('.')>0) ? f.name.split('.').pop().toLowerCase() : '';
        $list.append(`<li>${escapeHtml(f.name)} (${ext || '확장자 없음'})</li>`);
      });
    }

    function escapeHtml(s){
      return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    // 초기 표시
    renderList();
  });

});



/* aside */
(function ($) {
  var SPEED = 220;
  var ACCORDION_L1 = true;  // 1뎁스: 하나만 열기 (closeAllSubmenus로 사실상 항상 하나만)
  var ACCORDION_L2 = true;  // 같은 2뎁스 내 3뎁스: 하나만 열기

  function isToggleLink($a) {
    var href = ($a.attr('href') || '').trim();
    return href === '' || href === '#';
  }
  function $d2($li1) { return $li1.children('ul.depth2'); }
  function $d3($a2)  { return $a2.next('ul.depth3'); }

  /* 모든 2·3뎁스를 닫는 공통 함수 */
  function closeAllSubmenus() {
    // 3뎁스 닫기 + 상태 초기화
    $('.aside-nav ul.depth2 > .depth2-item > a[aria-expanded="true"]')
      .attr('aria-expanded', 'false');
    $('.aside-nav ul.depth2 > .depth2-item > ul.depth3:visible')
      .stop(true,true).slideUp(SPEED).attr('aria-hidden', 'true');

    // 2뎁스 닫기 + 1뎁스 상태 초기화
    $('.aside-nav > ul > li.active')
      .removeClass('active')
      .children('.depth1').attr('aria-expanded','false');
    $('.aside-nav ul.depth2:visible').stop(true,true).slideUp(SPEED);
  }

  /* 현재 항목 강조 + 부모 펼침(접근성 상태 포함) */
  function markActiveAndExpand($a){
    if (!$a || !$a.length) return;

    // 리셋
    $('.aside-nav a.is-active').removeClass('is-active');
    $('.aside-nav > ul > li.active')
      .removeClass('active')
      .children('.depth1').attr('aria-expanded','false');
    $('.aside-nav ul.depth2').hide();
    $('.aside-nav ul.depth3').hide().attr('aria-hidden','true');
    $('.aside-nav .depth2 > .depth2-item > a[aria-expanded="true"]').attr('aria-expanded','false');

    // 3뎁스라면 2뎁스 버튼 '열림' 표시 + 패널 펼침
    var $d3c = $a.closest('ul.depth3');
    if ($d3c.length){
      $d3c.show().attr('aria-hidden','false');
      $d3c.prev('a').attr('aria-expanded','true');
    }

    // 1뎁스 li 찾기 및 2뎁스 펼침
    var $li1 = $a.hasClass('depth1') ? $a.closest('li') : $a.closest('ul.depth2').closest('li');
    $li1.addClass('active')
        .children('.depth1').attr('aria-expanded','true');
    $li1.children('ul.depth2').show();

    // 현재 링크 강조
    $a.addClass('is-active');
  }

  /* 문자열 정규화 (origin 제거, 끝 슬래시 제거) */
  function norm(u){
    return String(u || '')
      .replace(location.origin, '')
      .replace(/\/+$/,'');
  }

  $(function () {
    /* ---------- 초기화 ---------- */
    $('.aside-nav > ul > li').each(function () {
      var $li1 = $(this), open = $li1.hasClass('active');
      $li1.children('.depth1').attr('aria-expanded', open ? 'true' : 'false');
      $d2($li1)[open ? 'show' : 'hide']();

      // 3뎁스 초기 닫기
      $li1.find('.depth2 > .depth2-item > a').each(function () {
        var $a2 = $(this), $panel = $d3($a2);
        if ($panel.length && $panel.children('li').length > 0) {
          $a2.attr('aria-expanded', 'false');
          $panel.hide().attr('aria-hidden', 'true');
        }
      });
    });

    /* ---------- 1뎁스 클릭: href 비었으면 토글, 있으면 이동 ---------- */
    $('.aside-nav').on('click', '.depth1', function (e) {
      var $a1 = $(this);
      var $li1 = $a1.closest('li');
      var isToggle = isToggleLink($a1);
      var isOpen   = $li1.hasClass('active');

      // 다른 1뎁스 클릭 시: 모든 2·3뎁스를 먼저 닫는다
      closeAllSubmenus();

      if (!isToggle) {
        // URL 있으면 이동 전 활성 저장
        var key = $a1.data('menuId') || norm($a1.attr('href'));
        try { localStorage.setItem('lnbActive', JSON.stringify({ level: 'd1', key: key })); } catch(e){}
        return; // 이동
      }

      // 토글 전용: 클릭한 1뎁스를 연다
      e.preventDefault();
      if (!isOpen) {
        $li1.addClass('active');
        $a1.attr('aria-expanded','true');
        $d2($li1).stop(true,true).slideDown(SPEED);
      }
      // 같은 1뎁스를 눌러 닫는 경우는 closeAllSubmenus로 이미 처리됨
    });

    /* ---------- 2뎁스 클릭: 3뎁스 있으면 토글, 없으면 이동 ---------- */
    $('.aside-nav').on('click', '.depth2 > .depth2-item > a', function (e) {
      var $a2 = $(this), $panel = $d3($a2);
      var hasD3 = $panel.length && $panel.children('li').length > 0;

      if (!hasD3) {
        // 3뎁스 없음 → 링크 이동이면 저장 후 진행
        if (!isToggleLink($a2)) {
          var key2 = $a2.data('menuId') || norm($a2.attr('href'));
          try { localStorage.setItem('lnbActive', JSON.stringify({ level: 'd2', key: key2 })); } catch(e){}
          return; // 이동
        }
        if (isToggleLink($a2)) { e.preventDefault(); return; } // 비어있고 3뎁스 없음 → 무시
      } else {
        // 3뎁스 존재 → 토글
        if (isToggleLink($a2)) e.preventDefault();

        var isOpen = $a2.attr('aria-expanded') === 'true';
        var $scope = $a2.closest('ul.depth2');

        if (ACCORDION_L2) {
          $scope.find('> .depth2-item > a[aria-expanded="true"]').not($a2)
            .attr('aria-expanded','false')
            .next('ul.depth3').stop(true,true).slideUp(SPEED).attr('aria-hidden','true');
        }

        $a2.attr('aria-expanded', (!isOpen).toString());
        $panel.stop(true,true)[isOpen ? 'slideUp' : 'slideDown'](SPEED)
              .attr('aria-hidden', isOpen ? 'true' : 'false');
      }
    });

    /* ---------- 3뎁스 클릭: 링크 이동이면 저장 ---------- */
    $('.aside-nav').on('click', 'ul.depth3 > li > a', function (e) {
      var $a3 = $(this);
      if (!isToggleLink($a3)) {
        var key3 = $a3.data('menuId') || norm($a3.attr('href'));
        try { localStorage.setItem('lnbActive', JSON.stringify({ level: 'd3', key: key3 })); } catch(e){}
        // 그대로 이동
      } else {
        e.preventDefault();
      }
    });

    /* ---------- 키보드 접근성: Space/Enter ---------- */
    $('.aside-nav').on('keydown', '.depth1, .depth2 > .depth2-item > a, ul.depth3 > li > a', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        $(this).trigger('click'); e.preventDefault();
      }
    });

    /* ---------- (개선) 저장키/URL 기반 자동 복원 ---------- */
    (function autoRestoreLNB(){
      var payload = null;
      try {
        payload = JSON.parse(localStorage.getItem('lnbActive') || 'null');
        localStorage.removeItem('lnbActive'); // 일회성 사용
      } catch(e){}

      var targetKey = payload && payload.key ? norm(payload.key)
                        : norm(location.pathname + location.search + location.hash);

      // 1) data-menu-id 우선 매칭
      var $byId = (payload && payload.key)
        ? $('.aside-nav a[data-menu-id="'+ payload.key +'"]')
        : $();

      // 2) href 기반 보조 매칭(가장 긴 일치)
      var $links = $('.aside-nav a[href]').filter(function(){
        var href = norm($(this).attr('href'));
        return href && href !== '#';
      });

      var $best = $byId.length ? $byId : $();
      if (!$best.length){
        var bestLen = -1;
        $links.each(function(){
          var href = norm($(this).attr('href'));
          if (targetKey === href || targetKey.indexOf(href) === 0){
            if (href.length > bestLen){ $best = $(this); bestLen = href.length; }
          }
        });
      }

      if ($best.length) {
        markActiveAndExpand($best.first());
      }
    })();
  });
})(jQuery);


/* dropdown */
(function ($) {
  'use strict';

  var SEL = {
    root: '.dropdown',
    btn:  '.dropdown_button',
    list: '.dropdown_list',
    opt:  '.dropdown_option',
    val:  '.dropdown_value'
  };

  // 스크롤 부모 찾기(overflowY: auto|scroll)
  function getScrollParent(el) {
    var $p = $(el).parent();
    while ($p.length) {
      var oy = $p.css('overflowY');
      if (oy === 'auto' || oy === 'scroll') return $p;
      $p = $p.parent();
    }
    return $(window);
  }

  function closeAll(except) {
    $(SEL.root).each(function () {
      var $dd = $(this);
      if (except && $dd.is(except)) return;
      $dd.removeAttr('aria-open').removeClass('is-above');
      $dd.find(SEL.btn).attr('aria-expanded', 'false');
    });
    $(window).off('resize.dd');
    $('.scroll-parent-dd').off('scroll.dd').removeClass('scroll-parent-dd');
  }

  // 열기 전에 방향/높이 계산
  function computeDirectionAndHeight($dd) {
    var $btn  = $dd.find(SEL.btn);
    var $list = $dd.find(SEL.list);

    // 실측을 위해 일시 표시
    $list.css({ display: 'block', visibility: 'hidden', maxHeight: '' });

    var btnRect = $btn[0].getBoundingClientRect();

    var $sp = getScrollParent($dd[0]);
    $sp.addClass('scroll-parent-dd');
    var spRect = ($sp[0] === window)
      ? { top: 0, bottom: window.innerHeight }
      : $sp[0].getBoundingClientRect();

    var spaceBelow = spRect.bottom - btnRect.bottom;  // 버튼 아래 가용
    var spaceAbove = btnRect.top - spRect.top;        // 버튼 위 가용
    var desired    = $list.outerHeight();             // 원래 높이

    // 아래 공간이 부족하고, 위가 더 넓으면 위로
    var openAbove  = (spaceBelow < Math.min(desired, 220)) && (spaceAbove > spaceBelow);

    // 가용공간 내에서 높이 제한(120~220)
    var avail = openAbove ? spaceAbove - 8 : spaceBelow - 8;
    var maxH  = Math.max(120, Math.min(220, avail));

    $dd.toggleClass('is-above', openAbove);
    $list.css({ maxHeight: maxH + 'px', visibility: '', display: '' });
  }

  function open($dd) {
    computeDirectionAndHeight($dd);
    $dd.attr('aria-open', 'true');
    $dd.find(SEL.btn).attr('aria-expanded', 'true');
    $dd.find(SEL.list).trigger('focus');

    // 열려있는 동안 위치 재계산
    var $sp = $('.scroll-parent-dd');
    $sp.on('scroll.dd', function () { computeDirectionAndHeight($dd); });
    $(window).on('resize.dd', function () { computeDirectionAndHeight($dd); });
  }

  function close($dd) {
    $dd.removeAttr('aria-open').removeClass('is-above');
    $dd.find(SEL.btn).attr('aria-expanded', 'false').trigger('focus');
    closeAll(); // 리스너 해제
  }

  function setValue($dd, $li) {
    var value = $li.data('value') != null ? $li.data('value') : $.trim($li.text());
    var text  = $.trim($li.text());

    // 옵션 aria-selected 업데이트
    $dd.find(SEL.opt).attr('aria-selected', 'false');
    $li.attr('aria-selected', 'true');

    // hidden input 반영
    var $hidden = $dd.find('input[type="hidden"]');
    if ($hidden.length === 0) {
      var name = $dd.data('name') || 'dropdown';
      $hidden = $('<input/>', { type: 'hidden', name: name }).appendTo($dd);
    }
    $hidden.val(value);

    // value 텍스트 반영 + 상태 플래그
    var $val = $dd.find(SEL.val);
    $val.text(text);
    $dd.removeClass('is-placeholder').attr('data-selected', 'true');
  }

  function moveActive($dd, dir) {
    var $items = $dd.find(SEL.opt);
    var $cur = $items.filter('.is-active').first();
    var idx = $cur.length ? $items.index($cur) : -1;
    var next = (idx === -1) ? (dir > 0 ? 0 : $items.length - 1)
                            : Math.max(0, Math.min($items.length - 1, idx + dir));
    $items.removeClass('is-active');
    var $t = $items.eq(next).addClass('is-active');
    var el = $t.get(0);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  // 초기화 + 이벤트 바인딩
  $(function () {
    // 초기 placeholder/선택값 적용
    $(SEL.root).each(function () {
      var $dd = $(this);
      var $sel = $dd.find(SEL.opt + '[aria-selected="true"]').first();
      if ($sel.length) {
        setValue($dd, $sel);
      } else {
        var $v = $dd.find(SEL.val);
        $v.text($v.data('placeholder') || '선택하세요');
        $dd.addClass('is-placeholder').removeAttr('data-selected');
      }
      $dd.find(SEL.btn).attr('aria-expanded', 'false');
    });

    // 버튼 클릭
    $(document).on('click', SEL.btn, function (e) {
      e.preventDefault();
      var $dd = $(this).closest(SEL.root);
      var isOpen = $dd.is('[aria-open]');
      closeAll($dd);
      isOpen ? close($dd) : open($dd);
    });

    // 옵션 클릭
    $(document).on('click', SEL.opt, function () {
      var $li = $(this);
      var $dd = $li.closest(SEL.root);
      setValue($dd, $li);
      close($dd);
    });

    // 외부 클릭 닫기
    $(document).on('click', function (e) {
      if ($(e.target).closest(SEL.root).length === 0) closeAll();
    });

    // 키보드 조작
    $(document).on('keydown', function (e) {
      var $focus = $(document.activeElement);
      var $dd = $focus.closest(SEL.root);
      if ($dd.length === 0) return;

      var isBtn = $focus.is(SEL.btn);
      var isOpen = $dd.is('[aria-open]');

      if (isBtn && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        isOpen ? close($dd) : (closeAll($dd), open($dd));
        return;
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive($dd, +1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive($dd, -1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var $act = $dd.find('.is-active').first();
        if (!$act.length) $act = $dd.find(SEL.opt).first();
        if ($act.length) { setValue($dd, $act); close($dd); }
      } else if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault(); close($dd);
      }
    });
  });
})(jQuery);



// 테이블 체크박스 제어 (문서 위임 방식)
(function ($) {
  'use strict';

  const $doc = $(document);

  function updateHeaderState($table) {
    const $rows = $table.find('tbody input[type="checkbox"]:not(:disabled)');
    const $checked = $rows.filter(':checked');
    const $all = $table.find('thead input[type="checkbox"]');

    if ($rows.length === 0) return $all.prop({ checked: false, indeterminate: false });

    if ($checked.length === 0) {
      $all.prop({ checked: false, indeterminate: false });
    } else if ($checked.length === $rows.length) {
      $all.prop({ checked: true, indeterminate: false });
    } else {
      $all.prop({ checked: false, indeterminate: true });
    }
  }

  function setRowHighlight($cb) {
    $cb.closest('tr').toggleClass('is-selected', $cb.is(':checked'));
  }

  // 1) 전체선택 클릭 → 본문 토글
  $doc.on('change', 'table thead input[type="checkbox"]', function () {
    const $table = $(this).closest('table');
    const checked = this.checked;
    $table.find('tbody input[type="checkbox"]:not(:disabled)')
      .prop('checked', checked)
      .each(function () { setRowHighlight($(this)); });

    updateHeaderState($table);
  });

  // 2) 본문 클릭 → 헤더 상태/행 하이라이트 갱신
  $doc.on('change', 'table tbody input[type="checkbox"]', function () {
    const $table = $(this).closest('table');
    setRowHighlight($(this));
    updateHeaderState($table);
  });

  // 3) 행 빈공간 클릭 시 토글 (input/label/버튼/링크는 제외)
  $doc.on('click', 'table tbody tr', function (e) {
    if ($(e.target).is('input, label, a, button')) return;
    const $cb = $(this).find('input[type="checkbox"]:not(:disabled)').first();
    if ($cb.length) { $cb.prop('checked', !$cb.prop('checked')).trigger('change'); }
  });

  // 4) Shift+클릭 범위 선택
  let lastChecked = null;
  $doc.on('click', 'table tbody input[type="checkbox"]', function (e) {
    const $table = $(this).closest('table');
    if (e.shiftKey && lastChecked) {
      const $boxes = $table.find('tbody input[type="checkbox"]:not(:disabled)');
      const start = $boxes.index(this);
      const end = $boxes.index(lastChecked);
      const [s, t] = start < end ? [start, end] : [end, start];
      const checked = this.checked;
      $boxes.slice(s, t + 1).prop('checked', checked).each(function () {
        setRowHighlight($(this));
      });
      updateHeaderState($table);
    }
    lastChecked = this;
  });

  // 5) 초기 상태 반영
  $(function () {
    $('table').each(function () {
      const $table = $(this);
      $table.find('tbody input[type="checkbox"]').each(function () {
        setRowHighlight($(this));
      });
      updateHeaderState($table);
    });
  });

  // 선택된 id 목록 얻기(옵션)
  window.getSelectedRowIds = function (tableSelector) {
    const ids = [];
    $(tableSelector).find('tbody input[type="checkbox"]:checked').each(function () {
      ids.push(this.id || $(this).data('id') || $(this).val());
    });
    return ids;
  };
})(jQuery);



// date-field 어디를 눌러도 date picker 열기
$(document).on('click', '.date-field', function (e) {
  const input = $(this).find('input[type="date"]')[0];
  // input 이외의 지점을 클릭했을 때도 picker 열기
  if (e.target !== input) {
    if (input.showPicker) {       // Chrome/Edge/새 사파리
      input.showPicker();
    } else {                      // 구형 브라우저 폴백
      input.focus();
      input.click();              // FF 등
    }
  }
});


// modal
(function($){
  'use strict';

  const $doc = $(document);
  let lastActive = null;
  let lastScrollTop = 0;

  function openModal(target){
    const $m = $(target);
    if (!$m.length) return;

    lastActive = document.activeElement;
    lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    $('body').addClass('body-lock');
    $m.attr('aria-hidden','false');

    const $container = $m.find('.modal-container').attr('tabindex', '-1');
    $container.trigger('focus');
  }

  function closeModal($m){
    if (!$m || !$m.length) return;
    $m.attr('aria-hidden','true');
    $('body').removeClass('body-lock');

    if (lastActive && typeof lastActive.focus === 'function') {
      lastActive.focus();
    }
    window.scrollTo({ top: lastScrollTop });
  }

  // 열기
  $doc.on('click', '.open-modal', function(){
    const target = $(this).data('target');
    openModal(target);
  });

  // 닫기
  $doc.on('click', '.modal [data-dismiss], .modal .modal-overlay', function(){
    closeModal($(this).closest('.modal'));
  });

  // ESC + 포커스 트랩
  $doc.on('keydown', function(e){
    const $open = $('.modal[aria-hidden="false"]');
    if (!$open.length) return;

    if (e.key === 'Escape' || e.key === 'Esc'){
      e.preventDefault();
      closeModal($open);
      return;
    }

    if (e.key === 'Tab'){
      const $focusables = $open.find('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')
                               .filter(':visible:not([disabled])');
      if ($focusables.length === 0) return;
      const first = $focusables[0];
      const last  = $focusables[$focusables.length - 1];

      if (e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
  });
})(jQuery);


// tabs
document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('tab')) return;

  const tabs = e.target.closest('.tabs');
  const panels = document.querySelector('.tab-panels');

  // 모든 탭 비활성화
  tabs.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('is-active');
    tab.setAttribute('aria-selected', 'false');
  });

  // 클릭된 탭 활성화
  e.target.classList.add('is-active');
  e.target.setAttribute('aria-selected', 'true');

  // 모든 패널 비활성화
  panels.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('is-active');
  });

  // 해당 패널 활성화
  const targetId = e.target.getAttribute('aria-controls');
  document.getElementById(targetId).classList.add('is-active');
});
