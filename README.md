# xtremeclaw-agentops

# XtremeClaw Agent (AI/Meme Scout)

Agent utility for scanning **new AI/Meme tokens** with momentum potential from DexScreener.

## What it does

- Searches narratives: `ai agent`, `ai meme`, `meme ai`
- Filters to newer pairs only (<= 96h)
- Scores by momentum, activity, liquidity, and freshness
- Outputs ranked picks in JSON
- Optional markdown report generation

## Quick start

```bash
cd xtremeclaw-agent
npm run scan
```

Generate markdown report:

```bash
npm run report
```

Reports are saved to `reports/`.

## Intended use

- Daily watchlist generation
- Inputs for Telegram alerts
- Inputs for X/Twitter market commentary

## Notes

- This is a signal assistant, not financial advice.
- You should still manually validate contract risk and liquidity traps.
