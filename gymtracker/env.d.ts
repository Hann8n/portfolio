// Optional bindings allow a useful configuration status before deployment.
interface Env {
  ADMIN_API_KEY?: string;
  ACCESS_ISSUER?: string;
  ACCESS_AUDIENCE?: string;
  METRICS?: D1Database;
  METRICS_RATE_LIMITER?: RateLimit;
}
