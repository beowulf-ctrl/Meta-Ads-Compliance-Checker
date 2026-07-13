import { describe, it, expect } from "vitest";
import {
  rejectionRisk,
  bandFor,
  verdictFor,
  accountBanRisk,
  countFlags,
} from "../src/scoring.js";
import type { Flag } from "../src/types.js";

function flag(tier: Flag["tier"], drugAdjacent = false): Flag {
  return {
    ruleId: "x",
    tier,
    category: "test",
    field: "primaryText",
    match: "x",
    message: "m",
    drugAdjacent,
  };
}

describe("rejectionRisk anchors", () => {
  it("scores a clean ad as 1", () => {
    expect(rejectionRisk({ critical: 0, high: 0, caution: 0 })).toBe(1);
  });
  it("scores caution-only as 3", () => {
    expect(rejectionRisk({ critical: 0, high: 0, caution: 2 })).toBe(3);
  });
  it("scores one HIGH as 5", () => {
    expect(rejectionRisk({ critical: 0, high: 1, caution: 0 })).toBe(5);
  });
  it("scores two HIGH as 7", () => {
    expect(rejectionRisk({ critical: 0, high: 2, caution: 0 })).toBe(7);
  });
  it("scores one CRITICAL as 7", () => {
    expect(rejectionRisk({ critical: 1, high: 0, caution: 0 })).toBe(7);
  });
  it("scores CRITICAL + HIGH as 9", () => {
    expect(rejectionRisk({ critical: 1, high: 1, caution: 0 })).toBe(9);
  });
  it("scores two CRITICAL as 10", () => {
    expect(rejectionRisk({ critical: 2, high: 0, caution: 0 })).toBe(10);
  });
});

describe("bands and verdicts", () => {
  it("maps score to band", () => {
    expect(bandFor(1)).toBe("green");
    expect(bandFor(3)).toBe("green");
    expect(bandFor(4)).toBe("yellow");
    expect(bandFor(6)).toBe("yellow");
    expect(bandFor(7)).toBe("red");
    expect(bandFor(10)).toBe("red");
  });
  it("maps band to verdict", () => {
    expect(verdictFor("green")).toBe("launch");
    expect(verdictFor("yellow")).toBe("rewrite-first");
    expect(verdictFor("red")).toBe("do-not-launch");
  });
});

describe("accountBanRisk", () => {
  it("is low with no criticals", () => {
    const flags = [flag("high")];
    expect(accountBanRisk(flags, countFlags(flags)).level).toBe("low");
  });
  it("is elevated with a single non-drug critical", () => {
    const flags = [flag("critical")];
    expect(accountBanRisk(flags, countFlags(flags)).level).toBe("elevated");
  });
  it("is high with a drug-adjacent flag even in isolation", () => {
    const flags = [flag("critical", true)];
    expect(accountBanRisk(flags, countFlags(flags)).level).toBe("high");
  });
  it("is high with two or more criticals", () => {
    const flags = [flag("critical"), flag("critical")];
    expect(accountBanRisk(flags, countFlags(flags)).level).toBe("high");
  });
  it("is high on resubmission of flagged creative", () => {
    const flags = [flag("high")];
    expect(accountBanRisk(flags, countFlags(flags), true).level).toBe("high");
  });
});
