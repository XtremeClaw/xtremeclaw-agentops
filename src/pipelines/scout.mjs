import { CONFIG } from '../config.mjs';
import { searchDexScreener, fetchLatestProfiles, fetchLatestBoosts, fetchPairsByToken } from '../providers/dexscreener.mjs';
import { classifyNarrative, ageHours, isProbablyGeneric } from '../engines/narrative.mjs';
import { scorePair, num } from '../engines/scoring.mjs';

function qualityPass(pair, cfg) {
  const age = ageHours(pair.pairCreatedAt);
  if (age > cfg.maxAgeHours) return false;
  if (num(pair.liquidity?.usd) < cfg.minLiquidityUsd) return false;
  if (num(pair.volume?.h1) < cfg.minVolume1h) return false;

  const h1 = num(pair.priceChange?.h1);
  const h24 = num(pair.priceChange?.h24);
  if (h1 < -70 && h24 < -90) return false;

  return true;
}

function toItem(pair, narrative, score) {
  return {
    narrative,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    chain: pair.chainId,
    dex: pair.dexId,
    url: pair.url,
    ageHours: Math.max(0, Math.round(ageHours(pair.pairCreatedAt))),
    h1: num(pair.priceChange?.h1),
    h24: num(pair.priceChange?.h24),
    vol1h: num(pair.volume?.h1),
    liquidity: num(pair.liquidity?.usd),
    score
  };
}

async function fromSearch(cfg, bucket) {
  for (const q of cfg.queries) {
    const pairs = await searchDexScreener(q.key);
    for (const p of pairs) {
      if (!p?.pairAddress || !p?.baseToken?.symbol) continue;
      if (!qualityPass(p, cfg)) continue;

      const score = scorePair(p);
      if (score < cfg.minScore) continue;
      const narrative = classifyNarrative(p, '');
      if (!narrative) continue;

      const item = toItem(p, narrative, score);
      const prev = bucket.get(p.pairAddress);
      if (!prev || item.score > prev.score) bucket.set(p.pairAddress, item);
    }
  }
}

async function fromFreshProfiles(cfg, bucket) {
  const profiles = (await fetchLatestProfiles()).slice(0, cfg.maxProfiles);
  const boosts = await fetchLatestBoosts();
  const contextByToken = new Map();

  for (const p of profiles) {
    const ctx = `${p.description || ''} ${(p.links || []).map((l) => l.type).join(' ')}`;
    contextByToken.set(String(p.tokenAddress || ''), ctx);
  }
  for (const b of boosts) {
    const prev = contextByToken.get(String(b.tokenAddress || '')) || '';
    contextByToken.set(String(b.tokenAddress || ''), `${prev} ${b.description || ''}`.trim());
  }

  for (const p of profiles) {
    const token = p.tokenAddress;
    if (!token) continue;

    const pairs = await fetchPairsByToken(token);
    for (const pair of pairs) {
      if (!pair?.pairAddress || !pair?.baseToken?.symbol) continue;
      if (!qualityPass(pair, cfg)) continue;
      if (isProbablyGeneric(pair)) continue;

      const score = scorePair(pair);
      if (score < cfg.minScore) continue;

      const context = contextByToken.get(String(token)) || '';
      const narrative = classifyNarrative(pair, context);
      if (!narrative) continue;

      const item = toItem(pair, narrative, score);
      const prev = bucket.get(pair.pairAddress);
      if (!prev || item.score > prev.score) bucket.set(pair.pairAddress, item);
    }
  }
}

export async function runScout(custom = {}) {
  const cfg = { ...CONFIG, ...custom };
  const dedupByPair = new Map();

  await fromSearch(cfg, dedupByPair);
  await fromFreshProfiles(cfg, dedupByPair);

  // avoid spam by same symbol on same chain
  const dedupBySymbol = new Map();
  for (const item of dedupByPair.values()) {
    const key = `${item.chain}:${String(item.symbol).toLowerCase()}`;
    const prev = dedupBySymbol.get(key);
    if (!prev || item.score > prev.score) dedupBySymbol.set(key, item);
  }

  const picks = [...dedupBySymbol.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, cfg.maxPicks);

  return {
    generatedAt: new Date().toISOString(),
    filters: {
      maxAgeHours: cfg.maxAgeHours,
      minLiquidityUsd: cfg.minLiquidityUsd,
      minVolume1h: cfg.minVolume1h,
      minScore: cfg.minScore
    },
    picks
  };
}
