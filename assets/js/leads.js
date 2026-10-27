/* ==========================================================================
   Lead delivery → /api/lead → Zapier "Catch Hook"  (shared by both forms)
   --------------------------------------------------------------------------
   The browser used to POST straight to hooks.zapier.com. Ad blockers and
   privacy extensions commonly blocklist that domain, so the request would
   be silently dropped (fire-and-forget + no-cors swallows the failure)
   while the form still showed success. We now POST same-origin to
   /api/lead (see that file), which relays to Zapier server-side — nothing
   in the browser talks to zapier.com, so domain-based blockers can't
   interfere. The actual webhook URLs now live only in api/lead.js.

   Each form has its OWN webhook, keyed by its `source`. A source with no
   matching entry in api/lead.js's HOOKS map is a safe no-op server-side —
   this keeps each Zap's data clean (e.g. the quiz Sheet only gets quiz leads).

   Fields sent:
     • source, page (path)                                    — on every submission
     • timestamp  (ISO 8601, machine-readable)                 — on every submission
     • submittedOn (human-readable UTC, e.g. "Jul 27, 2026, 10:28 PM UTC" — map
       this to your "Submitted On" column so it reads as a real date)
     • quiz  (source "offense-vulnerability-quiz"):        firstName, lastName, email, score
       (posted once the quiz is finished; `score` is the final result as a
        string like "20 of 28")
     • bonus (source "unoffendable-heart-preorder-bonus"): firstName, lastName, email, retailer, orderNo

   Fire-and-forget: we never block the form flow on the relay's response.
   ========================================================================== */
(function () {
  'use strict';

  // Sources this page is allowed to post. Keep in sync with api/lead.js's
  // HOOKS map — this list only gates the client-side no-op check below.
  var SOURCES = ['offense-vulnerability-quiz', 'unoffendable-heart-preorder-bonus'];

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
    if (SOURCES.indexOf(source) === -1) return false; // not a known form — no-op
    try {
      var now = new Date();
      var payload = {
        source: source,
        timestamp: now.toISOString(),      // machine-readable ISO 8601
        submittedOn: readableUTC(now),     // human-readable, e.g. "Jul 27, 2026, 10:28 PM UTC"
        page: location.pathname
      };
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] != null) payload[k] = String(data[k]);
        });
      }
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      return source ? SOURCES.indexOf(source) !== -1 : SOURCES.length > 0;
    }
  };
})();
