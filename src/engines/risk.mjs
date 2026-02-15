import { num } from './scoring.mjs';
import { ageHours } from './narrative.mjs';

export function evaluateRisk(pair) {
  const reasons = [];
  let score = 100;

  const liq = num(pair.liquidity?.usd);
  const vol1h = num(pair.volume?.h1);
  const h1 = num(pair.priceChange?.h1);
  const h24 = num(pair.priceChange?.h24);
  const buys = num(pair.txns?.h1?.buys);
  const sells = num(pair.txns?.h1?.sells);
  const age = ageHours(pair.pairCreatedAt);
  const fdv = num(pair.fdv);
  const mcap = num(pair.marketCap);

  if (liq < 5000) {
    score -= 28;
    reasons.push('Low liquidity (<$5k)');
  } else if (liq < 15000) {
    score -= 12;
    reasons.push('Thin liquidity (<$15k)');
  }

  if (vol1h < 500) {
    score -= 15;
    reasons.push('Low 1h volume');
  }

  if (h1 < -25) {
    score -= 16;
    reasons.push('Strong negative 1h momentum');
  }

  if (h24 < -60) {
    score -= 12;
    reasons.push('Weak 24h trend');
  }

  if (buys + sells > 0 && buys < sells * 0.65) {
    score -= 14;
    reasons.push('Sell pressure dominates buys');
  }

  if (age <= 2) {
    score -= 8;
    reasons.push('Very new pair (high uncertainty)');
  }

  if (mcap > 0 && fdv > 0 && fdv / mcap > 3.5) {
    score -= 10;
    reasons.push('FDV/MarketCap gap is high');
  }

  if (fdv > 0 && liq > 0 && liq / fdv < 0.012) {
    score -= 10;
    reasons.push('Low liquidity-to-FDV ratio');
  }

  score = Math.max(0, Math.min(100, score));

  let safety = 'Risky';
  if (score >= 75) safety = 'Safer';
  else if (score >= 55) safety = 'Moderate';

  return {
    riskScore: score,
    safety,
    riskReasons: reasons.slice(0, 5)
  };
}
