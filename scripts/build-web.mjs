/**
 * Build the single-file web checker from the adlint engine.
 *
 * Bundles src/index.ts into an IIFE (global `adlint`), injects it into
 * web/template.html along with per-variant config, and writes one static
 * page per variant under public/ (what a static host serves).
 *
 * To ship a brand-preset variant of the checker, add an entry to VARIANTS —
 * or, to keep a preset out of this repo entirely, depend on adlint from your
 * own (private) repo and reuse the exported `renderChecker` helper there.
 *
 * Run: npm run build:web
 */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
];

/**
 * Render the checker page for a variant.
 * @param {string} template  contents of web/template.html
 * @param {string} bundle    IIFE bundle exposing the engine as global `adlint`
 * @param {{title: string, subtitle: string, rulesets: string[], defaultRuleset: string}} variant
 */
export function renderChecker(template, bundle, variant) {
  for (const token of ["/*__ADLINT_BUNDLE__*/", '"__ADLINT_CONFIG__"', "{{TITLE}}", "{{SUBTITLE}}"]) {
    if (!template.includes(token)) {
      throw new Error(`checker template is missing the ${token} placeholder`);
    }
  }
  return template
    .replace("/*__ADLINT_BUNDLE__*/", () => bundle)
    .replace('"__ADLINT_CONFIG__"', () =>
      JSON.stringify({ rulesets: variant.rulesets, defaultRuleset: variant.defaultRuleset }),
    )
    .replaceAll("{{TITLE}}", variant.title)
    .replaceAll("{{SUBTITLE}}", variant.subtitle);
}

/** Bundle an entry module into the IIFE the template expects. */
export async function bundleEngine(entryPoint) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "iife",
    globalName: "adlint",
    minify: true,
    write: false,
    target: "es2020",
  });
  return result.outputFiles[0].text;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const bundle = await bundleEngine(resolve(root, "src/index.ts"));
  const template = readFileSync(resolve(root, "web/template.html"), "utf8");
  for (const variant of VARIANTS) {
    const out = resolve(root, variant.out);
    mkdirSync(dirname(out), { recursive: true });
    const html = renderChecker(template, bundle, variant);
    writeFileSync(out, html);
    console.log(`wrote ${variant.out} (${(html.length / 1024).toFixed(0)} KB) — ${variant.title}`);
  }
}
