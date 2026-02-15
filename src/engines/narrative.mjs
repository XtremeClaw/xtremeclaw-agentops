export function ageHours(pairCreatedAt) {
  if (!pairCreatedAt) return 9999;
  return (Date.now() - Number(pairCreatedAt)) / 36e5;
}

const AI_WORDS = ['ai', 'agent', 'agents', 'bot', 'gpt', 'llm', 'grok', 'neural', 'inference', 'autonomous'];
const MEME_WORDS = ['meme', 'memecoin', 'dog', 'cat', 'frog', 'pepe', 'degen', 'shitcoin'];

function hasAny(text, words) {
  return words.some((w) => text.includes(w));
}

export function classifyNarrative(pair, context = '') {
  const blob = `${pair?.baseToken?.name || ''} ${pair?.baseToken?.symbol || ''} ${context}`.toLowerCase();

  const ai = hasAny(blob, AI_WORDS);
  const meme = hasAny(blob, MEME_WORDS);
  const agent = /\bagent\b|\bbot\b|autonomous/.test(blob);

  if (!ai) return null;
  if (ai && meme) return 'AI Meme';
  if (agent) return 'AI Agents';
  return 'AI';
}

export function isProbablyGeneric(pair) {
  const sym = String(pair?.baseToken?.symbol || '').trim().toLowerCase();
  const name = String(pair?.baseToken?.name || '').trim().toLowerCase();

  return sym === 'ai' || name === 'ai' || name === 'artificial intelligence' || name.length <= 2;
}
