// 체크박스 그룹 초기화 (여러 그룹도 지원)
function initCheckboxGroup(root) {
  const group = root.closest('.checkbox-group') || root;
  const all = group.querySelector('.chk-all');
  const items = Array.from(group.querySelectorAll('.chk-item'));

  if (!all || items.length === 0) return;

  // 전체선택 → 하위 모두 반영
  all.addEventListener('change', () => {
    items.forEach(i => { i.checked = all.checked; });
    all.indeterminate = false; // 전체선택 직접 변경 시 indeterminate 해제
  });

  // 하위 변경 → 전체선택 상태(indeterminate 포함) 갱신
  const syncAll = () => {
    const checkedCount = items.filter(i => i.checked).length;
    all.checked = checkedCount === items.length;
    all.indeterminate = checkedCount > 0 && checkedCount < items.length;
  };
  items.forEach(i => i.addEventListener('change', syncAll));

  // 초기 상태 동기화(새로고침 복구/기본값 반영)
  syncAll();
}

// 페이지 내 모든 그룹 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.checkbox-group').forEach(initCheckboxGroup);
});
