# Editorial portfolio

A personal portfolio. The layout geometry started as a replica of the
kishanvagale.com system — measure, type scale, section rhythm — but the surface has
since been re-skinned (see **Moving away from the original**). The case study page
takes its structure from a different reference again.

## Run it

```bash
node editorial-portfolio/serve.js
```

Then open <http://localhost:5210>. There is no build step; edit the files and reload.
(The Claude Code preview pane knows this as the `editorial-portfolio` launch config.)

## Files

| File | What's in it |
| --- | --- |
| `index.html` | All page content. This is the only file you need to touch to change copy. |
| `styles.css` | Tokens at the top, then layout → typography → per-section rules → responsive → motion. |
| `script.js` | Theme toggle, all the interactions, token calendar, LinkedIn carousel. |
| `serve.js` | Minimal local static server. |
| `Nitansh-Anand-Resume.pdf` | Served by the "Download resume" button. |
| `claude-usage.js` | Generated token-usage data for the "On Claude Code" section. |
| `tools/build-usage.js` | Regenerates the above from local Claude Code transcripts. |
| `tools/build-standalone.js` | Folds `agent-mode.html` and everything it references into `agent-mode-standalone.html`. Run it after editing that page. `--inline-video` also folds in the Unfinished World preview clip. |
| `ask-knowledge.js` | What the Ask widget can answer. Content only, edit freely. |
| `linkedin-posts.js` | Your LinkedIn posts. Paste a new one here when you publish. |

## On Claude Code

Replaces the old GitHub contribution graph. Same calendar component — keyboard
navigable day buttons, live-region announcements, horizontal scroll under 634px —
but keyed on **real Claude Code token usage**, with a terracotta ramp
(`--tok-1` … `--tok-4`) instead of GitHub's greens.

Refresh the data any time:

```bash
node tools/build-usage.js
```

It walks `~/.claude/projects/**/*.jsonl`, sums each message's `usage` object by
calendar day, and writes `claude-usage.js`. Only day totals and counts are
written — no prompts, no file contents, nothing leaves the machine.

**What the numbers mean.** "Processed" is every token the API touched, and it is
dominated by cache reads (4.68B of the 4.81B) — that is how usage tooling counts,
but it is not 4.81B tokens of original work. "Generated" is output only, 15.7M, of
which 4.4M is thinking. Both are shown so the headline figure is not read as
something it isn't.

Volume bands are set against the real spread in `script.js` — under 40M, 100M,
250M, then above. The trailing-year grid is mostly empty because the history
starts 2026-07-24; it fills in as you use it.

## Ask widget

A floating card anchored bottom-right, 392×580, inset from the edges. It is
**non-modal on purpose**: no backdrop on desktop, `pointer-events: none` on the
wrapper, so the page stays readable and clickable while you ask. Escape closes it;
clicking the page does not, because you may want to read while a question is open.

On phones it becomes a sheet at 76dvh with a light scrim, still leaving the top of
the page visible rather than taking the whole frame.

Replies are bubbles with an avatar, questions are accent bubbles on the right, and
source chips deep-link into the page.

**It genuinely answers questions**, but by retrieval rather than generation. The
matcher in `script.js` scores the question against `ask-knowledge.js` — phrase
tags score 6, exact word matches 3, prefix matches 1.5, plus a weak echo from the
answer body — normalises by question length, and needs to clear a threshold of 2.
Below that it says it does not know and offers the email instead.

That design is deliberate: **it can only ever say what is written in
`ask-knowledge.js`**, so it cannot invent a claim about you. Adding an answer is
adding an object to that array; no code changes.

To put a real model behind it, set `window.ASK_ENDPOINT` to a URL that accepts
`POST { question }` and returns `{ answer, link? }`. The panel will use it and
fall back to local retrieval if the request fails. Do not put an API key in the
page — point it at a proxy you control.

## LinkedIn

**Live post fetching is not possible from a static page.** LinkedIn has no public
API for reading a personal feed; the member-social scope is partner-gated and
needs an authenticated backend with token refresh. Anything claiming otherwise is
scraping, which breaks and violates their terms.

So `linkedin-posts.js` is the practical version: a small data file the section
renders from. Paste a post when you publish one — date, body, permalink, and
optional reaction/comment/impression counts. Set a count to `null` and it is
hidden rather than shown as zero. Dots and the carousel rebuild themselves from
the array length.

If you later deploy somewhere with scheduled functions (Vercel, Netlify, a GitHub
Action), the same file shape can be generated on a cron instead of by hand.

