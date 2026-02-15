export function classifyNarrative(pair, fallback = 'AI Broad') {
  const blob = `${pair?.baseToken?.name || ''} ${pair?.baseToken?.symbol || ''}`.toLowerCase();
  if (blob.includes('meme')) return 'Meme AI';
  if (blob.includes('agent') || blob.includes('bot')) return 'AI Agents';
  if (blob.includes('ai')) return 'AI';
  return fallback;
}

export function ageHours(pairCreatedAt) {
  if (!pairCreatedAt) return 9999;
  return (Date.now() - Number(pairCreatedAt)) / 36e5;
}
