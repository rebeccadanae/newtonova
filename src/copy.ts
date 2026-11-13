// All site copy lives here. Everything is placeholder until rewritten.

// "Your group on newtonova" Tally form: claim, update, suggest or remove a group.
export const TALLY_URL = "https://tally.so/r/RWK9Pd";

export const copy = {
  siteTitle: "new to nova",
  metaDescription:
    "A free directory of Northern Virginia groups that welcome new people.",

  nav: {
    label: "Main",
    groups: "Groups",
    events: "Events",
    about: "About",
    email: "Stay in the loop",
    menu: "Menu",
  },

  hero: {
    // The highlighted words get a white marker stripe.
    headline: "New to Northern Virginia?",
    headlineHighlight: "Find your people",
    searchLabel: "Search the board",
    searchPlaceholder: "Try pottery, hiking, choir",
  },

  // Becca's note under the homepage headline (her words).
  note: {
    photoAlt: "Becca Portman",
    hello: "Hi, I'm Becca!",
    body: "I wasn't sure how to find community when I first moved to NoVA, but I've discovered so many great groups along the way! I made this page to make it easier for you to get started.",
  },

  // Homepage "Coming up" sheet: the next few events from Live groups.
  coming: {
    heading: "Coming up",
    more: "All events",
  },

  // Homepage "Where are you headed?" route groups (data in src/routes.ts).
  routes: {
    heading: "Where are you headed?",
    all: "All of NoVA",
    note: "Numbers are how many groups. Statewide and national groups count everywhere.",
    anywhere: "Lilac: statewide, national, or in lots of places.",
    showTowns: "Towns",
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
    // "loop" gets the white marker stripe.
    heading: "Stay in the",
    headingHighlight: "loop",
    intro:
      "new to nova is just getting started. Leave your email and I'll let you know what's coming. Telling me what you're looking for, and how you found the site, helps me decide which groups to add first. Both are optional.",
    // Our own form, sent to Kit form 10076200 ("Mills form"). Answers are saved in Kit only.
    emailLabel: "Your email",
    lookingLabel: "What are you looking for?",
    lookingHint: "Optional. For example: pottery, a running group, people to try new restaurants with",
    sourceLabel: "How did you hear about the site?",
    sourceHint: "Optional",
    button: "Keep me posted",
    note: "No spam. Unsubscribe any time.",
  },

  // /join/thanks/: where Kit sends people after they sign up (set as the form's redirect in Kit).
  joinThanks: {
    title: "Thanks · new to nova",
    heading: "You're on the",
    headingHighlight: "list",
    body: "Thanks for signing up. If an email asks you to confirm, click the link in it so my emails reach you.",
    back: "Back to the groups",
  },

  filters: {
    label: "Filter by category",
    all: "Everything",
    areaLabel: "Area",
    allAreas: "All areas",
  },

  listing: {
    visit: "Visit website",
    claim: "Is this your group?",
    newTab: "(opens in a new tab)",
    empty: "Nothing on the board for that yet.",
    clear: "Clear filters",
    suggest: "Suggest a group",
    // Tear-off tabs at the bottom of each flyer: [small label, line].
    nextLabel: "Next",
    nextNone: "Nothing listed yet",
    visitTab: ["Visit", "their site"],
    claimTab: ["Yours?", "Check it"],
    total: (n: number) => `${n} ${n === 1 ? "group" : "groups"}`,
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} groups`,
  },

  // /events page
  events: {
    title: "Events · new to nova",
    metaDescription:
      "Things to do this week in Northern Virginia, with groups that welcome new people.",
    // The highlighted words get a white marker stripe, as on the homepage.
    heading: "Things to do this week, with groups that welcome",
    headingHighlight: "new people",
    subline: "Each event links to the group's own page, where the current details live.",
    filtersLabel: "Filter events",
    viewLabel: "View",
    week: "Week",
    month: "Month",
    weekend: "This weekend",
    categoryLabel: "Filter by category",
    all: "All",
    areaLabel: "Area",
    allAreas: "All areas",
    // The count says what it covers: "17 events this week", "42 events in November 2026".
    count: (n: number, scope: string) => `${n} ${n === 1 ? "event" : "events"} ${scope}`,
    scopeThisWeek: "this week",
    scopeNextWeek: "next week",
    scopeThatWeek: "that week",
    scopeThisWeekend: "this weekend",
    scopeNextWeekend: "next weekend",
    scopeMonth: (month: string) => `in ${month}`,
    showAll: "Show all events",
    thisWeek: "This week",
    nextWeek: "Next week",
    thisWeekend: "This weekend",
    nextWeekend: "Next weekend",
    prev: "Previous week",
    next: "Next week",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    more: (n: number) => `+${n} more`,
    // Screen-reader label for a day in the month grid.
    dayButton: (day: string, n: number) => `${day}, ${n} ${n === 1 ? "event" : "events"}. Show this week.`,
    addToCalendar: "Add to calendar",
    google: "Google Calendar",
    apple: "Apple Calendar",
    outlook: "Outlook",
    icsNote: "Apple Calendar and Outlook download an .ics file.",
    today: "Today",
    allDay: "All day",
    continues: "Continues",
    nothingDay: "Nothing listed yet.",
    noMatch: "Nothing matches that yet. Try another area, or look at next week.",
    nothingLeft: "Nothing else listed this week. Try next week.",
    details: "Details on their site ↗",
    newTab: "(opens in a new tab)",
    organizers: {
      heading: "Running something open to newcomers?",
      body: "Verified groups can send their events to be listed here. Free.",
      button: "Verify your listing",
      href: TALLY_URL,
    },
  },

  organizers: {
    heading: "Run a group that welcomes new people?",
    body: "Check your listing, keep it current and send me your events. I review each one by hand. Free.",
    button: "Check your listing",
    href: TALLY_URL,
  },

  // About page copy is final (Becca's own words), not placeholder.
  about: {
    title: "About · new to nova",
    metaDescription:
      "Why new to nova exists and how the list of Northern Virginia groups works.",
    photoAlt: "Becca Portman",
    // "Becca" gets the white marker stripe.
    heading: "Hi, I'm",
    headingHighlight: "Becca",
    paragraphs: [
      "I moved to the suburbs of Northern Virginia in 2022 and wasn't sure how to make friends. Finding community here has taken a lot of trial and error (and I'm still working on it!)",
      "As I've tried different hobbies and explored local groups, I've met others who felt similarly isolated. I've also connected with owners of small, community-minded businesses who had no consistent way to reach people new to the area. And I kept stumbling onto great groups and businesses I wished I'd known about sooner.",
    ],
    lastParagraph:
      "So I started writing them down. new to nova is that list: groups and businesses in Northern Virginia that welcome new people and foster community. It's a first step. At a time when it's easy to feel divided, I'm interested in the places where people still show up for each other, and in how technology can help us find them.",

    howHeading: "How the list works",
    howFree: "Free to browse.",
    // Placeholder wording for the organizers bullet, until Becca rewrites it.
    orgLead: "Run a group or business on the list?",
    orgBefore: "I add groups from public information, so some details may be out of date. Use",
    orgLink: "this form",
    orgAfter: "to update your listing and mark it as current, ask me to take it down, or suggest a group that's missing.",

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

  // /admin, seen only by Becca.
  admin: {
    title: "Admin",
    signedInAs: "Signed in as",
    viewSite: "View the site",
    notionNote:
      "Read only for now. Keep editing in Notion: every build copies Notion in, so changes made anywhere else would be overwritten until the switch.",
    groupsHeading: "Groups",
    searchLabel: "Search groups",
    searchPlaceholder: "Name, town or kind",
    searchButton: "Search",
    statusLabel: "Status",
    allStatuses: "All",
    columns: { name: "Name", status: "Status", kinds: "Kinds", towns: "Towns", verified: "Verified", updated: "Updated" },
    verifiedYes: "Yes",
    verifiedNo: "No",
    noWebsite: "No website",
    none: "None",
    empty: "No groups match.",
    clear: "Clear search",
  },
};
