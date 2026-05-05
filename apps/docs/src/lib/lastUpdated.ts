import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? __dirname ?? ".", "../../../..");

const cache = new Map<string, string | null>();

/**
 * Returns the ISO 8601 datetime of the latest commit that touched `relPath`,
 * resolved from the monorepo root. Returns `null` when git history is
 * shallow / unavailable (e.g. CI without `fetch-depth: 0`).
 */
export function lastUpdatedFor(relPath: string): string | null {
  if (cache.has(relPath)) return cache.get(relPath) ?? null;
  try {
    const out = execSync(
      `git log -1 --format=%cI -- "${relPath}"`,
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    const value = out || null;
    cache.set(relPath, value);
    return value;
  } catch {
    cache.set(relPath, null);
    return null;
  }
}

/** Format a `YYYY-MM-DDTHH:MM:SS+ZZ` ISO timestamp into "May 5, 2026". */
export function formatLastUpdated(iso: string | null, locale = "en-US"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