## Resume hover preview

Hovering (or tabbing to) **Download resume** peeks at page 1 of the PDF.
`assets/resume-preview.webp` is a pre-rendered image, fetched on first reveal rather
than at page load, so nothing ships a PDF renderer to the browser. It is hidden on
coarse pointers and below 600px, and `pointer-events: none` keeps it from ever
intercepting the download click. Regenerate it with `tools/build-resume-preview.md`
whenever the PDF changes.

## Analytics

`analytics.js` carries Microsoft Clarity and Google Analytics 4. Both are off until
you paste IDs into the `CONFIG` block at the top of that file — leave one blank and
only the other loads.

| Where to get the ID | |
| --- | --- |
| Clarity | Settings → Overview → project ID |
| GA4 | Admin → Data streams → Measurement ID |

It is loaded `defer` from the `<head>` of `index.html` and `digilawyer.html`, so it
never blocks rendering.

**Nothing loads** on localhost, on `file://`, when no IDs are set, or when the visitor
sends Global Privacy Control / Do Not Track. `window.__analyticsOff` says which of
those applied, which is the first thing to check if a live site reports nothing.

**Custom events** are wired through one delegated click listener, so `script.js` needed
no edits: `resume_download`, `project_open`, `article_open`, `ask_open`, `contact_click`.
Call `window.track(name, params)` to add more; it is a no-op when analytics is off.

**Privacy.** Clarity records sessions, so the Ask widget's textarea carries
`data-clarity-mask="true"` and nothing typed there is recorded — mask any input you add
the same way. Both tools set cookies and there is no cookie banner; the
`requireConsent` flag plus `window.analyticsConsent()` are the hook if you add one.

## Content status

Copy comes from `Nitansh Anand Resume 26'.pdf`. Real: name, role, summary, the three
jobs with their metrics, education, email and LinkedIn.

**Still to fill in:**

| Where | What |
| --- | --- |
| Section library / company website | No case study written yet; both cards link to Ask rather than a page |
| `linkedin-posts.js` | Three placeholder posts — replace with real ones and permalinks |
| `.home-portrait` | SVG silhouette — swap for a real photo |
| Hero intro | No city; the resume only gives Gurugram/Delhi for the internships |
| `.career-logo` / `.company-brand` colours | Guessed, except Figma / Material 3 / Angular |

Only DigiLawyer has a written case study, and only that card links to one. The
section library and company website cards offer "Ask about this project" instead,
until their own pages exist.

Not on the page because the design has no section for them: the Skills list, and the
phone number (deliberately left off a public page — add it if you want it).

The section-library bullet was cut off in the resume PDF at "launch time down from
3 months to under 1" with no unit. Confirmed by Nitansh as **months**, and the full
metric is now on the card and in the Ask answer.

### How the pieces work

- **Hero** — `.home-heading` is a two-column grid: `.home-copy` (headline, intro,
  actions) on the left, `.hero-widget` on the right. Stacks under 760px.
- **Hero widget** — a square slot, `clamp(136px, 14vw, 172px)`, currently holding
  `assets/hero-widget.png`. Put anything in it (illustration, photo, a small
  interactive thing) and it keeps the box.
- **How I build** — `.build-grid`, sticky intro left, `.build-steps` right. The rail
  is a gradient on `.build-steps::before` and each dot is `li::before`; add a step by
  adding an `<li>`.
- **Company chips** — each `.company-brand` sets its own `--brand-color`. Employer
  logos live in `assets/logos/`; tool marks (Figma, Material 3, Angular, Claude) are
  inline SVG. Either way the mark sits in a 1.05em `.brand-logo` box.
- **Career** — one `<article class="career-entry">` per company. Featured case studies
  are `<li class="career-study-row">` wrapping an `<a class="project-card">`; plain
  entries are a bare `<li>` with an `<h4>`.
- **Status chips** — `project-card-status--live` / `--wip` / `--sunset`.
- **Token calendar** — each day is a `<button>` with `data-level="1…4"`, built in
  `script.js` from `window.CLAUDE_USAGE`.
- **LinkedIn posts** — rendered from `linkedin-posts.js`. Cards and dots are built
  from the array, so adding a post is one object.

## Design tokens

Set once on `:root` in `styles.css`, redefined for dark mode:

