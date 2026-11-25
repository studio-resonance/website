(function () {
  // Googleアナリティクスへのイベント送信（読み込まれていなければ何もしない）
  var track = function (name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); };

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

  // ---- 透過ヘッダーの文字色（下が黒いセクションなら白文字） ----
  if (header) {
    var darkAreas = document.querySelectorAll('[data-header="dark"]');
    var setTheme = function () {
      var y = header.offsetHeight / 2, dark = false;
      darkAreas.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) dark = true;
      });
      header.classList.toggle('is-dark', dark);
    };
    window.addEventListener('scroll', setTheme, { passive: true });
    window.addEventListener('resize', setTheme);
    setTheme();
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

  // ---- 進行表（いま見ているセクションを水色に） ----
  var shotLinks = document.querySelectorAll('.shotlist a');
  var scenes = document.querySelectorAll('[data-scene]');
  if (shotLinks.length && scenes.length) {
    var update = function () {
      var line = window.innerHeight * 0.4, current = 0;
      scenes.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) current = i; });
      shotLinks.forEach(function (a, i) {
        a.classList.toggle('is-current', i === current);
        a.classList.toggle('is-done', i < current);
        if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- ショームービー（背景で音なし自動再生。スマホでは再生しない） ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroMedia = document.querySelector('.hero-media[data-yt]');
  var isPhone = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  if (heroMedia && !reduce && !isPhone) {
    var id = heroMedia.dataset.yt;
    var bg = document.createElement('iframe');
    bg.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id +
      '&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&fs=0';
    bg.title = 'ショームービー（背景）';
    bg.allow = 'autoplay; encrypted-media';
    bg.tabIndex = -1;
    bg.setAttribute('aria-hidden', 'true');
    heroMedia.appendChild(bg);
    // 画面サイズに関係なく、16:9の映像で背景を隙間なく覆う
    var cover = function () {
      var w = heroMedia.clientWidth, h = heroMedia.clientHeight;
      var vw = Math.max(w, h * 16 / 9), vh = vw * 9 / 16;
      if (vh < h) { vh = h; vw = h * 16 / 9; }
      bg.style.width = Math.ceil(vw) + 'px';
      bg.style.height = Math.ceil(vh) + 'px';
    };
    cover();
    window.addEventListener('resize', cover);
    // 読み込み直後に出るYouTubeの表示を見せないよう、少し待ってからフェードイン
    bg.addEventListener('load', function () { setTimeout(function () { heroMedia.classList.add('is-playing'); }, 2500); });
  }

  // ---- サムネイルをクリックでその場再生（YouTube） ----
  document.querySelectorAll('.thumb[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      track('work_video_play', { video_id: b.dataset.yt, video_title: (b.getAttribute('aria-label') || '').replace(/^再生：/, '') });
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
        if (res.success) {
          track('generate_lead', { form_name: 'contact', inquiry_type: data['ご相談の種類'] || '' });
          setTimeout(function () { location.href = '/thanks/'; }, 300);
        }
        else { throw new Error(res.message); }
      }).catch(function () {
        status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
        btn.disabled = false;
      });
    });
  }
})();
