/**
 * Minimal usage example.
 * Run after building:  node --experimental-strip-types examples/check.ts
 * or import { checkAd } from "adlint" once published.
 */
import { readFileSync } from "node:fs";
import { checkAd } from "../src/index.js";
import type { AdInput } from "../src/index.js";

const ad = JSON.parse(
  readFileSync(new URL("./ad.json", import.meta.url), "utf8"),
) as AdInput;

const result = checkAd(ad, { ruleset: "maneup" });

console.log(`Rejection risk: ${result.rejectionRisk}/10 (${result.band})`);
console.log(`Account ban risk: ${result.accountBanRisk} — ${result.banReason}`);
console.log(`Verdict: ${result.verdict}\n`);
for (const f of result.flags) {
  console.log(`[${f.tier}] ${f.field}: "${f.match}"`);
  console.log(`   ${f.message}`);
  if (f.fix) console.log(`   fix: ${f.fix}`);
}
