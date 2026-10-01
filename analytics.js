/* =========================================================================
   Analytics — Microsoft Clarity + Google Analytics 4.

   Put your IDs in CONFIG below and they load automatically. Leave one blank
   and that tool simply never loads, so you can turn either on independently.

     clarity  Clarity → Settings → Overview → project ID   (e.g. "abc123xyz")
     ga4      GA4 → Admin → Data streams → Measurement ID  (e.g. "G-XXXXXXXXXX")

   Nothing loads on localhost, so your own development never shows up in the
   numbers. Nothing loads for visitors sending Global Privacy Control or Do
   Not Track either — see PRIVACY at the bottom of this file.
   ========================================================================= */

(function () {
  "use strict";

  var CONFIG = {
    clarity: "",   // <-- paste your Clarity project ID
    ga4: "",       // <-- paste your GA4 measurement ID

    // Hosts that should never report. Add a staging domain if you have one.
    ignoreHosts: ["localhost", "127.0.0.1", "0.0.0.0", ""],

    // Honour browser-level opt-out signals. Turning this off is legal in some
    // places and not others; leaving it on costs you a small slice of traffic
    // and keeps you on the right side of the question.
    respectDoNotTrack: true,

    // Set true if you add a cookie banner. Nothing loads until your banner
    // calls window.analyticsConsent() — see CONSENT below.
    requireConsent: false,
  };

  /* ---------------------------------------------------------------- gates */

  var host = location.hostname;

  function optedOut() {
    if (!CONFIG.respectDoNotTrack) return false;
    return (
      navigator.globalPrivacyControl === true ||
      navigator.doNotTrack === "1" ||
      window.doNotTrack === "1" ||
      navigator.msDoNotTrack === "1"
    );
  }

  function blocked() {
    if (location.protocol === "file:") return "local file";
    if (CONFIG.ignoreHosts.indexOf(host) !== -1) return "ignored host: " + (host || "(none)");
    if (optedOut()) return "visitor opted out";
    if (!CONFIG.clarity && !CONFIG.ga4) return "no IDs configured";
    return null;
  }

  /* ------------------------------------------------------------- loaders */

  var started = false;

  function loadClarity(id) {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.clarity.ms/tag/" + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function loadGA4(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);

    window.gtag("js", new Date());
    // anonymize_ip is the GA4 default, but being explicit documents the intent.
    window.gtag("config", id, { anonymize_ip: true });
  }

  function start() {
    if (started) return;
    var why = blocked();
    if (why) { window.__analyticsOff = why; return; }
    started = true;
    if (CONFIG.clarity) loadClarity(CONFIG.clarity);
    if (CONFIG.ga4) loadGA4(CONFIG.ga4);
  }

  /* -------------------------------------------------------------- events */

  // Safe to call whether or not anything actually loaded.
  function track(name, params) {
    if (window.gtag) window.gtag("event", name, params || {});
    if (window.clarity) window.clarity("event", name);
  }
  window.track = track;

  // One delegated listener rather than edits scattered through script.js.
  document.addEventListener("click", function (e) {
    var el = e.target instanceof Element ? e.target : null;
    if (!el) return;

    var resume = el.closest(".home-resume-button");
    if (resume) return track("resume_download", { file: resume.getAttribute("href") });

    var project = el.closest(".project-card");
    if (project) {
      return track("project_open", {
        project: project.dataset.projectName || "",
        destination: project.getAttribute("href") || "",
      });
    }

    var article = el.closest(".writing-card");
    if (article) {
      var title = article.querySelector(".writing-title");
      return track("article_open", { title: title ? title.textContent.trim() : "" });
    }

    if (el.closest(".ask-launcher, .ask-docked, .nav-ask")) return track("ask_open");
    if (el.closest(".home-contact-button")) return track("contact_click");
  }, true);

  /* ------------------------------------------------------------- CONSENT */

  // If you add a cookie banner later: set requireConsent above to true, then
  // call window.analyticsConsent() from the banner's accept handler.
  window.analyticsConsent = function () {
    CONFIG.requireConsent = false;
    start();
  };

  if (!CONFIG.requireConsent) start();

  /* ------------------------------------------------------------- PRIVACY

     Clarity records sessions: pointer movement, clicks, scrolling, and by
     default the text on the page. The Ask widget's textarea carries
     data-clarity-mask="true" so anything a visitor types there is never
     recorded. If you add any other input, mask it the same way.

     Neither tool is loaded on localhost, so nothing you do while building
     this site lands in the reports.

     Both set cookies. There is no cookie banner on this site. Whether you
     need one depends on where your visitors are, not where you are — the
     EU/UK rules key off the visitor. The requireConsent flag above is the
     hook for wiring one up.
     ------------------------------------------------------------------- */
})();
