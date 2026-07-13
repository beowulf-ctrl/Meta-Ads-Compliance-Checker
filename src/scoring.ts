/**
 * Scoring model. Two independent readouts:
 *   A) Rejection Risk (1–10, anchored) — how likely the platform rejects this ad.
 *   B) Account Ban Risk (low/elevated/high) — risk to the account itself, which
 *      is NOT additive: one drug-adjacency claim outweighs several tone issues.
 */
import type {
  Flag,
  Band,
  AccountBanRisk,
  Verdict,
  CheckResult,
} from "./types.js";

export interface Counts {
  critical: number;
  high: number;
  caution: number;
}

export function countFlags(flags: Flag[]): Counts {
  let critical = 0;
  let high = 0;
  let caution = 0;
  for (const f of flags) {
    if (f.tier === "critical") critical++;
    else if (f.tier === "high") high++;
    else caution++;
  }
  return { critical, high, caution };
}

/**
 * Anchored 1–10 rejection risk. The anchors are documented so scores are
 * reproducible rather than vibes-based:
 *   1–2  clean structure-function
 *   3    minor caution only
 *   4–5  one HIGH issue
 *   6    (reserved for a strong single HIGH — see note)
 *   7–8  one CRITICAL, or 2+ HIGH
 *   9–10 multiple CRITICAL / overt drug or disease claims
 */
export function rejectionRisk(counts: Counts): number {
  const { critical, high, caution } = counts;
  if (critical >= 2) return 10;
  if (critical === 1 && high >= 1) return 9;
  if (critical === 1) return 7;
  if (high >= 2) return 7;
  if (high === 1) return 5;
  if (caution > 0) return 3;
  return 1;
}

export function bandFor(score: number): Band {
  if (score >= 7) return "red";
  if (score >= 4) return "yellow";
  return "green";
}

export function verdictFor(band: Band): Verdict {
  if (band === "red") return "do-not-launch";
  if (band === "yellow") return "rewrite-first";
  return "launch";
}

export interface BanRisk {
  level: AccountBanRisk;
  reason: string;
}

/**
 * Account ban risk. Drug-adjacency or multiple criticals => high, because that
 * is the pattern that escalates from a rejected ad to a banned account.
 */
export function accountBanRisk(
  flags: Flag[],
  counts: Counts,
  isResubmission = false,
): BanRisk {
  const hasDrug = flags.some((f) => f.drugAdjacent);
  if (isResubmission && counts.critical + counts.high > 0) {
    return {
      level: "high",
      reason:
        "re-submitting previously rejected creative without substantive change — the pattern that gets accounts banned",
    };
  }
  if (hasDrug || counts.critical >= 2) {
    return {
      level: "high",
      reason:
        "prescription/drug-adjacent or multiple critical claims — this is what escalates to account bans",
    };
  }
  if (counts.critical === 1) {
    return { level: "elevated", reason: "a critical health-claim flag is present" };
  }
  return { level: "low", reason: "no critical flags" };
}

/** Sort order: critical first, then high, then caution. */
const TIER_ORDER: Record<Flag["tier"], number> = {
  critical: 0,
  high: 1,
  caution: 2,
};

export function sortFlags(flags: Flag[]): Flag[] {
  return [...flags].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

/** Assemble the full scored result from a flag list. */
export function score(
  flags: Flag[],
  rulesetId: string,
  isResubmission = false,
): CheckResult {
  const sorted = sortFlags(flags);
  const counts = countFlags(sorted);
  const risk = rejectionRisk(counts);
  const band = bandFor(risk);
  const ban = accountBanRisk(sorted, counts, isResubmission);
  return {
    rejectionRisk: risk,
    band,
    accountBanRisk: ban.level,
    banReason: ban.reason,
    verdict: verdictFor(band),
    flags: sorted,
    counts,
    ruleset: rulesetId,
  };
}
