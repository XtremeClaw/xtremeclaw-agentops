export const CONFIG = {
  queries: [
    { key: 'ai agent', label: 'AI Agents' },
    { key: 'ai meme', label: 'AI Meme' },
    { key: 'meme coin ai', label: 'AI Meme' },
    { key: 'grok ai', label: 'AI' }
  ],
  maxPicks: 25,
  maxProfiles: 60,
  mode: 'strict',
  chainAllowlist: [], // empty = all chains
  modes: {
    strict: {
      maxAgeHours: 72,
      minLiquidityUsd: 15000,
      minVolume1h: 1200,
      minScore: 80
    },
    balanced: {
      maxAgeHours: 96,
      minLiquidityUsd: 10000,
      minVolume1h: 1000,
      minScore: 60
    },
    early: {
      maxAgeHours: 48,
      minLiquidityUsd: 3000,
      minVolume1h: 250,
      minScore: 35
    }
  }
};
