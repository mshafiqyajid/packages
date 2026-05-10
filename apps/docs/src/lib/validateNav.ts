import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { allSlugs, categories } from "~/data/nav";

let validated = false;

/**
 * Build-time consistency check between `packages/react-*` directories and the
 * sidebar nav. Catches the two failure modes that hardcoded descriptions can
 * produce: a published package with no sidebar entry, and a sidebar entry with
 * an empty description.
 *
 * Runs once per process (cached) so calling it from every page render is cheap.
 */
export function validateNav(): void {
  if (validated) return;
  validated = true;

  const root = fileURLToPath(new URL("../../../../", import.meta.url));
  const packagesDir = path.join(root, "packages");

  let pkgSlugs: string[] = [];
  try {
    pkgSlugs = readdirSync(packagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("react-"))
      .map((d) => d.name.slice("react-".length));
  } catch {
    return;
  }

  const navSlugs = new Set(allSlugs);
  const missingFromNav = pkgSlugs.filter((s) => !navSlugs.has(s));
  const orphanInNav = allSlugs.filter((s) => !pkgSlugs.includes(s));

  const missingDescriptions: string[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      if (!item.description || !item.description.trim()) {
        missingDescriptions.push(item.slug);
      }
    }
  }

  const errors: string[] = [];
  if (missingFromNav.length) {
    errors.push(
      `packages/react-* directories with no entry in apps/docs/src/data/nav.ts: ${missingFromNav.join(", ")}`,
    );
  }
  if (orphanInNav.length) {
    errors.push(
      `nav.ts entries with no matching packages/react-* directory: ${orphanInNav.join(", ")}`,
    );
  }
  if (missingDescriptions.length) {
    errors.push(
      `nav.ts entries missing a description: ${missingDescriptions.join(", ")}`,
    );
  }

  if (errors.length) {
    throw new Error(
      `[validateNav] sidebar nav is out of sync with packages/:\n  - ${errors.join("\n  - ")}`,
    );
  }
}
