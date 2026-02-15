import { readdir, readFile } from 'node:fs/promises';
import { fetchPairByAddress } from '../providers/dexscreener.mjs';

function pct(entry, current) {
  if (!entry || !current) return null;
  return ((current - entry) / entry) * 100;
}

export async function runBacktest({ snapshotPath } = {}) {
  let file = snapshotPath;

  if (!file) {
    const dir = new URL('../../data/snapshots/', import.meta.url);
    const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.json')).sort();
    if (!files.length) {
      return { ok: false, message: 'No snapshots found in data/snapshots' };
    }
    file = new URL(`../../data/snapshots/${files[files.length - 1]}`, import.meta.url);
  }

  const raw = await readFile(file, 'utf8');
  const snapshot = JSON.parse(raw);

  const results = [];
  for (const pick of snapshot.picks || []) {
    if (!pick.chain || !pick.pairAddress || !pick.priceUsd) continue;

    const live = await fetchPairByAddress(pick.chain, pick.pairAddress);
    if (!live) continue;

    const currentPrice = Number(live.priceUsd || 0);
    const ret = pct(Number(pick.priceUsd), currentPrice);

    results.push({
      symbol: pick.symbol,
      chain: pick.chain,
      confidence: pick.confidence,
      safety: pick.safety,
      entryPriceUsd: Number(pick.priceUsd),
      currentPriceUsd: currentPrice,
      returnPct: ret == null ? null : Number(ret.toFixed(2)),
      url: pick.url
    });
  }

  const valid = results.filter((r) => Number.isFinite(r.returnPct));
  const wins = valid.filter((r) => r.returnPct > 0).length;
  const avgReturn = valid.length ? valid.reduce((a, b) => a + b.returnPct, 0) / valid.length : 0;

  return {
    ok: true,
    snapshotGeneratedAt: snapshot.generatedAt,
    evaluatedAt: new Date().toISOString(),
    totalEvaluated: valid.length,
    winRatePct: valid.length ? Number(((wins / valid.length) * 100).toFixed(2)) : 0,
    avgReturnPct: Number(avgReturn.toFixed(2)),
    results: valid.sort((a, b) => b.returnPct - a.returnPct)
  };
}
