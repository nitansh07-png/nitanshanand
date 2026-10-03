/* =========================================================================
   Answers for the Ask panel.

   This is the content layer — edit freely, no code changes needed. Each entry:
     tags     strong signals, single words or phrases. Phrases score higher.
     a        the answer. Plain text; \n starts a new paragraph.
     link     optional { href, label } rendered under the answer.

   The matcher in script.js scores a question against these and picks a winner,
   or says it does not know. It is retrieval, not generation — so it can only
   ever say things written here, which is the point.
   ========================================================================= */
window.ASK_KB = [
  {
    id: "intro",
    tags: ["who are you", "about you", "about yourself", "what do you do", "what you do", "introduce", "yourself", "who", "bio", "background", "summary", "designer", "role"],
    a: "I'm Nitansh Anand, a product designer working on design systems and enterprise UX.\n" +
       "Over 2+ years I've worked with Delhi Metro and Maxlence, and I'm currently an Associate Product Designer at BigOhTech.\n" +
       "I own the system side end to end: tokens, master components, accessibility and developer handoff.",
  },
  {
    id: "current-role",
    tags: ["bigohtech", "current role", "current job", "where do you work", "now", "present", "associate product designer", "today"],
    a: "I'm an Associate Product Designer at BigOhTech, since October 2024.\n" +
       "The work spans a reusable section library, the company website, DigiLawyer's product pages, and the AI assistant layer for Costimizer, a cloud cost dashboard.",
    link: { href: "#career", label: "See the full career section" },
  },
  {
    id: "section-library",
    tags: ["section library", "component library", "reusable", "library", "sections", "assembled", "biggest project", "proudest"],
    a: "A section library, so new sites get assembled rather than redesigned.\n" +
       "- **My part** Audited the repeat website work, defined the section taxonomy, and built the library and the specs engineering builds against.\n" +
       "- Heroes, features, testimonials, timelines and pricing blocks, each with **multiple variants**.\n" +
       "- Now powers **3 live SaaS products**.\n" +
       "- Cut launch time from **3 months to under 1 month**.\n" +
       "- **The constraint** Every new site was redesigned from scratch, so the same hero and pricing patterns were rebuilt each time at full cost.\n" +
       "- **The decision** Design the variants up front rather than per project. A section gets chosen and configured, not drawn again.\n" +
       "- **The evidence** Three products now ship from the same library, and launch fell from three months to under one.\n",
  },
  {
    id: "company-website",
    tags: ["company website", "website redesign", "conversion", "marketing site", "organic traffic", "seo"],
    a: "I designed and launched the BigOhTech company website. It delivered a 40% lift in conversion rate and 65% growth in organic traffic within three months.",
  },
  {
    id: "digilawyer",
    tags: ["digilawyer", "product detail", "listing pages", "challan", "legal", "ecommerce", "e-commerce", "filtering", "path to purchase", "service pages"],
    a: "I audited DigiLawyer's service pages, then rebuilt the challan page around the task people actually came for: checking a vehicle, not booking a consultation. The opening ask went from four fields to one.\n" +
       "That structure then became master Figma components, with equivalents built in code. Three page types assemble from them now, and product owners build pages with them too.\n" +
       "- **The constraint** The long explanations were load-bearing for search, so the content team could not simply lose them.\n" +
       "- **The decision** Ask for the vehicle number first and move the depth behind a control, rather than choosing between the visitor and the SEO strategy.\n" +
       "- **The evidence** Three page types now assemble from the same sections, and product owners build pages without a designer.\n",
    link: { href: "digilawyer.html", label: "Read the case study" },
  },
  {
    id: "four-to-one",
    tags: ["four-to-one", "four to one", "reduction", "four fields", "one field", "initial screen", "scope", "what it covers", "claim", "entry point"],
    a: "It covers the **opening screen only**. Before the redesign the entry point asked four fields, none of them the vehicle. After it, one field: the vehicle itself.\n" +
       "- Further information and resolution belong to the steps after that one, so the number is not a claim about the whole flow.\n" +
       "- The case study says that in a note beside the figure, rather than leaving it to be read as a funnel result.",
    link: { href: "digilawyer.html#decisions", label: "See the decision and its cost" },
  },
  {
    id: "wider-team",
    tags: ["wider team", "team extend", "extended", "team adoption", "adoption", "who else", "beyond my pages", "page formats", "product owners", "handover"],
    a: "The case study is explicit about the split: Nitansh owned the concept, the team extended it. Three things went beyond his own pages.\n" +
       "- The approach supported **three page formats**: listing, product detail, and use-case pages.\n" +
       "- The Figma sections had corresponding components built by developers.\n" +
       "- Product owners used the shared sections to structure further pages, working with the content and SEO teams.",
    link: { href: "digilawyer.html#outcomes", label: "See the outcomes" },
  },
  {
    id: "costimizer",
    tags: ["costimizer", "ai assistant", "cloud cost", "dashboard", "ai layer", "assistant", "usability sessions"],
    a: "I designed and tested the AI assistant layer for Costimizer, a cloud cost dashboard.\n" +
       "35+ user sessions showed a 4-minute average session length and a 58-second time to first action.\n" +
       "- **The constraint** The brief arrived before the product did. Nobody could yet say what the model would reliably do.\n" +
       "- **The decision** Design the empty state and the failure state first, so the interface stayed honest whatever the model returned.\n" +
       "- **The evidence** Across 35+ sessions, first useful action landed at 58 seconds.\n",
    link: {
      href: "https://medium.com/@nitansh07/i-was-a-fresher-designer-asked-to-build-an-ai-nobody-fully-understood-heres-what-happened-155939ac0f88",
      label: "Read the case study on Medium",
    },
  },
  {
    id: "maxlence",
    tags: ["maxlence", "internship", "intern", "gurugram", "ux design intern", "user interviews", "personas"],
    a: "I was a UX Design Intern at Maxlence Consulting in Gurugram, January to July 2024.\n" +
       "I redesigned the marketing website through iterative user testing, lifting conversion rate by 33%, and ran 25+ user interviews that turned into personas and a clearer, more accessible interface.",
  },
  {
    id: "dmrc",
    tags: ["delhi metro", "dmrc", "metro", "system design intern", "passenger", "feedback system", "public sector", "transit"],
    a: "I was a System Design Intern at Delhi Metro Rail Corporation, September to November 2023.\n" +
       "I designed a passenger feedback system for station and in-transit use, which DMRC approved for full production rollout. I worked with Metro officials through the whole design-to-handoff cycle, shaping the system around operational constraints so it could be sustained after launch.\n" +
       "- **The constraint** The only channel was a once-a-year survey buried on a government site, in two languages, in a city that speaks dozens.\n" +
       "- **The decision** Move feedback into the journey and make it a conversation: voice or text, categorised up front so every answer arrives routable.\n" +
       "- **The evidence** DMRC approved it for full production rollout.\n",
    link: {
      href: "https://metrodost-case-study.vercel.app/",
      label: "Read the MetroDost case study",
    },
  },
  {
    id: "process",
    tags: ["process", "design process", "how do you work", "how you work", "approach", "method", "methodology", "workflow", "steps", "how do you start"],
    a: "Five moves, in order, and the first one is usually the surprise.\n" +
       "- **Diagnose the gap.** Friction is rarely where the brief says it is.\n" +
       "- **Define the outcome.** Tie each decision to something measurable.\n" +
       "- **Partner early**, so feasibility shapes the design instead of arriving after it.\n" +
       "- **Build the system**, not isolated screens.\n" +
       "- **Validate fast.** 35+ sessions on the Costimizer assistant said more than any round of reviews.",
    link: { href: "#process", label: "See how I build products" },
  },
  {
    id: "design-systems",
    tags: ["design system", "design systems", "tokens", "design tokens", "component", "components", "architecture", "system work", "scale"],
    a: "Design systems are the centre of what I do. I work on token architecture, master components and UI architecture for data-dense products.\n" +
       "The approach I keep coming back to: a component library isn't visual consistency, it's how a team makes decisions and ships without re-solving the same problem.",
  },
  {
    id: "accessibility",
    tags: ["accessibility", "a11y", "wcag", "contrast", "keyboard", "screen reader", "inclusive", "aa"],
    a: "I build accessibility into component specs rather than auditing it afterwards, so WCAG AA contrast and keyboard criteria arrive with the handoff.\n" +
       "State management is part of that: a component spec that doesn't define focus, disabled and error states isn't finished.",
  },
  {
    id: "research",
    tags: ["research", "user research", "usability", "testing", "interviews", "discovery", "validate", "users"],
    a: "I run user research and usability testing as part of delivery, not as a separate phase.\n" +
       "At Maxlence that meant 25+ user interviews turned into personas. At BigOhTech it meant 35+ sessions on the Costimizer assistant, which is where the 58-second time-to-first-action number came from.",
  },
  {
    id: "critique",
    tags: ["critique", "feedback", "review", "reviews", "criticism", "disagree", "disagreement", "pushback", "stakeholder", "defend", "take feedback", "design review"],
    a: "By moving the argument earlier, so there is less to defend later.\n" +
       "- I partner with engineering and founders **from the start**, so feasibility shapes the design instead of arriving as a late objection.\n" +
       "- Where it is settleable with evidence, I settle it with evidence: **35+ sessions** on the Costimizer assistant said more than any round of reviews.\n" +
       "- I take designs into the codebase myself, which changes what I put in a spec, because I know what is annoying to receive.",
    link: { href: "#process", label: "See how I build products" },
  },
  {
    id: "handoff",
    tags: ["handoff", "developer handoff", "engineers", "engineering", "collaboration", "specs", "acceptance criteria", "work with developers", "devs"],
    a: "Developer handoff is annotated specs plus acceptance criteria, not a Figma link.\n" +
       "I work closely with engineering and founders, and I take designs into the codebase myself when it helps, which changes what I put in a spec, because I know what's annoying to receive.",
  },
  {
    id: "tools",
    tags: ["tools", "stack", "software", "what do you use", "figma", "material", "angular", "adobe"],
    a: "Figma for design, Angular Material for the code it ships as.\n" +
       "- **Figma** for design systems, tokens, prototypes and specs.\n" +
       "- **Material Design 3** and **Angular Material** as the component foundation.\n" +
       "- **Claude Code** for building, and Adobe Suite where it is needed.",
  },
  {
    // "Do you know React?" used to match the word "experience" and return a
    // years-of-experience blurb. Naming the boundary is the better answer: a
    // stack mismatch stated plainly reads as confidence, not as a gap.
    id: "frameworks",
    tags: ["react", "vue", "svelte", "next", "nextjs", "tailwind", "framework", "frontend", "front end", "do you code", "javascript", "typescript", "storybook"],
    a: "Angular Material, not React.\n" +
       "- The design system I own ships as **Figma components** and as **Angular Material** code.\n" +
       "- I take designs into the codebase myself, so specs are written by someone who has had to receive them.\n" +
       "- This site is hand-built **HTML, CSS and JavaScript**, with no framework at all.",
    link: { href: "#toolkit", label: "See the full toolkit" },
  },
  {
    id: "what-went-wrong",
    tags: ["failed", "failure", "went wrong", "mistake", "regret", "differently", "lesson", "next time", "hardest", "what would you change"],
    a: "On DigiLawyer, measurement was set up after the rollout rather than before it.\n" +
       "- The reports could not isolate the redesign from everything else shipping at the same time.\n" +
       "- Next time I would define the funnel **before rollout**: consistent page paths, a recorded release date, and separate events for lookup starts, enquiries and payments.\n" +
       "- It is why that case study states what it can prove and labels the rest unverified.",
    link: { href: "digilawyer.html", label: "Read the DigiLawyer case study" },
  },
  {
    id: "ai",
    tags: ["ai", "claude", "claude code", "llm", "agentic", "automation", "shipping with ai", "vibe coding", "build"],
    a: "I use Claude Code to take designs all the way into the codebase, this site included.\n" +
       "The calendar in the Claude Code section is real usage from my own local transcripts: 4.81B tokens processed, 15.7M generated, across 34 active days and 28 sessions.",
    link: { href: "#labs", label: "See the usage calendar" },
  },
  {
    id: "education",
    tags: ["education", "degree", "university", "college", "studied", "study", "studies", "where did you study", "bachelor", "jklu", "jaipur", "b.des", "graduate"],
    a: "Bachelor of Design in Interaction Design, JK Lakshmipat University, Jaipur, 2020 to 2024.",
  },
  {
    id: "experience-length",
    tags: ["how long", "years of experience", "experience", "how many years", "senior", "level"],
    a: "2+ years across product, UI and marketing design, focused on design systems and end-to-end UX for SaaS, enterprise and e-commerce platforms.",
  },
  {
    id: "impact",
    tags: ["impact", "results", "metrics", "numbers", "outcomes", "achievements", "wins"],
    a: "The numbers I'd point at: 3 live SaaS products running on one section library, a 40% conversion lift and 65% organic traffic growth on the company site, and three DigiLawyer page formats assembled from one set of reusable sections.\n" +
       "The DMRC passenger feedback system was approved for full production rollout.",
  },
  {
    id: "contact",
    tags: ["contact", "email", "hire", "hiring", "reach", "get in touch", "available", "availability", "freelance", "work together", "resume", "cv"],
    a: "Email is best: nitansh07@gmail.com. I'm also on LinkedIn, and the resume is downloadable from the top of this page.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Email me" },
  },
  {
    id: "linkedin",
    tags: ["linkedin", "social", "posts", "writing", "profile"],
    a: "My LinkedIn is linkedin.com/in/nitansh10, which is where I post.",
    link: { href: "https://linkedin.com/in/nitansh10", label: "Open LinkedIn" },
  },
  {
    id: "this-site",
    tags: ["this site", "this website", "portfolio site", "how did you build", "built this", "made this", "code"],
    a: "This site is hand-built static HTML, CSS and JavaScript, with no framework and no build step.\n" +
       "The type is Inter throughout, the layout runs on a 720px measure, and the Claude Code section reads real usage data generated from my local transcripts.",
  },
];

