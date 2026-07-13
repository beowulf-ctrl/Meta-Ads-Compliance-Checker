import { describe, it, expect } from "vitest";
import { resolveRuleset } from "../src/engine.js";
import {
  getRuleset,
  listRulesets,
  registerRuleset,
} from "../src/rulesets/index.js";
import type { Ruleset } from "../src/types.js";

describe("registry", () => {
  it("ships meta-health and maneup", () => {
    expect(listRulesets()).toEqual(
      expect.arrayContaining(["meta-health", "maneup"]),
    );
    expect(getRuleset("meta-health")).toBeDefined();
  });
});

describe("resolveRuleset", () => {
  it("inherits parent rules through extends", () => {
    const resolved = resolveRuleset("maneup");
    const ids = resolved.rules.map((r) => r.id);
    // own rule
    expect(ids).toContain("hair-regrow");
    // inherited rule from meta-health
    expect(ids).toContain("disease-treatment-verb");
    // inherited signals too
    expect(resolved.signals?.some((s) => s.id === "signal-before-after")).toBe(
      true,
    );
  });

  it("keeps its own id/name after resolving", () => {
    const resolved = resolveRuleset("maneup");
    expect(resolved.id).toBe("maneup");
    expect(resolved.name).toContain("Maneup");
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
