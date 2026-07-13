/**
 * Core type definitions for adlint.
 *
 * The engine is intentionally dependency-free and data-driven: a "ruleset" is a
 * bundle of regex-based text rules plus creative/structural signal handling, and
 * the engine simply scans an ad against it and scores the result.
 */

/** Severity of a rule. Drives both the rejection score and the ban-risk read. */
export type Tier = "critical" | "high" | "caution";

/** The text fields of an ad that get scanned. */
export type AdField =
  | "primaryText"
  | "headline"
  | "description"
  | "onImageText"
  | "landingPage";

export const AD_FIELDS: readonly AdField[] = [
  "primaryText",
  "headline",
  "description",
  "onImageText",
  "landingPage",
] as const;

/** A single text rule. Rules are plain data — no code needed to add one. */
export interface Rule {
  /** Unique, kebab-case identifier, e.g. "disease-reverse-hairloss". */
  id: string;
  tier: Tier;
  /** Policy area, e.g. "disease-claim", "personal-attribute", "drug-adjacency". */
  category: string;
  /** Pattern to match against ad text. Case-insensitive is recommended. */
  pattern: RegExp;
  /** Why it fails / which policy it breaks. Shown to the user. */
  message: string;
  /** Optional compliant rewrite suggestion. */
  fix?: string;
  /**
   * Marks a rule as prescription/drug-adjacent. These carry outsized
   * account-ban risk even in isolation.
   */
  drugAdjacent?: boolean;
  /** Restrict scanning to specific fields. Defaults to all fields. */
  fields?: AdField[];
}

/** Non-text creative/structural signals the caller reports as booleans. */
export interface CreativeSignals {
  /** Before/after or side-by-side transformation imagery. */
  beforeAfter?: boolean;
  /** Product shown next to a full-headed/fit model as the implied result. */
  modelAsResult?: boolean;
  /** Close-up of a "problem area" (bald spot, receding hairline, belly). */
  problemAreaCloseup?: boolean;
  /** A named doctor/expert recommends the product for a specific outcome. */
  expertEndorsement?: boolean;
  /** Supplement landing page is missing the FDA structure-function disclaimer. */
  missingDisclaimer?: boolean;
}

/**
 * A signal rule maps one boolean creative signal to a flag. Rulesets declare
 * which signals they care about and at what tier.
 */
export interface SignalRule {
  id: string;
  signal: keyof CreativeSignals;
  tier: Tier;
  category: string;
  message: string;
  fix?: string;
  drugAdjacent?: boolean;
}

/** A bundle of rules targeting a platform/policy area. */
export interface Ruleset {
  /** Unique id, e.g. "meta-health". */
  id: string;
  name: string;
  description?: string;
  /** Optional id of a base ruleset whose rules/signals are inherited. */
  extends?: string;
  rules: Rule[];
  signals?: SignalRule[];
}

/** The ad to be checked. All fields optional; whatever is present is scanned. */
export interface AdInput {
  primaryText?: string;
  headline?: string;
  description?: string;
  onImageText?: string;
  landingPage?: string;
  creative?: CreativeSignals;
  /** Optional product / active-ingredient context (for future use). */
  product?: string;
  /**
   * True if this is a re-submission of previously rejected creative without
   * substantive change. Escalates account-ban risk — the pattern that gets
   * accounts banned.
   */
  isResubmission?: boolean;
}

/** A single detected issue. */
export interface Flag {
  ruleId: string;
  tier: Tier;
  category: string;
  /** Which field/signal it came from. */
  field: AdField | "creative";
  /** The exact matched phrase, or a human label for a creative signal. */
  match: string;
  message: string;
  fix?: string;
  drugAdjacent: boolean;
}

export type Band = "green" | "yellow" | "red";
export type AccountBanRisk = "low" | "elevated" | "high";
export type Verdict = "launch" | "rewrite-first" | "do-not-launch";

/** The result of checking an ad. */
export interface CheckResult {
  /** 1–10 likelihood Meta rejects this specific ad. */
  rejectionRisk: number;
  band: Band;
  /** Separate dimension: risk to the ad account itself. */
  accountBanRisk: AccountBanRisk;
  banReason: string;
  verdict: Verdict;
  flags: Flag[];
  counts: { critical: number; high: number; caution: number };
  /** Id of the ruleset used. */
  ruleset: string;
}

export interface CheckOptions {
  /** Ruleset id (must be registered) or a Ruleset object. Defaults to "meta-health". */
  ruleset?: string | Ruleset;
}
