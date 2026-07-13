/**
 * Build the single-file web checker from the adlint engine.
 *
 * Bundles src/index.ts into an IIFE (global `adlint`), injects it into
 * web/template.html at the `__ADLINT_BUNDLE__` placeholder, and writes
 * public/index.html — the static site Vercel (or any host) serves.
 *
 * If an ad-compliance-checker.html already exists in the parent directory
 * (a local convenience copy some setups keep next to the repo), it is
 * refreshed too; absent that, the parent directory is left untouched so the
 * build behaves the same on CI.
 *
 * Run: npm run build:web
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
const placeholder = "/*__ADLINT_BUNDLE__*/";
if (!template.includes(placeholder)) {
  throw new Error(`web/template.html is missing the ${placeholder} placeholder`);
}
const html = template.replace(placeholder, () => bundle);

mkdirSync(resolve(root, "public"), { recursive: true });
const outputs = [resolve(root, "public/index.html")];

const localCopy = resolve(root, "../ad-compliance-checker.html");
if (existsSync(localCopy)) outputs.push(localCopy);

for (const out of outputs) {
  writeFileSync(out, html);
  console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}
