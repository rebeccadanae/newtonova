// Admin: the Organizers box on a group's page posts here.
//   action=invite  (first, email optional): saves the person if there's an email,
//                  links them, and makes sure the group has a personal link
//   action=new-link: replaces the group's link (the old one stops working)
//   action=revoke:   switches the group's link off
//   action=edit-person (person, name, email, role): fixes a typo in a linked
//                  organizer's name or email (everywhere), and their role here
//   action=remove-person (person): unlinks them from this group and its link.
//                  The person row stays; nothing is deleted.
// Then it goes back to the group's page, which shows the drafted email.
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { activeInvite, makeInvite, revokeInvite } from "../../../../organizers/invites";
import { linkPerson, readPersonEdit, savePerson } from "../../../../organizers/people";

export const prerender = false;

const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = params.id ?? "";
  const org = await env.DB.prepare("SELECT id, status FROM orgs WHERE id = ?1").bind(id).first<{ id: string; status: string }>();
  if (!org) return new Response("That group no longer exists.", { status: 404 });
  const back = (q: string) => redirect(`/admin/groups/${id}?${q}#organizers`, 303);

  const form = await request.formData();
  const action = String(form.get("action") ?? "");

  // Editing and removing work on any group, Live or not, but only on someone linked to it.
  if (action === "edit-person" || action === "remove-person") {
    const personId = String(form.get("person") ?? "");
    const linked = await env.DB.prepare("SELECT 1 FROM org_people WHERE org_id = ?1 AND person_id = ?2")
      .bind(id, personId)
      .first();
    if (!linked) return back("link=person-gone");

    if (action === "remove-person") {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM org_people WHERE org_id = ?1 AND person_id = ?2").bind(id, personId),
        env.DB.prepare("UPDATE invites SET person_id = NULL WHERE org_id = ?1 AND person_id = ?2 AND revoked_at IS NULL").bind(id, personId),
      ]);
      return back("link=person-removed");
    }

    const { values, error } = readPersonEdit(form);
    if (error) return back(`link=${error}&edit=${encodeURIComponent(personId)}`);
    const taken = await env.DB.prepare("SELECT 1 FROM people WHERE email = ?1 AND id != ?2").bind(values.email, personId).first();
    if (taken) return back(`link=email-taken&edit=${encodeURIComponent(personId)}`);
    await env.DB.batch([
      env.DB.prepare("UPDATE people SET name = ?1, email = ?2, updated_at = ?3 WHERE id = ?4")
        .bind(values.name, values.email, new Date().toISOString(), personId),
      env.DB.prepare("UPDATE org_people SET role = ?1 WHERE org_id = ?2 AND person_id = ?3").bind(values.role || null, id, personId),
    ]);
    return back("link=person-saved");
  }

  if (action === "revoke") {
    await revokeInvite(env.DB, id);
    return back("link=revoked");
  }

  // Personal links are for Live groups only.
  if (org.status !== "Live") return back("link=not-live");

  if (action === "new-link") {
    await makeInvite(env.DB, id, null);
    return back("link=new");
  }

  if (action === "invite") {
    const first = String(form.get("first") ?? "").trim().slice(0, 100);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    if (email && !looksLikeEmail(email)) return back(`first=${encodeURIComponent(first)}&link=bad-email`);

    let personId: string | null = null;
    if (email) {
      personId = await savePerson(env.DB, { name: first || email.split("@")[0], email });
      await linkPerson(env.DB, id, personId, "");
    }

    // One link per group: reuse it (so links already sent keep working), and
    // attach the person if the link doesn't have one yet.
    const code = await activeInvite(env.DB, id);
    if (code) {
      if (personId) {
        await env.DB.prepare("UPDATE invites SET person_id = ?1 WHERE code = ?2 AND person_id IS NULL").bind(personId, code).run();
      }
    } else {
      await makeInvite(env.DB, id, personId);
    }
    return back(`first=${encodeURIComponent(first)}&link=draft`);
  }

  return back("");
};
