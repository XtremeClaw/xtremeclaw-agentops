import { mkdir, writeFile } from 'node:fs/promises';
import { runScout } from './pipelines/scout.mjs';

const args = process.argv.slice(2);
const report = args.includes('--report');

const payload = await runScout();
console.log(JSON.stringify(payload, null, 2));

if (report) {
  await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const lines = [
    '# XtremeClaw AgentOps Report',
    '',
    `Generated: ${payload.generatedAt}`,
    '',
    '## Top Picks',
    ...payload.picks.map((p, i) => `${i + 1}. **${p.symbol}** (${p.narrative}) · h1 ${p.h1.toFixed(2)}% · age ${p.ageHours}h · liq $${Math.round(p.liquidity).toLocaleString()} · ${p.url}`)
  ];

  await writeFile(new URL(`../reports/${ts}.md`, import.meta.url), lines.join('\n'), 'utf8');
}
