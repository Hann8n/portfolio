import { sql, type Fragment } from "./sql";

/**
 * Internal installations (developer, TestFlight, demo devices) are excluded from reporting by default.
 * Raw events are kept, so a mistaken exclusion can be undone without data loss.
 */
const KV_KEY = "analytics_internal_installations";
const MAX_INTERNAL = 200;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface InternalInstall { id: string; label: string; added_at: string }
export interface Audience { excludeInternal: boolean; internal: InternalInstall[] }

export async function getInternalInstalls(kv: KVNamespace | undefined): Promise<InternalInstall[]> {
  if (!kv) return [];
  try {
    const parsed = JSON.parse((await kv.get(KV_KEY)) || "[]");
    return Array.isArray(parsed) ? parsed.filter(row => row && typeof row.id === "string" && UUID.test(row.id)) : [];
  } catch { return []; }
}

export async function setInternalInstall(kv: KVNamespace, id: string, label: string, internal: boolean): Promise<InternalInstall[]> {
  const current = (await getInternalInstalls(kv)).filter(row => row.id.toLowerCase() !== id.toLowerCase());
  const next = internal ? [...current, { id, label: label.trim().slice(0, 60), added_at: new Date().toISOString() }] : current;
  if (next.length > MAX_INTERNAL) throw new RangeError("Too many internal installations");
  await kv.put(KV_KEY, JSON.stringify(next));
  return next;
}

export async function resolveAudience(env: Env, mode: string | null): Promise<Audience> {
  return { excludeInternal: mode !== "include", internal: await getInternalInstalls(env.AD_CONFIG) };
}

/** Rows counted in reports. */
export function audienceFilter(audience: Audience): Fragment {
  if (!audience.excludeInternal || !audience.internal.length) return sql`1 = 1`;
  return sql`installation_id NOT IN (SELECT value FROM json_each(${JSON.stringify(audience.internal.map(row => row.id))}))`;
}

/** Rows removed by the internal filter, for disclosure next to the numbers they would have changed. */
export function internalOnlyFilter(audience: Audience): Fragment {
  if (!audience.excludeInternal || !audience.internal.length) return sql`1 = 0`;
  return sql`installation_id IN (SELECT value FROM json_each(${JSON.stringify(audience.internal.map(row => row.id))}))`;
}
