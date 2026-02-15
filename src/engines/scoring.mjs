import { ageHours } from './narrative.mjs';

export const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function scorePair(pair) {
  const h1 = num(pair.priceChange?.h1);
  const h24 = num(pair.priceChange?.h24);
  const v1h = num(pair.volume?.h1);
  const v6h = num(pair.volume?.h6);
  const liq = num(pair.liquidity?.usd);
  const buys = num(pair.txns?.h1?.buys);
  const sells = num(pair.txns?.h1?.sells);
  const tx = Math.min(120, buys + sells);
  const age = ageHours(pair.pairCreatedAt);

  const momentum = Math.max(-25, Math.min(55, h1)) * 1.1 + Math.max(-60, Math.min(140, h24)) * 0.22;
  const activity = Math.log10(v1h + 1) * 10 + Math.log10(v6h + 1) * 6 + tx * 0.16;
  const liqScore = liq >= 120_000 ? 16 : liq >= 40_000 ? 10 : liq >= 12_000 ? 4 : -10;
  const fresh = age <= 6 ? 14 : age <= 24 ? 9 : age <= 72 ? 3 : -8;

  return Number((momentum + activity + liqScore + fresh).toFixed(2));
}
