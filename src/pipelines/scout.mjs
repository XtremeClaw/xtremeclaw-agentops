import { CONFIG } from '../config.mjs';
import { searchDexScreener, fetchLatestProfiles, fetchLatestBoosts, fetchPairsByToken } from '../providers/dexscreener.mjs';
import { classifyNarrative, ageHours, isProbablyGeneric } from '../engines/narrative.mjs';
import { scorePair, num } from '../engines/scoring.mjs';
import { evaluateRisk } from '../engines/risk.mjs';
import { confidenceTier, positionSizing } from '../engines/confidence.mjs';

function buildConfig(custom = {}) {
  const cleanCustom = Object.fromEntries(Object.entries(custom).filter(([, v]) => v !== undefined && v !== null));
  const mode = cleanCustom.mode || CONFIG.mode || 'balanced';
  const modeCfg = CONFIG.modes?.[mode] || CONFIG.modes.balanced;
  const merged = { ...CONFIG, ...modeCfg, ...cleanCustom, mode };
  if (!merged.chainAllowlist) merged.chainAllowlist = [];
  return merged;
}

function chainAllowed(pair, cfg) {
  if (!cfg.chainAllowlist.length) return true;
  return cfg.chainAllowlist.includes(String(pair.chainId || '').toLowerCase());
}

function qualityPass(pair, cfg) {
  const age = ageHours(pair.pairCreatedAt);
  if (age > cfg.maxAgeHours) return false;
  if (!chainAllowed(pair, cfg)) return false;

  if (num(pair.liquidity?.usd) < cfg.minLiquidityUsd) return false;
  if (num(pair.volume?.h1) < cfg.minVolume1h) return false;

  const h1 = num(pair.priceChange?.h1);
  const h24 = num(pair.priceChange?.h24);
  if (h1 < -35 || h24 < -70) return false;

  const buys = num(pair.txns?.h1?.buys);
  const sells = num(pair.txns?.h1?.sells);
  if (buys + sells > 0 && buys < sells * 0.6) return false;

  return true;
}

function toItem(pair, narrative, score) {
  const risk = evaluateRisk(pair);
  const meta = confidenceTier({
    score,
    riskScore: risk.riskScore,
    h1: num(pair.priceChange?.h1),
    h24: num(pair.priceChange?.h24),
    liquidity: num(pair.liquidity?.usd)
  });

  return {
    narrative,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    tokenAddress: pair.baseToken.address,
    pairAddress: pair.pairAddress,
    chain: pair.chainId,
    dex: pair.dexId,
    url: pair.url,
    ageHours: Math.max(0, Math.round(ageHours(pair.pairCreatedAt))),
    h1: num(pair.priceChange?.h1),
    h24: num(pair.priceChange?.h24),
    vol1h: num(pair.volume?.h1),
    liquidity: num(pair.liquidity?.usd),
    priceUsd: num(pair.priceUsd),
    score,
    riskScore: risk.riskScore,
    riskReasons: risk.riskReasons,
    safety: risk.safety,
    confidence: meta.tier,
    composite: meta.composite,
    positionSize: positionSizing(meta.tier)
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
      const narrative = classifyNarrative(p, q.key);
      if (!narrative) continue;

      const item = toItem(p, narrative, score);
      const prev = bucket.get(p.pairAddress);
      if (!prev || item.composite > prev.composite) bucket.set(p.pairAddress, item);
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
      if (!prev || item.composite > prev.composite) bucket.set(pair.pairAddress, item);
    }
  }
}

export async function runScout(custom = {}) {
  const cfg = buildConfig(custom);
  const dedupByPair = new Map();

  await fromSearch(cfg, dedupByPair);
  await fromFreshProfiles(cfg, dedupByPair);

  const dedupBySymbol = new Map();
  for (const item of dedupByPair.values()) {
    const key = `${item.chain}:${String(item.symbol).toLowerCase()}`;
    const prev = dedupBySymbol.get(key);
    if (!prev || item.composite > prev.composite) dedupBySymbol.set(key, item);
  }

  const picks = [...dedupBySymbol.values()]
    .sort((a, b) => b.composite - a.composite)
    .slice(0, cfg.maxPicks);

  return {
    generatedAt: new Date().toISOString(),
    mode: cfg.mode,
    filters: {
      chainAllowlist: cfg.chainAllowlist,
      maxAgeHours: cfg.maxAgeHours,
      minLiquidityUsd: cfg.minLiquidityUsd,
      minVolume1h: cfg.minVolume1h,
      minScore: cfg.minScore
    },
    picks
  };
}
