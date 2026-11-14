// All site copy lives here. Everything is placeholder until rewritten.

// "Your group on newtonova" Tally form: claim, update, suggest or remove a group.
export const TALLY_URL = "https://tally.so/r/RWK9Pd";

export const copy = {
  siteTitle: "new to nova",
  // Shown only on the staging site (staging builds).
  staging: { bar: "Staging site. Changes here aren't live yet.", live: "Go to newtonova.org" },
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
      "Groups can be edited here now. Each build still copies Notion in, but a group edited here keeps this version unless it's edited in Notion afterwards, so once you've changed a group here, keep editing it here. Changes show on the site after the next rebuild.",
    groupsHeading: "Groups",
    newGroup: "New group",
    saved: (name: string) => `Saved ${name}. It shows on the site after the next rebuild.`,
    website: "Website",
    // Edit and new group pages
    newHeading: "New group",
    editHeading: "Edit group",
    notFound: "No group with that id.",
    backToGroups: "← All groups",
    lastSaved: "Last saved",
    seeOnSite: "See it on the site",
    fixErrors: (n: number) => (n === 1 ? "One thing needs fixing before this can save." : `${n} things need fixing before this can save.`),
    saveFailed: "Couldn't save:",
    saveButton: "Save changes",
    addButton: "Add group",
    cancel: "Cancel",
    fields: {
      aboutLegend: "The group",
      name: "Name",
      website: "Website",
      blurb: "Blurb",
      blurbHint: "In your own words, never copied from their site.",
      kinds: "Kinds",
      whereLegend: "Where",
      towns: "Towns",
      other: "Other",
      where: "Where they meet",
      whereHint: "Address or venue, for the map later. Not shown on the site yet.",
      noFixedPlace: "No fixed place",
      detailsLegend: "Details",
      detailsHint: "Not shown on the site yet.",
      schedule: "When they meet",
      scheduleHint: "Second Tuesdays, 7pm",
      cost: "Cost",
      costHint: "Free, or $10 a session",
      ages: "Ages",
      agesHint: "All ages, or 21+",
      accessibility: "Accessibility",
      firstTime: "What to expect the first time",
      adminLegend: "Just for you",
      status: "Status",
      statusHint: "Only Live groups are on the site. Removed means they asked to come down.",
      verified: "Verified",
      foundVia: "Found via",
      eventsPage: "Events page",
      eventsPageHint: "Where to find their events.",
    },
    events: {
      heading: "Events",
      newEvent: "New event",
      saved: (name: string) => `Saved ${name}. It shows on the site after the next rebuild.`,
      searchLabel: "Search events",
      searchPlaceholder: "Event or group",
      upcoming: "Upcoming",
      past: "Past",
      empty: "No events match.",
      columns: { when: "When", name: "Event", group: "Group", towns: "Towns", status: "Status" },
      noGroup: "No group",
      allDay: "All day",
      // Edit and new event pages
      newHeading: "New event",
      notFound: "No event with that id.",
      backToEvents: "← All events",
      copy: "Copy as new event",
      seriesAdded: (n: number, name: string) => `Added ${n} ${n === 1 ? "date" : "dates"} of ${name}. They show on the site after the next rebuild.`,
      seriesChanged: (n: number, name: string) => `Saved ${n} ${n === 1 ? "date" : "dates"} of ${name}. They show on the site after the next rebuild.`,
      endingHeading: "Repeats running out",
      endingItem: (last: string) => `last date ${last}`,
      endingLink: "Add more dates",
      repeat: {
        legend: "Repeats",
        none: "Doesn't repeat",
        generic: {
          weekly: "Every week, same day",
          biweekly: "Every 2 weeks, same day",
          monthly: "Monthly, same weekday (like the 3rd Tuesday)",
          "monthly-last": "Monthly, last weekday (like the last Friday)",
        },
        until: "Repeat until",
        untilHint: (def: number, max: number) => `Leave empty for ${def} months. At most ${max} months ahead.`,
        partOf: (rule: string, n: number, first: string, last: string) =>
          `Repeats: ${rule}. ${n} ${n === 1 ? "date" : "dates"}, ${first} to ${last}.`,
        scopeLegend: "Save changes to",
        scopeThis: "This event only",
        scopeLater: (n: number) => `This and later ones in the series (${n + 1} in all)`,
        scopeHint: "Later ones keep their own dates; times, details and status follow this one.",
        extendHeading: "Add more dates",
        extendHint: (last: string) => `The latest date is ${last}. New dates copy its details.`,
        extendButton: "Add dates",
      },
      copyNote: (name: string) => `Copied from ${name}. Pick a date, then add it.`,
      saveButton: "Save changes",
      addButton: "Add event",
      fields: {
        eventLegend: "The event",
        name: "Name",
        link: "Link",
        linkHint: "Where people find details or sign up.",
        group: "Group",
        groupHint: "Its kinds and place colour come from the group.",
        noGroup: "No group",
        whenLegend: "When",
        date: "Date",
        startTime: "Start time",
        startTimeHint: "Leave empty for all day.",
        endDate: "End date",
        endDateHint: "Only if it runs over more than one day.",
        endTime: "End time",
        whereLegend: "Where",
        towns: "Towns",
        where: "Venue or address",
        whereHint: "Shown on the event and in calendar files.",
        extrasLegend: "Kind and newsletter",
        kind: "Kind",
        kindHint: "Only used when the event has no Live group.",
        noKind: "None",
        summary: "Summary",
        summaryHint: "For the newsletter only. Never shown on the site. In your own words.",
        adminLegend: "Status",
        status: "Status",
        statusHint: "Only Live events are on the site. To skip one, set it to Removed.",
      },
    },
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
