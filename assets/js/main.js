/* Konawiri Digital – main.js (ohne externe Bibliotheken, ohne Tracking, ohne Cookies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  var loader = document.querySelector(".loader");

  function ready() {
    body.classList.remove("is-loading");
    doc.classList.add("is-ready");
  }

  if (loader && !reduce) {
    var fill = loader.querySelector(".loader__fill");
    var count = loader.querySelector(".loader__count");
    var start = performance.now();
    var minDuration = 1900; // ms – kurz genug, um nicht zu nerven
    var pageLoaded = document.readyState === "complete";
    window.addEventListener("load", function () { pageLoaded = true; });

    var progress = 0;
    (function tick(now) {
      var t = Math.min((now - start) / minDuration, 1);
      // Easing: schnell an, langsam aus
      var eased = 1 - Math.pow(1 - t, 3);
      var target = pageLoaded ? eased : Math.min(eased, 0.9);
      progress += (target - progress) * 0.18;
      if (t >= 1 && pageLoaded && progress > 0.995) progress = 1;
      var p = Math.round(progress * 100);
      fill.style.transform = "scaleX(" + progress + ")";
      count.textContent = p;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add("is-leaving");
          setTimeout(function () {
            loader.classList.add("is-done");
            ready();
            setTimeout(function () { loader.classList.add("is-gone"); }, 1000);
          }, 260);
        }, 180);
      }
    })(start);
    // Sicherheitsnetz: niemals länger als 5 s blockieren
    setTimeout(function () {
      if (!loader.classList.contains("is-done")) {
        loader.classList.add("is-done");
        ready();
      }
    }, 5000);
  } else {
    if (loader) loader.classList.add("is-gone");
    ready();
  }

  /* ---------- Header beim Scrollen ---------- */
  var header = document.querySelector(".header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);
    updateSteps();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile Navigation ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
        body.style.overflow = "";
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) burger.click();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Zähler (Performance) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var dur = 1600;
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min((now - t0) / dur, 1);
      var v = Math.round(to * (1 - Math.pow(1 - t, 4)));
      el.textContent = v;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = "0"; cio.observe(c); });
  }

  /* ---------- Ablauf-Linie ---------- */
  var stepsWrap = document.querySelector(".steps");
    var steps = document.querySelectorAll(".step");
  function updateSteps() {
    if (!stepsWrap) return;
    var r = stepsWrap.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.7 - r.top) / (r.height || 1);
    if (window.innerWidth > 1020) p = (vh * 0.75 - r.top) / (vh * 0.45);
    p = Math.max(0, Math.min(1, p));
    stepsWrap.style.setProperty("--p", p.toFixed(3));
    steps.forEach(function (s, i) {
      s.classList.toggle("is-active", p >= i / steps.length + 0.02);
    });
  }
  onScroll();

  /* ---------- Glow-Effekt auf Karten ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Kontaktformular ---------- */
  var form = document.querySelector(".form");
  if (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      if (!window.fetch || !window.FormData) return; // normaler Submit als Fallback
      e.preventDefault();
      status.className = "form__status";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      status.textContent = "Wird gesendet …";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            form.reset();
            status.classList.add("is-ok");
            status.textContent = "Danke! Eure Nachricht ist angekommen – wir melden uns innerhalb von 24 Stunden.";
          } else {
            throw new Error((res && res.error) || "Fehler");
          }
        })
        .catch(function () {
          status.classList.add("is-err");
          status.innerHTML = 'Das hat leider nicht geklappt. Schreibt uns gern direkt an <a href="mailto:hallo@konawiri.de">hallo@konawiri.de</a>.';
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
