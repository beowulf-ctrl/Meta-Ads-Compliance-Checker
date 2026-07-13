/**
 * The scanning engine. Resolves a ruleset (following `extends`), scans each ad
 * field against its text rules, applies creative/structural signal rules, then
 * hands the flags to the scorer.
 */
import {
  AD_FIELDS,
  type AdField,
  type AdInput,
  type CheckOptions,
  type CheckResult,
  type Flag,
  type Ruleset,
  type SignalRule,
} from "./types.js";
import { getRuleset } from "./rulesets/index.js";
import { score } from "./scoring.js";

/** Human-readable labels for creative signals. */
const SIGNAL_LABELS: Record<SignalRule["signal"], string> = {
  beforeAfter: "Before/after imagery",
  modelAsResult: "Model shown as implied result",
  problemAreaCloseup: "Problem-area close-up",
  expertEndorsement: "Expert endorses an outcome",
  missingDisclaimer: "No FDA disclaimer on landing page",
};

/**
 * Flatten a ruleset's `extends` chain into a single effective ruleset.
 * Child rules/signals come after the parent's; ids are de-duplicated with the
 * child taking precedence.
 */
export function resolveRuleset(input: string | Ruleset): Ruleset {
  const start = typeof input === "string" ? getRuleset(input) : input;
  if (!start) {
    throw new Error(
      `Unknown ruleset: "${String(input)}". Register it or pass a Ruleset object.`,
    );
  }

  // Walk up the `extends` chain, guarding against cycles. `unshift` keeps the
  // chain base-first so child rules override parents when merged by id.
  const seen = new Set<string>();
  const chain: Ruleset[] = [];
  let current: Ruleset | undefined = start;
  while (current) {
    if (seen.has(current.id)) {
      throw new Error(`Circular ruleset extends detected at "${current.id}".`);
    }
    seen.add(current.id);
    chain.unshift(current);
    if (!current.extends) break;
    const parent = getRuleset(current.extends);
    if (!parent) {
      throw new Error(
        `Ruleset "${current.id}" extends unknown ruleset "${current.extends}".`,
      );
    }
    current = parent;
  }

  const rulesById = new Map<string, Ruleset["rules"][number]>();
  const signalsById = new Map<string, SignalRule>();
  for (const rs of chain) {
    for (const r of rs.rules) rulesById.set(r.id, r);
    for (const s of rs.signals ?? []) signalsById.set(s.id, s);
  }

  return {
    id: start.id,
    name: start.name,
    description: start.description,
    rules: [...rulesById.values()],
    signals: [...signalsById.values()],
  };
}

function scanField(field: AdField, text: string, ruleset: Ruleset): Flag[] {
  const flags: Flag[] = [];
  for (const rule of ruleset.rules) {
    const fields = rule.fields ?? AD_FIELDS;
    if (!fields.includes(field)) continue;
    const m = text.match(rule.pattern);
    if (m) {
      flags.push({
        ruleId: rule.id,
        tier: rule.tier,
        category: rule.category,
        field,
        match: m[0],
        message: rule.message,
        fix: rule.fix,
        drugAdjacent: rule.drugAdjacent ?? false,
      });
    }
  }
  return flags;
}

function scanCreative(ad: AdInput, ruleset: Ruleset): Flag[] {
  const flags: Flag[] = [];
  const creative = ad.creative;
  if (!creative) return flags;
  for (const sig of ruleset.signals ?? []) {
    if (creative[sig.signal]) {
      flags.push({
        ruleId: sig.id,
        tier: sig.tier,
        category: sig.category,
        field: "creative",
        match: SIGNAL_LABELS[sig.signal],
        message: sig.message,
        fix: sig.fix,
        drugAdjacent: sig.drugAdjacent ?? false,
      });
    }
  }
  return flags;
}

function dedupe(flags: Flag[]): Flag[] {
  const seen = new Set<string>();
  const out: Flag[] = [];
  for (const f of flags) {
    const key = `${f.ruleId}|${f.field}|${f.match.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

/**
 * Check an ad against a ruleset and return a scored result.
 *
 * @example
 * const result = checkAd({ primaryText: "Regrow your hair, guaranteed." });
 * result.rejectionRisk; // 9
 * result.band;          // "red"
 */
export function checkAd(ad: AdInput, options: CheckOptions = {}): CheckResult {
  const ruleset = resolveRuleset(options.ruleset ?? "meta-health");

  const flags: Flag[] = [];
  for (const field of AD_FIELDS) {
    const text = ad[field];
    if (typeof text === "string" && text.trim().length > 0) {
      flags.push(...scanField(field, text, ruleset));
    }
  }
  flags.push(...scanCreative(ad, ruleset));

  return score(dedupe(flags), ruleset.id, ad.isResubmission ?? false);
}
