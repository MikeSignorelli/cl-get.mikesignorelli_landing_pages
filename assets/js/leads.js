/* ==========================================================================
   Lead delivery → Zapier "Catch Hook"  (shared by both landing-page forms)
   --------------------------------------------------------------------------
   Each form has its OWN webhook, keyed by its `source` in the HOOKS map below.
   Leave a source's URL blank to disable delivery for that form (safe no-op) —
   this keeps each Zap's data clean (e.g. the quiz Sheet only gets quiz leads).

   SETUP (per form, in Zapier):
     1. Create a Zap. Trigger app: "Webhooks by Zapier".
     2. Trigger event: "Catch Hook"  (NOT "Catch Raw Hook").
     3. Leave "Pick off a Child Key" BLANK — our payload is flat.
     4. Copy the webhook URL and paste it next to the matching source below.
     5. Build the action (Google Sheet, Mailchimp, …) and map the fields.

   Fields sent (application/x-www-form-urlencoded so Zapier maps each on its own):
     • source, page (path)                                    — on every submission
     • timestamp  (ISO 8601, machine-readable)                 — on every submission
     • submittedOn (human-readable UTC, e.g. "Jul 27, 2026, 10:28 PM UTC" — map
       this to your "Submitted On" column so it reads as a real date)
     • quiz  (source "offense-vulnerability-quiz"):        firstName, lastName, email, score
       (posted once the quiz is finished; `score` is the final result as a
        string like "20 of 28")
     • bonus (source "unoffendable-heart-preorder-bonus"): firstName, lastName, email, retailer, orderNo

   mode:"no-cors" + fire-and-forget: Zapier's hook returns no CORS headers, and
   we never read the response or block the form flow.
   ========================================================================== */
(function () {
  'use strict';

  // One Zapier Catch Hook URL per form. Blank = that form does not post.
  var HOOKS = {
    'offense-vulnerability-quiz':        'https://hooks.zapier.com/hooks/catch/1556442/440jatu/',
    'unoffendable-heart-preorder-bonus': 'https://hooks.zapier.com/hooks/catch/1556442/447odu1/'
  };

  // Human-readable UTC timestamp, e.g. "Jul 27, 2026, 10:28 PM UTC".
  // Sent alongside the ISO `timestamp` so the sheet shows a real date instead
  // of a raw serial number. The " UTC" suffix also stops Google Sheets from
  // re-parsing it into a serial, so it stays readable regardless of the
  // column's number format. Falls back to ISO on any locale/engine quirk.
  function readableUTC(d) {
    try {
      return d.toLocaleString('en-US', {
        timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      }) + ' UTC';
    } catch (e) {
      return d.toISOString();
    }
  }

  function post(source, data) {
    var url = HOOKS[source];
    if (!url) return false; // no hook configured for this form — no-op
    try {
      var now = new Date();
      var body = new URLSearchParams();
      body.set('source', source);
      body.set('timestamp', now.toISOString());      // machine-readable ISO 8601
      body.set('submittedOn', readableUTC(now));     // human-readable, e.g. "Jul 27, 2026, 10:28 PM UTC"
      body.set('page', location.pathname);
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] != null) body.set(k, String(data[k]));
        });
      }
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',   // Zapier hook sends no CORS headers; we don't read the response
        body: body,        // URLSearchParams → application/x-www-form-urlencoded (Zapier parses fields)
        keepalive: true    // still delivers if the page is navigating away
      }).catch(function () { /* silent: never block the form flow */ });
      return true;
    } catch (e) {
      return false;
    }
  }

  window.UHLead = {
    post: post,
    configured: function (source) {
      return source
        ? !!HOOKS[source]
        : Object.keys(HOOKS).some(function (s) { return !!HOOKS[s]; });
    }
  };
})();
