/* =========================================================================
   Agent mode — hero video and the record.
   ========================================================================= */

/* ------------------------------------------------------------------ *
 * Hero video. The poster carries first paint; the clip only fades in  *
 * once it actually has frames. Some mobile browsers withhold autoplay *
 * until a gesture, so play() is nudged again on the first touch.      *
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  var video = document.getElementById("heroVideo");
  if (!video) return;

  function reveal() { video.classList.add("is-ready"); }

  // readyState 3 = HAVE_FUTURE_DATA, i.e. there is a frame to show.
  if (video.readyState >= 3) reveal();
  else video.addEventListener("loadeddata", reveal, { once: true });

  function kick() {
    var p = video.play();
    // A blocked autoplay rejects; that is expected, not an error worth logging.
    if (p && p.catch) p.catch(function () {});
  }

  kick();
  window.addEventListener("touchstart", kick, { once: true, passive: true });
  window.addEventListener("click", kick, { once: true });
})();

/* ------------------------------------------------------------------ *
 * The record — Billy Joel, "Vienna", through a Spotify embed.         *
 *                                                                     *
 * Spotify holds the licence, so no audio is served from this site.    *
 * The iframe is created on the first press rather than at load, which *
 * keeps Spotify's requests and cookies off the page for anyone who    *
 * never asks for music.                                               *
 *                                                                     *
 * Playback needs a user gesture in every browser, so the record can   *
 * never start on its own — the button is the gesture.                 *
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  var TRACK = "spotify:track:4U45aEWtQhrm8A5mxPaFZ7";
  var API = "https://open.spotify.com/embed/iframe-api/v1";

  var toggle = document.getElementById("recordToggle");
  var label = document.getElementById("recordLabel");
  var panel = document.getElementById("recordPanel");
  var mount = document.getElementById("recordMount");
  if (!toggle || !label || !panel || !mount) return;

  var controller = null;   // Spotify's EmbedController, once it exists
  var wanted = false;      // what the button is currently asking for
  var loading = false;

  function paint(playing) {
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    label.textContent = playing ? "Stop the record" : "Play the record";
  }

  function setPanel(open) {
    panel.hidden = !open;
    // Height animates from 0, so it needs a frame with the element in flow.
    if (open) requestAnimationFrame(function () { panel.classList.add("is-open"); });
    else panel.classList.remove("is-open");
  }

  function build() {
    if (loading) return;
    loading = true;

    // Spotify calls this global once its API script has parsed.
    window.onSpotifyIframeApiReady = function (IFrameAPI) {
      IFrameAPI.createController(
        mount,
        { uri: TRACK, width: "100%", height: 80 },
        function (ctrl) {
          controller = ctrl;

          // Keep the button honest about what the embed is actually doing —
          // the visitor can press Spotify's own controls too.
          ctrl.addListener("playback_update", function (e) {
            if (e && e.data) paint(!e.data.isPaused);
          });

          if (wanted) ctrl.play();
        }
      );
    };

    var s = document.createElement("script");
    s.src = API;
    s.async = true;
    s.onerror = function () {
      // Offline, blocked, or Spotify is down: say so rather than leaving a
      // button that silently does nothing.
      loading = false;
      wanted = false;
      paint(false);
      label.textContent = "Record unavailable";
      toggle.disabled = true;
    };
    document.head.appendChild(s);
  }

  toggle.addEventListener("click", function () {
    wanted = toggle.getAttribute("aria-pressed") !== "true";
    paint(wanted);

    if (wanted) {
      setPanel(true);
      if (controller) controller.play();
      else build();
      return;
    }

    if (controller) controller.pause();
    setPanel(false);
  });
})();

/* ------------------------------------------------------------------ *
 * Below the hero the page is an ordinary portfolio surface, so the    *
 * header has to stop forcing ink-on-sky or it vanishes into the dark  *
 * theme. Flip a class when the hero leaves.                           *
 * ------------------------------------------------------------------ */
