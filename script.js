/* =========================================================================
 * Interactions, ported from the reference site.
 * Every block bails out under prefers-reduced-motion where motion is the point.
 * ========================================================================= */

var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

function clamp(min, v, max) { return Math.max(min, Math.min(v, max)); }

/* ------------------------------------------------------------------ *
 * Theme toggle — respects the OS setting until the visitor overrides. *
 * ------------------------------------------------------------------ */
(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".theme-toggle");
  var system = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (system.matches ? "dark" : "light");
  }

  function apply() {
    var theme = currentTheme();
    root.classList.toggle("theme-dark", theme === "dark");
    if (btn) btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
  }

  apply();

  // Follow the OS while the visitor has not chosen a theme of their own.
  system.addEventListener("change", function () {
    if (!root.getAttribute("data-theme")) apply();
  });

  if (!btn) return;
  btn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    apply();
  });
})();

/* ------------------------------------------------------------------ *
 * Grid energy — a 1px spark travels a column rule or a section rule,  *
 * fading in and out along the way. One at a time, at random intervals.*
 * ------------------------------------------------------------------ */
(function () {
  var layer = document.getElementById("grid-energy");
  if (!layer || !("animate" in Element.prototype)) return;

  var timer;

  function tick() {
    var blocked = reduced.matches || document.hidden || document.querySelector("dialog[open]");

    if (!blocked) {
      var len = Math.round(14 + 42 * Math.random());          // 14–56px
      var duration = 1700 + (len / 56) * 4700 + 900 * Math.random();
      var vertical = Math.random() < 0.6;

      // Only rules currently on screen are worth lighting up.
      var rules = [].slice
        .call(document.querySelectorAll("main .section + .section, .timeline > li, .proof-grid > li + li"))
        .map(function (el) { return el.getBoundingClientRect(); })
        .filter(function (r) { return r.top > 60 && r.top < window.innerHeight; });

      var target = rules[Math.floor(Math.random() * rules.length)];

      // A horizontal spark needs a rule to run along; skip if none is on screen.
      if (!vertical && !target) {
        timer = setTimeout(tick, 850 + 1400 * Math.random());
        return;
      }

      var packet = document.createElement("span");
      packet.className = "grid-energy-packet";

      // x of the two vertical rules drawn by body::before.
      var edge = Math.max(16, (window.innerWidth - 784) / 2);

      if (vertical) {
        var x = Math.random() < 0.5 ? edge : window.innerWidth - edge;
        packet.style.cssText = "left:" + x + "px;top:" + window.scrollY + "px;width:1px;height:" + len + "px";
      } else {
        packet.style.cssText =
          "left:" + ((target && target.left) || 0) + "px;" +
          "top:" + (((target && target.top) || 56) + window.scrollY) + "px;" +
          "width:" + len + "px;height:1px";
      }

      layer.appendChild(packet);

      var travel = vertical
        ? "translateY(" + window.innerHeight + "px)"
        : "translateX(" + ((target && target.width) || window.innerWidth) + "px)";

      packet
        .animate(
          [
            { opacity: 0, transform: "translate(0, 0)" },
            { opacity: 0.38, offset: 0.25 },
            { opacity: 0.26, offset: 0.75 },
            { opacity: 0, transform: travel },
          ],
          { duration: duration, easing: "linear" }
        )
        .finished.then(function () { packet.remove(); }, function () { packet.remove(); });
    }

    timer = setTimeout(tick, 850 + 1400 * Math.random());
  }

  timer = setTimeout(tick, 900);

  // Any reflow invalidates the cached rule positions.
  var clear = function () { layer.replaceChildren(); };
  new ResizeObserver(clear).observe(document.body);
  window.addEventListener("resize", clear);
})();

/* ------------------------------------------------------------------ *
 * Reveal — content rises 48px and fades in as it enters the viewport, *
 * staggered in groups so a section arrives as a sequence.             *
 * ------------------------------------------------------------------ */
(function () {
  if (reduced.matches || !("IntersectionObserver" in window)) return;

  var targets = [].slice.call(
    document.querySelectorAll(
      "main .section > .col-wide > :not(.ask-launcher):not(dialog)," +
      ".writing-grid > li," +
      ".home-copy > *, .home-heading > .hero-widget, .build-intro, .build-steps > li," +
      ".cs-section > .cs-shell > *, .cs-hero > .cs-shell > *"
    )
  );

  // Composite blocks animate their children individually.
  var groups = new Map();
  targets.forEach(function (el) {
    var composite = ".proof-grid, .timeline, .writing-head," +
                    ".cs-hero-grid, .cs-meta-grid, .cs-users, .cs-pain-grid, .cs-goals," +
                    ".cs-modules, .cs-decisions, .cs-artifacts, .cs-outcomes, .cs-problem-grid";
    var parts = el.matches(composite) ? [].slice.call(el.children) : [el];
    groups.set(el, parts);
    if (el.getBoundingClientRect().top >= window.innerHeight) {
      parts.forEach(function (p) { p.dataset.revealPending = "true"; });
    }
  });

  var pending = targets.length;

  function reveal(el, delay, animate) {
    (groups.get(el) || []).forEach(function (part) {
      delete part.dataset.revealPending;
      // Never animate something the keyboard is currently inside.
      if (!animate || part.contains(document.activeElement)) return;
      part.animate(
        [
          { opacity: 0, transform: "translateY(48px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 1100, delay: delay, easing: "cubic-bezier(0.16, 0.75, 0.25, 1)", fill: "backwards" }
      );
    });
    pending--;
  }

  var io = new IntersectionObserver(
    function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          if (!el.getClientRects().length) return;
          io.unobserve(el);
          reveal(el, Math.min(110 * i++, 330), true);
        } else if (entry.boundingClientRect.bottom < 0) {
          // Already scrolled past — an anchor jump or a restored position.
          io.unobserve(el);
          reveal(el, 0, false);
        }
      });
    },
    { rootMargin: "0px 0px -90px 0px", threshold: 0 }
  );

  targets.forEach(function (el) { io.observe(el); });

  // Safety net: an instant jump can move the page further than the observer
  // samples, so anything left hidden at or above the fold is simply shown.
  var sweepFrame = 0;
  function sweep() {
    sweepFrame = 0;
    if (pending <= 0) return;
    targets.forEach(function (el) {
      var parts = groups.get(el) || [];
      if (!parts.length || parts[0].dataset.revealPending !== "true") return;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        io.unobserve(el);
        reveal(el, 0, false);
      }
    });
  }

  window.addEventListener(
    "scroll",
    function () { if (!sweepFrame && pending > 0) sweepFrame = requestAnimationFrame(sweep); },
    { passive: true }
  );
  window.addEventListener("resize", sweep);
  window.addEventListener("hashchange", function () { setTimeout(sweep, 60); });
})();

/* ------------------------------------------------------------------ *
 * Project cursor preview — a card trails the pointer across a project *
 * card, and the card's own contents drift very slightly toward it.    *
 * ------------------------------------------------------------------ */
(function () {
  var preview = document.getElementById("project-preview");
  var nameEl = document.getElementById("project-preview-name");
  if (!preview || !nameEl) return;

  var SELECTOR = ".project-card";
  var current = null;
  var rect = null;
  var pinned = false;
  var frame = 0;
  var point = { x: 0, y: 0 };

  function place(x, y) {
    preview.style.transform =
      "translate3d(" +
      clamp(12, x, window.innerWidth - 332) + "px, " +
      clamp(72, y, window.innerHeight - 229) + "px, 0)";
  }

  function show(card) {
    if (current === card) { rect = card.getBoundingClientRect(); return; }
    clearMagnet();
    current = card;
    rect = card.getBoundingClientRect();
    nameEl.textContent = card.dataset.projectName || "";
    preview.classList.add("is-visible");
  }

  function clearMagnet() {
    if (!current) return;
    current.style.removeProperty("--project-x");
    current.style.removeProperty("--project-y");
  }

  function hide() {
    clearMagnet();
    current = null;
    rect = null;
    pinned = false;
    preview.classList.remove("is-visible");
  }

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || !finePointer.matches) return;
    var card = e.target instanceof Element ? e.target.closest(SELECTOR) : null;
    if (!card) { if (current) hide(); return; }

    show(card);
    pinned = false;
    point = { x: e.clientX, y: e.clientY };

    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      if (!current || !rect) return;
      place(point.x + 344 > window.innerWidth - 12 ? point.x - 344 : point.x + 24, point.y + 20);
      if (reduced.matches) return;
      current.style.setProperty("--project-x", clamp(-4, (point.x - rect.left - rect.width / 2) * 0.025, 4) + "px");
      current.style.setProperty("--project-y", clamp(-3, (point.y - rect.top - rect.height / 2) * 0.07, 3) + "px");
    });
  });

  // Keyboard users get the preview anchored beside the focused card.
  document.addEventListener("focusin", function (e) {
    var card = e.target instanceof Element ? e.target.closest(SELECTOR) : null;
    if (!card || !card.matches(":focus-visible") || window.innerWidth < 760) return;
    show(card);
    pinned = true;
    if (rect) place(rect.right + 344 < window.innerWidth ? rect.right + 16 : rect.left - 336, rect.top);
  });

  document.addEventListener("focusout", hide);
  document.addEventListener("pointerleave", hide);

  window.addEventListener(
    "scroll",
    function () {
      if (!pinned || !current) return;
      rect = current.getBoundingClientRect();
      if (rect.bottom < 56 || rect.top > window.innerHeight) { hide(); return; }
      place(rect.right + 344 < window.innerWidth ? rect.right + 16 : rect.left - 336, rect.top);
    },
    { passive: true }
  );

  window.addEventListener("resize", hide);
  window.addEventListener("blur", hide);
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  reduced.addEventListener("change", hide);
})();

