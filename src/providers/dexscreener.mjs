export async function searchDexScreener(query) {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.pairs || [];
}
