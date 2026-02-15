# XtremeClaw AgentOps

Production-style AI/Meme market scouting toolkit for OpenClaw agents and human operators.

XtremeClaw AgentOps helps you detect **newer tokens with momentum** while applying minimum quality and safety filters before adding them to a watchlist.

---

## What this project does

- Scans DexScreener with AI/Meme-focused discovery flow
- Prioritizes **recent pairs** (fresh deployments)
- Filters low-quality candidates (liquidity, volume, negative momentum patterns)
- Scores candidates using a transparent composite model
- Adds a practical **safety tag** (`Safer`, `Moderate`, `Risky`)
- Exports machine-readable JSON and markdown reports

---

## Key features

### 1) Fresh token discovery
Data is gathered from:
- DexScreener search API
- DexScreener latest token profiles
- DexScreener token boosts
- Pair resolution per token (`/latest/dex/tokens/{tokenAddress}`)

### 2) Quality and risk gates
Default gates (tunable in `src/config.mjs`):
- `maxAgeHours: 96`
- `minLiquidityUsd: 10000`
- `minVolume1h: 1000`
- `minScore: 60`

Additional guards:
- remove generic/noisy symbols
- reject collapsing momentum patterns
- reject weak buy/sell pressure profiles
- deduplicate by pair and symbol/chain

### 3) Scoring model
Composite score uses:
- short-term momentum (`h1`, `h24`)
- trading activity (`volume`, `txns`)
- liquidity quality
- freshness boost

### 4) Safety tag
Each pick includes:
- `Safer`
- `Moderate`
- `Risky`

This is a signal aid, not a guarantee.

---

## Project structure

```text
xtremeclaw-agentops/
├── src/
│   ├── config.mjs
│   ├── index.mjs
│   ├── providers/
│   │   └── dexscreener.mjs
│   ├── engines/
│   │   ├── narrative.mjs
│   │   └── scoring.mjs
│   └── pipelines/
│       └── scout.mjs
├── docs/
│   ├── ARCHITECTURE.md
│   ├── RUNBOOK.md
│   └── ROADMAP.md
├── skills/
│   └── openclaw-agentops/
│       └── SKILL.md
└── reports/
```

---

## Quick start

```bash
npm run doctor
npm run scan
npm run report
```

- `scan` prints JSON to stdout
- `report` saves markdown snapshot into `reports/`

---

## Output format

`npm run scan` returns:
- `generatedAt`
- `filters`
- `picks[]` with:
  - `symbol`, `name`, `narrative`
  - `chain`, `dex`, `url`
  - `ageHours`
  - `h1`, `h24`
  - `vol1h`, `liquidity`
  - `score`
  - `safety`

---

## OpenClaw integration

This repo includes a local skill profile for agent sessions:

- `skills/openclaw-agentops/SKILL.md`

Use it to standardize operation flow when this toolkit is executed by OpenClaw agents.

---

## Professional usage notes

- Treat output as **decision support**, not auto-buy logic.
- Always run manual contract checks before entering a position.
- Prefer staged entries and strict risk limits.
- Keep threshold tuning versioned in Git (auditability).

---

## Disclaimer

Not financial advice. Crypto assets are high risk.
