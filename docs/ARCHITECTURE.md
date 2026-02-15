# Architecture

## Layers

1. **Providers**
   - DexScreener adapters (`search`, `profiles`, `boosts`, `pairs`)

2. **Engines**
   - `narrative`: AI/Meme classification and generic-token rejection
   - `scoring`: momentum + activity + liquidity + freshness
   - `risk`: risk scoring + reason generation
   - `confidence`: conviction tier + position sizing guidance

3. **Pipelines**
   - `scout`: discovery → filtering → scoring → risk/confidence
   - `backtest`: snapshot replay against latest pair prices

4. **Entry point**
   - `src/index.mjs` command router (`scan`, `report`, `snapshot`, `backtest`, `alert`, `doctor`)

## Data flow

Sources -> Normalize -> Quality gates -> Score -> Risk -> Confidence -> Output
