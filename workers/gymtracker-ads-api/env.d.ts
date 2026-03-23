// Secrets (wrangler secret put) — not in wrangler.jsonc; augment generated Env

interface Env {
  ADMIN_API_KEY?: string;
  POSTHOG_PERSONAL_API_KEY?: string;
}
