// Cloudflare Turnstile: the spam check on the public organizer forms (/yours/).
// The widget puts a token in the form as "cf-turnstile-response"; we ask
// Cloudflare whether it's good. Personal links don't need it.
// Locally, .dev.vars holds Cloudflare's published test keys.

export const TOKEN_FIELD = "cf-turnstile-response";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// False on a missing secret or token, a failed check, or a network error,
// so a broken setup refuses rather than letting everything through.
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!secret || !token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetcher(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
