// Emails Becca when an organizer sends something, so she doesn't have to
// check To review. One short plain-text email per submission, to her own
// address (the NOTIFY_TO secret), through Cloudflare's send_email binding
// (NOTIFY_EMAIL in wrangler.jsonc). It can only reach verified Email Routing
// addresses.
//
// Contact rule: the organizer's name and role may appear (it's Becca's own
// inbox), never their email address. Becca sees that in /admin.
import type { Kind } from "./submissions";

export const ALERT_FROM = { email: "alerts@newtonova.org", name: "new to nova" };
const ADMIN_REVIEW = "https://newtonova.org/admin/review/";
const NOTE_MAX = 300;

export type AlertInput = {
  kind: Kind;
  submissionId: string;
  groupName: string;
  via: "invite" | "public";
  // The organizer as they filled it in. The email field is ignored on purpose.
  who: { name: string; role: string; email?: string };
  note: string;
  staging: boolean;
};

const subjects: Record<Kind, string> = {
  confirm: "Looks good",
  change: "Change to",
  remove: "Take off",
  new: "New group:",
};

export function alertEmail(a: AlertInput): { subject: string; text: string } {
  const lead = a.kind === "confirm" || a.kind === "remove" ? `${subjects[a.kind]}: ${a.groupName}` : `${subjects[a.kind]} ${a.groupName}`;
  const subject = `${a.staging ? "[staging] " : ""}${lead}`;

  const sender = a.who.role ? `${a.who.name} (${a.who.role})` : a.who.name;
  const note = a.note.length > NOTE_MAX ? `${a.note.slice(0, NOTE_MAX).trimEnd()}…` : a.note;
  const lines = [
    lead,
    "",
    `Sent by: ${sender}, ${a.via === "invite" ? "using your personal link" : "on the public page"}`,
    ...(note ? ["", "Their note:", note] : []),
    "",
    `Review it: ${ADMIN_REVIEW}${a.submissionId}`,
    ...(a.staging ? ["", "(Sent from the staging site. Admin doesn't open there, so this link won't find it.)"] : []),
  ];
  return { subject, text: lines.join("\n") + "\n" };
}

type Sender = { send(message: { from: { email: string; name: string }; to: string; subject: string; text: string }): Promise<unknown> };

// Sends the alert. Never throws: a failed email must not stop the organizer's
// thanks, and the submission is already waiting in To review.
export async function sendAlert(binding: Sender | undefined, to: string | undefined, a: AlertInput): Promise<void> {
  if (!binding || !to) return;
  try {
    await binding.send({ from: ALERT_FROM, to, ...alertEmail(a) });
  } catch (e) {
    console.error("notify: couldn't send the alert email", e);
  }
}
