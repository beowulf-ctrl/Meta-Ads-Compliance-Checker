/**
 * Maneup preset — a men's hair-loss / hormone brand.
 *
 * Extends the generic `meta-health` ruleset with niche-specific patterns for
 * hair regrowth, hormone claims, and the brand's peptide/compound context.
 * Use this as a template for building your own brand preset.
 */
import type { Ruleset } from "../../types.js";

export const maneup: Ruleset = {
  id: "maneup",
  name: "Maneup (men's hair & hormone)",
  description:
    "Hair-loss / men's-health preset extending meta-health with regrowth, hormone, and peptide-compound rules.",
  extends: "meta-health",
  rules: [
    {
      id: "hair-regrow",
      tier: "critical",
      category: "disease-claim",
      pattern: /\bregrow(ing|s|th)?\b/i,
      message: "Hair 'regrowth' is a disease-outcome claim for a non-drug product.",
      fix: "'support the look of fuller hair'",
    },
    {
      id: "hair-loss-action",
      tier: "critical",
      category: "disease-claim",
      pattern:
        /\b(reverse|reverses|reversing|stop|stops|stopping|end|ends|ending|halt|halts)\s+(the\s+)?(hair\s*loss|balding|baldness|thinning|shedding)\b/i,
      message: "Claims to reverse/stop hair loss read as treating a condition.",
      fix: "'support your hair's natural cycle' / 'support thicker-looking hair'",
    },
    {
      id: "hair-restore",
      tier: "critical",
      category: "disease-claim",
      pattern: /\brestore\s+(your\s+)?(hairline|hair|crown)\b/i,
      message: "'Restore your hairline' is a transformation/cure claim.",
      fix: "'support the appearance of your hairline'",
    },
    {
      id: "hormone-boost",
      tier: "critical",
      category: "disease-claim",
      pattern:
        /\b(boost|boosts|boosting|increase|increases|raise|raises)\s+(your\s+)?(testosterone|test\b|t\s*levels?)\b/i,
      message: "Raising testosterone is a health-outcome/medical claim.",
      fix: "'supports healthy energy and everyday vitality'",
    },
    {
      id: "personal-attr-your-hair",
      tier: "critical",
      category: "personal-attribute",
      pattern:
        /\byour\s+(thinning|balding|bald\s*spot|receding|hair\s*loss|low\s*t)\b/i,
      message:
        "Asserts the viewer has the condition ('your thinning hair') — violates Personal Attributes.",
      fix: "Talk about the goal, not the viewer's assumed condition.",
    },
    {
      id: "compound-clascoterone",
      tier: "critical",
      category: "drug-adjacency",
      pattern: /\bclascoterone\b/i,
      message:
        "Clascoterone is a regulated compound — naming it as the benefit is drug-adjacency.",
      fix: "Describe your formulation without positioning it as a drug.",
      drugAdjacent: true,
    },
    {
      id: "condition-ed",
      tier: "critical",
      category: "disease-claim",
      pattern: /\berectile\s+dysfunction\b/i,
      message: "ED is a sensitive medical condition; avoid in paid social entirely.",
      fix: "Do not reference ED in ad copy.",
    },
    {
      id: "fix-condition",
      tier: "critical",
      category: "disease-claim",
      pattern:
        /\b(fix|fixes|fixing)\s+(your\s+)?(low\s*t\b|low\s*testosterone|hair|hairline|balding|thinning|shedding|ed\b|erectile)/i,
      message: "'Fix [condition]' is a disease-treatment claim.",
      fix: "'support healthy energy and vitality' / 'support healthier-looking hair'",
    },
    {
      id: "caution-anti-aging",
      tier: "caution",
      category: "buzzword",
      pattern: /\banti-?aging\b/i,
      message:
        "'Anti-aging' is fine cosmetically but risky when tied to health outcomes.",
      fix: "'supports the look of healthy, youthful hair/skin'",
    },
    {
      id: "caution-mg-dosing",
      tier: "caution",
      category: "drug-adjacency",
      pattern: /\b\d+(\.\d+)?\s?mg\b/i,
      message: "Drug-style mg dosing can read as a drug label.",
      fix: "Give usage instructions without therapeutic dosing framing.",
    },
  ],
};
