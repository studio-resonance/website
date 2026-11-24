// 制作実績のカテゴリ絞り込み
document.querySelectorAll('.filters button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var f = btn.dataset.filter;
    document.querySelectorAll('.filters button').forEach(function (b) {
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    document.querySelectorAll('.work').forEach(function (w) {
      w.hidden = !(f === 'all' || w.dataset.cat.split('|').indexOf(f) !== -1);
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

// 実績サムネイルをクリックでその場再生（YouTube）
document.querySelectorAll('.thumb[data-yt]').forEach(function (b) {
  b.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label');
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    var w = document.createElement('div');
    w.className = 'thumb';
    w.appendChild(f);
    b.replaceWith(w);
  });
});
