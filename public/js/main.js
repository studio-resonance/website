(function () {
  // ---- スマホ用メニュー（右上の3本線） ----
  var header = document.getElementById('header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    header.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // ---- 実績の絞り込み（トップは data-limit 件まで表示） ----
  var grid = document.querySelector('.works-grid');
  var buttons = document.querySelectorAll('.filters button');
  var more = document.getElementById('works-more');
  function applyFilter(f) {
    if (!grid) return;
    var limit = parseInt(grid.dataset.limit || '0', 10);
    var shown = 0;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === f ? 'true' : 'false'); });
    grid.querySelectorAll('.work').forEach(function (w) {
      var match = f === 'all' || w.dataset.cat.split('|').indexOf(f) !== -1;
      var show = match && (!limit || shown < limit);
      if (show) shown++;
      w.hidden = !show;
      if (show) w.classList.add('is-in');
    });
    if (more) more.href = '/works/' + (f === 'all' ? '' : '?cat=' + encodeURIComponent(f));
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });
  if (grid) {
    var initial = new URLSearchParams(location.search).get('cat');
    var valid = initial && Array.prototype.some.call(buttons, function (b) { return b.dataset.filter === initial; });
    if (grid.dataset.limit || valid) applyFilter(valid ? initial : 'all');
  }

  // ---- 実績カードをふわっと表示 ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (i % 3) * 0.12 + 's';
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { el.classList.remove('is-in'); io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---- サムネイルをクリックでその場再生（YouTube） ----
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

  // ---- お問い合わせフォーム（Web3Forms） ----
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
})();
