const BASE = 'https://api.dexscreener.com';

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function searchDexScreener(query) {
  const data = await getJson(`${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`);
  return data?.pairs || [];
}

export async function fetchLatestProfiles() {
  const data = await getJson(`${BASE}/token-profiles/latest/v1`);
  return Array.isArray(data) ? data : [];
}

export async function fetchLatestBoosts() {
  const data = await getJson(`${BASE}/token-boosts/latest/v1`);
  return Array.isArray(data) ? data : [];
}

export async function fetchPairsByToken(tokenAddress) {
  const data = await getJson(`${BASE}/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`);
  return data?.pairs || [];
}

export async function fetchPairByAddress(chainId, pairAddress) {
  const data = await getJson(`${BASE}/latest/dex/pairs/${encodeURIComponent(chainId)}/${encodeURIComponent(pairAddress)}`);
  if (!data) return null;
  return data.pair || (data.pairs || [])[0] || null;
}
