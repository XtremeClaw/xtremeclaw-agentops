# XtremeClaw AgentOps

Professional OpenClaw-oriented AI agent toolkit focused on **AI/Meme narrative intelligence** and **early momentum discovery**.

## Why this project exists

Most repos stop at a single script. This project is structured as a reusable agent-ops foundation:

- Modular architecture (providers / engines / pipelines)
- Repeatable scanning with deterministic filters
- Report generation for publishing and review
- Ready to extend for alerts, memory, and autonomous execution

## Core capabilities (current)

- Scan DexScreener using AI/Meme-focused queries
- Filter for **newer pairs** and basic quality thresholds
- Rank tokens via a composite scoring model:
  - momentum (h1/h24)
  - activity (volume + txns)
  - liquidity quality
  - freshness boost
- Output machine-readable JSON
- Generate markdown reports in `reports/`

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

## Quick start

```bash
npm run scan
npm run report
```

## Example output

`npm run scan` prints JSON with:

- `generatedAt`
- `filters`
- `picks[]` (symbol, narrative, age, momentum, liquidity, score, URL)

## OpenClaw compatibility

A local skill brief is included:

- `skills/openclaw-agentops/SKILL.md`

Use it as operational guidance when this repo is controlled by an OpenClaw agent session.

## Security note

This project provides signal assistance, **not financial advice**.
Always verify contract safety manually before taking action.
