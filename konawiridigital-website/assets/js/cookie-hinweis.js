/* Konawiri Digital. Cookie-Hinweis
   Die Website setzt keine Cookies. Dieser Hinweis informiert Besucher darüber.
   Dass er geschlossen wurde, wird nur lokal im Browser gespeichert (kein Cookie). */
(function () {
  "use strict";
  var KEY = "kd-cookie-hinweis";
  try { if (localStorage.getItem(KEY) === "ok") return; } catch (e) {}

  function show() {
    var box = document.createElement("div");
    box.className = "cookie-note";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Hinweis zu Cookies");
    box.innerHTML =
      '<svg class="cookie-note__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12.5A8.5 8.5 0 1 1 11.5 3.5a3 3 0 0 0 4 3.5 3 3 0 0 0 5 5.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="14" cy="15" r="1.2" fill="currentColor"/><circle cx="9" cy="15.5" r="1" fill="currentColor"/></svg>' +
      '<p><strong>Keine Cookies. Kein Tracking.</strong> Diese Website verwendet keine Cookies und keine Analyse-Tools. Mehr dazu in der <a href="/datenschutz/">Datenschutzerklärung</a>.</p>' +
      '<button type="button" class="btn btn--accent btn--sm cookie-note__ok">OK</button>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("is-visible"); });
    box.querySelector(".cookie-note__ok").addEventListener("click", function () {
      try { localStorage.setItem(KEY, "ok"); } catch (e) {}
      box.classList.remove("is-visible");
      setTimeout(function () { box.remove(); }, 500);
    });
  }

  function init() {
    // Auf der Startseite erst nach dem Intro einblenden
    var delay = document.querySelector(".loader") ? 2800 : 600;
    setTimeout(show, delay);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
