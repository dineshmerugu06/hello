/* Imperium redesign — motion + the one live thing.
   All motion is transform/opacity, gated on prefers-reduced-motion.
   Content is fully visible without this file. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Section entrances: staggered, once, in reading order ---- */
  var arrivals = document.querySelectorAll(".arrive, .shutter");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
          return c.classList && (c.classList.contains("arrive") || c.classList.contains("shutter"));
        });
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(idx, 5) * 75 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    arrivals.forEach(function (el) { io.observe(el); });
  } else {
    arrivals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Moving pictures: scroll-linked drift on the big photographs ---- */
  var drifters = Array.prototype.slice.call(document.querySelectorAll(".ph-drift img"));
  if (drifters.length && !reduced) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      drifters.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; /* -0.5 .. 0.5 through the screen */
        var y = Math.max(-11, Math.min(-1, -6 + p * 10));
        img.style.setProperty("--py", y.toFixed(2) + "%");
      });
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---- The agents: margin notes light their row in the Commander panel ---- */
  var consoleEl = document.querySelector(".console");
  if (consoleEl) {
    var rows = {};
    consoleEl.querySelectorAll(".console-agents li").forEach(function (li) {
      rows[li.getAttribute("data-agent")] = li;
    });
    var notes = document.querySelectorAll(".note");
    var clearLit = function () {
      consoleEl.classList.remove("has-active");
      Object.keys(rows).forEach(function (k) { rows[k].classList.remove("is-lit"); });
      notes.forEach(function (n) { n.classList.remove("is-active"); n.setAttribute("aria-pressed", "false"); });
    };
    notes.forEach(function (note) {
      var key = note.getAttribute("data-agent");
      var light = function () {
        clearLit();
        if (rows[key]) { rows[key].classList.add("is-lit"); consoleEl.classList.add("has-active"); }
        note.classList.add("is-active"); note.setAttribute("aria-pressed", "true");
      };
      note.addEventListener("mouseenter", light);
      note.addEventListener("focus", light);
      note.addEventListener("click", light);
      note.addEventListener("mouseleave", clearLit);
      note.addEventListener("blur", clearLit);
    });
  }

  /* ---- Choose your mode: the live thing ---- */
  var table = document.querySelector(".plans");
  var readout = document.getElementById("configReadout");
  var cta = document.getElementById("configCta");
  if (table && readout && cta) {
    var MODES = {
      logic: {
        label: "Local Logic",
        text: "Local Logic: deterministic code alone — filters, scoring and tracking with no AI model. It always works, even with Ollama off."
      },
      "3b": {
        label: "Ollama 3B",
        text: "Ollama 3B: qwen2.5:3b adds drafting and summaries on modest hardware — faster answers, same agents, same $0."
      },
      "7b": {
        label: "Ollama 7B",
        text: "Ollama 7B: the strongest local reasoning — deep resume tailoring and guardrail fact-checking, on your machine."
      }
    };
    var ADDONS = [
      { id: "addon-research", label: "Research Notes" },
      { id: "addon-ats", label: "ATS Scoring" },
      { id: "addon-form", label: "Form Filling" }
    ];
    var current = "7b";
    var sync = function () {
      var chosen = ADDONS.filter(function (a) {
        var box = document.getElementById(a.id);
        return box && box.checked;
      }).map(function (a) { return a.label; });
      var addonLine = chosen.length ? chosen.join(", ") : "None";
      readout.textContent = MODES[current].text;
      var subject = encodeURIComponent("Imperium — " + MODES[current].label);
      var body = encodeURIComponent(
        "Mode: " + MODES[current].label + "\nAdd-ons: " + addonLine + "\nTotal: $0"
      );
      cta.href = "mailto:dinesh.merugu.kumar@gmail.com?subject=" + subject + "&body=" + body;
    };
    document.querySelectorAll(".plan-pick").forEach(function (btn) {
      btn.addEventListener("click", function () {
        current = btn.getAttribute("data-pick");
        table.setAttribute("data-selected", current);
        document.querySelectorAll(".plan-pick").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        sync();
      });
    });
    ADDONS.forEach(function (a) {
      var box = document.getElementById(a.id);
      if (box) box.addEventListener("change", sync);
    });
    table.setAttribute("data-selected", current);
    sync();
  }
})();
