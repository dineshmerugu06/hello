/* Imperium redesign sample — motion + the two working fragments.
   Content is fully readable without this file: every hidden state is
   applied from here / behind html.js + no-preference in the CSS. */
(function () {
  'use strict';

  /* Section entrances: heading, text, picture — staggered by the observer order */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero gate fragment: reads the visitor's real clock; the Submit in it is the user's */
  var clock = document.getElementById('gate-clock');
  function tick() {
    if (clock && document.contains(clock)) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick(); setInterval(tick, 1000);

  var submit = document.getElementById('gate-submit');
  var readout = document.getElementById('gate-readout');
  var awaitRow = document.getElementById('gate-await');
  if (submit) {
    submit.addEventListener('click', function () {
      var when = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      submit.disabled = true;
      submit.textContent = 'Submitted by you';
      if (awaitRow) { awaitRow.innerHTML = 'Submitted by you · ' + when; }
      if (readout) readout.innerHTML = 'Now the Tracker follows it. In the app, this click is yours alone — the agent only ever fills and stops.';
    });
  }

  /* The locked flow: slider drives clause, fragment state, fill and names */
  var CLAUSES = [
    'First, real jobs come in',
    'Then, your resume is tailored',
    'Next, checked against the ATS',
    'Then, the form is filled',
    'Now, only you can submit',
    'Finally, every step is tracked'
  ];
  var range = document.getElementById('flow-range');
  var clause = document.getElementById('flow-clause');
  var fill = document.getElementById('flow-fill');
  var panes = document.querySelectorAll('.stage__pane');
  var names = document.querySelectorAll('#flow-names li');
  if (names[4]) names[4].classList.add('is-gate');
  function setStage(i) {
    if (clause) {
      clause.style.opacity = '0';
      setTimeout(function () {
        clause.textContent = CLAUSES[i];
        clause.classList.toggle('is-accent', i === 4);
        clause.style.opacity = '1';
      }, 200);
    }
    panes.forEach(function (p) {
      var on = Number(p.dataset.pane) === i;
      p.hidden = !on;
      p.style.opacity = on ? '1' : '0';
    });
    names.forEach(function (n, k) { n.classList.toggle('is-on', k === i); });
    if (fill) fill.style.width = (i / 5 * 100) + '%';
    if (range) range.setAttribute('aria-valuetext', names[i] ? names[i].textContent : '');
  }
  if (range) {
    range.addEventListener('input', function () { setStage(Number(range.value)); });
    setStage(0);
  }

  /* Choose your mode: the one live thing. Every choice totals $0. */
  var READOUTS = {
    'Local Logic': 'Local Logic: no AI model at all — the same agents, run on deterministic code alone.',
    'Ollama 3B': 'Ollama 3B: a light local model (qwen2.5:3b) drafts and summarises. The total stays $0.',
    'Ollama 7B': 'Ollama 7B: the strongest local reasoning (qwen2.5:7b) — deep tailoring and full delegation. The total stays $0.'
  };
  var form = document.getElementById('config');
  var configReadout = document.getElementById('config-readout');
  var action = document.getElementById('config-action');
  function updateConfig() {
    var mode = form.querySelector('input[name="mode"]:checked');
    if (!mode) return;
    var addons = Array.prototype.map.call(
      form.querySelectorAll('input[name="addon"]:checked'),
      function (a) { return a.value; }
    );
    if (configReadout) {
      configReadout.textContent = READOUTS[mode.value] +
        (addons.length ? ' Included: ' + addons.join(', ') + '.' : ' Nothing extra included.');
    }
    if (action) {
      action.href = 'mailto:dinesh.merugu.kumar@gmail.com?subject=' +
        encodeURIComponent('Imperium — ' + mode.value + (addons.length ? ' · ' + addons.join(', ') : ''));
    }
  }
  if (form) {
    form.addEventListener('change', updateConfig);
    updateConfig();
  }
})();