/* =========================================================================
   Conversation layer.

   ASK_KB above answers questions about the work. This part answers everything
   else: hellos, small talk, questions the site cannot know, and requests that
   are not questions at all.

   Two rules for all of it. Never dead-end: say the true thing, then hand back
   a way further into the portfolio. And be warm about it. This panel is the
   first thing a visitor talks to, and a short answer can very easily read as
   a closed door. When the answer is no, the sentence after it should open
   something else.

   Each intent:
     test   a regex against the normalised question.
     a      the reply. \n starts a new paragraph.
     link   optional { href, label }.
     chips  follow-ups as { label, ask }: a short face, the real question.

   Order matters. The first test that matches wins, so put the specific
   patterns above the general ones.
   ========================================================================= */

window.ASK_INTENTS = [
  {
    id: "greeting",
    test: /^(hi|hey|hello|yo|hiya|howdy|good (morning|afternoon|evening)|namaste)\b/,
    a: "Hey, good to see you here.\nI can tell you about Nitansh's work, how he builds design systems, or how to get in touch. Where would you like to start?",
    chips: [
      { label: "What he does", ask: "What does he do?" },
      { label: "Best project", ask: "Tell me about the section library" },
      { label: "Get in touch", ask: "How do I reach him?" },
    ],
  },
  {
    id: "how-are-you",
    test: /(how are you|how'?s it going|how do you do|what'?s up|sup)\b/,
    a: "Doing well, thanks for asking.\nI only really know one subject, but I know it properly. What would you like to hear about?",
    chips: [
      { label: "What he does", ask: "What does he do?" },
      { label: "Recent work", ask: "What is he working on now?" },
    ],
  },
  {
    id: "thanks",
    test: /(thank|thanks|thx|cheers|appreciate it|helpful)\b/,
    a: "You're very welcome.\nHappy to keep going if there's anything else you'd like to see.",
    chips: [
      { label: "Best project", ask: "Tell me about the section library" },
      { label: "Working with devs", ask: "How does he work with engineers?" },
    ],
  },
  {
    id: "bye",
    test: /^(bye|goodbye|see ya|see you|later|good night|gn)\b/,
    a: "Thanks for stopping by, it was good to have you.\nIf you'd like to carry the conversation on with Nitansh himself, email is the quickest way to reach him.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Email Nitansh" },
  },
  {
    id: "bot",
    test: /(are you (a )?(bot|robot|ai|human|real|person)|is this (ai|a bot|real)|chatgpt|are you nitansh|who am i (talking|speaking) to|llm|language model)/,
    a: "Good question. I'm a small answer engine built into this site, so I'm not a language model and I'm not Nitansh himself.\nEverything I tell you is written down somewhere on this page, which is what keeps me honest. When I don't have something, I'll say so and point you somewhere useful instead.",
    chips: [
      { label: "What can I ask?", ask: "What can I ask you?" },
      { label: "About this site", ask: "How was this site built?" },
    ],
  },
  {
    id: "capability",
    test: /(what can (you|i) (do|ask)|what do you know|help me|how does this work|what are you for|options|menu)/,
    a: "Quite a lot, happily.\nAsk me about any of the projects and what they moved, how Nitansh approaches design systems, accessibility, research or engineering handoff, where he has worked, or how to get in touch.\nPlain questions work best, and I'll always point you to the part of the site that backs the answer up.",
    chips: [
      { label: "Best project", ask: "Tell me about the section library" },
      { label: "Accessibility", ask: "How does he handle accessibility?" },
      { label: "Get in touch", ask: "How do I reach him?" },
    ],
  },
  {
    id: "hire",
    test: /(hiring|available|availability|open to work|looking for (a )?(job|role|work)|can i hire|join (us|our)|opportunity|vacancy|freelance|contract|notice period)/,
    a: "Great question, and the honest answer is that I don't have sight of his calendar.\nNitansh is the right person to ask, and he's quick to reply. In the meantime I'm happy to show you the work so you know what you'd be getting.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Email Nitansh" },
    chips: [
      { label: "What he does", ask: "What does he do?" },
      { label: "The results", ask: "What results has the work had?" },
    ],
  },
  {
    id: "money",
    test: /(salary|ctc|rate|how much (do|does|would)|charge|cost|pay|compensation|budget|expected)/,
    a: "That's really one for Nitansh directly, since it depends so much on the project and the scope.\nDrop him a line and he'll happily talk it through with you.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Email Nitansh" },
    chips: [
      { label: "The results", ask: "What results has the work had?" },
      { label: "Experience", ask: "How long has he been designing?" },
    ],
  },
  {
    id: "location",
    test: /(where (are you|is he|do you) (based|live|located|from)|which city|relocat|remote|onsite|hybrid|visa|timezone)/,
    a: "The site doesn't say where he's based day to day, and I'd rather not give you the wrong answer.\nWhat I can tell you is where the work happened: the Delhi Metro project was in Delhi, Maxlence was in Gurugram, and he studied in Jaipur.",
    link: { href: "#career", label: "See the career timeline" },
    chips: [
      { label: "Delhi Metro", ask: "What did he do at Delhi Metro?" },
      { label: "Get in touch", ask: "How do I reach him?" },
    ],
  },
  {
    id: "why-hire",
    test: /(why (should|would) (we|i|anyone) (hire|pick|choose)|what makes (him|you) different|why (him|you)|strength|stand out|unique)/,
    a: "Happy to make the case.\nThe same pattern runs through all of it: find the thing being rebuilt over and over, give it a name, and turn it into a system the rest of the team can use.\nThat's what took a new product site from three months to under one, and it's why a single library now runs three live products.",
    link: { href: "#work", label: "See the work" },
    chips: [
      { label: "Section library", ask: "Tell me about the section library" },
      { label: "AI assistant", ask: "What did the AI assistant do?" },
    ],
  },
  {
    id: "weakness",
    test: /(weakness|worst|failure|failed|mistake|struggle|bad at|criticism)/,
    a: "That's a fair question and a good one to ask.\nIt isn't something the site covers though, and I don't want to put words in his mouth. It's worth putting to him directly, he tends to answer it properly.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Ask him yourself" },
    chips: [
      { label: "How he decides", ask: "How does he research?" },
      { label: "Best project", ask: "Tell me about the section library" },
    ],
  },
  {
    id: "personal",
    test: /(how old|your age|married|girlfriend|boyfriend|wife|husband|relationship|religion|caste|politic|family|dating|height|weight)/,
    a: "That's a little more personal than this site goes, so I'll leave that one for him.\nI'd love to tell you about the work though, if you're curious.",
    chips: [
      { label: "What he does", ask: "What does he do?" },
      { label: "Best project", ask: "Tell me about the section library" },
    ],
  },
  {
    id: "task-request",
    test: /(write (me|my)|do my|make me a|build me a|generate|code this|solve|translate|summarise this|summarize this|essay|homework|recipe|joke)/,
    a: "I'd genuinely like to help, but I'm just the part of this site that explains Nitansh's work, so that one is outside what I can do.\nAnything about the design work though, and I'm all yours.",
    chips: [
      { label: "What can I ask?", ask: "What can I ask you?" },
      { label: "Best project", ask: "Tell me about the section library" },
    ],
  },
  {
    id: "compliment",
    test: /(nice|cool|love|great|awesome|beautiful|impressive|well done|good (site|work|job)|sick|clean)\b/,
    a: "Thank you, that's lovely to hear. I'll pass it on.\nHe built this one himself, custom cursor and all.",
    link: { href: "agent-mode.html", label: "See the playground" },
    chips: [
      { label: "About this site", ask: "How was this site built?" },
      { label: "Best project", ask: "Tell me about the section library" },
    ],
  },
  {
    id: "criticism",
    test: /(sucks|terrible|ugly|hate|awful|boring|worst site|bad design)/,
    a: "Thanks for being straight with me, that's genuinely useful.\nNitansh would rather hear it firsthand than not at all, so do send it his way.",
    link: { href: "mailto:nitansh07@gmail.com", label: "Send the feedback" },
    chips: [
      { label: "Best project", ask: "Tell me about the section library" },
      { label: "How he works", ask: "How does he work with engineers?" },
    ],
  },
];

