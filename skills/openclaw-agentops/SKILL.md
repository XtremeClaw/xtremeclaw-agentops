---
name: openclaw-agentops
description: Operate XtremeClaw AgentOps for AI/Meme token discovery, risk/confidence filtering, reporting, snapshot tracking, and webhook alerts.
---

# OpenClaw AgentOps Skill

## Use this when
- User asks for AI/Meme token scouting
- User asks for fresh token momentum reports
- User asks for watchlist candidates with risk/confidence labels
- User asks for signal tracking and performance review

## Commands

```bash
npm run scan
npm run report
npm run snapshot
npm run backtest
npm run alert
```

## Mode examples

```bash
node src/index.mjs scan --mode strict --chains base
node src/index.mjs scan --mode balanced --chains base,solana
node src/index.mjs scan --mode early --min-liq 3000 --min-vol1h 250
```

## Operational notes
- Default mode is `strict` for safer filtering
- Use `snapshot` + `backtest` to validate signal quality over time
- Alert only publishes A/B confidence non-risky picks
- Always do manual contract checks before execution
