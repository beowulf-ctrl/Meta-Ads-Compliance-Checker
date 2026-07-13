import { describe, it, expect } from "vitest";
import { resolveRuleset } from "../src/engine.js";
import {
  getRuleset,
  listRulesets,
  registerRuleset,
} from "../src/rulesets/index.js";
import type { Ruleset } from "../src/types.js";

describe("registry", () => {
  it("ships meta-health", () => {
    expect(listRulesets()).toEqual(expect.arrayContaining(["meta-health"]));
    expect(getRuleset("meta-health")).toBeDefined();
  });
});

const brandPreset: Ruleset = {
  id: "brand-preset",
  name: "Brand Preset",
  extends: "meta-health",
  rules: [
    {
      id: "brand-regrow",
      tier: "critical",
      category: "disease-claim",
      pattern: /\bregrow\b/i,
      message: "regrowth claim",
    },
  ],
};

describe("resolveRuleset", () => {
  it("inherits parent rules through extends", () => {
    registerRuleset(brandPreset);
    const resolved = resolveRuleset("brand-preset");
    const ids = resolved.rules.map((r) => r.id);
    // own rule
    expect(ids).toContain("brand-regrow");
    // inherited rule from meta-health
    expect(ids).toContain("disease-treatment-verb");
    // inherited signals too
    expect(resolved.signals?.some((s) => s.id === "signal-before-after")).toBe(
      true,
    );
  });

  it("keeps its own id/name after resolving", () => {
    registerRuleset(brandPreset);
    const resolved = resolveRuleset("brand-preset");
    expect(resolved.id).toBe("brand-preset");
    expect(resolved.name).toBe("Brand Preset");
  });

  it("throws on an unknown ruleset", () => {
    expect(() => resolveRuleset("does-not-exist")).toThrow(/Unknown ruleset/);
  });

  it("throws when extending an unknown ruleset", () => {
    const bad: Ruleset = {
      id: "bad-extends",
      name: "bad",
      extends: "ghost",
      rules: [],
    };
    expect(() => resolveRuleset(bad)).toThrow(/extends unknown ruleset/);
  });

  it("detects circular extends", () => {
    const a: Ruleset = { id: "cyc-a", name: "a", extends: "cyc-b", rules: [] };
    const b: Ruleset = { id: "cyc-b", name: "b", extends: "cyc-a", rules: [] };
    registerRuleset(a);
    registerRuleset(b);
    expect(() => resolveRuleset("cyc-a")).toThrow(/Circular/);
  });

  it("accepts an inline Ruleset object", () => {
    const custom: Ruleset = {
      id: "inline",
      name: "Inline",
      rules: [
        {
          id: "no-free",
          tier: "high",
          category: "test",
          pattern: /\bfree\b/i,
          message: "no free",
        },
      ],
    };
    const resolved = resolveRuleset(custom);
    expect(resolved.rules).toHaveLength(1);
  });
});
