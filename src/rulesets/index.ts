/**
 * Ruleset registry. Rulesets register themselves here so they can be referenced
 * by id (including via `extends`). Add new rulesets/presets to `BUILTIN`.
 */
import type { Ruleset } from "../types.js";
import { metaHealth } from "./meta-health.js";

const registry = new Map<string, Ruleset>();

/** Register (or override) a ruleset by id. */
export function registerRuleset(ruleset: Ruleset): void {
  registry.set(ruleset.id, ruleset);
}

/** Look up a registered ruleset by id. */
export function getRuleset(id: string): Ruleset | undefined {
  return registry.get(id);
}

/** List all registered ruleset ids. */
export function listRulesets(): string[] {
  return [...registry.keys()];
}

/** Rulesets shipped with adlint. */
export const BUILTIN: Ruleset[] = [metaHealth];
for (const rs of BUILTIN) registerRuleset(rs);

export { metaHealth };
