/**
 * adlint — a linter for advertising copy.
 *
 * Score ad copy against ad-platform policy before you launch. Pluggable
 * rulesets, no network calls, runs in Node and the browser.
 *
 * @example
 * import { checkAd } from "adlint";
 *
 * const result = checkAd({
 *   primaryText: "Cure your hair loss — 40% more in 90 days, guaranteed.",
 * });
 * console.log(result.rejectionRisk, result.band, result.accountBanRisk);
 * // 9 "red" "elevated"
 *
 * @packageDocumentation
 */
export { checkAd, resolveRuleset } from "./engine.js";
export {
  score,
  rejectionRisk,
  accountBanRisk,
  bandFor,
  verdictFor,
  countFlags,
} from "./scoring.js";
export {
  getRuleset,
  registerRuleset,
  listRulesets,
  metaHealth,
  BUILTIN,
} from "./rulesets/index.js";

export type {
  Tier,
  AdField,
  Rule,
  SignalRule,
  Ruleset,
  AdInput,
  CreativeSignals,
  Flag,
  Band,
  AccountBanRisk,
  Verdict,
  CheckResult,
  CheckOptions,
} from "./types.js";

export { AD_FIELDS } from "./types.js";