/* ------------------------------------------------------------------ *
 * Brand chips — magnetic pull toward the pointer, a spotlight that    *
 * tracks across the pill, and a tooltip with the role timeline.       *
 * ------------------------------------------------------------------ */
(function () {
  var wraps = [].slice.call(document.querySelectorAll(".brand-wrap[data-tooltip]"));
  if (!wraps.length) return;

  var tooltip = null;
  var owner = null;
  var closeTimer = 0;
  var seq = 0;

  function buildTooltip(wrap) {
    var el = document.createElement("div");
    el.className = "brand-tooltip company-tooltip";
    el.id = "brand-tip-" + ++seq;
    el.setAttribute("role", "tooltip");

    var chip = wrap.querySelector(".company-brand");
    el.style.setProperty("--brand-color", (chip && chip.style.getPropertyValue("--brand-color")) || "var(--color-ink)");

    var list = document.createElement("ul");
    wrap.dataset.tooltip.split("|").forEach(function (entry) {
      var parts = entry.split("—");
      var li = document.createElement("li");
      var title = document.createElement("span");
      title.className = "tooltip-title";
      title.textContent = parts[0].trim();
      li.appendChild(title);
      if (parts[1]) {
        var date = document.createElement("span");
        date.className = "tooltip-date";
        date.textContent = parts.slice(1).join("—").trim();
        li.appendChild(date);
      }
      list.appendChild(li);
    });
    el.appendChild(list);
    return el;
  }

  function position(wrap) {
    var r = wrap.getBoundingClientRect();
    var w = tooltip.offsetWidth;
    var left = clamp(16, r.left + r.width / 2 - w / 2, window.innerWidth - w - 16);
    tooltip.style.top = Math.max(8, r.top - tooltip.offsetHeight - 12) + "px";
    tooltip.style.left = left + "px";
    tooltip.style.setProperty("--arrow-x", clamp(18, r.left + r.width / 2 - left, w - 18) + "px");
  }

  function open(wrap) {
    clearTimeout(closeTimer);
    if (owner === wrap) return;
    close(true);
    owner = wrap;
    tooltip = buildTooltip(wrap);
    document.body.appendChild(tooltip);
    position(wrap);
    var trigger = wrap.querySelector(".brand-trigger");
    if (trigger) trigger.setAttribute("aria-describedby", tooltip.id);
  }

  function close(immediate) {
    if (!tooltip) return;
    var el = tooltip;
    var wrap = owner;
    tooltip = null;
    owner = null;
    var trigger = wrap && wrap.querySelector(".brand-trigger");
    if (trigger) trigger.removeAttribute("aria-describedby");
    if (immediate || reduced.matches) { el.remove(); return; }
    el.classList.add("is-closing");
    setTimeout(function () { el.remove(); }, 200);
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () { close(); }, 140);
  }

  wraps.forEach(function (wrap) {
    var chip = wrap.querySelector(".company-brand");

    wrap.addEventListener("mouseenter", function () { open(wrap); });
    wrap.addEventListener("mouseleave", function () {
      if (chip) { chip.style.setProperty("--tx", "0px"); chip.style.setProperty("--ty", "0px"); }
      scheduleClose();
    });

    wrap.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduced.matches || !chip) return;
      var r = wrap.getBoundingClientRect();
      chip.style.setProperty("--tx", clamp(-5, (e.clientX - r.left - r.width / 2) * 0.22, 5) + "px");
      chip.style.setProperty("--ty", clamp(-4, (e.clientY - r.top - r.height / 2) * 0.22, 4) + "px");
      chip.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      chip.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });

    var trigger = wrap.querySelector(".brand-trigger");
    if (!trigger) return;
    trigger.addEventListener("focus", function () { open(wrap); });
    trigger.addEventListener("blur", function () { close(true); });
    trigger.addEventListener("click", function () { open(wrap); });
    trigger.addEventListener("keydown", function (e) { if (e.key === "Escape") close(true); });
  });

  window.addEventListener("scroll", function () { close(true); }, { passive: true });
  window.addEventListener("resize", function () { close(true); });
})();

/* ------------------------------------------------------------------ *
 * Ask widget — launcher, docked pill, and an answer engine that scores *
 * the question against window.ASK_KB and replies from it. The card is   *
 * non-modal on purpose: the page stays readable while you ask.          *
 *                                                                      *
 * It is retrieval, not generation: it can only say what is written in  *
 * ask-knowledge.js, so it cannot invent a claim about Nitansh. To put  *
 * a real model behind it instead, set window.ASK_ENDPOINT to a URL     *
 * that accepts { question } and returns { answer, link? } — see below. *
 * ------------------------------------------------------------------ */
