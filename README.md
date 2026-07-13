# adlint

**A linter for advertising copy.** Score ads against ad-platform policy — starting with Meta (Facebook/Instagram) Health & Wellness — *before* you launch, so a rejected ad never turns into a banned account.

**▶ Try it live: [meta-ads-compliance-checker.vercel.app](https://meta-ads-compliance-checker.vercel.app)** — the web checker, generated from this engine.

- 🧩 **Pluggable rulesets** — rules are plain data; add one without touching the engine.
- 🔌 **Zero dependencies, zero network calls** — runs in Node and the browser.
- 📊 **Two-dimensional scoring** — a 1–10 rejection risk *and* a separate account-ban risk.
- 🧪 **Typed and tested** — TypeScript, full test suite.

> ⚠️ **Not legal advice.** adlint encodes best-effort interpretations of public ad policies to help you catch obvious problems early. Policies change and rules can be wrong — always use your own judgment and, for high-stakes decisions, qualified counsel.

## Install

```bash
npm install adlint
```

## Quick start

```ts
import { checkAd } from "adlint";

const result = checkAd(
  {
    primaryText: "Regrow your hair — 40% more in 90 days, guaranteed.",
    landingPage: "The #1 way to reverse hair loss.",
    creative: { beforeAfter: true },
  },
  { ruleset: "maneup" }, // or "meta-health" (the generic default)
);

console.log(result.rejectionRisk); // 10
console.log(result.band);          // "red"
console.log(result.accountBanRisk);// "high"
console.log(result.verdict);       // "do-not-launch"

for (const f of result.flags) {
  console.log(`[${f.tier}] "${f.match}" — ${f.message}`);
  if (f.fix) console.log(`   fix: ${f.fix}`);
}
```

## The scoring model

Every check returns **two independent readouts**, because they answer different questions.

**A) Rejection Risk — 1 to 10** (will *this ad* get rejected?), anchored so scores are reproducible:

| Score | Band | Meaning |
|------:|:----:|---------|
| 1–2 | 🟢 green | Clean structure-function copy. Launch. |
| 3 | 🟢 green | Minor caution only. |
| 4–5 | 🟡 yellow | One high-risk issue. Rewrite first. |
| 6 | 🟡 yellow | Strong single high-risk issue. |
| 7–8 | 🔴 red | One critical, or two+ high. Do not launch. |
| 9–10 | 🔴 red | Multiple critical / overt drug or disease claims. |

**B) Account Ban Risk — `low` / `elevated` / `high`** (will this hurt *the account*?). This is **not** additive: a single prescription/drug-adjacent claim is `high` on its own, because that is the pattern that escalates from a rejected ad to a banned account. Re-submitting previously rejected creative also forces `high`.

## Input shape

```ts
interface AdInput {
  primaryText?: string;
  headline?: string;
  description?: string;
  onImageText?: string;   // text that appears inside the image/video
  landingPage?: string;   // the destination page is scored too
  creative?: {
    beforeAfter?: boolean;
    modelAsResult?: boolean;
    problemAreaCloseup?: boolean;
    expertEndorsement?: boolean;
    missingDisclaimer?: boolean;
  };
  product?: string;
  isResubmission?: boolean; // previously rejected without change → ban risk high
}
```

## Rulesets & presets

- **`meta-health`** — the generic Meta Health & Wellness ruleset. A good default for any health/DTC advertiser.
- **`maneup`** — a men's hair-loss/hormone preset that `extends` `meta-health` with niche rules (regrowth, testosterone, peptide compounds). Use it as a template for your own brand preset.

Bring your own ruleset inline:

```ts
import { checkAd, type Ruleset } from "adlint";

const myRules: Ruleset = {
  id: "my-brand",
  name: "My Brand",
  extends: "meta-health",
  rules: [
    {
      id: "no-cure-all",
      tier: "critical",
      category: "disease-claim",
      pattern: /\bcure-?all\b/i,
      message: "'Cure-all' is a disease claim.",
      fix: "Describe specific, structure-function benefits.",
    },
  ],
};

checkAd({ primaryText: "the cure-all tonic" }, { ruleset: myRules });
```

Or register it globally so other rulesets can `extends` it:

```ts
import { registerRuleset } from "adlint";
registerRuleset(myRules);
```

## Authoring rules

A rule is just data:

```ts
interface Rule {
  id: string;          // unique, kebab-case
  tier: "critical" | "high" | "caution";
  category: string;    // e.g. "disease-claim", "drug-adjacency"
  pattern: RegExp;     // matched against ad text (case-insensitive recommended)
  message: string;     // why it fails
  fix?: string;        // a compliant rewrite
  drugAdjacent?: boolean; // contributes to account-ban risk
  fields?: AdField[];  // limit to specific fields (default: all)
}
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add rules or a whole ruleset. New rulesets and better patterns are the most valuable contributions.

## API

| Export | Description |
|--------|-------------|
| `checkAd(ad, options?)` | Check an ad, returns a `CheckResult`. |
| `resolveRuleset(idOrObj)` | Flatten a ruleset's `extends` chain. |
| `registerRuleset(rs)` / `getRuleset(id)` / `listRulesets()` | Registry helpers. |
| `score`, `rejectionRisk`, `accountBanRisk`, `bandFor`, `verdictFor` | Scoring primitives. |
| `metaHealth`, `maneup`, `BUILTIN` | Built-in rulesets. |

## Web checker

A single-file web UI (paste your ad fields, tick the creative signals, drop the
ad image to OCR its on-image text) is generated straight from the engine, so
the rules never fork:

```bash
npm run build:web   # writes public/index.html — open it in any browser
```

The bundle is self-contained and offline-friendly; only the optional image OCR
(tesseract.js, lazy-loaded from a CDN on first use) needs a connection.

### Deploy

The repo ships a `vercel.json`, so deploying your own copy is one click:
import the repo on [Vercel](https://vercel.com/new) (or point Netlify/Pages at
`npm run build:web` with `public` as the output directory) and every push to
`main` redeploys the checker.

## Develop

```bash
npm install
npm run typecheck
npm test
npm run build       # library → dist/
npm run build:web   # web checker → public/index.html
```

## Roadmap

- More platform rulesets (TikTok, Google) as presets.
- Optional LLM "deep check" layer for nuance regex can't catch (implied claims, imagery, tone).
- CLI (`adlint ./ad.json`).

## License

[MIT](./LICENSE) © Maneup Labs
