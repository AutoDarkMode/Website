/* ==========================================================================
   Auto Dark Mode — website behavior
   Plain ES5-friendly JavaScript. No dependencies, no build step.
     1. Theme switch (Light / Auto / Dark, persisted to localStorage)
     2. Copy-to-clipboard buttons
     3. Screenshot carousel (dots, arrows, keyboard, auto-advance)
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* 1. Theme switch -------------------------------------------------------- */
  function setMode(mode) {
    root.setAttribute('data-mode', mode);
    try { localStorage.setItem('adm-theme', mode); } catch (e) { /* private mode */ }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-seg]'), function (btn) {
    btn.addEventListener('click', function () {
      setMode(btn.getAttribute('data-seg'));
    });
  });

  /* 2. Copy-to-clipboard --------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.cmd__copy'), function (btn) {
    btn.addEventListener('click', function () {
      var cmd = btn.closest('.cmd');
      var code = cmd && cmd.querySelector('code');
      if (!code) { return; }
      var original = btn.textContent;

      function done() {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = original; }, 1400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code.textContent).then(done, done);
      } else {
        done();
      }
    });
  });

  /* 3. Carousel ------------------------------------------------------------ */
  var AUTO_MS = 5500;

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel__slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel__dot'));
    if (slides.length < 2) { return; }

    var index = 0;
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains('is-active')) { index = i; break; }
    }

    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) { slide.classList.toggle('is-active', n === index); });
      dots.forEach(function (dot, n) {
        var on = n === index;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function start() {
      if (reduceMotion) { return; }
      stop();
      timer = setInterval(next, AUTO_MS);
    }

    var nextBtn = carousel.querySelector('[data-next]');
    var prevBtn = carousel.querySelector('[data-prev]');
    if (nextBtn) { nextBtn.addEventListener('click', function () { next(); start(); }); }
    if (prevBtn) { prevBtn.addEventListener('click', function () { prev(); start(); }); }

    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { show(n); start(); });
    });

    // Pause while the visitor is looking or interacting.
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // Arrow-key navigation when the carousel has focus.
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); start(); }
      else if (e.key === 'ArrowRight') { next(); start(); }
    });

    show(index);
    start();
  });
})();