(function () {
  var launcher = document.getElementById("ask");
  var docked = document.getElementById("ask-docked");
  var widget = document.getElementById("ask-widget");
  var scrim = document.getElementById("ask-scrim");
  var closeBtn = document.getElementById("ask-close");
  var composer = document.getElementById("ask-composer");
  var input = document.getElementById("ask-input");
  // Assigned once the composer is wired up, so open() can re-measure the field.
  var syncComposer = null;
  var send = document.getElementById("ask-send");
  var conversation = document.getElementById("ask-conversation");
  var intro = document.getElementById("ask-intro");
  var starters = document.getElementById("ask-starters");
  if (!widget || !launcher) return;

  var card = widget.querySelector(".ask-card");
  var lastFocus = null;
  var leaving = null;
  var isOpen = function () { return !widget.hasAttribute("hidden"); };
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  // The panel slides out rather than vanishing, so [hidden] lands one
  // animation later. Everything that reads open state keys off [hidden],
  // which means a panel mid-exit still counts as open — hence the unwind.
  var EXIT_MS = 220;
  function settle() {
    if (leaving) { clearTimeout(leaving); leaving = null; }
    if (card) card.classList.remove("is-leaving");
  }

  function open() {
    var reopening = leaving !== null;
    settle();
    if (isOpen() && !reopening) {
      // Already open and the launcher was pressed again: that control is the
      // better place to land on close than whatever opened it originally.
      var here = document.activeElement;
      if (here && here !== document.body && !widget.contains(here)) lastFocus = here;
      if (input) input.focus();
      return;
    }
    if (!reopening) lastFocus = document.activeElement;
    widget.removeAttribute("hidden");
    document.documentElement.classList.add("ask-open");
    // Now that it has layout, let the composer size itself properly.
    if (typeof syncComposer === "function") syncComposer();
    if (input) setTimeout(function () { input.focus(); }, 140);
  }

  function finishClose() {
    settle();
    widget.setAttribute("hidden", "");
  }

  // Anything inside the panel is about to be [hidden], and <body> is not a
  // focus target, so either one falls back to whichever launcher is on screen.
  function restoreFocus() {
    var home = lastFocus;
    if (!home || !home.focus || home === document.body ||
        !document.contains(home) || widget.contains(home)) {
      home = docked && docked.classList.contains("is-visible") ? docked : launcher;
    }
    if (!home || !home.focus) return;
    // preventScroll: the launcher may be far up the page by now, and closing a
    // panel should not also move the reader.
    try { home.focus({ preventScroll: true }); } catch (e) { home.focus(); }
  }

  function close() {
    if (!isOpen() || leaving) return;
    document.documentElement.classList.remove("ask-open");
    // Focus goes home now, not when the animation ends — a keyboard user
    // should never be parked on a control that is on its way off screen.
    restoreFocus();
    if (!card || (calm && calm.matches)) { finishClose(); return; }
    card.classList.add("is-leaving");
    leaving = setTimeout(finishClose, EXIT_MS);
  }

  // Non-modal by design, so Escape and the phone scrim are the ways out.
  // Clicking the page behind it does not close — you may want to read while asking.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) { e.preventDefault(); close(); }
  });

  launcher.addEventListener("click", open);
  if (docked) docked.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (scrim) scrim.addEventListener("click", close);

  /* ---- docked pill visibility ---- */
  if (docked && "IntersectionObserver" in window) {
    var pastLauncher = false;
    var atFooter = false;
    var update = function () {
      var visible = pastLauncher && !atFooter;
      docked.classList.toggle("is-visible", visible);
      docked.setAttribute("aria-hidden", visible ? "false" : "true");
      docked.tabIndex = visible ? 0 : -1;
    };
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      pastLauncher = !e.isIntersecting && e.boundingClientRect.bottom < 56;
      update();
    }, { rootMargin: "-56px 0px 0px 0px" }).observe(launcher);

    var footer = document.querySelector(".home-footer");
    if (footer) {
      new IntersectionObserver(function (entries) {
        atFooter = entries[0].isIntersecting;
        update();
      }, { rootMargin: "0px 0px 96px 0px" }).observe(footer);
    }
  }

  /* ================================================================== *
   * Matcher                                                            *
   *                                                                    *
   * Retrieval, not generation: it can only ever say what is written in *
   * ask-knowledge.js. What changed is that it no longer dead-ends. A   *
   * question it cannot answer still gets a true reply and a way back   *
   * into the portfolio, because a chat that shrugs is worse than no    *
   * chat at all.                                                       *
   * ================================================================== */

  var STOP = ("a an and are as at be but by can did do does for from had has have how i if in is it its me my of on or " +
              "our so tell that the their them then there these they this to was what when where which who whom why " +
              "will with would you your about like just some more please give show he him his she her they").split(" ");

  // Visitors do not use the site's vocabulary. This closes the gap between
  // what they type and what the entries are tagged with.
  var SYNONYM = {
    portfolio: "work", project: "work", projects: "work", case: "work",
    ux: "design", ui: "design", product: "design",
    "design system": "design systems", ds: "design systems",
    a11y: "accessibility", wcag: "accessibility", contrast: "accessibility",
    dev: "handoff", developer: "handoff", engineer: "handoff", engineering: "handoff",
    figma: "tools", tooling: "tools", stack: "tools",
    metro: "dmrc", delhi: "dmrc", railway: "dmrc",
    llm: "ai", gpt: "ai", claude: "ai", model: "ai",
    resume: "contact", cv: "contact", email: "contact", reach: "contact",
    study: "education", degree: "education", college: "education", university: "education",
    years: "experience", experience: "experience", senior: "experience",
    result: "impact", results: "impact", metric: "impact", numbers: "impact",
    shipped: "impact", built: "impact", achieved: "impact", moved: "impact",
    online: "linkedin", profile: "linkedin", social: "linkedin", posts: "linkedin",
    best: "impact", biggest: "impact", favourite: "impact", favorite: "impact",
  };

  function normalise(text) {
    return String(text).toLowerCase().replace(/[^\w\s'-]/g, " ").replace(/\s+/g, " ").trim();
  }

  // The entries are written the way Nitansh would say them, in the second
  // person. Visitors ask in the third: "what does he do", "is Nitansh on
  // LinkedIn". Rewriting the pronoun is what lets one set of tags serve both.
  var PERSON = [
    [/\b(?:does|did) (?:he|nitansh)\b/g, "do you"],
    [/\b(?:has|have) (?:he|nitansh)\b/g, "have you"],
    [/\b(?:is|was) (?:he|nitansh)\b/g, "are you"],
    [/\b(can|could|will|would|should) (?:he|nitansh)\b/g, "$1 you"],
    [/\bnitansh's\b/g, "your"],
    [/\bhis\b/g, "your"],
    [/\bhimself\b/g, "yourself"],
    [/\b(?:he|him|nitansh)\b/g, "you"],
  ];

  function canonical(text) {
    var t = normalise(text);
    PERSON.forEach(function (rule) { t = t.replace(rule[0], rule[1]); });
    return t.replace(/\s+/g, " ").trim();
  }

  function tokens(text) {
    var norm = canonical(text);
    var extra = [];
    Object.keys(SYNONYM).forEach(function (k) {
      if (k.indexOf(" ") > -1 && norm.indexOf(k) > -1) extra.push(SYNONYM[k]);
    });
    var own = norm.split(" ").filter(function (t) {
      return t.length > 1 && STOP.indexOf(t) < 0;
    });
    own.forEach(function (t) { if (SYNONYM[t]) extra.push(SYNONYM[t]); });
    var all = own.concat(extra);
    // Length is measured on what was actually typed. A synonym is a second
    // way to reach a tag, not a longer question, and it must never cost.
    all.own = own.length;
    return all;
  }

  // Light stemmer: enough to tie "designs"/"design" and "shipping"/"ship".
  function stem(t) {
    return t.replace(/(ing|ers|er|ies|es|s)$/, function (m) {
      return t.length - m.length >= 3 ? "" : m;
    });
  }

  // Tokens that appear across many tags and in half the answer bodies. On its
  // own none of them identifies a topic: "React experience" is a question about
  // React, not about experience, and matching the latter is how the panel ended
  // up answering with a years-of-experience blurb.
  var GENERIC = {
    design: 1, designs: 1, designer: 1, designing: 1, work: 1, works: 1,
    working: 1, experience: 1, experienced: 1, role: 1, roles: 1, project: 1,
    projects: 1, product: 1, products: 1, build: 1, built: 1, building: 1,
    use: 1, used: 1, using: 1, know: 1, knows: 1, doing: 1, done: 1, make: 1,
    made: 1, thing: 1, things: 1, stuff: 1, good: 1, best: 1,
  };

  function score(question, entry) {
    var qNorm = canonical(question);
    var raw = tokens(question);
    var qTokens = raw.map(stem);
    var ownCount = raw.own;
    var total = 0;
    var hits = 0;
    var phrase = false;   // a multi-word tag matched verbatim
    var strong = 0;       // exact matches on tags that actually name a topic

    entry.tags.forEach(function (tag) {
      var t = normalise(tag);
      if (t.indexOf(" ") > -1) {
        // Phrase tag: a direct hit is a strong signal.
        if (qNorm.indexOf(t) > -1) { total += 6; hits++; phrase = true; }
        return;
      }
      var st = stem(t);
      var generic = GENERIC[t] === 1 || GENERIC[st] === 1;
      qTokens.forEach(function (q) {
        if (q === st) { total += 3; hits++; if (!generic) strong++; }
        else if (q.length > 3 && st.length > 3 && (q.indexOf(st) === 0 || st.indexOf(q) === 0)) { total += 1.5; hits++; }
      });
    });

    // Weak echo from the answer body, so near-misses still rank sensibly.
    var body = normalise(entry.a);
    qTokens.forEach(function (q) {
      if (q.length > 3 && body.indexOf(q) > -1) total += 0.5;
    });

    if (!hits) return { s: 0, phrase: false, strong: 0 };
    // Normalise by question length so long questions are not unfairly
    // favoured, counting only the words the visitor actually typed.
    return {
      s: total / Math.sqrt(Math.max(ownCount, 1)),
      phrase: phrase,
      strong: strong,
    };
  }

  // Everything the matcher knows about a question, ranked. The caller decides
  // what counts as confident enough; the ranking is useful either way, because
  // the near misses are exactly what a fallback should offer.
  function rank(question) {
    return (window.ASK_KB || [])
      .map(function (entry) {
        var r = score(question, entry);
        return { entry: entry, s: r.s, phrase: r.phrase, strong: r.strong };
      })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
  }

  function findIntent(question) {
    var q = canonical(question);
    var list = window.ASK_INTENTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].test.test(q)) return list[i];
    }
    return null;
  }

  var PROMPTS = window.ASK_PROMPTS || {};
  var LABELS = window.ASK_LABELS || {};
  var RELATED = window.ASK_RELATED || {};

  // A chip shows two or three words and asks a whole question. Keeping the
  // two apart is what stops the row of follow-ups reading as a wall.
  function chip(id) {
    if (!PROMPTS[id]) return null;
    return { label: LABELS[id] || PROMPTS[id], ask: PROMPTS[id] };
  }

  function chipsFor(id) {
    return (RELATED[id] || []).map(chip).filter(Boolean).slice(0, 3);
  }

  var DEFAULT_CHIPS = ["intro", "section-library", "contact"].map(chip).filter(Boolean);

  /* ================================================================== *
   * Rendering                                                          *
   * ================================================================== */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function icon(paths) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = paths;
    return s;
  }

  var ICON = {
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M15 6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    retry: '<path d="M4.5 12a7.5 7.5 0 1 1 2.6 5.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 7.5V12h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="M5 12.8 9.8 17.5 19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7L11.8 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.5-1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    doc: '<path d="M13 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V9.5L13 3.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 3.5V9h6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  function addYou(text) {
    var row = el("div", "ask-msg ask-msg--you");
    row.appendChild(el("div", "ask-bubble", text));
    conversation.appendChild(row);
    scrollDown();
  }

  function replyRow() {
    var row = el("div", "ask-msg ask-msg--reply");
    row.appendChild(el("span", "ask-msg-avatar"));
    var stack = el("div", "ask-msg-stack");
    var bubble = el("div", "ask-bubble");
    stack.appendChild(bubble);
    row.appendChild(stack);
    return { row: row, stack: stack, bubble: bubble };
  }

  // The hover toolbar from any decent chat: copy what was said, or ask again.
  function addActions(m, plain, question) {
    var bar = el("div", "ask-actions");

    var copy = el("button", "ask-action");
    copy.type = "button";
    copy.title = "Copy";
    copy.setAttribute("aria-label", "Copy answer");
    copy.appendChild(icon(ICON.copy));
    copy.addEventListener("click", function () {
      var done = function () {
        copy.classList.add("is-done");
        copy.replaceChildren(icon(ICON.check));
        setTimeout(function () {
          copy.classList.remove("is-done");
          copy.replaceChildren(icon(ICON.copy));
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plain).then(done, function () {});
      }
    });
    bar.appendChild(copy);

    if (question) {
      var again = el("button", "ask-action");
      again.type = "button";
      again.title = "Ask again";
      again.setAttribute("aria-label", "Ask again");
      again.appendChild(icon(ICON.retry));
      again.addEventListener("click", function () { respond(question); });
      bar.appendChild(again);
    }

    m.stack.appendChild(bar);
  }

  function addChips(m, chips) {
    if (!chips || !chips.length) return;
    var wrap = el("div", "ask-chips");
    chips.forEach(function (c) {
      // Tolerates a plain string, so a remote endpoint can stay simple.
      var label = typeof c === "string" ? c : c.label;
      var question = typeof c === "string" ? c : c.ask;
      var b = el("button", "ask-chip", label);
      b.type = "button";
      b.title = question;
      b.addEventListener("click", function () { ask(question); });
      wrap.appendChild(b);
    });
    m.stack.appendChild(wrap);
  }

  // A link is a destination, so it gets a card rather than a line of text.
  function addLinkCard(m, link) {
    var href = link.href;
    var kind = /^mailto:/.test(href) ? "mail"
             : /^https?:/.test(href) ? "link"
             : "doc";

    // The knowledge base is shared, and every bare hash in it names a section
    // of the landing page. Read anywhere else it is wrong twice over: some of
    // those sections do not exist here, and process exists on a case study
    // too, where it means that project's process rather than how Nitansh
    // works. So off the landing page, a bare hash resolves against that page.
    var p = location.pathname;
    var onHome = p === "/" || p.slice(-11) === "/index.html";
    if (/^#/.test(href) && !onHome) {
      href = "index.html" + href;
    }

    // On the page a link points at, "Read the case study" is a no-op. Drop a
    // bare self-link; keep one with a hash, as a jump to that section.
    if (kind === "doc" && !/^#/.test(href)) {
      var u = new URL(href, location.href);
      if (u.pathname === location.pathname) {
        if (!u.hash) return;
        href = u.hash;
      }
    }

    var a = el("a", "ask-source");
    a.href = href;
    a.appendChild(icon(ICON[kind]));
    a.appendChild(el("span", "ask-source-label", link.label));
    a.appendChild(el("span", "ask-source-go", kind === "link" ? "↗" : "→"));
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    else if (/^#/.test(href)) a.addEventListener("click", close);
    m.stack.appendChild(a);
  }

  /* Answers may use two marks: a line starting "- " is a bullet, and **text**
     is bold. Built as nodes rather than innerHTML, because this same renderer
     shows remote answers whenever ASK_ENDPOINT is set, and a server response
     is not something to trust with markup. */
  function inline(target, text) {
    String(text).split("**").forEach(function (part, i) {
      if (!part) return;
      if (i % 2) target.appendChild(el("strong", null, part));
      else target.appendChild(document.createTextNode(part));
    });
  }

  // What the copy button puts on the clipboard: the words, without the marks.
  function plain(answer) {
    return String(answer)
      .split("\n")
      .map(function (l) { return l.trim().replace(/^- /, "").split("**").join(""); })
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function addReply(answer, link, chips, question) {
    var m = replyRow();
    var list = null;
    String(answer).split("\n").forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      if (line.indexOf("- ") === 0) {
        if (!list) { list = el("ul", "ask-list"); m.bubble.appendChild(list); }
        var li = el("li");
        inline(li, line.slice(2));
        list.appendChild(li);
        return;
      }
      list = null;            // a paragraph closes any run of bullets
      var p = el("p");
      inline(p, line);
      m.bubble.appendChild(p);
    });
    conversation.appendChild(m.row);
    if (link) addLinkCard(m, link);
    addActions(m, plain(answer), question);
    addChips(m, chips);
    scrollDown();
  }

  function addTyping() {
    var m = replyRow();
    m.row.classList.add("ask-typing-wrap");
    var dots = el("span", "ask-typing");
    dots.appendChild(el("i"));
    dots.appendChild(el("i"));
    dots.appendChild(el("i"));
    m.bubble.appendChild(dots);
    conversation.appendChild(m.row);
    scrollDown();
    return m.row;
  }

  function scrollDown() {
    conversation.scrollTop = conversation.scrollHeight;
  }

  /* ================================================================== *
   * Answering                                                          *
   * ================================================================== */

  // Two ways to come up short, and neither of them is a shrug. If something
  // ranked at all, name it and offer it. If nothing did, say so plainly and
  // put the three best doors back on screen.
  function miss(ranked) {
    var near = ranked.slice(0, 2).map(function (r) { return chip(r.entry.id); }).filter(Boolean);
    if (near.length) {
      return {
        a: "I don't have that one written down, and I'd rather tell you that than guess.\n" +
           "Here are the closest things I can tell you about, or ask me something else and I'll see what I have.",
        chips: near,
      };
    }
    return {
      a: "That's a little outside what this site covers, so I'd only be guessing.\n" +
         "What I can do is walk you through the projects, how Nitansh builds systems, or how to reach him.",
      chips: DEFAULT_CHIPS,
    };
  }

  /* Optional: point window.ASK_ENDPOINT at your own proxy to use a real model.
     It should accept POST { question } and return { answer, link? }. */
  function remoteAnswer(question) {
    return fetch(window.ASK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question }),
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { return { a: d.answer, link: d.link, chips: d.chips }; });
  }

  function localAnswer(question) {
    var ranked = rank(question);

    // The best entry that actually NAMED a topic, which is not always the
    // highest scorer: "React experience" ranks experience-length top on the
    // generic word alone, while the entry about frameworks sits below it.
    var best = null;
    for (var i = 0; i < ranked.length; i++) {
      // 2.0 was set to stop generic tokens answering. Entries that named a
      // topic have already passed that test, so they get the lower bar: a
      // three-word question with one real tag hit scores about 1.7, and
      // "has he shipped anything with AI" should not fail on arithmetic.
      if (ranked[i].s >= 1.6 && (ranked[i].phrase || ranked[i].strong >= 1)) {
        best = ranked[i];
        break;
      }
    }

    // Conversation first, but only when the knowledge base has nothing
    // specific: "a time a project failed" trips the weakness intent, yet it
    // is a content question with a real answer written for it.
    var intent = findIntent(question);
    if (intent && !best) return { a: intent.a, link: intent.link, chips: intent.chips };

    if (best) return { a: best.entry.a, link: best.entry.link, chips: chipsFor(best.entry.id) };
    return miss(ranked);
  }

  function respond(question) {
    var typing = addTyping();
    var started = Date.now();

    var work = window.ASK_ENDPOINT
      ? remoteAnswer(question).catch(function () { return localAnswer(question); })
      : Promise.resolve(localAnswer(question));

    work.then(function (hit) {
      // A beat of latency reads as considered rather than canned.
      var wait = Math.max(0, 420 - (Date.now() - started));
      setTimeout(function () {
        typing.remove();
        addReply(hit.a, hit.link, hit.chips, question);
      }, wait);
    });
  }

  /* ================================================================== *
   * Composer                                                           *
   * ================================================================== */
  if (!composer || !input || !send) return;

  function sync() {
    send.disabled = !input.value.trim();

    // A hidden element reports scrollHeight 0, and writing that leaves the
    // field permanently collapsed once the widget opens. Size it only while
    // it is actually laid out; the CSS min-height covers the rest.
    if (!input.getClientRects().length) return;

    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }
  syncComposer = sync;
  input.addEventListener("input", sync);
  sync();   // set the starting height so the field never shows a scrollbar

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); composer.requestSubmit(); }
  });

  var reset = document.getElementById("ask-reset");
  if (reset) {
    reset.addEventListener("click", function () {
      conversation.querySelectorAll(".ask-msg").forEach(function (n) { n.remove(); });
      if (intro) intro.hidden = false;
      reset.hidden = true;
      if (input) input.focus();
    });
  }

  function ask(question) {
    if (!question) return;
    if (intro && !intro.hidden) intro.hidden = true;
    if (reset) reset.hidden = false;
    addYou(question);
    input.value = "";
    sync();
    respond(question);
  }

  if (starters) {
    starters.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      // The chip shows a short label; the question it actually asks is on the
      // element, so the face can stay two words wide.
      if (btn) ask(btn.dataset.ask || btn.textContent.trim());
    });
  }

  composer.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value.trim());
  });
})();


