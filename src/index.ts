interface Env {
  ASSETS: Fetcher;
  HEVY_API_KEY: string;
}

interface HevyWorkout {
  title: string;
  start_time: string;
  end_time?: string;
  exercises?: Array<{ sets?: HevySet[] }>;
}

interface HevySet {
  weight_kg?: number | null;
  reps?: number | null;
}

interface HevyWorkoutsResponse {
  page_count: number;
  workouts: HevyWorkout[];
}

const HEVY_API_URL = "https://api.hevyapp.com/v1";
const GITHUB_CONTRIBUTIONS_URL = "https://github.com/users/Hann8n/contributions";
const PAGE_SIZE = 1;
const EDGE_CACHE_SECONDS = 600;
const ASSET_VERSION = "2026-08-29-gym-tracker-chip";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/hevy" && request.method === "GET") {
      return hevyActivity(request, env, ctx);
    }

    if (url.pathname === "/api/github" && request.method === "GET") {
      return githubActivity(request, ctx);
    }

    // Version the internal asset request so custom-domain edge caches cannot
    // serve a previous site shell after a Worker deployment.
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === "/" && !assetUrl.searchParams.has("v")) {
      assetUrl.searchParams.set("v", ASSET_VERSION);
    }
    assetUrl.searchParams.set("__asset_version", ASSET_VERSION);
    return env.ASSETS.fetch(new Request(assetUrl, request));
  },
} satisfies ExportedHandler<Env>;

async function hevyActivity(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.HEVY_API_KEY) {
    return response({ error: "Hevy is not configured." }, 503);
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/hevy?schema=4", request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const firstPage = await getWorkouts(env.HEVY_API_KEY, 1);

    const last = firstPage.workouts[0] ?? null;
    const payload = {
      lastWorkout: last
        ? {
            title: last.title || "Workout",
            date: last.start_time,
            durationMinutes: workoutDuration(last),
            volumeKg: workoutVolume(last),
            setCount: workoutSetCount(last),
            exerciseCount: workoutExerciseCount(last),
          }
        : null,
      updatedAt: new Date().toISOString(),
    };

    const fresh = response(payload, 200, {
      "Cache-Control": `public, max-age=60, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=86400`,
    });
    ctx.waitUntil(cache.put(cacheKey, fresh.clone()));
    return fresh;
  } catch {
    return response({ error: "Unable to load lifting activity." }, 502);
  }
}

async function githubActivity(request: Request, ctx: ExecutionContext): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/github?schema=1", request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const result = await fetch(GITHUB_CONTRIBUTIONS_URL, {
      headers: {
        Accept: "text/html",
        "User-Agent": "jackhannon.net activity viewer",
      },
    });
    if (!result.ok) throw new Error("GitHub activity is unavailable.");

    const html = await result.text();
    const total = html.match(/([\d,]+)\s+contributions\s+in the last year/)?.[1];
    const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"/g)]
      .map(([, date, level]) => ({ date, level: Number(level) }))
      .sort((left, right) => left.date.localeCompare(right.date));
    if (!total || days.length < 350) throw new Error("GitHub calendar could not be read.");

    const fresh = response({
      contributions: Number(total.replaceAll(",", "")),
      days,
      updatedAt: new Date().toISOString(),
    }, 200, {
      "Cache-Control": "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400",
    });
    ctx.waitUntil(cache.put(cacheKey, fresh.clone()));
    return fresh;
  } catch {
    return response({ error: "Unable to load GitHub activity." }, 502);
  }
}

function workoutDuration(workout: HevyWorkout): number | null {
  if (!workout.end_time) return null;
  const duration = (new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / 60000;
  return Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null;
}

function workoutVolume(workout: HevyWorkout): number | null {
  const volume = workout.exercises?.flatMap((exercise) => exercise.sets ?? []).reduce(
    (total, set) => total + (set.weight_kg ?? 0) * (set.reps ?? 0),
    0,
  );
  return volume && Number.isFinite(volume) ? Math.round(volume) : null;
}

function workoutSetCount(workout: HevyWorkout): number {
  return workout.exercises?.reduce((count, exercise) => count + (exercise.sets?.length ?? 0), 0) ?? 0;
}

function workoutExerciseCount(workout: HevyWorkout): number {
  return workout.exercises?.filter((exercise) => (exercise.sets?.length ?? 0) > 0).length ?? 0;
}

async function getWorkouts(apiKey: string, page: number): Promise<HevyWorkoutsResponse> {
  const result = await hevyFetch(`/workouts?page=${page}&pageSize=${PAGE_SIZE}`, apiKey);
  return (await result.json()) as HevyWorkoutsResponse;
}

async function hevyFetch(path: string, apiKey: string): Promise<Response> {
  const result = await fetch(`${HEVY_API_URL}${path}`, {
    headers: { Accept: "application/json", "api-key": apiKey },
  });

  if (!result.ok) throw new Error(`Hevy returned ${result.status}`);
  return result;
}

function response(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}
