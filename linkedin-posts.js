/* =========================================================================
   LinkedIn posts.

   LinkedIn has no public API for reading a personal feed — the member-social
   scope is partner-gated and needs an authenticated backend, so a static page
   cannot pull your posts live. This file is the practical substitute: paste a
   post here when you publish one and the section re-renders itself.

   To add a post: copy a block, change the fields, put the newest first.
     date        ISO date, used for the label
     body        post text. \n starts a new paragraph. Long ones get a "more".
     url         permalink to the post on LinkedIn
     reactions   / comments / impressions — numbers, or null to hide the row
     media       optional image path, e.g. "assets/posts/orchestra.jpg"

   Tip: a post's exact date is encoded in the share id at the end of its
   permalink — `new Date(Number(BigInt(id) >> 22n))`. The "6mo" label LinkedIn
   shows is rounded, so prefer the decoded value.

   If you later deploy somewhere with scheduled functions (Vercel, Netlify,
   a GitHub Action), the same shape can be generated on a cron instead.
   ========================================================================= */
window.LINKEDIN_POSTS = {
  profile: "https://linkedin.com/in/nitansh10",
  name: "Nitansh Anand",
  headline: "Product Designer · Design Systems & Enterprise UX · BigOhTech",

  posts: [
    {
      // Date decoded from the share id, not the rounded "6mo" label.
      date: "2026-03-11",
      body:
        '"Design an AI tool," they said.\n' +
        '"What does it do?" I asked.\n' +
        '"We’re still figuring that out," they replied. 😅\n' +
        'As a fresher designer, I was thrown into the deep end of a project nobody fully understood. I quickly learned that when the tech is a "black box," the designer’s job isn’t just to make it pretty, it’s to make it make sense.\n' +
        "I just shared the story of how I navigated the chaos, the ambiguity, and the eventual breakthroughs.",
      url: "https://www.linkedin.com/posts/nitansh10_i-was-a-fresher-designer-asked-to-build-an-share-7437543440848154624-pZQZ/",
      // Left null on purpose: the logged-out post page interleaves counts from
      // several posts, so there was no number here worth trusting. Fill these
      // in from your own LinkedIn analytics and the stats row appears.
      reactions: null,
      comments: null,
      impressions: null,
      // The article card the post shares, mirrored locally at the slot's own
      // 2x size. LinkedIn's CDN urls carry an expiry signature, so they are
      // not safe to hotlink.
      media: "assets/posts/ai-copilot.webp",
    },
    {
      date: "2023-05-30",
      body: "Hey everyone! Go check out my latest project on Behance & let me know what you think of it. Cheers!",
      url: "https://www.linkedin.com/posts/nitansh10_hey-everyone-go-check-out-my-latest-project-share-7069370697961082880-n06P/",
      reactions: null,
      comments: null,
      impressions: null,
      media: "assets/posts/behance-project.webp",
    },

    /* Two more posts you sent are behind LinkedIn's sign-in wall, so their
       text and images could not be read. Paste the body in and they are ready:

    {
      date: "2024-12-19",
      body: "",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7275484383350796288/",
      reactions: null, comments: null, impressions: null, media: null,
    },
    {
      date: "2024-05-20",
      body: "",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7198356312135516161/",
      reactions: null, comments: null, impressions: null, media: null,
    },
    */
  ],
};
