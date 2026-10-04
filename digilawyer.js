/* ------------------------------------------------------------------ *
 * DigiLawyer case study: the two interactions the page actually needs. *
 *                                                                      *
 * The first turns the central decision into something you operate      *
 * rather than read: three shipped versions of the same form, each with *
 * what it earned. The second opens the                                  *
 * page exports, which are cropped in the article and otherwise         *
 * unreadable.                                                          *
 *                                                                      *
 * Both follow the pattern the source implementation already used:      *
 * a tablist, and a native <dialog>.                                    *
 * ------------------------------------------------------------------ */

/* ================================================================== *
 * The entry point, before and after                                  *
 * ================================================================== */
(function () {
  var group = document.getElementById("dl-compare");
  if (!group) return;

  var tabs = [].slice.call(group.querySelectorAll("[data-panel]"));
  var count = group.querySelector(".dl-count-value");
  if (!tabs.length) return;

  function select(tab, moveFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.dataset.panel);
      if (panel) panel.hidden = !on;
    });
    if (count) count.textContent = tab.dataset.fields;
    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { select(tab); });
    tab.addEventListener("keydown", function (e) {
      var keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (keys.indexOf(e.key) < 0) return;
      e.preventDefault();
      var n = e.key === "Home" ? 0
            : e.key === "End" ? tabs.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[n], true);
    });
  });

  select(tabs[0]);
})();

/* ================================================================== *
 * Page exports, at full height                                       *
 *                                                                    *
 * Every screenshot in the article is cropped: the exports run to 1:7 *
 * and showing one whole would swallow the page. Clicking opens it.   *
 * ================================================================== */
(function () {
  var shots = [].slice.call(document.querySelectorAll("[data-zoom] img"));
  if (!shots.length || !window.HTMLDialogElement) return;

  var dialog = document.createElement("dialog");
  dialog.className = "dl-lightbox";
  dialog.innerHTML =
    '<button type="button" class="dl-lightbox-close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
    "</button>" +
    '<figure class="dl-lightbox-figure">' +
      '<img alt="" />' +
      "<figcaption></figcaption>" +
    "</figure>";
  document.body.appendChild(dialog);

  var full = dialog.querySelector("img");
  var caption = dialog.querySelector("figcaption");
  var last = null;

  /* A modal <dialog> does not stop the page behind it scrolling, so a wheel
     over a tall capture moved the article instead of the capture. Holding the
     page still sends the wheel where the pointer is. The scrollbar's width is
     paid back as padding so nothing shifts sideways as it disappears. */
  var scrollY = 0;
  function lockPage() {
    if (locked) return;
    locked = true;
    scrollY = window.scrollY;
    var bar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (bar > 0) document.documentElement.style.paddingRight = bar + "px";
  }
  var locked = false;
  function unlockPage() {
    if (!locked) return;
    locked = false;
    document.documentElement.style.overflow = "";
    document.documentElement.style.paddingRight = "";
    window.scrollTo({ top: scrollY, behavior: "instant" });
  }

  shots.forEach(function (img) {
    var host = img.closest("[data-zoom]");
    host.classList.add("is-zoomable");

    // A real button, so it is reachable by keyboard and announced as one.
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "dl-zoom";
    trigger.setAttribute("aria-label", "View full page export");
    trigger.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      "<span>Full page</span>";
    trigger.addEventListener("click", function () {
      last = trigger;
      full.src = img.currentSrc || img.src;
      full.alt = img.alt;
      var cap = host.querySelector("figcaption");
      caption.textContent = cap ? cap.textContent.trim() : "";
      lockPage();
      dialog.showModal();
    });
    host.appendChild(trigger);
  });

  // These exports run from 249 to 1147px wide. Stretching a narrow one
  // across a 1000px dialog is a 3x blow-up that turns to mush, so the
  // dialog takes its width from the image, capped at twice natural: enough
  // to read the structure, not so much that it invents detail.
  full.addEventListener("load", function () {
    var natural = full.naturalWidth;
    if (!natural) return;
    var width = Math.min(natural * 2, Math.round(window.innerWidth * 0.94), 1000);
    dialog.style.width = Math.max(width, 280) + "px";
  });

  /* Every way out unlocks, rather than trusting one event: the close event
     did not reach us in testing, and a page left locked cannot be scrolled
     at all, which is worse than the bug this fixes. */
  dialog.querySelector(".dl-lightbox-close").addEventListener("click", function () {
    unlockPage();
    dialog.close();
  });

  // Clicking the backdrop closes it; clicking the image itself does not.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) { unlockPage(); dialog.close(); }
  });

  dialog.addEventListener("cancel", unlockPage);

  dialog.addEventListener("close", function () {
    unlockPage();
    full.removeAttribute("src");
    if (last && last.focus) last.focus();
  });
})();


