// The organizer steps, shared by the personal link (/yours/<code>) and the
// public path (/yours/). Each page works out who is sending and which group,
// then hands the request here. Nothing here changes a group: every submission
// waits for Becca in /admin.
import { fromRow, readDetails, type Errors, type GroupDetails, type OrgRow } from "../admin/groups";
import { readWho, savePerson, linkPerson, type Who, type WhoErrors } from "./people";
import { createSubmission, lastPending, findSubmission, type Kind } from "./submissions";
import { readAnswers, isEmpty, saveAnswers, answersFor } from "./answers";
import { isUpcoming, whenShort } from "../event-dates";
import type { FlyerOrg, NextEvent } from "../flyer";

export const STEPS = ["check", "confirm", "fix", "remove", "new", "about", "thanks"] as const;
export type Step = (typeof STEPS)[number];

// "new" (add a group) and "confirm" (who's saying Looks good) are public-path
// steps; a personal link already knows who is sending, so it confirms from check.
export function readStep(url: URL, isPublic: boolean): Step {
  const asked = url.searchParams.get("step") ?? "";
  if ((asked === "new" || asked === "confirm") && !isPublic) return "check";
  return (STEPS as readonly string[]).includes(asked) ? (asked as Step) : "check";
}

// Where each step lives. The personal link keeps its code in the path; the
// public path carries the group in ?org=.
export type Links = {
  step: (step: Step) => string;
  after: (step: "about" | "thanks", submissionId: string) => string;
};

export type FlowSetup = {
  db: D1Database;
  request: Request;
  url: URL;
  step: Step;
  // The Live group (null for a new group, or when the link or group is gone).
  row: OrgRow | null;
  via: "invite" | "public";
  inviteCode: string | null;
  knownName: string;
  knownEmail: string | null;
  links: Links;
  // Public path only: checks the Turnstile token on each send.
  checkHuman?: (form: FormData) => Promise<boolean>;
};

export type Sent = { id: string; name: string; kind: Kind; orgId: string | null; personId: string };

export type FlowState = {
  step: Step;
  org: FlyerOrg | null;
  who: Who;
  whoErrors: WhoErrors;
  details: GroupDetails | null;
  detailErrors: Errors;
  note: string;
  notHuman: boolean;
  next: NextEvent[];
  pendingDate: string;
  sent: Sent | null;
  saidYesToChat: boolean;
};

const blankDetails = (): GroupDetails => ({
  name: "", website: "", blurb: "", category: [], area: [], schedule: "", cost: "",
  accessibility: "", ages: "", first_time: "", where_text: "", no_fixed_place: false,
});

// Returns a redirect after a successful POST, otherwise what the page shows.
export async function runFlow(s: FlowSetup): Promise<{ redirect: string } | FlowState> {
  const { db, request, step, row } = s;
  const current: GroupDetails | null = row ? fromRow(row) : null;
  const org: FlyerOrg | null = row && current
    ? { id: row.id, name: current.name, website: current.website, category: current.category, area: current.area, blurb: current.blurb }
    : null;

  const state: FlowState = {
    step,
    org,
    who: { name: s.knownName, email: "", role: "" },
    whoErrors: {},
    // A new group can arrive with its name from the list's search (?name=).
    details: step === "new" ? { ...blankDetails(), name: (s.url.searchParams.get("name") ?? "").trim().slice(0, 200) } : current,
    detailErrors: {},
    note: "",
    notHuman: false,
    next: [],
    pendingDate: "",
    sent: null,
    saidYesToChat: false,
  };

  const sending = step === "check" || step === "confirm" || step === "fix" || step === "remove" || step === "new";
  if (sending && request.method === "POST" && (row || step === "new")) {
    const form = await request.formData();
    const emailKnown = Boolean(s.knownEmail);
    const read = readWho(form, { emailKnown });
    state.who = read.values;
    state.whoErrors = read.errors;
    state.note = String(form.get("note") ?? "").trim().slice(0, 2000);

    let kind: Kind = "confirm";
    let proposed: GroupDetails | null = null;
    if (step === "fix" || step === "new") {
      const d = readDetails(form, current ? { category: current.category, area: current.area } : undefined);
      state.details = d.values;
      state.detailErrors = d.errors;
      kind = step === "fix" ? "change" : "new";
      proposed = d.values;
    } else if (step === "remove") {
      kind = "remove";
    }

    const valid = Object.keys(state.whoErrors).length === 0 && Object.keys(state.detailErrors).length === 0;
    if (valid && s.checkHuman && !(await s.checkHuman(form))) state.notHuman = true;

    if (valid && !state.notHuman) {
      const personId = await savePerson(db, { name: state.who.name, email: state.who.email || s.knownEmail! });
      if (row) await linkPerson(db, row.id, personId, state.who.role);
      const id = await createSubmission(db, {
        kind,
        orgId: row?.id ?? null,
        personId,
        via: s.via,
        inviteCode: s.inviteCode,
        proposed,
        note: state.note,
      });
      // Someone taking their group off skips the "help me help" questions.
      return { redirect: s.links.after(kind === "remove" ? "thanks" : "about", id) };
    }
    return state;
  }

  // The flyer's next events, and the "coming back" note (personal link only:
  // on the public path the visitor may not be the one who sent it).
  if (row && step === "check") {
    const events = await db
      .prepare(`SELECT name, start, "end", all_day, link FROM events WHERE org_id = ?1 AND status = 'Live' ORDER BY start LIMIT 20`)
      .bind(row.id)
      .all<{ name: string; start: string; end: string | null; all_day: number; link: string | null }>();
    state.next = events.results
      .map((e) => ({ name: e.name, start: e.start, end: e.end, allDay: Boolean(e.all_day), link: e.link ?? "" }))
      .filter((e) => isUpcoming(e))
      .slice(0, 3)
      .map((e) => ({ ...e, when: whenShort(e) }));

    if (s.via === "invite") {
      const pending = await lastPending(db, row.id);
      state.pendingDate = pending
        ? new Date(pending.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "America/New_York" })
        : "";
    }
  }

  // About and thanks: what was sent and by whom, read back from the submission
  // (it must belong to this link, or to the public path).
  if (step === "about" || step === "thanks") {
    const sub = await findSubmission(db, s.url.searchParams.get("s") ?? "", s.inviteCode);
    if (sub) {
      const p = await db.prepare("SELECT name FROM people WHERE id = ?1").bind(sub.person_id).first<{ name: string }>();
      state.sent = { id: sub.id, name: p?.name ?? "", kind: sub.kind, orgId: sub.org_id, personId: sub.person_id };
    }
  }

  // About: the answers are optional; an untouched form saves nothing.
  if (step === "about" && request.method === "POST") {
    const sent = state.sent;
    if (!sent) return { redirect: s.links.step("check") };
    const answers = readAnswers(await request.formData());
    if (!isEmpty(answers)) {
      await saveAnswers(db, answers, { orgId: sent.orgId, personId: sent.personId, submissionId: sent.id });
    }
    return { redirect: s.links.after("thanks", sent.id) };
  }

  if (step === "thanks" && state.sent) {
    state.saidYesToChat = (await answersFor(db, state.sent.id))?.chat === "yes";
  }
  return state;
}
