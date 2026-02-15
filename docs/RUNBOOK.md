# Runbook

## Daily flow (recommended)

1. `npm run scan` (strict mode default)
2. If too few picks, run balanced/early mode:
   - `node src/index.mjs scan --mode balanced`
3. Save a session snapshot:
   - `npm run snapshot`
4. Generate report for review:
   - `npm run report`
5. Track signal quality over time:
   - `npm run backtest`

## Alerting

Use webhook mode for ops channels:

```bash
node src/index.mjs alert --mode strict --alert-webhook https://your-webhook-url
```

Only A/B confidence + non-Risky picks are sent.

## Troubleshooting

- `picks: []`
  - Market may be weak or API temporarily limited
  - Try `--mode balanced` or `--mode early`
  - Relax thresholds (`--min-liq`, `--min-vol1h`, `--min-score`)
- `backtest totalEvaluated: 0`
  - No valid snapshot picks yet or snapshot too recent
  - Run snapshot during active market and retry later