/* ================================================================== *
 * The live-site link                                                 *
 *                                                                    *
 * A case study that links nowhere is worse than one that does not    *
 * offer the link, so this refuses to render until the href is a real *
 * address. Unfilled, it becomes a note that the data-slots switch    *
 * hides along with the image placeholders.                           *
 * ================================================================== */
(function () {
  var link = document.querySelector("[data-live-link]");
  if (!link) return;

  var href = link.getAttribute("href") || "";
  if (/^https?:\/\//i.test(href)) return;   // real URL, nothing to do

  var note = document.createElement("p");
  note.className = "cs-cta-pending";
  note.setAttribute("data-slot", "");
  note.textContent = "Live link not set. Replace SET_LIVE_URL in the markup.";
  link.parentNode.replaceChild(note, link);
})();

/* ------------------------------------------------------------------ *
 * Reading mode.                                                       *
 *                                                                     *
 * Skim collapses the cards to their labels; depth is the real page and *
 * stays the default. Ask opens the assistant if this page ever carries *
 * it, and otherwise sends the reader home to the panel, where the hash *
 * handler opens it on arrival.                                         *
 * ------------------------------------------------------------------ */
(function () {
  var pill = document.querySelector(".rm-pill");
  if (!pill) return;

  var modes = [].slice.call(pill.querySelectorAll("[data-read-mode]"));

  /* What skim keeps. overview is the hero, which is not a .cs-section and so
     is never hidden either way. */
  var KEPT = { overview: 1, problem: 1, solution: 1, outcomes: 1 };

  function set(mode) {
    if (mode === "skim") document.body.setAttribute("data-read", "skim");
    else document.body.removeAttribute("data-read");
    modes.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.readMode === mode));
    });
  }

  modes.forEach(function (b) {
    b.addEventListener("click", function () { set(b.dataset.readMode); });
  });

  /* A link into the page can point at a section skim hides, an Ask answer
     being the usual source. Leave skim before the jump, so there is
     something for it to land on. */
  document.addEventListener("click", function (e) {
    if (!document.body.hasAttribute("data-read")) return;
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (id && !KEPT[id]) set("depth");
  });

  var ask = document.getElementById("rm-ask");
  if (ask) {
    ask.addEventListener("click", function () {
      var launcher = document.getElementById("ask");
      if (launcher) launcher.click();
      else window.location.href = "index.html#ask";
    });
  }
})();

/* ================================================================== *
 * Page gallery                                                       *
 *                                                                    *
 * Whole pages, one at a time. The filters scroll the track; the      *
 * track reports back which page is on screen, so dragging the strip  *
 * leaves the right filter lit rather than a stale one.               *
 * ================================================================== */
(function () {
  var gallery = document.getElementById("cs-gallery");
  var track = document.getElementById("cs-gallery-track");
  if (!gallery || !track) return;

  var tabs = [].slice.call(gallery.querySelectorAll(".cs-filter"));
  var panels = [].slice.call(track.querySelectorAll(".cs-slide"));
  if (tabs.length !== panels.length || !tabs.length) return;

  function select(i, moveFocus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && moveFocus) t.focus();
    });
  }

  function show(i) {
    select(i, false);
    // scrollIntoView would also scroll the page to the gallery; this moves
    // only the track.
    track.scrollTo({ left: panels[i].offsetLeft - panels[0].offsetLeft,
                     behavior: "smooth" });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(i); });
    // left and right walk the set, as a tablist should
    t.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
      if (n < 0 || n >= tabs.length) return;
      e.preventDefault();
      select(n, true);
      show(n);
    });
  });

  // whichever page covers the middle of the track is the current one
  if (!("IntersectionObserver" in window)) return;
  // isIntersecting is true for a single visible pixel, so the first callback
  // lit whichever neighbour happened to be reported last. Take the panel
  // covering the most of the track instead.
  var ratios = panels.map(function () { return 0; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var i = panels.indexOf(e.target);
      if (i > -1) ratios[i] = e.intersectionRatio;
    });
    var best = 0;
    for (var n = 1; n < ratios.length; n++) if (ratios[n] > ratios[best]) best = n;
    if (ratios[best] > 0) select(best, false);
  }, { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] });
  panels.forEach(function (p) { io.observe(p); });
})();
