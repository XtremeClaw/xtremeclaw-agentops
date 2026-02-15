# Runbook

## Daily operation

1. Run `npm run scan`
2. Review top picks for quality and obvious traps
3. Run `npm run report` for saved snapshot
4. Publish insights manually or pass to downstream automation

## Troubleshooting

- Empty picks:
  - Loosen thresholds in `src/config.mjs`
  - Broaden query set
- Slow fetch:
  - Re-run in 1-2 minutes
  - Check DexScreener endpoint health
- Bad quality picks:
  - Raise `minLiquidityUsd`
  - Raise `minScore`
