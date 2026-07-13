# Contributing to adlint

Thanks for helping make ad compliance less painful. Contributions of all sizes are welcome — especially new rules and rulesets.

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/adlint.git
cd adlint
npm install
npm test
```

## Ways to contribute

### Add or improve a rule (most common)
Rules live in `src/rulesets/`. Each rule is plain data — a regex pattern, a tier, a policy explanation, and a suggested fix. You do not need to touch the engine to add one.

1. Open the relevant ruleset (e.g. `src/rulesets/meta-health.ts`).
2. Add a `Rule` object to the `rules` array. Give it a unique, kebab-case `id`.
3. Add a test in `test/` that proves it fires on a violating example and does **not** fire on a compliant one.
4. `npm test` and open a PR.

### Add a new ruleset or preset
- A **ruleset** targets a platform/policy area (e.g. `tiktok-health`).
- A **preset** narrows a ruleset to a niche (e.g. a hair-loss brand) via `extends`.
- Register it in `src/rulesets/index.ts` so it's discoverable.

### Guidelines
- Keep the core engine dependency-free. Rules are data, not code.
- Every rule needs a `message` (why it fails) and, where possible, a `fix` (a compliant rewrite).
- Prefer precise patterns over broad ones; false positives erode trust.
- Cite the policy source in the rule's `message` or a code comment when you can.

## Not legal advice
adlint encodes best-effort interpretations of public ad policies. It is a developer tool, not legal advice. Rules can be wrong or out of date — that's exactly why contributions matter.

## Code of Conduct
By participating you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
