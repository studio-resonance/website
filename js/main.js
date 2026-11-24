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

// お問い合わせフォーム（Web3Forms）送信
var form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = '送信中です…';
    var data = Object.fromEntries(new FormData(form));
    delete data.redirect;
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.success) { location.href = '/thanks/'; }
      else { throw new Error(res.message); }
    }).catch(function () {
      status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
      btn.disabled = false;
    });
  });
}
