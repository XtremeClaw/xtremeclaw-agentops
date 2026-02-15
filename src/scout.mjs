import { mkdir, writeFile } from 'node:fs/promises';

const QUERIES = [
  { key: 'ai', label: 'AI Broad' },
  { key: 'ai meme', label: 'AI Meme' },
  { key: 'meme ai', label: 'Meme AI' }
];

const MAX_AGE_HOURS = 240;
const MIN_LIQ_USD = 1000;
const MIN_VOL_1H = 1;
const MIN_SCORE = 4;

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function ageHours(pairCreatedAt) {
  if (!pairCreatedAt) return 9999;
  return (Date.now() - Number(pairCreatedAt)) / 36e5;
}

function classifyNarrative(pair, fallback) {
  const blob = `${pair?.baseToken?.name || ''} ${pair?.baseToken?.symbol || ''}`.toLowerCase();
  if (blob.includes('meme')) return 'Meme AI';
  if (blob.includes('agent') || blob.includes('bot')) return 'AI Agents';
  if (blob.includes('ai')) return 'AI';
  return fallback;
}

function scorePair(p) {
  const h1 = num(p.priceChange?.h1);
  const h24 = num(p.priceChange?.h24);
  const v1h = num(p.volume?.h1);
  const v6h = num(p.volume?.h6);
  const liq = num(p.liquidity?.usd);
  const buys = num(p.txns?.h1?.buys);
  const sells = num(p.txns?.h1?.sells);
  const age = ageHours(p.pairCreatedAt);

  const momentum = Math.max(-20, Math.min(45, h1)) * 1.8 + Math.max(-40, Math.min(130, h24)) * 0.32;
  const activity = Math.log10(v1h + 1) * 16 + Math.log10(v6h + 1) * 9 + (buys + sells) * 1.1;
  const liqScore = liq >= 120_000 ? 20 : liq >= 40_000 ? 12 : liq >= 12_000 ? 4 : -18;
  const fresh = age <= 6 ? 24 : age <= 24 ? 16 : age <= 72 ? 6 : -20;

  return Number((momentum + activity + liqScore + fresh).toFixed(2));
}

async function fetchPairs(query) {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.pairs || [];
}

async function run() {
  const map = new Map();

  for (const q of QUERIES) {
    const pairs = await fetchPairs(q.key);

    for (const p of pairs) {
      if (!p?.pairAddress || !p?.baseToken?.symbol) continue;

      const age = ageHours(p.pairCreatedAt);
      if (age > MAX_AGE_HOURS) continue;
      if (num(p.liquidity?.usd) < MIN_LIQ_USD) continue;
      if (num(p.volume?.h1) < MIN_VOL_1H) continue;

      const score = scorePair(p);
      if (score < MIN_SCORE) continue;

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

      const prev = map.get(p.pairAddress);
      if (!prev || item.score > prev.score) map.set(p.pairAddress, item);
    }
  }

  const picks = [...map.values()].sort((a, b) => b.score - a.score).slice(0, 20);

  const payload = {
    generatedAt: new Date().toISOString(),
    filters: { maxAgeHours: MAX_AGE_HOURS, minLiqUsd: MIN_LIQ_USD, minVol1h: MIN_VOL_1H, minScore: MIN_SCORE },
    picks
  };

  console.log(JSON.stringify(payload, null, 2));

  if (process.argv.includes('--report')) {
    await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const md = [
      `# XtremeClaw Agent Report`,
      ``,
      `Generated: ${payload.generatedAt}`,
      ``,
      `## Top Picks`,
      ...picks.map((p, i) => `${i + 1}. **${p.symbol}** (${p.narrative}) — h1: ${p.h1.toFixed(2)}%, age: ${p.ageHours}h, liq: $${Math.round(p.liquidity).toLocaleString()} — ${p.url}`)
    ].join('\n');

    const file = new URL(`../reports/${ts}.md`, import.meta.url);
    await writeFile(file, md, 'utf8');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
