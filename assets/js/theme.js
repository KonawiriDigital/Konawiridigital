/* Konawiri Digital. Hell/Dunkel-Umschalter
   Wird im <head> ohne defer geladen, damit beim Seitenaufbau nichts flackert.
   Die Auswahl bleibt nur lokal im Browser gespeichert (kein Cookie, keine Übertragung). */
(function () {
  "use strict";
  var KEY = "kd-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0e0d0c" : "#f7f2ea");
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.setAttribute("aria-label", dark ? "Helles Design aktivieren" : "Dunkles Design aktivieren");
      btn.setAttribute("title", dark ? "Helles Design" : "Dunkles Design");
    });
  }

  apply(stored() === "dark" ? "dark" : "light");

  document.addEventListener("DOMContentLoaded", function () {
    apply(root.getAttribute("data-theme"));
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      });
    });
  });
})();