/* ------------------------------------------------------------------ *
 * Claude Code token calendar — real usage from the local transcripts,  *
 * summed per day by tools/build-usage.js. Every day is a button,       *
 * arrow keys walk the grid, selection is announced in the live region. *
 * ------------------------------------------------------------------ */
(function () {
  var grid = document.getElementById("activity-grid");
  var status = document.getElementById("activity-status");
  var count = document.getElementById("activity-count");
  var monthsRow = document.getElementById("activity-months");
  if (!grid) return;

  var usage = window.CLAUDE_USAGE || { totals: {}, days: {} };
  var days = usage.days || {};
  var totals = usage.totals || {};

  function compact(n) {
    if (n >= 1e9) return +(n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + "K";
    return String(n);
  }

  // Volume bands, chosen against the real spread (0 to ~670M in a day).
  function levelFor(tokens) {
    if (!tokens) return 0;
    if (tokens < 40e6) return 1;
    if (tokens < 100e6) return 2;
    if (tokens < 250e6) return 3;
    return 4;
  }

  var WEEKS = 53;
  var PER_WEEK = 7;

  var end = new Date();
  end.setUTCHours(12, 0, 0, 0);
  var start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (WEEKS * PER_WEEK - 1));

  var cells = [];
  var frag = document.createDocumentFragment();
  var monthSpans = [];
  var lastMonth = -1;
  var active = 0;

  for (var i = 0; i < WEEKS * PER_WEEK; i++) {
    var day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    var date = day.toISOString().slice(0, 10);

    var entry = days[date];
    var tokens = entry ? entry[0] : 0;
    var msgs = entry ? entry[2] : 0;
    var level = levelFor(tokens);
    if (tokens > 0) active++;

    var label = tokens
      ? date + ": " + compact(tokens) + " tokens \u00b7 " + msgs.toLocaleString("en-US") + " messages"
      : date + ": no sessions";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.tabIndex = i === 0 ? 0 : -1;
    if (level) btn.setAttribute("data-level", String(level));
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.dataset.summary = label;

    cells.push(btn);
    frag.appendChild(btn);

    if (i % PER_WEEK === 0) {
      var m = day.getUTCMonth();
      if (m !== lastMonth) {
        // The window rarely opens on the 1st, so the first label can sit a
        // week or two before the next one and print on top of it ("SepOct").
        // A label needs about three columns; drop the stub rather than collide.
        var prevSpan = monthSpans[monthSpans.length - 1];
        if (prevSpan && i / PER_WEEK + 1 - prevSpan.col < 3) monthSpans.pop();
        monthSpans.push({ col: i / PER_WEEK + 1, name: day.toLocaleDateString("en", { month: "short", timeZone: "UTC" }) });
        lastMonth = m;
      }
    }
  }

  grid.appendChild(frag);

  if (count) {
    count.textContent = totals.processed
      ? compact(totals.processed) + " tokens processed \u00b7 " +
        compact(totals.output) + " generated \u00b7 " +
        totals.activeDays + " active days \u00b7 " +
        totals.sessions + " sessions"
      : "No local Claude Code history found. Run node tools/build-usage.js";
  }

  if (monthsRow) {
    monthsRow.style.gridTemplateColumns = "repeat(" + WEEKS + ", minmax(0, 1fr))";
    monthSpans.forEach(function (m) {
      var span = document.createElement("span");
      span.style.gridColumn = String(m.col);
      span.textContent = m.name;
      monthsRow.appendChild(span);
    });
  }

  function announce(btn) { if (status) status.textContent = btn.dataset.summary; }

  function focusCell(index) {
    var next = clamp(0, index, cells.length - 1);
    cells.forEach(function (c, i) { c.tabIndex = i === next ? 0 : -1; });
    cells[next].focus();
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (btn) announce(btn);
  });
  grid.addEventListener("focusin", function (e) {
    var btn = e.target.closest("button");
    if (btn) announce(btn);
  });
  grid.addEventListener("keydown", function (e) {
    var step = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    focusCell(cells.indexOf(e.target) + step);
  });

  // The freshest data is at the right edge, so start the scroll there.
  var scroller = grid.closest(".activity-scroll");
  if (scroller) scroller.scrollLeft = scroller.scrollWidth;
})();


