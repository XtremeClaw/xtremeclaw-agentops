import { CONFIG } from '../config.mjs';
import { searchDexScreener } from '../providers/dexscreener.mjs';
import { classifyNarrative, ageHours } from '../engines/narrative.mjs';
import { scorePair, num } from '../engines/scoring.mjs';

export async function runScout(custom = {}) {
  const cfg = { ...CONFIG, ...custom };
  const dedup = new Map();

  for (const q of cfg.queries) {
    const pairs = await searchDexScreener(q.key);

    for (const p of pairs) {
      if (!p?.pairAddress || !p?.baseToken?.symbol) continue;

      const age = ageHours(p.pairCreatedAt);
      if (age > cfg.maxAgeHours) continue;
      if (num(p.liquidity?.usd) < cfg.minLiquidityUsd) continue;
      if (num(p.volume?.h1) < cfg.minVolume1h) continue;

      const score = scorePair(p);
      if (score < cfg.minScore) continue;

      const item = {
        narrative: classifyNarrative(p, q.label),
        symbol: p.baseToken.symbol,
        name: p.baseToken.name,
        chain: p.chainId,
        dex: p.dexId,
        url: p.url,
        ageHours: Math.max(0, Math.round(age)),
        h1: num(p.priceChange?.h1),
        h24: num(p.priceChange?.h24),
        vol1h: num(p.volume?.h1),
        liquidity: num(p.liquidity?.usd),
        score
      };

      const prev = dedup.get(p.pairAddress);
      if (!prev || item.score > prev.score) dedup.set(p.pairAddress, item);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    filters: {
      maxAgeHours: cfg.maxAgeHours,
      minLiquidityUsd: cfg.minLiquidityUsd,
      minVolume1h: cfg.minVolume1h,
      minScore: cfg.minScore
    },
    picks: [...dedup.values()].sort((a, b) => b.score - a.score).slice(0, cfg.maxPicks)
  };
}
