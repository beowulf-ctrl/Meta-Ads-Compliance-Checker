/**
 * Generic Meta (Facebook/Instagram) Health & Wellness ruleset.
 *
 * Reusable by any health/DTC advertiser. Brand- or niche-specific patterns
 * belong in a preset that `extends: "meta-health"` (see presets/maneup.ts).
 *
 * Policy grounding: Meta Advertising Standards — Health & Wellness and
 * Drugs & Pharmaceuticals (transparency.meta.com/policies/ad-standards).
 * These are best-effort interpretations, not legal advice.
 */
import type { Ruleset } from "../types.js";

export const metaHealth: Ruleset = {
  id: "meta-health",
  name: "Meta Health & Wellness",
  description:
    "Generic Meta ad policy checks for health/wellness and DTC advertisers.",
  rules: [
    // ── Disease / condition claims (CRITICAL) ────────────────────────────────
    {
      id: "disease-treatment-verb",
      tier: "critical",
      category: "disease-claim",
      pattern:
        /\b(cure|cures|curing|treat|treats|treating|heal|heals|healing|prevent|prevents|preventing|reverse|reverses|reversing|eliminate|eliminates|eliminating)\b/i,
      message:
        "Disease/treatment verb implies the product cures, treats, or prevents a condition — prohibited for non-drug products.",
      fix: "Use structure-function language: 'supports a healthy, normal function'.",
    },
    {
      id: "disease-relief",
      tier: "high",
      category: "disease-claim",
      pattern: /\b(relief|relieve|relieves)\b/i,
      message:
        "'Relief' framing implies treating a medical symptom.",
      fix: "Describe support of normal function instead of relief from a symptom.",
    },

    // ── Personal attributes (CRITICAL/HIGH) ──────────────────────────────────
    {
      id: "personal-attr-emotion",
      tier: "critical",
      category: "personal-attribute",
      pattern: /\b(embarrassed|ashamed|insecure|self-?conscious)\b/i,
      message:
        "Implies you know the viewer feels bad about a personal condition — violates Personal Attributes.",
      fix: "Speak to the aspiration, not the viewer's assumed insecurity.",
    },
    {
      id: "personal-attr-suffer",
      tier: "critical",
      category: "personal-attribute",
      pattern: /\b(suffer|suffering|struggling)\s+(from|with)\b/i,
      message:
        "Implies knowledge of the viewer's health condition — violates Personal Attributes.",
      fix: "Reframe around the goal, e.g. 'building a better routine?'",
    },
    {
      id: "personal-attr-soft",
      tier: "high",
      category: "personal-attribute",
      pattern: /\b(sick of|tired of)\b/i,
      message:
        "Desperation hook that can imply the viewer's condition — high-risk under Personal Attributes.",
      fix: "Use a positive, goal-oriented hook.",
    },

    // ── Prescription / drug adjacency (CRITICAL) ─────────────────────────────
    {
      id: "drug-prescription-strength",
      tier: "critical",
      category: "drug-adjacency",
      pattern: /prescription[-\s]?strength/i,
      message:
        "Positions a supplement/cosmetic as a drug — 'prescription-strength' is drug-adjacency.",
      fix: "Say 'high-quality formula' without drug positioning.",
      drugAdjacent: true,
    },
    {
      id: "drug-rx-active-name",
      tier: "critical",
      category: "drug-adjacency",
      pattern:
        /\b(finasteride|minoxidil|dutasteride|propecia|rogaine|semaglutide|ozempic|wegovy|tirzepatide|mounjaro|sildenafil|tadalafil|viagra|cialis)\b/i,
      message:
        "Names a prescription active as the benefit — requires online-pharmacy/telehealth authorization to advertise.",
      fix: "Describe your own formulation without naming Rx drugs or implying equivalence.",
      drugAdjacent: true,
    },
    {
      id: "drug-glp1",
      tier: "critical",
      category: "drug-adjacency",
      pattern: /\bglp-?1\b/i,
      message: "GLP-1 reference ties the product to prescription drug outcomes.",
      fix: "Do not tie the product to GLP-1 / weight-loss-drug results.",
      drugAdjacent: true,
    },
    {
      id: "drug-alternative-to",
      tier: "high",
      category: "drug-adjacency",
      pattern: /\balternative to\s+\w+/i,
      message:
        "'Alternative to [drug]' implies equivalence to a regulated product.",
      fix: "Avoid comparisons to drugs; describe what your product is.",
    },
    {
      id: "expert-prescriber",
      tier: "critical",
      category: "drug-adjacency",
      pattern: /\bdoctors?\s+(prescribe|recommend|use)\b/i,
      message:
        "Combines drug/prescriber authority with a product recommendation.",
      fix: "Keep expert credibility off the creative; no prescriber framing.",
      drugAdjacent: true,
    },

    // ── Misleading results / guarantees (HIGH) ───────────────────────────────
    {
      id: "claim-guaranteed",
      tier: "high",
      category: "unsubstantiated-claim",
      pattern: /\bguarantee(d|s)?\b/i,
      message: "Guaranteed health outcome — unsubstantiated and high-risk.",
      fix: "Reference a satisfaction/money-back guarantee (the offer), not the health result.",
    },
    {
      id: "claim-clinically-proven",
      tier: "high",
      category: "unsubstantiated-claim",
      pattern: /\bclinically\s+proven\b/i,
      message:
        "'Clinically proven' needs held clinical data; frequently rejected.",
      fix: "'Formulated with clinically studied ingredients' — only if true.",
    },
    {
      id: "claim-percentage",
      tier: "high",
      category: "quantified-claim",
      pattern: /\b\d{1,3}\s?%/,
      message: "Quantified outcome requires substantiation.",
      fix: "Remove the number; describe directional support over time.",
    },
    {
      id: "claim-fixed-timeline",
      tier: "high",
      category: "quantified-claim",
      pattern: /\bin\s+\d+\s+(days|weeks|months)\b/i,
      message: "A fixed timeline to a result reads as a medical promise.",
      fix: "Avoid promising results by a fixed date.",
    },
    {
      id: "claim-transformation-copy",
      tier: "high",
      category: "transformation",
      pattern: /before\s*(&|and|\/)?\s*after/i,
      message: "Before/after transformation framing is high-risk for health results.",
      fix: "Reframe to lived experience ('my routine feels effortless now').",
    },
    {
      id: "claim-miracle",
      tier: "high",
      category: "exaggerated-claim",
      pattern: /\b(miracle|life-?changing|total\s+reset|game-?changer)\b/i,
      message: "Miracle/exaggerated framing is treated as misleading.",
      fix: "Keep it grounded and aspirational, not miraculous.",
    },

    // ── Cautions (Tier 3) ────────────────────────────────────────────────────
    {
      id: "caution-absolute",
      tier: "caution",
      category: "absolute-claim",
      pattern: /\b(100%|completely|totally)\b/i,
      message: "Absolute language can read as an overpromise.",
      fix: "Soften absolutes.",
    },
    {
      id: "caution-buzzword",
      tier: "caution",
      category: "buzzword",
      pattern: /\b(nootropic|adaptogen|detox|hormone-?balancing)\b/i,
      message: "These buzzwords have been ruled as claims in some reviews.",
      fix: "Use structure-function framing instead.",
    },
  ],
  signals: [
    {
      id: "signal-before-after",
      signal: "beforeAfter",
      tier: "high",
      category: "transformation",
      message: "Before/after imagery is prohibited for health results.",
      fix: "Use lifestyle imagery of a confident person, product in daily use.",
    },
    {
      id: "signal-model-as-result",
      signal: "modelAsResult",
      tier: "high",
      category: "transformation",
      message: "Product next to a fit/healthy model is an implied transformation (2026 rule).",
      fix: "Show the product alone or in-use, with no implied result.",
    },
    {
      id: "signal-problem-area",
      signal: "problemAreaCloseup",
      tier: "high",
      category: "negative-self-perception",
      message: "Problem-area close-ups trigger negative-self-perception / body-shaming rules.",
      fix: "Use a full-person lifestyle shot.",
    },
    {
      id: "signal-expert-endorsement",
      signal: "expertEndorsement",
      tier: "high",
      category: "expert-endorsement",
      message: "A named professional endorsing a specific outcome is high-risk.",
      fix: "Keep experts to general ingredient education, off the creative.",
    },
    {
      id: "signal-missing-disclaimer",
      signal: "missingDisclaimer",
      tier: "high",
      category: "structural",
      message: "Supplement landing page is missing the FDA structure-function disclaimer.",
      fix: 'Add: "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease."',
    },
  ],
};
