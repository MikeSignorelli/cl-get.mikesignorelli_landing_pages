/* ==========================================================================
   Server-side relay → Zapier "Catch Hook"
   --------------------------------------------------------------------------
   The browser used to POST straight to hooks.zapier.com. Ad blockers and
   privacy extensions commonly blocklist that domain, so the client-side
   fetch would silently fail (fire-and-forget + no-cors swallows the error)
   while the form still showed a success state. Routing through this
   same-origin endpoint means the browser never talks to zapier.com, so
   those blockers have nothing to match.

   Keep this HOOKS map in sync with assets/js/leads.js's SOURCES list.
   ========================================================================== */

var HOOKS = {
  'offense-vulnerability-quiz':        'https://hooks.zapier.com/hooks/catch/29186855/41lv7ll/',
  'unoffendable-heart-preorder-bonus': 'https://hooks.zapier.com/hooks/catch/29186855/41glv8k/'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  var data = req.body || {};
  var source = data.source;
  var url = HOOKS[source];
  if (!url) {
    res.status(400).json({ ok: false, error: 'Unknown or unconfigured source' });
    return;
  }

  var body = new URLSearchParams();
  Object.keys(data).forEach(function (k) {
    if (data[k] != null) body.set(k, String(data[k]));
  });

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'Upstream delivery failed' });
  }
}
