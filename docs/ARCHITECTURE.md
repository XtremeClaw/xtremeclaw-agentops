# Architecture

## Layers

1. **Providers**
   - External data source integrations
   - Current: DexScreener search API

2. **Engines**
   - Deterministic logic modules
   - Narrative classifier
   - Score model

3. **Pipelines**
   - Orchestrate provider + engines
   - Deduplicate and rank picks

4. **Entry points**
   - CLI (`src/index.mjs`)
   - JSON/stdout output
   - Markdown report output

## Data flow

Query -> Fetch pairs -> Quality filters -> Score -> Rank -> Output