/* =========================================================================
   Related topics.

   After an answer lands, these become the follow-up buttons under it, so the
   conversation always has somewhere to go next. Keys are ASK_KB ids.
   ========================================================================= */

window.ASK_RELATED = {
  intro:             ["current-role", "design-systems", "impact"],
  "current-role":    ["section-library", "costimizer", "company-website"],
  "section-library": ["design-systems", "handoff", "impact"],
  "company-website": ["impact", "research", "current-role"],
  digilawyer:        ["company-website", "research"],
  costimizer:        ["ai", "research", "impact"],
  maxlence:          ["research", "impact", "experience-length"],
  dmrc:              ["research", "accessibility", "impact"],
  "design-systems":  ["section-library", "handoff", "accessibility"],
  accessibility:     ["design-systems", "handoff", "dmrc"],
  research:          ["costimizer", "dmrc", "impact"],
  handoff:           ["design-systems", "tools", "section-library"],
  tools:             ["design-systems", "handoff", "ai"],
  ai:                ["costimizer", "this-site", "tools"],
  education:         ["dmrc", "experience-length", "intro"],
  "experience-length": ["current-role", "impact", "intro"],
  impact:            ["section-library", "company-website", "costimizer"],
  contact:           ["linkedin", "intro"],
  linkedin:          ["contact", "this-site"],
  "this-site":       ["ai", "tools", "contact"],
};