/* ------------------------------------------------------------------ *
 * Inertial scroll — the wheel drives a target the page eases toward.  *
 * Delete this block to get the browser's native scrolling back.       *
 * ------------------------------------------------------------------ */
(function () {
  if (reduced.matches) return;

  var target = 0;
  var position = 0;
  var frame = 0;
  var last = 0;

  var maxScroll = function () {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  };

  function step(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    position += (target - position) * (1 - Math.exp(-dt / 0.105));
    if (Math.abs(target - position) < 0.35) position = target;
    window.scrollTo({ top: position, behavior: "instant" });
    frame = position === target ? 0 : requestAnimationFrame(step);
  }

  // Anything with its own scrollbar keeps it.
  function insideScrollable(node) {
    if (document.querySelector("dialog[open]")) return true;
    while (node && node !== document.body) {
      if (node instanceof HTMLElement) {
        var oy = getComputedStyle(node).overflowY;
        if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight + 1) return true;
        var ox = getComputedStyle(node).overflowX;
        if ((ox === "auto" || ox === "scroll") && node.scrollWidth > node.clientWidth + 1) return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  window.addEventListener(
    "wheel",
    function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (insideScrollable(e.target)) return;

      e.preventDefault();
      if (!frame) { position = window.scrollY; last = performance.now(); }
      target = clamp(0, (frame ? target : window.scrollY) + e.deltaY, maxScroll());
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: false }
  );

  // Any scroll we did not initiate resets the animation.
  var stop = function () { if (frame) { cancelAnimationFrame(frame); frame = 0; } };
  window.addEventListener("keydown", stop);
  window.addEventListener("touchstart", stop, { passive: true });
  reduced.addEventListener("change", stop);
})();

/* ------------------------------------------------------------------ *
 * LinkedIn carousel — arrows, dots and scroll position stay in sync.  *
 * ------------------------------------------------------------------ */
(function () {
  var track = document.getElementById("li-track");
  var dotsWrap = document.getElementById("li-dots");
  var prev = document.getElementById("li-prev");
  var next = document.getElementById("li-next");
  if (!track || !dotsWrap || !prev || !next) return;

  /* ---- render from linkedin-posts.js ---- */
  var feed = window.LINKEDIN_POSTS;
  if (feed && feed.posts && feed.posts.length) {
    var summary = document.getElementById("li-summary");
    var profileLink = document.querySelector(".linkedin-summary a");
    if (profileLink && feed.profile) profileLink.href = feed.profile;

    var frag = document.createDocumentFragment();
    feed.posts.forEach(function (post, i) {
      var card = document.createElement("article");
      card.className = "li-card";

      var head = document.createElement("header");
      head.className = "li-head";
      head.innerHTML =
        '<span class="li-avatar"></span>' +
        '<span class="li-who">' +
        '<strong></strong><small class="li-headline"></small><small class="li-date"></small>' +
        "</span>";
      head.querySelector("strong").textContent = feed.name || "";
      head.querySelector(".li-headline").textContent = feed.headline || "";
      head.querySelector(".li-date").textContent = post.date
        ? new Date(post.date + "T12:00:00Z").toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
        : "";
      card.appendChild(head);

      var body = document.createElement("p");
      body.className = "li-body";
      var paras = String(post.body || "").split("\n").filter(Boolean);
      // Show whole paragraphs up to roughly a LinkedIn-sized preview. Going by
      // paragraph count alone left a post that opens on a short line of
      // dialogue showing barely a dozen words before the "more".
      var PREVIEW = 180;
      var shown = [];
      var chars = 0;
      for (var p = 0; p < paras.length; p++) {
        shown.push(paras[p]);
        chars += paras[p].length;
        if (chars >= PREVIEW) break;
      }
      var hiddenParas = paras.slice(shown.length);

      // Trim trailing punctuation so the truncation ellipsis does not double up.
      body.textContent = shown.join(" ").replace(/[.,;:s]+$/, "");
      if (hiddenParas.length) {
        var rest = document.createElement("span");
        rest.className = "li-rest";
        rest.hidden = true;
        rest.textContent = " " + hiddenParas.join(" ");
        var more = document.createElement("button");
        more.type = "button";
        more.className = "li-more";
        more.textContent = "more";
        more.addEventListener("click", function () { rest.hidden = false; more.remove(); });
        body.append("\u2026 ", more, rest);
      }
      card.appendChild(body);

      // Only when there is something to show. An empty .li-media renders as a
      // 210px tinted void, which read as "image pending" for the placeholder
      // posts but is just a hole under a real text-only post.
      if (post.media) {
        var media = document.createElement("div");
        media.className = "li-media";
        var img = document.createElement("img");
        img.src = post.media;
        img.alt = "";
        img.loading = "lazy";
        media.appendChild(img);
        card.appendChild(media);
      }

      var foot = document.createElement("footer");
      foot.className = "li-foot";
      var stats = [];
      if (post.reactions != null) stats.push(post.reactions + (post.reactions === 1 ? " reaction" : " reactions"));
      if (post.comments != null) stats.push(post.comments + (post.comments === 1 ? " comment" : " comments"));
      var left = document.createElement("span");
      left.className = "li-stats";
      left.textContent = stats.join(" \u00b7 ");
      var right = document.createElement("a");
      right.className = "li-impressions";
      right.href = post.url || feed.profile || "#";
      right.target = "_blank";
      right.rel = "noopener";
      right.textContent = (post.impressions != null
        ? post.impressions.toLocaleString("en-US") + " impressions"
        : "View on LinkedIn") + " ↗";   // leaves the site, like every other ↗ here
      foot.append(left, right);
      card.appendChild(foot);

      frag.appendChild(card);
    });
    track.replaceChildren(frag);

    // one dot per post
    dotsWrap.replaceChildren();
    feed.posts.forEach(function (post, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      if (i === 0) dot.className = "is-active";
      dot.setAttribute("aria-label", "Go to post " + (i + 1));
      dotsWrap.appendChild(dot);
    });

    if (summary) summary.textContent = feed.posts.length === 1 ? "Latest post" : "Latest posts";

    // One post has nowhere to page to: a lone dot and two dead arrows would
    // only advertise that the feed is short.
    var key = document.querySelector(".linkedin-key");
    if (key) key.style.display = feed.posts.length < 2 ? "none" : "";
  }

  var cards = Array.prototype.slice.call(track.querySelectorAll(".li-card"));
  var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll("button"));
  if (!cards.length) return;

  function step() {
    if (cards.length < 2) return track.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function activeIndex() {
    var s = step();
    return s ? Math.round(track.scrollLeft / s) : 0;
  }

  function sync() {
    var i = activeIndex();
    dots.forEach(function (dot, n) {
      dot.classList.toggle("is-active", n === i);
      dot.setAttribute("aria-current", n === i ? "true" : "false");
    });
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  }

  function scrollToCard(i) {
    var target = clamp(0, i, cards.length - 1);
    track.scrollTo({ left: target * step(), behavior: reduced.matches ? "auto" : "smooth" });
  }

  prev.addEventListener("click", function () { scrollToCard(activeIndex() - 1); });
  next.addEventListener("click", function () { scrollToCard(activeIndex() + 1); });

  dots.forEach(function (dot, n) {
    dot.addEventListener("click", function () { scrollToCard(n); });
  });

  track.addEventListener("scroll", function () {
    window.clearTimeout(track._t);
    track._t = window.setTimeout(sync, 80);
  }, { passive: true });

  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollToCard(activeIndex() + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollToCard(activeIndex() - 1); }
  });

  window.addEventListener("resize", sync, { passive: true });
  sync();
})();

