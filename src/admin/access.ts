// Second lock on /admin, behind Cloudflare Access.
// Access signs each request it lets through with a token in the
// Cf-Access-Jwt-Assertion header. We check that token's signature, team and
// audience here, so /admin stays shut even on a hostname Access doesn't
// cover (like the workers.dev address) or if the Access app is changed.
import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export type AccessUser = { email: string };

export async function checkAccess(
  request: Request,
  teamDomain: string | undefined,
  audience: string | undefined,
): Promise<AccessUser | null> {
  // Not configured yet: fail closed.
  if (!teamDomain || !audience) return null;

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return null;

  const issuer = `https://${teamDomain}`;
  jwks ??= createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience });
    return typeof payload.email === "string" ? { email: payload.email } : null;
  } catch {
    return null;
  }
}
