/* ==========================================================================
   The Unoffendable Heart — Offense Vulnerability Assessment
   Vanilla-JS re-implementation of the Claude Design (DCLogic) component.
   Behaviour, copy, questions and scoring are ported verbatim from the design
   source; only the runtime (React/DCLogic → vanilla) and the required a11y /
   lead-capture wiring have been added.
   ========================================================================== */
(function () {
  'use strict';

  // Lead delivery goes through the shared Zapier module (assets/js/leads.js).
  // Configure the webhook URL there; this is just the `source` tag for this form.
  var LEAD_SOURCE = 'offense-vulnerability-quiz';


  /* ---------------------------- Quiz data ------------------------------ */
  var QUESTIONS = [
    { text: 'How long does it typically take you to stop replaying an offensive comment someone made?',
      options: [
        { letter: 'A', label: 'Days or weeks: it runs on a loop in my mind', points: 4 },
        { letter: 'B', label: 'Several hours to a day before I can let it go', points: 3 },
        { letter: 'C', label: 'I process it within an hour or so and move on', points: 2 },
        { letter: 'D', label: "I rarely hold onto offenses; they don't stick", points: 1 } ] },
    { text: 'How many people are you currently “not speaking to” or actively avoiding because of past hurt?',
      options: [
        { letter: 'A', label: 'Three or more people', points: 4 },
        { letter: 'B', label: 'One or two people', points: 3 },
        { letter: 'C', label: 'No one currently, though I have in the past', points: 2 },
        { letter: 'D', label: "I can't think of anyone", points: 1 } ] },
    { text: 'When you think about a specific person who deeply hurt you, what happens in your body?',
      options: [
        { letter: 'A', label: 'I feel immediate tension, anger, or anxiety', points: 4 },
        { letter: 'B', label: 'I feel a dull ache, sadness, or heaviness', points: 3 },
        { letter: 'C', label: "I feel mostly neutral; I've processed most of it", points: 2 },
        { letter: 'D', label: 'I can genuinely feel compassion or pray for them', points: 1 } ] },
    { text: 'How often do you rehearse conversations in your head, things you wish you had said?',
      options: [
        { letter: 'A', label: 'Daily: I have ongoing mental arguments with people', points: 4 },
        { letter: 'B', label: 'Weekly: certain conversations keep replaying', points: 3 },
        { letter: 'C', label: 'Occasionally, when something really bothers me', points: 2 },
        { letter: 'D', label: "Rarely or never: what's done is done", points: 1 } ] },
    { text: 'How do you honestly feel about forgiving someone who hurt you deeply and never apologized?',
      options: [
        { letter: 'A', label: "Impossible: they don't deserve it", points: 4 },
        { letter: 'B', label: "I know I should, but I can't seem to do it", points: 3 },
        { letter: 'C', label: "I'm working on it; it's a process", points: 2 },
        { letter: 'D', label: "I've experienced that kind of freedom; it's real", points: 1 } ] },
    { text: 'Do you find yourself getting offended by the same type of behavior repeatedly? (feeling disrespected, overlooked, controlled, criticized)',
      options: [
        { letter: 'A', label: "Yes: there's a clear pattern I can't seem to break", points: 4 },
        { letter: 'B', label: 'Somewhat: I notice recurring themes', points: 3 },
        { letter: 'C', label: "Occasionally, but I'm learning to recognize it", points: 2 },
        { letter: 'D', label: 'Not really: offenses feel random and manageable', points: 1 } ] },
    { text: 'How would you describe your overall emotional state over the past six months?',
      options: [
        { letter: 'A', label: 'Exhausted, angry, bitter, or resentful most of the time', points: 4 },
        { letter: 'B', label: 'Up and down: good days and bad days, easily affected by others', points: 3 },
        { letter: 'C', label: 'Generally stable with occasional struggles', points: 2 },
        { letter: 'D', label: 'Peaceful and resilient, even when circumstances are hard', points: 1 } ] }
  ];

  /* ------------------------- Result definitions ------------------------ */
  function computeResult(answers, firstName) {
    var total = answers.reduce(function (a, b) { return a + (b || 0); }, 0);
    var name = firstName || 'Friend';
    var key = total >= 22 ? 'exposed' : total >= 15 ? 'wounded' : total >= 8 ? 'healing' : 'unoffendable';

    var tierDefs = [
      { key: 'exposed', label: 'Exposed' },
      { key: 'wounded', label: 'Wounded' },
      { key: 'healing', label: 'Healing' },
      { key: 'unoffendable', label: 'Unoffendable' }
    ];
    var activeIndex = tierDefs.map(function (t) { return t.key; }).indexOf(key);
    var tiers = tierDefs.map(function (t, i) {
      return {
        label: t.label,
        bar: i === activeIndex ? '#C2A064' : 'rgba(240,238,229,0.16)',
        color: i === activeIndex ? '#C2A064' : 'rgba(240,238,229,0.4)'
      };
    });

    var data = {
      exposed: {
        badge: 'High Vulnerability', headline: 'Your heart is exposed',
        paras: [
          name + ', your assessment reveals that your heart is currently highly vulnerable to offense.',
          "This isn't weakness. This is a wound, and wounds can heal.",
          "You're carrying hurts that haven't fully healed. When new offenses come, they don't bounce off; they stick, compound, and drain you."
        ],
        hasPatterns: true, patternsLabel: 'You may recognize these patterns:',
        patterns: ['Replaying conversations for days or weeks', 'Feeling exhausted by relationships that should give life', 'Wanting to let go but not knowing how'],
        hasTruth: true, truthLabel: "Here's the truth", truth: "You don't need thicker skin. You need a stronger heart.",
        ctaLead: "Pastor Mike Signorelli's new book The Unoffendable Heart, with a foreword by John Bevere, is the guide you need for the war being waged inside you.",
        hasMultiCta: false
      },
      wounded: {
        badge: 'Moderate Vulnerability', headline: 'Your heart is wounded',
        paras: [
          name + ", you're carrying unhealed wounds that make you more vulnerable to offense than you need to be.",
          "You're not constantly triggered, but certain people or situations get under your skin in ways that feel disproportionate. You've probably noticed the patterns."
        ],
        hasPatterns: true, patternsLabel: 'You may recognize these patterns:',
        patterns: ['Generally okay, but with specific triggers', 'Able to forgive but struggling to truly release', 'Knowing you should let it go, but not knowing how'],
        hasTruth: true, truthLabel: "Here's the truth", truth: "Your vulnerability isn't weakness; it's unfinished healing.",
        ctaLead: "Pastor Mike Signorelli's new book The Unoffendable Heart, with a foreword by John Bevere, provides the framework to heal the wounds that make you vulnerable.",
        hasMultiCta: false
      },
      healing: {
        badge: 'Low Vulnerability', headline: 'Your heart is healing',
        paras: [
          name + ", you've developed meaningful resilience against offense. You're not immune, but you've learned to process hurts without letting them define you.",
          "You can navigate difficult people without being destroyed. But you also know there's another level."
        ],
        hasPatterns: true, patternsLabel: 'You may still have:',
        patterns: ["Specific wounds that haven't fully healed", 'Certain people who can still get to you', 'A desire to help others who struggle more'],
        hasTruth: true, truthLabel: "Here's the invitation", truth: 'The principles that got you here can take you further.',
        ctaLead: "Pastor Mike Signorelli's new book The Unoffendable Heart, with a foreword by John Bevere, will reinforce what you've learned and take you deeper.",
        hasMultiCta: false
      },
      unoffendable: {
        badge: 'Minimal Vulnerability', headline: 'Your heart is strong',
        paras: [
          name + ', your assessment reveals remarkable spiritual resilience. Offense rarely sticks to you, and when it does, you process it quickly.',
          "What you have is rare. And it's needed.",
          'Here\'s the question: Do the people around you have what you have? Your spouse? Your kids? Your friends? In a culture drowning in outrage, the freedom you\'ve found is exactly what others are searching for.',
          'You might be exactly the person to give this book away.'
        ],
        hasPatterns: false, patternsLabel: '', patterns: [],
        hasTruth: false, truthLabel: '', truth: '',
        ctaLead: "Pastor Mike Signorelli's new book The Unoffendable Heart, with a foreword by John Bevere, gives language for what you've experienced and tools to help others find freedom.",
        hasMultiCta: true
      }
    };
    var r = data[key];
    r.scoreText = 'Your score: ' + total + ' of 28';
    r.tiers = tiers;
    return r;
  }

  /* ------------------------------ State -------------------------------- */
  /* State is in-memory only: it survives closing and reopening the modal
     within a single page view, but a full page reload starts fresh
     (reset-on-reload) — there is no sessionStorage persistence. `leadKey`
     records the last email a lead was sent for, so the same submission is
     never POSTed twice (resubmission prevention). */
  var state = { view: 'landing', step: 0, firstName: '', lastName: '', email: '', location: '', answers: [], exitShown: false, leadKey: null };

  function resetQuiz() {
    state.step = 0;
    state.answers = [];
  }

  /* ---------------------------- DOM refs ------------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var overlay, viewEmail, viewQuestion, viewResult, viewThankyou,
      progress, progressBar, progressLabel, announce, exitPopup, emailForm, thanksBody;
  var lastTrigger = null;

  /* --------------------------- Rendering ------------------------------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showView(name) {
    [viewEmail, viewQuestion, viewResult, viewThankyou].forEach(function (v) { v.hidden = true; });
    if (name === 'email') viewEmail.hidden = false;
    else if (name === 'question') viewQuestion.hidden = false;
    else if (name === 'result') viewResult.hidden = false;
    else if (name === 'thankyou') viewThankyou.hidden = false;
  }

  function renderQuestion() {
    var q = QUESTIONS[state.step - 1];
    var opts = q.options.map(function (o) {
      return '<button class="uh-opt" data-points="' + o.points + '" style="display:flex; align-items:center; gap:18px; text-align:left; width:100%; background:#1C2214; border:1px solid rgba(240,238,229,0.16); border-radius:12px; padding:20px 22px; cursor:pointer; transition:border-color .18s, background .18s, transform .18s;">' +
        '<span style="flex-shrink:0; width:34px; height:34px; border-radius:999px; border:1px solid rgba(194,160,100,0.6); display:flex; align-items:center; justify-content:center; font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:15px; color:#C2A064;">' + esc(o.letter) + '</span>' +
        '<span style="font-family:\'Newsreader\',serif; font-size:17px; line-height:1.45; color:#F0EEE5;">' + esc(o.label) + '</span>' +
      '</button>';
    }).join('');
    var back = state.step >= 1
      ? '<button class="uh-back" data-action="back" style="margin-top:28px; display:inline-flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer; font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(240,238,229,0.55);">← Back</button>'
      : '';
    viewQuestion.innerHTML =
      '<div class="uh-anim">' +
        '<div style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#C2A064; margin-bottom:18px;">Question ' + state.step + ' of 7</div>' +
        '<h2 style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:0.01em; font-size:32px; line-height:1.16; color:#F0EEE5; margin:0 0 38px;">' + esc(q.text) + '</h2>' +
        '<div style="display:flex; flex-direction:column; gap:13px;">' + opts + '</div>' + back +
      '</div>';
  }

  function renderResult() {
    var r = computeResult(state.answers, state.firstName);
    var tiers = r.tiers.map(function (t) {
      return '<div style="flex:1; text-align:center;">' +
        '<div style="height:6px; background:' + t.bar + '; margin-bottom:8px;"></div>' +
        '<span style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:10px; letter-spacing:0.04em; text-transform:uppercase; color:' + t.color + ';">' + esc(t.label) + '</span>' +
      '</div>';
    }).join('');
    var paras = r.paras.map(function (p) {
      return '<p style="font-family:\'Newsreader\',serif; font-size:18px; line-height:1.68; color:rgba(240,238,229,0.82); margin:0 0 18px;">' + esc(p) + '</p>';
    }).join('');
    var patterns = '';
    if (r.hasPatterns) {
      var items = r.patterns.map(function (p) {
        return '<div style="display:flex; gap:12px; align-items:flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2A064" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:3px;"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4M12 16h.01"></path></svg><span style="font-family:\'Newsreader\',serif; font-size:16.5px; line-height:1.5; color:rgba(240,238,229,0.78);">' + esc(p) + '</span></div>';
      }).join('');
      patterns =
        '<div style="margin:26px 0 6px;">' +
          '<div style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:#C2A064; margin-bottom:16px;">' + esc(r.patternsLabel) + '</div>' +
          '<div style="display:flex; flex-direction:column; gap:12px;">' + items + '</div>' +
        '</div>';
    }
    var truth = '';
    if (r.hasTruth) {
      truth =
        '<div style="margin-top:30px; padding-top:26px; border-top:1px solid rgba(240,238,229,0.14);">' +
          '<div style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(240,238,229,0.5); margin-bottom:10px;">' + esc(r.truthLabel) + '</div>' +
          '<p style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:0.01em; font-size:22px; line-height:1.28; color:#C2A064; margin:0;">' + esc(r.truth) + '</p>' +
        '</div>';
    }
    var multiCta = r.hasMultiCta
      ? '<a class="uh-h-outline" href="https://get.mikesignorelli.com/the-unoffendable-heart-pre-order" style="display:inline-flex; align-items:center; gap:10px; font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:14px; letter-spacing:0.04em; text-transform:uppercase; color:#F0EEE5; background:transparent; border:2px solid rgba(240,238,229,0.5); padding:15px 30px; border-radius:999px; cursor:pointer; text-decoration:none;">Order Multiple Copies →</a>'
      : '';
    var bonus =
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:13px 24px; margin-bottom:30px;">' +
        bonusItem('M2 4.5A2.5 2.5 0 0 1 4.5 2H10v18H4.5A2.5 2.5 0 0 0 2 20.5z"></path><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H14v18h5.5a2.5 2.5 0 0 1 2.5 2.5z', 'Sample Chapters (Intro + Ch. 1)') +
        bonusItem('M4 3h11l5 5v13H4z"></path><path d="M8 8h6M8 12h8M8 16h8', '7-Day Devotional &amp; Journal') +
        bonusItem('M22 9 12 4 2 9l10 5z"></path><path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5', 'Masterclass on Forgiveness') +
        bonusItem('', 'Live Zoom Q&amp;A on Release Day', true) +
      '</div>';

    viewResult.innerHTML =
      '<div class="uh-anim">' +
        '<div style="text-align:center; margin-bottom:20px;"><span style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#C2A064;">Your result · ' + esc(r.badge) + '</span></div>' +
        '<div style="display:flex; gap:8px; max-width:520px; margin:0 auto 32px;">' + tiers + '</div>' +
        '<h2 style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:0.01em; font-size:38px; line-height:1.08; color:#F0EEE5; margin:0 0 8px; text-align:center;">' + esc(r.headline) + '</h2>' +
        '<p style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(240,238,229,0.5); text-align:center; margin:0 0 38px;">' + esc(r.scoreText) + '</p>' +
        '<div style="background:#1C2214; border:1px solid rgba(240,238,229,0.12); border-radius:12px; padding:40px 40px 44px;">' + paras + patterns + truth + '</div>' +
        '<div style="margin-top:30px; background:#0F1309; border-top:4px solid #C2A064; border-radius:0 0 12px 12px; padding:40px;">' +
          '<p style="font-family:\'Newsreader\',serif; font-size:17.5px; line-height:1.62; color:rgba(240,238,229,0.82); margin:0 0 24px;">' + esc(r.ctaLead) + '</p>' +
          '<div style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#C2A064; margin-bottom:16px;">Pre-order now &amp; get instant access to:</div>' +
          bonus +
          '<div style="display:flex; gap:14px; flex-wrap:wrap;">' +
            '<a class="uh-h-gold" href="https://get.mikesignorelli.com/the-unoffendable-heart-pre-order" style="display:inline-flex; align-items:center; gap:10px; font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:14px; letter-spacing:0.04em; text-transform:uppercase; color:#171C10; background:#C2A064; padding:16px 32px; border-radius:999px; border:none; cursor:pointer; text-decoration:none;">Pre-Order Now + Get Instant Access →</a>' + multiCta +
          '</div>' +
        '</div>' +
        '<div style="text-align:center; margin-top:26px;"><a class="uh-h-linkmuted" data-action="closeQuiz" role="button" tabindex="0" style="font-family:\'Saira SemiCondensed\',sans-serif; font-weight:600; font-size:12px; letter-spacing:0.06em; text-transform:uppercase; color:rgba(240,238,229,0.5); text-decoration:none; cursor:pointer;">← Back to the landing page</a></div>' +
      '</div>';
  }

  function bonusItem(paths, label, isVideo) {
    var svg = isVideo
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2A064" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;"><rect x="2" y="5" width="14" height="14" rx="2"></rect><path d="m22 8-6 4 6 4z"></path></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2A064" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;"><path d="' + paths + '"></path></svg>';
    return '<div style="display:flex; gap:11px; align-items:flex-start;">' + svg +
      '<span style="font-family:\'Newsreader\',serif; font-size:15px; line-height:1.4; color:rgba(240,238,229,0.82);">' + label + '</span></div>';
  }

  /* Central render: reflect state → DOM (view, progress, overlay open) */
  function render() {
    var inQuiz = state.view === 'quiz';
    var isEmail = inQuiz && state.step === 0;
    var isQuestion = inQuiz && state.step >= 1 && state.step <= 7;
    var isResult = inQuiz && state.step === 8;
    var isThankyou = state.view === 'thankyou';
    var open = inQuiz || isThankyou;

    if (isQuestion) renderQuestion();
    if (isResult) { renderResult(); postLead(); }
    if (isThankyou) {
      thanksBody.textContent = (state.firstName ? state.firstName + ', thank' : 'Thank') +
        ' you for pre-ordering The Unoffendable Heart. Your copy is reserved, and your bonuses are unlocked right now.';
    }

    if (isEmail) showView('email');
    else if (isQuestion) showView('question');
    else if (isResult) showView('result');
    else if (isThankyou) showView('thankyou');

    // progress bar
    var showProgress = isQuestion || isResult;
    progress.style.display = showProgress ? 'flex' : 'none';
    if (showProgress) {
      var width = Math.round(isResult ? 100 : ((state.step - 1) / 7) * 100);
      progressBar.style.width = width + '%';
      progressLabel.textContent = isResult ? 'Complete' : (state.step + ' / 7');
    }

    setOverlayOpen(open);
  }

  /* ------------------------ Overlay open/close ------------------------- */
  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }
  function setOverlayOpen(open) {
    var wasOpen = !overlay.classList.contains('uh-overlay-hidden');
    overlay.classList.toggle('uh-overlay-hidden', !open);
    lockScroll(open || !exitPopup.classList.contains('uh-overlay-hidden'));
    if (open && !wasOpen) {
      overlay.scrollTop = 0;
      focusFirst(overlay);
    }
  }

  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function focusFirst(root) {
    var els = focusables(root);
    // prefer the first field/interactive element in the visible view, not the header
    var view = root.querySelector('.uh-view:not([hidden])');
    var pick = (view && focusables(view)[0]) || els[0];
    if (pick) pick.focus();
  }

  /* ---------------------------- Actions -------------------------------- */
  function openQuiz(trigger) {
    // remember the *opener* for focus-return; ignore triggers inside the overlay
    if (trigger && !overlay.contains(trigger)) lastTrigger = trigger;
    else if (!lastTrigger) lastTrigger = document.activeElement;
    // A finished run (result shown, or after the pre-order thank-you) starts
    // over so the email form is always reachable; an in-progress run (steps
    // 1-7) resumes where it left off.
    if (state.step >= 8 || state.view === 'thankyou') resetQuiz();
    state.view = 'quiz';
    if (typeof state.step !== 'number' || state.step < 0 || state.step > 8) state.step = 0;
    hideExit();
    render();
  }
  function closeQuiz() {
    state.view = 'landing';
    render();
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }
  function goThankyou(trigger) {
    // only landing CTAs (outside the overlay) become the focus-return target
    if (trigger && !overlay.contains(trigger)) lastTrigger = trigger;
    state.view = 'thankyou';
    render();
  }

  var EMAIL_FIELDS = [
    { name: 'firstName', label: 'First name', type: 'name', minLength: 3 },
    { name: 'lastName',  label: 'Last name' },
    { name: 'email',     label: 'Email address', type: 'email' },
    { name: 'location',  label: 'Location', requiredMessage: 'Please select your location.' }
  ];

  function submitEmail(e) {
    e.preventDefault();
    var form = e.target;
    var res = window.UHForms
      ? window.UHForms.validate(form, EMAIL_FIELDS)
      : { valid: form.checkValidity ? form.checkValidity() : true, values: {
          firstName: (form.elements.firstName.value || '').trim(),
          lastName:  (form.elements.lastName.value || '').trim(),
          email:     (form.elements.email.value || '').trim(),
          location:  (form.elements.location && form.elements.location.value || '').trim() } };
    if (!res.valid) return;

    state.firstName = res.values.firstName;
    state.lastName = res.values.lastName;
    state.email = res.values.email;
    state.location = res.values.location;
    // The lead is NOT posted here: we wait until the quiz is finished so the
    // final score can be delivered with it (see postLead / renderResult).
    state.step = 1;
    render();
  }

  // Deliver the completed lead (name, email + final score) to Zapier via the
  // shared module (assets/js/leads.js). Called once the result is reached.
  // No-op until the Zapier Catch Hook URL is configured there.
  // Resubmission prevention: only POST once per (email + score) so re-renders
  // of the result view don't fire duplicate submissions.
  function postLead() {
    if (!state.email) return;
    var total = state.answers.reduce(function (a, b) { return a + (b || 0); }, 0);
    var key = state.email.toLowerCase() + '|' + total;
    if (key === state.leadKey) return;
    state.leadKey = key;
    if (window.UHLead) {
      window.UHLead.post(LEAD_SOURCE, {
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        location: state.location,
        score: total + ' of 28'   // e.g. "20 of 28" (max possible is 28)
      });
    }
  }

  function selectAnswer(points) {
    state.answers[state.step - 1] = points;
    state.step = state.step < 7 ? state.step + 1 : 8;
    render();
  }
  function back() {
    state.step = state.step > 1 ? state.step - 1 : 0;
    render();
  }

  /* --------------------------- Landing bits ---------------------------- */
  function dismissAnnounce() { if (announce) announce.style.display = 'none'; }
  function showExit() {
    if (state.exitShown || state.view !== 'landing') return;
    state.exitShown = true;
    exitPopup.classList.remove('uh-overlay-hidden');
    lockScroll(true);
    var f = focusables(exitPopup)[0];
    if (f) f.focus();
  }
  function hideExit() {
    exitPopup.classList.add('uh-overlay-hidden');
    if (overlay.classList.contains('uh-overlay-hidden')) lockScroll(false);
  }
  function faqToggle(btn) {
    var i = btn.getAttribute('data-faq');
    var ans = document.querySelector('[data-faq-a="' + i + '"]');
    var open = !ans.hidden;
    ans.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    var sign = btn.querySelector('[data-faq-sign]') || btn.querySelectorAll('span')[1];
    if (sign) sign.textContent = open ? '+' : '–';
  }

  /* ------------------------ Event delegation --------------------------- */
  function onClick(e) {
    var optBtn = e.target.closest ? e.target.closest('.uh-opt') : null;
    if (optBtn) { selectAnswer(parseInt(optBtn.getAttribute('data-points'), 10)); return; }

    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    var action = el.getAttribute('data-action');
    switch (action) {
      case 'openQuiz': openQuiz(el); break;
      case 'closeQuiz': closeQuiz(); break;
      case 'goThankyou': e.preventDefault(); goThankyou(el); break;
      case 'dismiss': dismissAnnounce(); break;
      case 'dismissExit': hideExit(); break;
      case 'stop': e.stopPropagation(); break;
      case 'back': back(); break;
      case 'faqToggle': faqToggle(el); break;
    }
  }

  // Make click-only <a> elements (no href) behave as real buttons for keyboards
  function upgradeAnchorButtons(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('a[data-action]'), function (a) {
      if (!a.getAttribute('href') && !a.hasAttribute('role')) {
        a.setAttribute('role', 'button');
        a.setAttribute('tabindex', '0');
      }
    });
  }

  function onKeydown(e) {
    // Enter/Space activates link-styled buttons (a[role=button])
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches &&
        e.target.matches('a[role="button"][data-action]')) {
      e.preventDefault();
      e.target.click();
      return;
    }
    if (e.key === 'Escape') {
      if (!exitPopup.classList.contains('uh-overlay-hidden')) { hideExit(); return; }
      if (!overlay.classList.contains('uh-overlay-hidden')) { closeQuiz(); return; }
    }
    if (e.key === 'Tab' && !overlay.classList.contains('uh-overlay-hidden')) {
      trapFocus(e, overlay);
    } else if (e.key === 'Tab' && !exitPopup.classList.contains('uh-overlay-hidden')) {
      trapFocus(e, exitPopup);
    }
  }
  function trapFocus(e, root) {
    var els = focusables(root);
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }

  /* ------------------------------ Init --------------------------------- */
  function init() {
    overlay = $('uh-overlay');
    viewEmail = $('uh-view-email');
    viewQuestion = $('uh-view-question');
    viewResult = $('uh-view-result');
    viewThankyou = $('uh-view-thankyou');
    progress = $('uh-progress');
    progressBar = $('uh-progress-bar');
    progressLabel = $('uh-progress-label');
    announce = $('uh-announce');
    exitPopup = $('uh-exit');
    emailForm = $('uh-email-form');
    thanksBody = $('uh-thanks-body');

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    if (emailForm) {
      emailForm.addEventListener('submit', submitEmail);
      if (window.UHForms) window.UHForms.attachLiveClear(emailForm, EMAIL_FIELDS);
    }
    upgradeAnchorButtons(document);

    // Desktop exit-intent: pointer leaves via the top of the viewport
    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 0 && !e.relatedTarget && !state.exitShown && state.view === 'landing') showExit();
    });

    render(); // landing
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
