// All site copy lives here. Everything is placeholder until rewritten.

// "Your group on newtonova" Tally form: claim, update, suggest or remove a group.
export const TALLY_URL = "https://tally.so/r/RWK9Pd";

export const copy = {
  siteTitle: "new to nova",
  metaDescription:
    "A free directory of Northern Virginia groups that welcome new people.",

  nav: {
    email: "Stay in the loop",
    organizers: "For organizers",
    about: "About",
  },

  hero: {
    headline: "New to Northern Virginia?",
    headlineItalic: "Find your people.",
    searchLabel: "Search community groups and organizations",
    searchPlaceholder: "Try pottery, hiking, Reston",
  },

  // Homepage box: a pitch that links to the /join page, where the Kit form lives.
  signup: {
    heading: "Stay in the loop",
    body: "new to nova is just getting started. Leave your email and I'll let you know what's coming.",
    button: "Keep me posted",
    href: "/join/",
  },

  // /join page. The form itself is Kit's embed (see src/pages/join.astro).
  join: {
    title: "Stay in the loop · new to nova",
    metaDescription:
      "Get an email from new to nova, and tell us what kind of groups you're looking for in Northern Virginia.",
    heading: "Stay in the",
    headingItalic: "loop.",
    intro:
      "new to nova is just getting started. Leave your email and I'll let you know what's coming. Telling me what you're looking for, and how you found the site, helps me decide which groups to add first. Both are optional.",
  },

  filters: {
    label: "Filter by category",
    all: "All",
    areaLabel: "Area",
    allAreas: "All areas",
  },

  listing: {
    visit: "Visit website",
    claim: "Is this your group?",
    newTab: "(opens in a new tab)",
    empty: "No groups match that yet. Try another word or category.",
    total: (n: number) => `${n} ${n === 1 ? "group" : "groups"}`,
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} groups`,
  },

  organizers: {
    heading: "Run one of these groups?",
    body: "Verify your listing to fix the details and show it's current. Free.",
    button: "Verify your listing",
    href: TALLY_URL,
  },

  // About page copy is final (Becca's own words), not placeholder.
  about: {
    title: "About · new to nova",
    metaDescription:
      "Why new to nova exists and how the list of Northern Virginia groups works.",
    photoAlt: "Becca Portman",
    heading: "Hi, I'm",
    headingItalic: "Becca.",
    paragraphs: [
      "I moved to the suburbs of Northern Virginia in 2022 and wasn't sure how to make friends. Finding community here has taken a lot of trial and error (and I'm still working on it!)",
      "As I've tried different hobbies and explored local groups, I've met others who felt similarly isolated. I've also connected with owners of small, community-minded businesses who had no consistent way to reach people new to the area. And I kept stumbling onto great groups and businesses I wished I'd known about sooner.",
    ],
    // Third paragraph is split around "new to nova" so "nova" can be italic.
    lastParagraphBefore: "So I started writing them down.",
    lastParagraphAfter:
      "is that list: groups and businesses in Northern Virginia that welcome new people and foster community. It's a first step. At a time when it's easy to feel divided, I'm interested in the places where people still show up for each other, and in how technology can help us find them.",

    howHeading: "How the list works",
    howFree: "Free to browse.",
    howVerifyBefore: "I add groups from public information. If you run one, you can",
    howVerifyLink: "verify your listing",
    howVerifyAfter: "to fix the details and show it's current.",
    howSuggestBefore: "Know a group that belongs here?",
    howSuggestLink: "Suggest it",
    howSuggestAfter: ".",

    hiHeading: "Say hi",
    hiIntro: "I'd love to hear from you if you:",
    hiReasons: [
      "know a group that should be on the list",
      "run a group or business and want to reach people new to the area",
      "want to help build community in Northern Virginia",
      "are new here and just want to say hi",
    ],
    email: "hello@newtonova.org",
    emailButton: "Email hello@newtonova.org",
    linkedin: "Find me on LinkedIn",
    linkedinHref: "https://www.linkedin.com/in/beccaportman/",
  },

  footer: {
    site: "newtonova.org",
    suggest: "Suggest a group",
    suggestHref: TALLY_URL,
  },
};
