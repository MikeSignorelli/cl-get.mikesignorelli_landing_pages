/* ==========================================================================
   Shared mobile navigation toggle (hamburger menu).
   Loaded on both landing pages. No-ops if the markup isn't present.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Keep long pill CTAs' trailing arrow on one line -------------------
     Some pill buttons ("Take the Free Assessment Now →", "Pre-Order for
     Exclusive Content →") wrap the arrow onto its own line on phones. Tag the
     ones that actually wrap with .uh-cta-fit; the stylesheet then trims their
     padding/font under 560px so the label + arrow stay on one line. Only
     wrapping pills are touched, so short CTAs keep their size. */
  function tagWrappingCtas() {
    var els = document.querySelectorAll('a, button');
    Array.prototype.forEach.call(els, function (el) {
      if (el.classList.contains('uh-cta-fit')) return;
      if (el.textContent.indexOf('→') === -1) return;            // has "→"
      if (el.closest('nav') || el.closest('.uh-sticky') ||
          el.closest('#uh-overlay') || el.closest('#uh-mobile-menu')) return;
      var cs = getComputedStyle(el);
      if (parseFloat(cs.borderRadius) < 40) return;                    // pill CTAs only
      var lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
      var padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      if (el.getBoundingClientRect().height > lineH + padV + 6) {
        el.classList.add('uh-cta-fit');
      }
    });
  }
  // Measure after webfonts settle so we don't over-shrink CTAs that only wrap
  // in the fallback font (font-display:swap).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(tagWrappingCtas);
  } else {
    tagWrappingCtas();
  }
  var _t;
  window.addEventListener('resize', function () {
    clearTimeout(_t);
    _t = setTimeout(tagWrappingCtas, 150);
  });

  /* --- Hamburger menu ---------------------------------------------------- */
  var burger = document.querySelector('.uh-burger');
  var menu = document.getElementById('uh-mobile-menu');
  if (!burger || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!menu.classList.contains('is-open'));
  });

  // close after choosing a destination
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  // close on Escape (returns focus to the toggle)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      burger.focus();
    }
  });

  // close when tapping outside the menu/toggle
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) && !burger.contains(e.target)) {
      setOpen(false);
    }
  });
})();
