export function confidenceTier({ score, riskScore, h1, h24, liquidity }) {
  const composite = score * 0.55 + riskScore * 0.45;

  if (composite >= 120 && riskScore >= 78 && h1 >= 0 && h24 >= -15 && liquidity >= 30000) {
    return { tier: 'A', composite: Number(composite.toFixed(2)) };
  }

  if (composite >= 95 && riskScore >= 62 && h24 >= -30) {
    return { tier: 'B', composite: Number(composite.toFixed(2)) };
  }

  if (composite >= 75 && riskScore >= 45) {
    return { tier: 'C', composite: Number(composite.toFixed(2)) };
  }

  return { tier: 'Avoid', composite: Number(composite.toFixed(2)) };
}

export function positionSizing(tier) {
  if (tier === 'A') return '1.00x (full risk unit)';
  if (tier === 'B') return '0.50x (half risk unit)';
  if (tier === 'C') return '0.25x (probe only)';
  return '0.00x (skip)';
}
