/* ------------------------------------------------------------------ *
 * Section rail — a tick per section down the right edge, the current  *
 * one widened with its label showing. Click a tick to jump.           *
 * ------------------------------------------------------------------ */
(function () {
  var rail = document.getElementById("cs-rail");
  var sections = [].slice.call(document.querySelectorAll("[data-rail]"));
  if (!rail || !sections.length) return;

  var buttons = sections.map(function (section) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-current", "false");

    var label = document.createElement("span");
    label.className = "cs-rail-label";
    label.textContent = section.dataset.rail;

    var tick = document.createElement("span");
    tick.className = "cs-rail-tick";

    btn.append(label, tick);
    btn.setAttribute("aria-label", "Jump to " + section.dataset.rail);
    btn.addEventListener("click", function () {
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });

    rail.appendChild(btn);
    return btn;
  });

  function setActive(index) {
    buttons.forEach(function (btn, i) {
      btn.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  if (!("IntersectionObserver" in window)) { setActive(0); return; }

  // Track which section owns the most of the viewport right now.
  var ratios = new Map();
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) { ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0); });

      var best = -1;
      var bestRatio = 0;
      sections.forEach(function (s, i) {
        var r = ratios.get(s) || 0;
        if (r > bestRatio) { bestRatio = r; best = i; }
      });

      // Nothing is meaningfully in view during a fast scroll; keep the last pick.
      if (best >= 0) setActive(best);
    },
    { threshold: [0, 0.15, 0.35, 0.6, 0.9], rootMargin: "-80px 0px -40% 0px" }
  );

  sections.forEach(function (s) { io.observe(s); });
  setActive(0);
})();