```
ink #1c1b19 · ground #faf9f7 · raised #fff · sunken #f1efea
hairline #e3dfd8 · accent #0e7c66 · highlight #fd2 · rule rgba(39,29,22,.1)
token ramp --tok-1…4  #f2d9cd → #8f4325
```

Layout constants: 720px measure, `clamp(1.25rem, 7vw, 6rem)` gutter, 56px header,
`clamp(3rem, 7vw, 4.5rem)` section rhythm, 210px career rail.

Type: **Inter** throughout. One family, hierarchy carried by weight, size and
tracking — body 400, headings `--display-wght: 640` with negative tracking
(`-0.032em` on the hero, `-0.026em` on section heads). `--font-display` is an
alias of `--font-body`, so pointing the site at a different family is one edit.

Use `--color-ground` for the page and `--color-raised` for anything that should
lift off it — on a warm paper ground a white card needs the distinction.

## Moving away from the original

The layout geometry is still inherited, but the surface is not:

| | was | now |
| --- | --- | --- |
| Typeface | Instrument Serif + DM Sans | **Inter** throughout, 640 for headings |
| Ground | pure white | warm paper `#faf9f7` |
| Accent | orange `#e94e00` | teal `#0e7c66` (mint `#45c9a6` on dark) |
| Column rules | solid hairlines | dotted, matching the case study ground |
| Hero | flat, portrait stacked above | dot grid, two columns: copy left, portrait right |
| Portrait | 10px radius | 3px, ringed and lifted |
| Brand chips | white pill, coloured border | tinted, with real company and tool logos |
| Primary button | ink | accent |
| LinkedIn cards | 8px, grey media, LinkedIn blue | 14px, accent-washed media, accent dots |

Inter runs loose at display sizes, so the hero is tracked to `-0.032em` and the
scale pulled back a step (hero `clamp(2.5rem, 5.6vw, 4.25rem)`, sections
`clamp(1.625rem, 3.1vw, 2.25rem)`) — a neutral grotesque carries less at the same
size than a display serif does.

Still recognisably inherited: the 720px measure, the career rail, the ask pill
straddling the section rule, and the hero composition.

## Case study page

`digilawyer.html` + `case-study.css` + `digilawyer.js`. The layout system comes
from the Vivek Purty JioCRM screenshots; the structure is bridged, not copied,
and every word of the content is Nitansh's own DigiLawyer work:

- **From the screenshots** — the section order and numbering, the filled-card
  language (ink / yellow / cream / paper), the bento blocking of every grid, the
  `— 0N · LABEL —` eyebrows, one yellow-ringed card per group, and the right-edge
  section rail.
