# XtremeClaw AgentOps

Production-ready AI/Meme scouting toolkit for OpenClaw agents and human traders.

Goal: help filter **newly deployed tokens** into a smaller list with better momentum/risk quality before manual buy decisions.

## What’s upgraded (v0.3)

- Multi-source discovery (search + latest profiles + boosts)
- Mode-based filtering: `strict`, `balanced`, `early`
- Risk engine with `riskScore` + `riskReasons[]`
- Confidence engine: `A / B / C / Avoid`
- Position sizing guidance per confidence tier
- Snapshot storage for tracking
- Backtest command for score validation
- Webhook alert mode for top A/B candidates

## Core commands

```bash
npm run doctor
npm run scan
npm run report
npm run snapshot
npm run backtest
npm run alert
```

### CLI flags

```bash
node src/index.mjs scan --mode strict --chains base,solana --max-picks 15
node src/index.mjs report --mode balanced
node src/index.mjs snapshot --mode early
node src/index.mjs backtest
node src/index.mjs alert --alert-webhook https://your-webhook-url
```

Supported overrides:
- `--mode strict|balanced|early`
- `--chains base,solana,...`
- `--max-picks 25`
- `--min-liq 15000`
- `--min-vol1h 1200`
- `--max-age 72`
- `--min-score 80`

## Output schema (scan)

Each pick includes:
- `symbol`, `name`, `narrative`
- `chain`, `dex`, `url`
- `pairAddress`, `tokenAddress`
- `ageHours`, `h1`, `h24`, `vol1h`, `liquidity`, `priceUsd`
- `score`
- `riskScore`, `riskReasons[]`, `safety`
- `confidence`, `composite`, `positionSize`

## Safety model (practical, no overclaim)

The toolkit is designed for **decision support**:
- Filters weak liquidity/volume and obvious downtrend pressure
- Adds transparent risk reasons
- Gives confidence tier + sizing hint

It does **not** guarantee safety. Always do final manual checks.

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
│   │   ├── scoring.mjs
│   │   ├── risk.mjs
│   │   └── confidence.mjs
│   └── pipelines/
│       ├── scout.mjs
│       └── backtest.mjs
├── data/
│   └── snapshots/
├── reports/
├── docs/
└── skills/
```

## OpenClaw integration

Use `skills/openclaw-agentops/SKILL.md` for standardized run flow inside OpenClaw sessions.

## Disclaimer

Not financial advice. Crypto tokens are high-risk assets.
