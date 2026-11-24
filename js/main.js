// 制作実績のカテゴリ絞り込み
document.querySelectorAll('.filters button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var f = btn.dataset.filter;
    document.querySelectorAll('.filters button').forEach(function (b) {
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    document.querySelectorAll('.work').forEach(function (w) {
      w.hidden = !(f === 'all' || w.dataset.cat === f);
    });
  });
});
