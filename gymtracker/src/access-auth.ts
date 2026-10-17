/** Verify Access JWTs; a caller-supplied header or email alone is not authentication. */
let cached: { issuer: string; expires: number; keys: (JsonWebKey & { kid?: string })[] } | undefined;
const decode = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")), c => c.charCodeAt(0));

export async function hasAccessAuth(request: Request, env: Env): Promise<boolean> {
  const hostname = new URL(request.url).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_ISSUER || !env.ACCESS_AUDIENCE) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const now = Date.now() / 1000;
    if (header.alg !== "RS256" || typeof header.kid !== "string" || payload.iss !== env.ACCESS_ISSUER ||
        typeof payload.exp !== "number" || payload.exp <= now || (typeof payload.nbf === "number" && payload.nbf > now) ||
        !Array.isArray(payload.aud) || !payload.aud.includes(env.ACCESS_AUDIENCE)) return false;
    if (!cached || cached.issuer !== env.ACCESS_ISSUER || cached.expires <= Date.now()) {
      const response = await fetch(`${env.ACCESS_ISSUER}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return false;
      const body = await response.json() as { keys: (JsonWebKey & { kid?: string })[] };
      if (!Array.isArray(body.keys)) return false;
      cached = { issuer: env.ACCESS_ISSUER, expires: Date.now() + 300000, keys: body.keys };
    }
    const jwk = cached.keys.find(key => key.kid === header.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decode(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  } catch { return false; }
}
