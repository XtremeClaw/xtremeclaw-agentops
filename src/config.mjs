export const CONFIG = {
  queries: [
    { key: 'ai agent', label: 'AI Agents' },
    { key: 'ai meme', label: 'AI Meme' },
    { key: 'meme coin ai', label: 'Meme AI' }
  ],
  maxAgeHours: 96,
  minLiquidityUsd: 3000,
  minVolume1h: 20,
  minScore: 12,
  maxPicks: 20,
  maxProfiles: 35,
  narrativeKeywords: {
    'AI Agents': ['agent', 'agents', 'bot', 'autonomous', 'copilot', 'assistant'],
    'AI Meme': ['meme', 'memecoin', 'shitcoin', 'degen', 'frog', 'dog', 'cat'],
    'Meme AI': ['ai', 'gpt', 'llm', 'inference', 'neural']
  }
};
