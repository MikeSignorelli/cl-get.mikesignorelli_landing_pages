/* ==========================================================================
   The Unoffendable Heart — Pre-Order page
   Vanilla-JS re-implementation of the Claude Design (DCLogic) component.
   Two behaviours: dismiss the announcement bar, and handle the pre-order
   bonus-claim form (validate -> background lead POST -> success state).
   ========================================================================== */
(function () {
  'use strict';

  // Lead delivery goes through the shared Zapier module (assets/js/leads.js).
  // Configure the webhook URL there; this is just the `source` tag for this form.
  var LEAD_SOURCE = 'unoffendable-heart-preorder-bonus';

  var submitted = false; // resubmission guard (reset on page reload)

  var $ = function (id) { return document.getElementById(id); };

  function dismissAnnounce() {
    var el = $('uh-announce');
    if (el) el.style.display = 'none';
  }

  // No-op until the Zapier Catch Hook URL is configured in assets/js/leads.js.
  function postLead(lead) {
    if (window.UHLead) window.UHLead.post(LEAD_SOURCE, lead);
  }

  // Resolve the retailer <select> to its human-readable label (e.g. "bn" -> "Barnes & Noble")
  // so the Google Sheet reads naturally. Falls back to the raw value if anything is off.
  function retailerLabel(form, value) {
    var sel = form && form.querySelector('select[name="retailer"]');
    if (sel && sel.selectedIndex > -1) {
      var opt = sel.options[sel.selectedIndex];
      if (opt && opt.value) return (opt.text || '').trim() || opt.value;
    }
    return value;
  }

  var BONUS_FIELDS = [
    { name: 'firstName', label: 'First name', type: 'name', minLength: 3 },
    { name: 'lastName',  label: 'Last name' },
    { name: 'email',     label: 'Email address', type: 'email' },
    { name: 'retailer',  label: 'Retailer', requiredMessage: 'Please select where you pre-ordered.' },
    { name: 'orderNo',   label: 'Order confirmation number' }
  ];

  function submitForm(e) {
    e.preventDefault();
    if (submitted) return; // already claimed — ignore repeat submits
    var form = e.target;
    var res;
    if (window.UHForms) {
      res = window.UHForms.validate(form, BONUS_FIELDS);
    } else {
      // fallback to native validation if the shared validator failed to load
      res = { valid: form.checkValidity ? form.checkValidity() : true, values: {} };
      if (!res.valid && form.reportValidity) form.reportValidity();
      Array.prototype.forEach.call(form.elements, function (el) { if (el.name) res.values[el.name] = (el.value || '').trim(); });
    }
    if (!res.valid) return;

    submitted = true;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    var first = res.values.firstName;
    postLead({
      firstName: first,
      lastName: res.values.lastName,
      email: res.values.email,
      retailer: retailerLabel(form, res.values.retailer),
      orderNo: res.values.orderNo
    });

    var name = $('uh-form-name');
    if (name) name.textContent = first ? (first + ', thank you. ') : '';
    var open = $('uh-form-open'), done = $('uh-form-done');
    if (open) open.classList.add('uh-hidden');
    if (done) done.classList.remove('uh-hidden');
  }

  function init() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (el && el.getAttribute('data-action') === 'dismiss') dismissAnnounce();
    });
    var form = document.querySelector('form[data-action-submit="submitForm"]');
    if (form) {
      form.setAttribute('novalidate', '');   // use our inline validation, not native tooltips
      form.addEventListener('submit', submitForm);
      if (window.UHForms) window.UHForms.attachLiveClear(form, BONUS_FIELDS);
    }

    // "Watch the message" video: the gold play overlay starts playback and
    // hands off to the native controls (no autoplay, no sound until clicked).
    var playBtn = document.querySelector('.uh-video-play');
    var videoEl = document.getElementById('uh-video-el');
    if (playBtn && videoEl) {
      playBtn.addEventListener('click', function () {
        videoEl.controls = true;
        playBtn.style.display = 'none';
        var p = videoEl.play();
        if (p && p.catch) p.catch(function () { videoEl.controls = true; });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
