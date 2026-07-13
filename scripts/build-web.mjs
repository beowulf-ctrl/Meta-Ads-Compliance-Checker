/**
 * Build the single-file web checkers from the adlint engine.
 *
 * Bundles src/index.ts into an IIFE (global `adlint`), injects it into
 * web/template.html along with per-variant config, and writes one static
 * page per variant under public/ (what Vercel serves):
 *
 *   public/index.html         — public checker, generic meta-health ruleset
 *   public/maneup/index.html  — Maneup team variant, brand preset included
 *
 * If an ad-compliance-checker.html already exists in the parent directory
 * (a local convenience copy some setups keep next to the repo), it is
 * refreshed with the Maneup variant; absent that, the parent directory is
 * left untouched so the build behaves the same on CI.
 *
 * Run: npm run build:web
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const VARIANTS = [
  {
    out: "public/index.html",
    title: "Meta Ads Compliance Checker",
    subtitle:
      'Pre-launch screen for Facebook/Instagram ads — catches the health-claim patterns that get ads rejected and accounts banned. Powered by the open-source <a href="https://github.com/beowulf-ctrl/Meta-Ads-Compliance-Checker" style="color:var(--accent)"><b>adlint</b></a> engine. Not legal advice.',
    rulesets: ["meta-health"],
    defaultRuleset: "meta-health",
  },
  {
    out: "public/maneup/index.html",
    title: "Maneup — Meta Ad Compliance Checker",
    subtitle:
      "Pre-launch screen for Facebook/Instagram ads. Powered by the <b>adlint</b> engine — rules live in one place. Not legal advice.",
    rulesets: ["meta-health", "maneup"],
    defaultRuleset: "maneup",
  },
];

const result = await build({
  entryPoints: [resolve(root, "src/index.ts")],
  bundle: true,
  format: "iife",
  globalName: "adlint",
  minify: true,
  write: false,
  target: "es2020",
});
const bundle = result.outputFiles[0].text;

const template = readFileSync(resolve(root, "web/template.html"), "utf8");
for (const token of ["/*__ADLINT_BUNDLE__*/", '"__ADLINT_CONFIG__"', "{{TITLE}}", "{{SUBTITLE}}"]) {
  if (!template.includes(token)) {
    throw new Error(`web/template.html is missing the ${token} placeholder`);
  }
}

function render(variant) {
  return template
    .replace("/*__ADLINT_BUNDLE__*/", () => bundle)
    .replace('"__ADLINT_CONFIG__"', () =>
      JSON.stringify({ rulesets: variant.rulesets, defaultRuleset: variant.defaultRuleset }),
    )
    .replaceAll("{{TITLE}}", variant.title)
    .replaceAll("{{SUBTITLE}}", variant.subtitle);
}

for (const variant of VARIANTS) {
  const out = resolve(root, variant.out);
  mkdirSync(dirname(out), { recursive: true });
  const html = render(variant);
  writeFileSync(out, html);
  console.log(`wrote ${variant.out} (${(html.length / 1024).toFixed(0)} KB) — ${variant.title}`);
}

const localCopy = resolve(root, "../ad-compliance-checker.html");
if (existsSync(localCopy)) {
  writeFileSync(localCopy, render(VARIANTS.find((v) => v.out.includes("maneup"))));
  console.log(`refreshed local copy: ${localCopy}`);
}
