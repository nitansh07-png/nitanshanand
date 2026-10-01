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

  dialog.querySelector(".dl-lightbox-close").addEventListener("click", function () {
    dialog.close();
  });

  // Clicking the backdrop closes it; clicking the image itself does not.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    full.removeAttribute("src");
    if (last && last.focus) last.focus();
  });
})();

/* ================================================================== *
 * Jump to a section                                                  *
 *                                                                    *
 * Built from the same [data-rail] labels the dot rail uses, so the   *
 * two can never disagree about what the page contains.               *
 * ================================================================== */
(function () {
  var nav = document.getElementById("dl-jump");
  var list = nav && nav.querySelector(".dl-jump-list");
  if (!nav || !list) return;

  var sections = [].slice.call(document.querySelectorAll("main [data-rail][id]"));
  if (sections.length < 3) return;

  sections.forEach(function (section) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + section.id;
    a.textContent = section.dataset.rail;
    a.className = "dl-pill";
    li.appendChild(a);
    list.appendChild(li);
  });
  nav.hidden = false;

  // Light the pill for whichever section is currently in view.
  if (!("IntersectionObserver" in window)) return;
  var links = [].slice.call(list.querySelectorAll("a"));

  function mark(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) mark(e.target.id);
    });
    // A band across the middle of the viewport, so the current section is
    // the one being read rather than the one just entering.
  }, { rootMargin: "-45% 0px -45% 0px" });

  sections.forEach(function (s) { io.observe(s); });
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