/* ------------------------------------------------------------------ *
 * Resume hover preview — page 1 of the PDF peeks out on hover or on   *
 * keyboard focus. The image is fetched on first reveal rather than at *
 * load, and the popover is skipped entirely on coarse pointers.       *
 * ------------------------------------------------------------------ */
(function () {
  var hint = document.querySelector(".resume-hint");
  if (!hint) return;

  var link = hint.querySelector(".home-resume-button");
  var img = hint.querySelector(".resume-peek img");
  if (!link || !img) return;

  // Same gate the stylesheet uses, so JS never opens a popover CSS hides.
  var canHover = window.matchMedia("(hover: hover)");
  var loaded = false;
  var closeTimer = 0;

  function load() {
    if (loaded) return;
    loaded = true;
    img.src = img.dataset.src;
    // A broken render should leave the link behaving like a plain link.
    img.addEventListener("error", function () { hint.classList.remove("is-peeking"); hint.dataset.broken = "true"; });
  }

  // Centred on the button is the nice case, but the button sits low in the
  // hero, so on a short viewport the card would hang off the bottom. Work out
  // how far it needs to move to stay on screen and hand that to the CSS.
  function reposition() {
    var peek = hint.querySelector(".resume-peek");
    var cardH = peek.offsetHeight; // layout height, so the transform can't skew it
    if (!cardH) return;

    var MARGIN = 12;
    var b = link.getBoundingClientRect();
    var wanted = b.top + b.height / 2 - cardH / 2;
    var lowest = window.innerHeight - cardH - MARGIN;
    // Taller than the viewport: pin to the top and let it clip at the bottom.
    var settled = lowest < MARGIN ? MARGIN : clamp(MARGIN, wanted, lowest);

    hint.style.setProperty("--peek-shift", Math.round(settled - wanted) + "px");
  }

  function open() {
    if (!canHover.matches || hint.dataset.broken) return;
    clearTimeout(closeTimer);
    load();
    reposition();
    hint.classList.add("is-peeking");
  }

  // A short close delay stops the card flickering as the pointer crosses
  // the gap between the link and the popover.
  function close(delay) {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () { hint.classList.remove("is-peeking"); }, delay || 0);
  }

  hint.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") open(); });
  hint.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") close(90); });

  link.addEventListener("focus", function () {
    if (!link.matches(":focus-visible")) return;
    open();
    // Focus can arrive mid-scroll, so measure again once layout has settled.
    requestAnimationFrame(reposition);
  });
  link.addEventListener("blur", function () { close(0); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && hint.classList.contains("is-peeking")) close(0);
  });

  // The shift is tied to where the button sits in the viewport, so it goes
  // stale the moment anything moves. Recompute while the card is open; both
  // listeners are passive and only do work during a hover.
  function keepInView() {
    if (hint.classList.contains("is-peeking")) reposition();
  }
  window.addEventListener("scroll", keepInView, { passive: true });
  window.addEventListener("resize", keepInView);
})();

/* ------------------------------------------------------------------ *
 * Cursor                                                              *
 *                                                                     *
 * The page draws its own pointer, in one family, and the captioned    *
 * pill trails behind it. Both live here because both need the same    *
 * hit test on every move, and doing it twice would be waste.          *
 *                                                                     *
 * Replacing the system cursor means owning every state it used to     *
 * express, so the glyph set covers what the browser would have shown  *
 * plus the few this page has opinions about. The glyph itself never   *
 * hides while the pointer is over the document: losing your cursor is *
 * worse than any caption.                                             *
 * ------------------------------------------------------------------ */
