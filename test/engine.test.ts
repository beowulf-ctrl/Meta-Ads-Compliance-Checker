import { describe, it, expect } from "vitest";
import { checkAd } from "../src/engine.js";

describe("checkAd — end to end", () => {
  it("passes a clean structure-function ad (green, 1/10, low ban risk)", () => {
    const r = checkAd(
      {
        primaryText:
          "Supports thicker-looking, healthier hair with GHK-Cu. Part of your daily routine.",
        headline: "Healthy hair support",
      },
      { ruleset: "maneup" },
    );
    expect(r.flags).toHaveLength(0);
    expect(r.rejectionRisk).toBe(1);
    expect(r.band).toBe("green");
    expect(r.accountBanRisk).toBe("low");
    expect(r.verdict).toBe("launch");
  });

  it("fails an overtly violating ad (red, 10/10, high ban risk)", () => {
    const r = checkAd(
      {
        primaryText:
          "Embarrassed by your thinning hair? Prescription-strength, clinically proven to regrow hair and reverse hair loss — 40% more, guaranteed.",
      },
      { ruleset: "maneup" },
    );
    expect(r.rejectionRisk).toBe(10);
    expect(r.band).toBe("red");
    expect(r.accountBanRisk).toBe("high");
    expect(r.counts.critical).toBeGreaterThanOrEqual(2);
  });

  it("treats a bare Rx drug name as drug-adjacency (red, high ban risk)", () => {
    const r = checkAd({ primaryText: "Our topical contains minoxidil." });
    expect(r.rejectionRisk).toBe(7);
    expect(r.band).toBe("red");
    expect(r.accountBanRisk).toBe("high");
    expect(r.flags.some((f) => f.drugAdjacent)).toBe(true);
  });

  it("scores a single HIGH transformation-copy flag as 5/yellow/low", () => {
    const r = checkAd({ primaryText: "See my before and after." });
    expect(r.rejectionRisk).toBe(5);
    expect(r.band).toBe("yellow");
    expect(r.accountBanRisk).toBe("low");
  });

  it("scores caution-only copy as 3/green", () => {
    const r = checkAd({ primaryText: "Try our daily detox blend." });
    expect(r.rejectionRisk).toBe(3);
    expect(r.band).toBe("green");
    expect(r.counts.caution).toBe(1);
  });

  it("scans the landing page field", () => {
    const r = checkAd({
      primaryText: "A supplement for your routine.",
      landingPage: "We reverse hair loss for good.",
    });
    const lp = r.flags.find((f) => f.field === "landingPage");
    expect(lp).toBeDefined();
    expect(lp?.tier).toBe("critical");
  });

  it("flags creative signals", () => {
    const r = checkAd({ creative: { beforeAfter: true } });
    expect(r.flags).toHaveLength(1);
    expect(r.flags[0]?.field).toBe("creative");
    expect(r.flags[0]?.category).toBe("transformation");
    expect(r.band).toBe("yellow");
  });

  it("escalates ban risk on resubmission of flagged creative", () => {
    const base = { primaryText: "See my before and after." };
    expect(checkAd(base).accountBanRisk).toBe("low");
    expect(checkAd({ ...base, isResubmission: true }).accountBanRisk).toBe("high");
  });

  it("ignores empty/whitespace fields", () => {
    const r = checkAd({ primaryText: "   ", headline: "" });
    expect(r.flags).toHaveLength(0);
    expect(r.rejectionRisk).toBe(1);
  });

  it("defaults to the meta-health ruleset", () => {
    const r = checkAd({ primaryText: "hello" });
    expect(r.ruleset).toBe("meta-health");
  });

  it("catches maneup preset rules folded in from the standalone checker", () => {
    const fix = checkAd(
      { primaryText: "Finally fix your thinning crown." },
      { ruleset: "maneup" },
    );
    expect(fix.flags.some((f) => f.ruleId === "fix-condition")).toBe(true);
    expect(fix.band).toBe("red");

    const dosing = checkAd(
      { primaryText: "Each application delivers 5mg of actives. Anti-aging support." },
      { ruleset: "maneup" },
    );
    const ids = dosing.flags.map((f) => f.ruleId);
    expect(ids).toContain("caution-mg-dosing");
    expect(ids).toContain("caution-anti-aging");
    expect(dosing.band).toBe("green"); // cautions only
  });

  it("orders flags most-severe-first", () => {
    const r = checkAd(
      { primaryText: "Try our detox to regrow hair, guaranteed." },
      { ruleset: "maneup" },
    );
    // first flag should be critical (regrow), not the caution (detox)
    expect(r.flags[0]?.tier).toBe("critical");
    expect(r.flags.at(-1)?.tier).toBe("caution");
  });
});