/* The short face a follow-up button wears. Two or three words, because a
   whole sentence in a pill reads as a paragraph someone forgot to finish. */
window.ASK_LABELS = {
  intro:             "What he does",
  "current-role":    "Right now",
  "section-library": "Section library",
  "company-website": "Company website",
  digilawyer:        "DigiLawyer",
  costimizer:        "AI assistant",
  maxlence:          "Maxlence",
  dmrc:              "Delhi Metro",
  "design-systems":  "Design systems",
  accessibility:     "Accessibility",
  research:          "Research",
  handoff:           "Working with devs",
  tools:             "Tools",
  ai:                "How he uses AI",
  education:         "Education",
  "experience-length": "Experience",
  impact:            "The results",
  contact:           "Get in touch",
  linkedin:          "LinkedIn",
  "this-site":       "About this site",
};

/* And the question it actually asks when pressed. */
window.ASK_PROMPTS = {
  intro:             "What does he do?",
  "current-role":    "What is he working on now?",
  "section-library": "Tell me about the section library",
  "company-website": "What happened with the company website?",
  digilawyer:        "What was DigiLawyer?",
  costimizer:        "What did the AI assistant do?",
  maxlence:          "What did he do at Maxlence?",
  dmrc:              "What did he do at Delhi Metro?",
  "design-systems":  "How does he think about design systems?",
  accessibility:     "How does he handle accessibility?",
  research:          "How does he research?",
  handoff:           "How does he work with engineers?",
  tools:             "What tools does he use?",
  ai:                "How does he use AI?",
  education:         "What did he study?",
  "experience-length": "How long has he been designing?",
  impact:            "What results has the work had?",
  contact:           "How do I reach him?",
  linkedin:          "Is he on LinkedIn?",
  "this-site":       "How was this site built?",
};
