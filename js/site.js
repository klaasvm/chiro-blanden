(function () {
  var d = document, root = d.documentElement, io, timer;
  function closeNav() {
    d.querySelectorAll('.nav-t[aria-expanded="true"]').forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
      var n = d.getElementById(t.getAttribute('aria-controls'));
      if (n) n.classList.remove('open');
    });
  }
  function lightbox(img) {
    var box = d.createElement('div'), big = new Image(), close = d.createElement('button');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '\u00d7';
    box.append(big, close);
    d.body.append(box);
    close.focus();
    function end() { box.remove(); d.removeEventListener('keydown', key); if (img.focus) img.focus(); }
    function key(e) { if (e.key === 'Escape') end(); }
    box.addEventListener('click', end);
    d.addEventListener('keydown', key);
  }
  d.addEventListener('click', function (e) {
    var t = e.target.closest('.nav-t');
    if (t) {
      var open = t.getAttribute('aria-expanded') !== 'true';
      closeNav();
      if (open) {
        t.setAttribute('aria-expanded', 'true');
        var n = d.getElementById(t.getAttribute('aria-controls'));
        if (n) n.classList.add('open');
      }
      return;
    }
    if (e.target.closest('.nav a')) closeNav();
    if (e.target.closest('.theme-t')) {
      var dark = root.dataset.theme ? root.dataset.theme !== 'dark' : !matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (x) {}
      return;
    }
    var img = e.target.closest('[data-lb] img');
    if (img) { lightbox(img); return; }
    var v = e.target.closest('button.vid-ph[data-src]');
    if (v) {
      var f = d.createElement('iframe');
      f.src = v.dataset.src + (v.dataset.src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
      f.title = v.dataset.title || '';
      f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      f.allowFullscreen = true;
      v.replaceWith(f);
      return;
    }
    if (e.target.closest('.to-top')) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
    if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-lb] img')) lightbox(e.target);
  });
  function countUp(el) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.querySelectorAll('.st b').forEach(function (b) {
      var m = b.textContent.match(/^(\D*)(\d[\d.,]*)(.*)$/);
      if (!m || b.dataset.n) return;
      var orig = b.textContent, raw = m[2], dec = (raw.match(/[.,](\d{1,2})$/) || [])[1];
      var target = parseFloat(raw.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.'));
      if (!isFinite(target)) return;
      b.dataset.n = 1;
      var places = dec ? dec.length : 0, sep = dec ? raw.charAt(raw.length - dec.length - 1) : '.', t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / 1400), val = target * (1 - Math.pow(1 - p, 3));
        b.textContent = p < 1 ? m[1] + val.toFixed(places).replace('.', sep) + m[3] : orig;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  function reveal() {
    var els = d.querySelectorAll('[data-anim]:not(.in)');
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  function countdown() {
    d.querySelectorAll('.cd[data-cd]').forEach(function (el) {
      var end = +el.dataset.cd;
      if (!end) return;
      var left = Math.max(0, end - Date.now());
      if (!left && el.dataset.done) {
        var p = d.createElement('p');
        p.className = 'cd-done';
        p.textContent = el.dataset.done;
        el.replaceChildren(p);
        el.removeAttribute('data-cd');
        return;
      }
      var v = [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
      el.querySelectorAll('b').forEach(function (b, i) { b.textContent = String(v[i]).padStart(2, '0'); });
    });
  }
  function init() {
    reveal();
    countdown();
    clearInterval(timer);
    if (d.querySelector('.cd[data-cd]')) timer = setInterval(countdown, 1000);
  }
  window.addEventListener('scroll', function () {
    var top = d.querySelector('.to-top');
    if (top) top.classList.toggle('on', window.scrollY > 600);
  }, { passive: true });
  window.siteInit = init;
  init();
})();

// Galerijtabjes: klik op de titel van een galerij om de foto's te tonen of te verbergen
(function () {
  function init() {
    document.querySelectorAll('.s-gallery.g-tabs').forEach(function (s) {
      var head = s.querySelector('.s-head');
      if (!head) return; // zonder titel valt er niets aan te klikken: laat de foto's staan
      s.classList.add('g-tabs-on');
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', 'false');
    });
  }
  function toggle(head) {
    var open = head.closest('.s-gallery').classList.toggle('open');
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.s-gallery.g-tabs-on .s-head');
    if (h) toggle(h);
  });
  document.addEventListener('keydown', function (e) {
    var h = e.target.closest && e.target.closest('.s-gallery.g-tabs-on .s-head');
    if (h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(h); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