(function () {
  // No cursor to replace on touch, and reduced motion should get neither a
  // drawn pointer nor a second thing chasing the first.
  if (!finePointer.matches || reduced.matches) {
    var stale = document.getElementById("buzz");
    if (stale) stale.remove();
    return;
  }

  /* ---- the glyph family ---------------------------------------------- *
   * One definition per glyph, stamped twice by <use>: a fat white stroke
   * for the halo, then the accent fill on top. That is what welds the
   * multi-part glyphs (the hands) into one silhouette with no seams.    */

  var GLYPHS = {
    // The base arrow. Tip at 4, 2.4.
    default: '<path d="M4 2.4L25.6 13.6L15.4 16.1L11.1 25.9Z"/>',

    // A pointing hand, because a badge does not teach anyone that a thing
    // is clickable. Fingertip at 12, 2.2.
    pointer: '<path d="M12 2.2c1.5 0 2.7 1.2 2.7 2.7v8.3c.5-.4 1.1-.6 1.8-.6 1.1 0 2 .6 2.4 1.5.4-.3 1-.5 1.5-.5 1.1 0 2.1.7 2.5 1.7.4-.2.8-.3 1.3-.3 1.5 0 2.7 1.2 2.7 2.7v3.2c0 4.3-3.5 7.8-7.8 7.8h-1.9c-2.3 0-4.4-1-5.9-2.7l-4.1-4.8c-.9-1-.8-2.6.2-3.5 1-.9 2.5-.8 3.4.1l1.1 1.2V4.9c0-1.5 1.2-2.7 2.7-2.7z"/>',

    // I-beam, centred on 16, 16.
    text: '<path d="M11.8 5h8.4v2.4h-3v17.2h3V27h-8.4v-2.4h3V7.4h-3z"/>',

    // Ring and bar, centred on 16, 16.
    disabled: '<path fill-rule="evenodd" d="M16 4.6a11.4 11.4 0 1 1 0 22.8 11.4 11.4 0 0 1 0-22.8zm0 4a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z"/>' +
              '<path d="M9.9 20.4L20.4 9.9l1.9 1.9L11.8 22.3z"/>',

    // Open palm. The gaps between the fingers read because the halo fills
    // them; the body stamp leaves them white.
    grab: '<rect x="8.4" y="12" width="15.2" height="14" rx="6"/>' +
          '<rect x="9.8" y="6.4" width="2.9" height="8" rx="1.45"/>' +
          '<rect x="13.5" y="4.6" width="2.9" height="9.8" rx="1.45"/>' +
          '<rect x="17.2" y="5.2" width="2.9" height="9.2" rx="1.45"/>' +
          '<rect x="20.9" y="7.4" width="2.9" height="7" rx="1.45"/>',

    // The same hand with the fingers curled in.
    grabbing: '<rect x="8.4" y="12.6" width="15.2" height="13.4" rx="6"/>' +
              '<rect x="10.2" y="9.6" width="2.9" height="5" rx="1.45"/>' +
              '<rect x="13.9" y="8.8" width="2.9" height="5.8" rx="1.45"/>' +
              '<rect x="17.6" y="9.2" width="2.9" height="5.4" rx="1.45"/>' +
              '<rect x="21" y="10.4" width="2.6" height="4.2" rx="1.3"/>'
  };

  // The badged states keep the arrow and add a mark at its lower right, the
  // way an OS cursor family does. Filled, never stroked, so the halo stamp
  // stays fat around them.
  var BADGES = {
    external: '<path d="M25.6 16.4l-7.9.1 2.5 2.5-4.7 4.7 2.8 2.8 4.7-4.7 2.5 2.5z"/>',
    download: '<path d="M19.8 16.4h3.7v4.5h2.9l-4.7 5.5-4.7-5.5h2.8z"/>',
    copy: '<path d="M17.2 16h6.8v2.5h-4.3v4.3h-2.5z"/><path d="M20.1 18.9h6.7v7.5h-6.7z"/>',
    help: '<path d="M21.7 16c2 0 3.5 1.3 3.5 3.2 0 1.3-.7 2.1-1.7 2.7-.7.5-.9.8-.9 1.4v.5h-2.3v-.8c0-1.2.5-2 1.5-2.6.7-.5 1-.8 1-1.3 0-.6-.5-1-1.2-1s-1.2.5-1.3 1.2l-2.3-.3c.2-1.8 1.7-3 3.7-3z"/>' +
          '<path d="M20.4 25.4a1.35 1.35 0 1 1 2.7 0 1.35 1.35 0 0 1-2.7 0z"/>',
    busy: ""   // the spinner is animated, so it lives outside the stamp
  };

  Object.keys(BADGES).forEach(function (k) {
    GLYPHS[k] = GLYPHS.default + BADGES[k];
  });

  /* ---- build it ------------------------------------------------------- */

  var defs = Object.keys(GLYPHS).map(function (k) {
    return '<g id="cg-' + k + '">' + GLYPHS[k] + "</g>";
  }).join("");

  var cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.id = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.dataset.state = "default";
  cursor.innerHTML =
    '<svg class="cursor-svg" viewBox="0 0 32 32" fill="none">' +
      "<defs>" + defs + "</defs>" +
      '<use class="cursor-halo" href="#cg-default"></use>' +
      '<use class="cursor-body" href="#cg-default"></use>' +
      '<g class="cursor-spin">' +
        '<circle class="cursor-spin-halo" cx="21.5" cy="21.5" r="5.4"></circle>' +
        '<circle cx="21.5" cy="21.5" r="5.4"></circle>' +
      "</g>" +
    "</svg>";
  document.body.appendChild(cursor);

  var halo = cursor.querySelector(".cursor-halo");
  var body = cursor.querySelector(".cursor-body");

  // Only now, with a glyph on screen, is it safe to take the real one away.
  document.documentElement.classList.add("cursor-custom");

  /* ---- which glyph ---------------------------------------------------- */

  // Matched against the element itself, not an ancestor: a browser shows the
  // I-beam over the text it is actually on, not over the whole card.
  var TEXT = "p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,td,th,dd,dt,mark,small,strong,em,b,i,code,pre,label";
  var FIELD = "input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]),textarea,[contenteditable='true'],[contenteditable='']";
  var PRESS = "a[href],button,[role=button],summary,select,label[for],.think-toggle";
  var DRAG = ".li-track,.activity-scroll";

  var held = null;   // the drag surface the pointer went down on

  function stateFor(el) {
    if (!el) return "default";

    // Anything with its own document paints its own cursor.
    if (el.closest("iframe,embed,object")) return "hidden";

    if (held) return "grabbing";

    var off = el.closest("[disabled],[aria-disabled=true]");
    if (off) return "disabled";

    // A live answer is being assembled; the composer says so, so should this.
    if (document.querySelector(".ask-typing") && el.closest(".ask-card")) return "busy";

    if (el.closest(FIELD)) return "text";

    if (el.closest(".contact-copy,#copy-email")) return "copy";

    var link = el.closest("a[href]");
    if (link) {
      if (link.hasAttribute("download")) return "download";
      if (link.target === "_blank") return "external";
      return "pointer";
    }

    if (el.closest("[data-tooltip]")) return "help";
    if (el.closest(PRESS)) return "pointer";
    if (el.closest(DRAG)) return "grab";

    if (el.matches && el.matches(TEXT)) return "text";
    return "default";
  }

  var state = "default";
  function setState(next) {
    if (next === state) return;
    state = next;
    var hidden = next === "hidden";
    cursor.classList.toggle("is-hidden", hidden);
    if (hidden) return;
    var href = "#cg-" + (GLYPHS[next] ? next : "default");
    halo.setAttribute("href", href);
    body.setAttribute("href", href);
    cursor.dataset.state = next;
  }

  /* ---- position ------------------------------------------------------- */

  // The glyph is the pointer, so it is exact. Only the label trails.
  var tip = { x: -100, y: -100 };
  var lag = { x: -100, y: -100 };
  var seen = false;
  var frame = 0;

  var label = document.getElementById("buzz");
  var labelText = document.getElementById("buzz-label");

  function labelBlocked() {
    // The preview card is its own companion and the ask panel takes the
    // pointer entirely. Neither is a reason to take the cursor away.
    var preview = document.getElementById("project-preview");
    var widget = document.getElementById("ask-widget");
    return (preview && preview.classList.contains("is-visible")) ||
           (widget && !widget.hasAttribute("hidden"));
  }

  function tick() {
    frame = 0;
    cursor.style.transform = "translate3d(" + tip.x + "px," + tip.y + "px,0)";

    if (label) {
      lag.x += (tip.x - lag.x) * 0.16;
      lag.y += (tip.y - lag.y) * 0.16;
      label.style.transform = "translate3d(" + lag.x + "px," + lag.y + "px,0)";
      label.classList.toggle("is-on", seen && !labelBlocked() && !!labelText.textContent);
      if (Math.abs(tip.x - lag.x) > 0.3 || Math.abs(tip.y - lag.y) > 0.3) queue();
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(tick); }

  /* ---- the caption ---------------------------------------------------- */

  var current = "";
  function say(text) {
    if (!labelText || text === current) return;
    current = text;
    labelText.classList.add("is-swapping");
    setTimeout(function () {
      labelText.textContent = text;
      labelText.classList.toggle("is-long", text.length > 64);
      labelText.classList.remove("is-swapping");
      queue();          // the text may have arrived after the glyph settled
    }, 180);
  }

  // One joke per section, each one still true, as the fallback for the space
  // between the tagged elements.
  var LINES = {
    top:      "No templates were harmed.",
    proof:    "Sourced, not rounded up.",
    work:     "Receipts, not vibes.",
    career:   "The short version.",
    process:  "Spoiler: it’s mostly listening.",
    writings: "Thoughts. With actual paragraphs.",
    labs:     "A GPU somewhere is tired.",
    writing:  "Now with 90% less “humbled”.",
    contact:  "This is the part where you say hi.",
  };

  var sections = [].slice.call(document.querySelectorAll("main > section[id]"));

  function pick() {
    // Whichever section covers the middle of the viewport wins; falling back
    // to the last one scrolled past keeps the label from going blank.
    var mid = window.innerHeight / 2;
    var best = sections[0];
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) return sections[i];
      if (r.bottom < mid) best = sections[i];
    }
    return best;
  }

  function lineFor(el) {
    var host = el && el.closest ? el.closest("[data-buzz]") : null;
    if (host) return host.dataset.buzz;
    var sec = sections.length ? pick() : null;
    return (sec && LINES[sec.id]) || "";
  }

  /* ---- events --------------------------------------------------------- */

  function at(x, y) {
    // elementFromPoint rather than the event target: it reports disabled
    // controls, which stop firing pointer events but still need a glyph.
    return document.elementFromPoint(x, y);
  }

  // A pen hovers, so it gets the glyph and the label too. Touch does not:
  // there is no hover to report, and a label chasing a finger that has
  // already lifted would be describing something nobody is pointing at.
  function hovers(e) {
    return e.pointerType === "mouse" || e.pointerType === "pen";
  }

  document.addEventListener("pointermove", function (e) {
    if (!hovers(e)) return;
    tip.x = e.clientX;
    tip.y = e.clientY;
    if (!seen) { lag.x = tip.x; lag.y = tip.y; seen = true; cursor.classList.remove("is-hidden"); }
    var el = at(e.clientX, e.clientY);
    setState(stateFor(el));
    say(lineFor(el));
    queue();
  }, { passive: true });

  document.addEventListener("pointerdown", function (e) {
    if (!hovers(e)) return;
    var el = at(e.clientX, e.clientY);
    held = el && el.closest ? el.closest(DRAG) : null;
    cursor.classList.add("is-pressed");
    setState(stateFor(el));
  }, { passive: true });

  document.addEventListener("pointerup", function (e) {
    if (!hovers(e)) return;
    held = null;
    cursor.classList.remove("is-pressed");
    setState(stateFor(at(e.clientX, e.clientY)));
  }, { passive: true });

  function stand_down() {
    seen = false;
    held = null;
    cursor.classList.add("is-hidden");
    cursor.classList.remove("is-pressed");
    if (label) label.classList.remove("is-on");
  }

  // Off the page, or into an iframe, or into the browser's own chrome.
  document.documentElement.addEventListener("pointerleave", stand_down);
  window.addEventListener("blur", stand_down);

  // Keyboard navigation means the pointer is not the thing being used.
  window.addEventListener("keydown", function (e) {
    if (e.key === "Tab") stand_down();
  });

  // Scrolling slides the page under a stationary pointer, so what it is over
  // changes with no pointer event to announce it.
  window.addEventListener("scroll", function () {
    if (!seen) return;
    var el = at(tip.x, tip.y);
    setState(stateFor(el));
    say(lineFor(el));
    queue();
  }, { passive: true });

  // The ask panel opening or an answer finishing both change the glyph
  // without moving the pointer.
  document.addEventListener("click", function () {
    if (seen) setState(stateFor(at(tip.x, tip.y)));
    queue();
  });
})();