- **From this site** — the Inter type system, the accent colour on links, the
  existing header and footer (not the reference's floating pill nav), and the same
  scroll-reveal animation the home page uses.
- Highlighted words in headings use the home page's yellow **band** rather than the
  reference's yellow text. Yellow type on cream sits near 1.4:1; the band keeps the
  colour just as loud while the words stay ink, and it reuses the home page's
  `.highlight` so the two pages share the device.

Sections: hero + meta grid, then 01 Project context, 02 Problem, 03 Users,
04 Pain points, 05 Design goals, 06 Solution, 07 Components, 08 Decisions,
09 Process, 10 Outcomes, 11 Reflection.

Re-skin from the `--cs-*` block at the top of `case-study.css`. The page is
1200px wide, and two rules there widen the header and footer to match — delete
them to keep those at the home page's 720px.

Content comes from `DigiLawyer_Claude_Code/digilawyer-case-study/CASE_STUDY.md`,
with the six screenshots from that folder. The reference's own JioCRM page, which
this template was reverse-engineered from, was deleted on 2026-09-27: it carried
another company's case study under Nitansh's name and byline.

## Interactions

Ported from the reference, with its own numbers where I could read them out of
the site's bundle. Each lives in its own IIFE in `script.js`, so any one can be
deleted on its own.

| Interaction | Behaviour |
| --- | --- |
| **Grid energy** | A 1px accent spark every 0.85–2.25s, travelling a column rule or a section rule. Length 14–56px, duration scaled 1.7–7.3s, 60% vertical. Pauses when the tab is hidden or a dialog is open. |
| **Scroll reveal** | Content rises 48px and fades in on entry, staggered `min(110 × n, 330)`ms, 1100ms `cubic-bezier(.16,.75,.25,1)`. Career blocks animate their children individually. |
| **Cursor preview** | A 320×213 card trails the pointer over a project card, flipping to the left when it would overflow. Keyboard focus anchors it beside the card instead. Off below 760px and on touch. |
| **Card magnetism** | Card contents drift toward the cursor: `±4px` horizontally (×0.025), `±3px` vertically (×0.07), eased over 520ms. |
| **Brand chips** | Pills pull toward the pointer (`±5px`/`±4px`, ×0.22) with a spotlight gradient tracking across them, plus a sheen sweep every 16.4s. |
| **Brand tooltips** | Role timeline above the chip, arrow tracking the chip centre, clamped 16px from either edge. Opens on hover and focus, closes on leave, Escape, scroll or resize. |
| **Docked ask pill** | Appears once the inline launcher passes above the header, retracts again at the footer. |
| **Ask sheet** | A `<dialog>` sheet with a blurred backdrop, starter chips and a composer. |
| **GitHub calendar** | Every day is a button. Arrow keys walk the grid (±7 horizontally, ±1 vertically) with roving tabindex, and selection is announced in a live region. |
| **Inertial scroll** | The wheel drives a target the page eases toward (`1 - e^(-dt/0.105)`). Skipped inside anything with its own scrollbar and while a dialog is open. |

All of it is gated behind `prefers-reduced-motion`, and the pointer-driven parts
additionally require a fine pointer.

### Deliberately not ported

- **Agent mode** — the reference opens a full terminal emulator with per-model
  theming. The nav button is present but only toggles `aria-pressed`.
- **Answering service** — the ask sheet is the interaction only. It echoes the
  question and says so; point it at an API and render the reply in `.ask-reply`.
- **View transitions** to case-study pages — there are no case-study pages yet.
- **Easter eggs** — the sound toggle, Avengers theme and sakura tooltips are
  built around the reference author's own content.

## Changes made on top of the reference

The light-mode desktop layout is a metric-for-metric match. These were added:

1. **Dark mode** — `prefers-color-scheme` plus a header toggle that persists to
   `localStorage`. Dark lifts near-black brand-chip borders so they stay visible.
2. **Single-row mobile nav** — the reference wraps its nav onto two lines under 600px;
   here the labels collapse to icons instead, keeping the header one row down to 320px.
3. **Readable body text on small screens** — the reference floors its intro copy at
   13.3px; this floors at 15px below 600px. Desktop is unchanged at 14.6px.
4. **Scrollable contribution graph** — cells stay at least 10px and the graph scrolls
   sideways on narrow screens rather than collapsing to 4.6px squares.
5. **Focus and motion** — `:focus-visible` rings on every interactive element, plus a
   full `prefers-reduced-motion` block.

## Image placeholders on the case study

Six slots sit across `digilawyer.html`, each stating what belongs in it and
why. They are visible while `<body>` carries `data-slots="show"`.

| Section | What the slot is for |
| --- | --- |
| 01 Context | The old service page at full length, as evidence for "articles" |
| 04 Pain points | PostHog heatmap or a session-recording still |
| 06 Solution | The redesigned hero, cropped tight to the entry point |
| 07 Components | The Figma master component set with variants visible |
| 09 Process | The handoff: specs, or the Figma file structure |
| 10 Outcomes | The GA4 report the figures come from, path and dates legible |

**To fill one**, replace the `<div class="cs-slot-frame">…</div>` with an
`<img>` and edit the `<figcaption>` that is already written under it:

```html
<figure class="cs-shot cs-shot--wide" data-zoom>
  <img src="assets/digilawyer/posthog.webp" alt="…" loading="lazy"
       decoding="async" width="1200" height="700" />
  <figcaption>Where the old form lost people. Recording evidence, not a design mock.</figcaption>
</figure>
```

Swapping the class from `cs-slot` to `cs-shot` picks up the existing image
frame, and adding `data-zoom` wires it into the lightbox alongside the six
images already there.

**To hide every unfilled slot**, delete `data-slots="show"` from the `<body>`
tag. One attribute, all six gone, so the page cannot ship with placeholders
showing by accident.

## The live-site link

The closing card carries two actions: **See it live** and **Get in touch**.

No URL for the live challan page exists in the handoff or the case-study
notes, so the link ships disabled rather than pointing at a guessed domain.
`digilawyer.js` checks the href on load:

- a real `http(s)` URL — the button renders and opens in a new tab
- anything else — the button is replaced by a marked note, which the same
  `data-slots` switch hides along with the image placeholders

**To enable it**, replace `SET_LIVE_URL` in `digilawyer.html` with the
address. Nothing else needs changing.
