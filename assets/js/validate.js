/* ==========================================================================
   Shared client-side form validation (both landing pages)
   Per-field required + email checks, with inline messages, invalid-field
   highlighting, ARIA wiring, and live error clearing as the user corrects.
   Exposes window.UHForms.{ validate, attachLiveClear }.
   ========================================================================== */
(function () {
  'use strict';

  // Structural email regex: sensible local part, a real domain, a 2+ letter TLD.
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  // Stricter than the regex alone: also rejects throwaway shapes like "a@b.co"
  // (1-char local part or 1-char domain label) that are technically valid.
  function validEmail(v) {
    if (!EMAIL_RE.test(v)) return false;
    var at = v.lastIndexOf('@');
    var local = v.slice(0, at);
    var labels = v.slice(at + 1).split('.');
    var tld = labels[labels.length - 1];
    var sld = labels.length >= 2 ? labels[labels.length - 2] : '';
    if (local.length < 2) return false;   // e.g. "a@gmail.com"
    if (sld.length < 2) return false;     // e.g. "test@b.co"
    if (tld.length < 2) return false;
    return true;
  }

  function control(form, name) { return form.elements[name]; }

  function errorEl(ctrl, name) {
    var id = 'uh-err-' + name;
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('span');
      el.id = id;
      el.className = 'uh-field-error';
      el.setAttribute('role', 'alert');
      el.hidden = true;
      ctrl.insertAdjacentElement('afterend', el); // sits directly under the field
    }
    return el;
  }

  function showError(ctrl, el, msg) {
    el.textContent = msg;
    el.hidden = false;
    ctrl.classList.add('uh-invalid');
    ctrl.setAttribute('aria-invalid', 'true');
    ctrl.setAttribute('aria-describedby', el.id);
  }

  function clearError(ctrl, el) {
    el.hidden = true;
    el.textContent = '';
    ctrl.classList.remove('uh-invalid');
    ctrl.removeAttribute('aria-invalid');
    ctrl.removeAttribute('aria-describedby');
  }

  function messageFor(field, value) {
    if (!value) return field.requiredMessage || ((field.label || 'This field') + ' is required.');
    if (field.minLength && value.length < field.minLength) {
      return (field.label || 'This field') + ' must be at least ' + field.minLength + ' characters.';
    }
    if (field.type === 'name' && !/[A-Za-z]/.test(value)) {
      return 'Please enter a valid ' + (field.label || 'name').toLowerCase() + '.';
    }
    if (field.type === 'email' && !validEmail(value)) return 'Please enter a valid email address.';
    return '';
  }

  /* Validate every field; render per-field errors; focus the first invalid.
     Returns { valid, values }. `fields` = [{ name, label, type, requiredMessage }]. */
  function validate(form, fields) {
    var firstInvalid = null;
    var values = {};
    fields.forEach(function (f) {
      var ctrl = control(form, f.name);
      if (!ctrl) return;
      var el = errorEl(ctrl, f.name);
      var value = (ctrl.value || '').trim();
      values[f.name] = value;
      var msg = messageFor(f, value);
      if (msg) {
        showError(ctrl, el, msg);
        if (!firstInvalid) firstInvalid = ctrl;
      } else {
        clearError(ctrl, el);
      }
    });
    if (firstInvalid) {
      try { firstInvalid.focus(); } catch (e) {}
      return { valid: false, values: values };
    }
    return { valid: true, values: values };
  }

  /* Clear a field's error as soon as it becomes valid while typing/changing. */
  function attachLiveClear(form, fields) {
    fields.forEach(function (f) {
      var ctrl = control(form, f.name);
      if (!ctrl || ctrl._uhLive) return;
      ctrl._uhLive = true;
      var handler = function () {
        var el = document.getElementById('uh-err-' + f.name);
        if (!el || el.hidden) return;
        if (!messageFor(f, (ctrl.value || '').trim())) clearError(ctrl, el);
      };
      ctrl.addEventListener('input', handler);
      ctrl.addEventListener('change', handler);
    });
  }

  window.UHForms = { validate: validate, attachLiveClear: attachLiveClear, validEmail: validEmail, EMAIL_RE: EMAIL_RE };
})();
