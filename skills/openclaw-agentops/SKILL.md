---
name: openclaw-agentops
description: Operate the XtremeClaw AgentOps repository to scan AI/Meme token momentum, generate ranked picks, and produce daily reports.
---

# OpenClaw AgentOps Skill

## Use this when
- User asks for AI/Meme token scouting
- User asks for fresh token momentum reports
- User asks for ranked watchlist generation from DexScreener

## Commands

```bash
npm run scan
npm run report
```

## Operational notes
- Tune thresholds in `src/config.mjs`
- Prefer report mode for audit trails (`reports/*.md`)
- Keep manual risk verification before publishing signals
