/* ============================================================
   Feel Fully You - Main Script
   Scroll reveal, mobile nav, dropdown close
   ============================================================ */

(function () {
  'use strict';

  /* ---- Scroll reveal via IntersectionObserver ---- */
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
  );
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---- Mobile hamburger ---- */
  var hamBtn = document.getElementById('hamBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (hamBtn && mobileNav) {
    hamBtn.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      hamBtn.setAttribute('aria-expanded', isOpen);
    });
    /* Close mobile nav when a link inside it is clicked */
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Close dropdowns when clicking outside ---- */
  document.addEventListener('click', function (e) {
    ['moreWrap', 'workWrap'].forEach(function (id) {
      var wrap = document.getElementById(id);
      if (wrap && !wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });
  });

  /* ---- Dropdown toggle buttons (aria) ---- */
  document.querySelectorAll('.more-wrap > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.more-wrap');
      var isOpen = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });
})();