(function () {
  var hero = document.querySelector(".hero");
  if (!hero) return;

  // Two separate things, and conflating them was the bug. A transparent
  // header only works while nothing is moving under it, so it solidifies on
  // any scroll at all. The record button is a separate question: it belongs
  // to the hero and leaves with it.
  var frame = 0;

  function sync() {
    frame = 0;
    document.body.classList.toggle("is-scrolled", window.scrollY > 8);
    document.body.classList.toggle("is-past-hero", hero.getBoundingClientRect().bottom <= 150);
  }

  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  }

  sync();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();

/* ------------------------------------------------------------------ *
 * The real number on this page comes from the usage file rather than  *
 * being typed in, so it cannot drift from what the transcripts say.   *
 * ------------------------------------------------------------------ */
(function () {
  var usage = window.CLAUDE_USAGE;
  if (!usage || !usage.totals) return;

  function compact(n) {
    if (n >= 1e9) return +(n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + "K";
    return String(n);
  }

  var t = usage.totals;

  var grid = document.getElementById("ag-stat-usage");
  if (grid) {
    grid.textContent =
      t.activeDays + " active days \u00b7 " +
      compact(t.messages) + " messages \u00b7 read from local transcripts";
  }
})();

/* ------------------------------------------------------------------ *
 * Footer footage. The glass pane needs something behind it to be      *
 * glass over, but a footer should not cost every visitor a video they *
 * may never scroll to — so it loads on approach and pauses on exit.   *
 * ------------------------------------------------------------------ */
(function () {
  var video = document.querySelector(".fx-video");
  var stage = video && video.closest(".fx-stage");
  if (!video || !stage) return;

  var loaded = false;
  var inView = false;

  function play() {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function load() {
    if (loaded) return;
    loaded = true;
    var src = document.createElement("source");
    src.src = video.dataset.src;
    src.type = "video/mp4";
    video.appendChild(src);
    // load() aborts anything already queued, so wait for a real frame.
    video.addEventListener("loadeddata", function () {
      video.classList.add("is-ready");
      play();
    }, { once: true });
    video.load();
  }

  if (!("IntersectionObserver" in window)) { inView = true; stage.classList.add("is-in"); load(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      inView = e.isIntersecting;
      if (inView) { if (loaded) play(); else load(); }
      else if (!video.paused) video.pause();
    });
  }, { rootMargin: "300px 0px", threshold: 0 }).observe(stage);

  // The hero's entrance rides the same signal.
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) stage.classList.add("is-in");
    });
  }, { rootMargin: "0px 0px -15% 0px", threshold: 0 }).observe(stage);
})();


/* ------------------------------------------------------------------ *
 * The preview clip. Same contract as the hero: nothing is requested   *
 * until the card is close, the drawing underneath holds the frame     *
 * until there is a real one, and it stops when it scrolls away. A     *
 * visitor who asked for less motion gets the still.                   *
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  // Every preview clip, not just the first. querySelector silently wired up
  // one card and left any later one dead, which is the kind of bug that only
  // shows when a second card arrives.
  [].forEach.call(document.querySelectorAll(".ag-preview-video"), setUpPreview);

  function setUpPreview(video) {
  var stage = video.closest(".ag-stage--preview");
  if (!stage) return;

  var loaded = false;
  var inView = false;

  function play() {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function load() {
    if (loaded) return;
    loaded = true;
    var src = document.createElement("source");
    src.src = video.dataset.src;
    src.type = "video/mp4";
    video.appendChild(src);
    video.addEventListener("loadeddata", function () {
      video.classList.add("is-ready");
      play();
    }, { once: true });
    video.load();
  }

  if (!("IntersectionObserver" in window)) { inView = true; load(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      inView = e.isIntersecting;
      if (inView) { if (loaded) play(); else load(); }
      else if (!video.paused) video.pause();
    });
  }, { rootMargin: "300px 0px", threshold: 0 }).observe(stage);
  }
})();


/* ------------------------------------------------------------------ *
 * Capabilities. The heading is split into words so each can blur in   *
 * on its own beat, and the clip behind the section follows the same   *
 * contract as every other video here: nothing until it is close, and  *
 * paused once it leaves.                                              *
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  var title = document.querySelector(".cap-title[data-blur]");
  if (title) {
    var words = title.textContent.trim().split(/\s+/);
    title.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      span.style.setProperty("--w-delay", (i * 100) + "ms");
      title.appendChild(span);
      // a real space, so the heading still copies and reads as words
      if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          title.classList.add("is-in");
          obs.disconnect();
        });
      }, { threshold: 0.1 }).observe(title);
    } else {
      title.classList.add("is-in");
    }
  }

  var video = document.querySelector(".cap-video");
  var section = video && video.closest(".cap");
  if (!video || !section) return;

  var loaded = false;
  var inView = false;

  function play() {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function load() {
    if (loaded) return;
    loaded = true;
    var src = document.createElement("source");
    src.src = video.dataset.src;
    src.type = "video/mp4";
    video.appendChild(src);
    video.addEventListener("loadeddata", function () {
      video.classList.add("is-ready");
      play();
    }, { once: true });
    video.load();
  }

  if (!("IntersectionObserver" in window)) { inView = true; load(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      inView = e.isIntersecting;
      if (inView) { if (loaded) play(); else load(); }
      else if (!video.paused) video.pause();
    });
  }, { rootMargin: "300px 0px", threshold: 0 }).observe(section);

  // This section can already be on screen at first paint, and a browser that
  // has seen no gesture yet will refuse the play(). The hero solves it the
  // same way: ask again the first time the visitor touches the page.
  function nudge() { if (loaded) play(); }
  window.addEventListener("touchstart", nudge, { once: true, passive: true });
  window.addEventListener("click", nudge, { once: true });
  window.addEventListener("keydown", nudge, { once: true });
})();