/* ------------------------------------------------------------------ *
 * "See my thinking" — one toggle, reused by every project card.       *
 *                                                                     *
 * The panels are open in CSS so the decisions are readable with no    *
 * JS at all. Adding .js to <html> hands control to the toggle.        *
 * ------------------------------------------------------------------ */
(function () {
  var toggles = [].slice.call(document.querySelectorAll(".think-toggle"));
  if (!toggles.length) return;

  toggles.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;

    // Hidden only once the script is running, so the decisions stay readable
    // if it never does.
    panel.hidden = true;

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      btn.lastChild.textContent = open ? " See my thinking" : " Hide my thinking";

      if (open) { panel.hidden = true; return; }

      // Unhide, then fade — a class flip on the same frame would not animate.
      panel.hidden = false;
      panel.classList.add("is-entering");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { panel.classList.remove("is-entering"); });
      });
    });
  });
})();

/* ------------------------------------------------------------------ *
 * "Ask about this project" — opens the assistant with the question    *
 * already in the box. It is never sent automatically; the visitor     *
 * still has to press send.                                            *
 * ------------------------------------------------------------------ */
(function () {
  var buttons = [].slice.call(document.querySelectorAll(".ask-about"));
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var launcher = document.getElementById("ask");
      var input = document.getElementById("ask-input");
      if (launcher) launcher.click();
      if (!input) return;
      setTimeout(function () {
        input.value = btn.dataset.question || "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }, 180);
    });
  });
})();

/* ------------------------------------------------------------------ *
 * Copy email — with a visible, announced confirmation and a reserved  *
 * status line so confirming never shifts the layout.                  *
 * ------------------------------------------------------------------ */
(function () {
  var btn = document.getElementById("copy-email");
  var status = document.getElementById("copy-status");
  if (!btn) return;

  var label = btn.querySelector(".contact-copy-label");
  var email = btn.dataset.email || "";
  var revert;

  function done(msg, ok) {
    if (status) status.textContent = msg;
    if (ok) {
      btn.classList.add("is-done");
      label.textContent = "Copied";
    }
    clearTimeout(revert);
    revert = setTimeout(function () {
      btn.classList.remove("is-done");
      label.textContent = "Copy address";
      if (status) status.textContent = "";
    }, 2600);
  }

  btn.addEventListener("click", function () {
    // The async clipboard API needs a secure context; fall back to a
    // selection copy rather than silently failing on http.
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(
        function () { done(email + " copied to your clipboard.", true); },
        function () { done("Could not copy. The address is " + email, false); }
      );
      return;
    }
    var field = document.createElement("textarea");
    field.value = email;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:-100px;opacity:0";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    field.remove();
    done(ok ? email + " copied to your clipboard." : "Could not copy. The address is " + email, ok);
  });
})();

/* ------------------------------------------------------------------ *
 * Nav bubble opens the assistant.                                     *
 *                                                                     *
 * The widget only exists on index.html, so the other two pages link    *
 * to index.html#ask and land here. Both routes click the launcher      *
 * rather than reimplementing open(), which already handles focus,      *
 * the exit-animation unwind and the already-open case.                 *
 * ------------------------------------------------------------------ */
(function () {
  var launcher = document.getElementById("ask");
  if (!launcher) return;            // a case-study page: let the link navigate

  function openAsk() { launcher.click(); }

  var navAsk = document.querySelector(".nav-ask");
  if (navAsk) {
    navAsk.addEventListener("click", function (e) {
      e.preventDefault();           // no jump to the launcher behind the panel
      openAsk();
    });
  }

  // Arriving from another page's nav link.
  if (location.hash === "#ask") openAsk();

  // And if someone is already here and the hash changes to #ask.
  window.addEventListener("hashchange", function () {
    if (location.hash === "#ask") openAsk();
  });
})();

/* ------------------------------------------------------------------ *
 * In-page shortcuts in the pinned row close the panel first.          *
 * Without this the visitor jumps to a section hidden behind it, which *
 * reads as the link having done nothing.                              *
 * ------------------------------------------------------------------ */
(function () {
  var close = document.getElementById("ask-close");
  if (!close) return;
  [].slice.call(document.querySelectorAll("[data-ask-jump]")).forEach(function (a) {
    a.addEventListener("click", function () { close.click(); });
  });
})();

/* ------------------------------------------------------------------ *
 * Voice input.                                                        *
 *                                                                     *
 * Web Speech API: free, local, and absent in Firefox, so the button   *
 * ships hidden and is revealed only on feature detection rather than  *
 * on a browser sniff. The transcript lands in the box and stops       *
 * there; nothing is sent until the visitor presses send, because a    *
 * mishearing should be correctable, not published.                    *
 * ------------------------------------------------------------------ */
(function () {
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var mic = document.getElementById("ask-mic");
  var input = document.getElementById("ask-input");
  if (!Rec || !mic || !input) return;

  mic.hidden = false;

  var rec = new Rec();
  // The visitor's locale, not the author's: this transcribes their speech.
  rec.lang = navigator.language || "en";
  rec.interimResults = true;
  rec.continuous = false;

  var listening = false;
  var base = "";

  function setState(on) {
    listening = on;
    mic.classList.toggle("is-live", on);
    mic.setAttribute("aria-label", on ? "Stop listening" : "Ask by voice");
  }

  mic.addEventListener("click", function () {
    if (listening) { rec.stop(); return; }
    // Keep anything already typed, so voice appends rather than replaces.
    base = input.value.trim() ? input.value.trim() + " " : "";
    try { rec.start(); } catch (e) { setState(false); }
  });

  rec.onstart = function () { setState(true); };
  rec.onend = function () { setState(false); };
  rec.onerror = function () { setState(false); };

  rec.onresult = function (e) {
    var text = "";
    for (var i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
    input.value = base + text;
    // The send button and the auto-grow both key off this.
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
})();

/* The bottom bar's Ask button reuses the launcher, same as the nav bubble. */
(function () {
  var b = document.getElementById("bn-ask");
  var launcher = document.getElementById("ask");
  if (!b || !launcher) return;
  b.addEventListener("click", function () { launcher.click(); });
})();

/* ------------------------------------------------------------------ *
 * "Last updated"                                                      *
 *                                                                     *
 * Written by hand it was two days stale within two days, on a site    *
 * that had been rebuilt four times that morning. document.lastModified*
 * is the page's own Last-Modified header, which this host sets to the *
 * deploy, so the claim maintains itself. The markup keeps a literal    *
 * for the case where no header arrives and the browser substitutes     *
 * the current time, which would be a lie told confidently.             *
 * ------------------------------------------------------------------ */
(function () {
  var el = document.getElementById("ft-updated");
  if (!el) return;

  var stamp = Date.parse(document.lastModified);
  if (!stamp) return;

  var d = new Date(stamp);
  // A header the host did not send leaves this at "now". Anything inside
  // the last minute is that, not a deploy, so the literal stands.
  if (Date.now() - stamp < 60000) return;

  var months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  el.textContent = "Last updated " + d.getDate() + " " + months[d.getMonth()] +
                   " " + d.getFullYear();
  el.setAttribute("datetime", d.toISOString().slice(0, 10));
})();

/* ------------------------------------------------------------------ *
 * More projects: the rail's arrows                                    *
 *                                                                     *
 * One card per press, measured off the first two items rather than    *
 * assumed, so it keeps step when the breakpoint changes the card      *
 * width. Each arrow goes dim at its end of the row, which is the only *
 * edge signal left now that the scrollbar is gone.                     *
 * ------------------------------------------------------------------ */
(function () {
  var rail = document.getElementById("mp-rail");
  var prev = document.getElementById("mp-prev");
  var next = document.getElementById("mp-next");
  if (!rail || !prev || !next) return;

  function step() {
    var items = rail.children;
    if (items.length > 1) return items[1].offsetLeft - items[0].offsetLeft;
    return items.length ? items[0].getBoundingClientRect().width : rail.clientWidth;
  }

  function sync() {
    var max = rail.scrollWidth - rail.clientWidth;
    // The rail carries 4px of padding so the focus ring has room, and it
    // comes to rest at that, not at zero. Measured rather than assumed, so
    // changing the padding cannot quietly strand the left arrow enabled.
    var start = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    prev.disabled = rail.scrollLeft <= start + 2;
    next.disabled = rail.scrollLeft >= max - 1;
  }

  function go(dir) {
    rail.scrollBy({ left: dir * step(), behavior: "smooth" });
  }

  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });

  var ticking = false;
  rail.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; sync(); });
  }, { passive: true });
  window.addEventListener("resize", sync, { passive: true });

  sync();
})();
