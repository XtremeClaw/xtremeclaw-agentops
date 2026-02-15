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
  const age = ageHours(pair.pairCreatedAt);

  const momentum = Math.max(-20, Math.min(45, h1)) * 1.8 + Math.max(-40, Math.min(130, h24)) * 0.32;
  const activity = Math.log10(v1h + 1) * 16 + Math.log10(v6h + 1) * 9 + (buys + sells) * 1.1;
  const liqScore = liq >= 120_000 ? 20 : liq >= 40_000 ? 12 : liq >= 12_000 ? 4 : -18;
  const fresh = age <= 6 ? 24 : age <= 24 ? 16 : age <= 72 ? 6 : -20;

  return Number((momentum + activity + liqScore + fresh).toFixed(2));
}
