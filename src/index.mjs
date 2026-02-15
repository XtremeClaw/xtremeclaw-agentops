import { mkdir, writeFile } from 'node:fs/promises';
import { runScout } from './pipelines/scout.mjs';
import { runBacktest } from './pipelines/backtest.mjs';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      args._.push(a);
      continue;
    }

    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function parseChains(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function toBool(v) {
  if (v === true) return true;
  if (v === false || v == null) return false;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

async function saveJsonSnapshot(payload) {
  await mkdir(new URL('../data/snapshots/', import.meta.url), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const path = new URL(`../data/snapshots/${ts}.json`, import.meta.url);
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf8');
  return `data/snapshots/${ts}.json`;
}

async function saveMarkdownReport(payload) {
  await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const lines = [
    '# XtremeClaw AgentOps Report',
    '',
    `Generated: ${payload.generatedAt}`,
    `Mode: ${payload.mode}`,
    '',
    '## Top Picks',
    ...payload.picks.map(
      (p, i) =>
        `${i + 1}. **${p.symbol}** (${p.narrative}) · ${p.chain} · conf ${p.confidence} · safety ${p.safety} · score ${p.score.toFixed(2)} · risk ${p.riskScore} · h1 ${p.h1.toFixed(2)}% · liq $${Math.round(p.liquidity).toLocaleString()} · ${p.url}`
    )
  ];

  const path = new URL(`../reports/${ts}.md`, import.meta.url);
  await writeFile(path, lines.join('\n'), 'utf8');
  return `reports/${ts}.md`;
}

async function sendWebhookAlert(payload, webhookUrl) {
  const picks = payload.picks.filter((p) => ['A', 'B'].includes(p.confidence) && p.safety !== 'Risky').slice(0, 5);
  if (!picks.length) return { sent: false, reason: 'No A/B non-risky picks' };

  const text = [
    `XtremeClaw Alert (${payload.mode})`,
    ...picks.map(
      (p, i) =>
        `${i + 1}) ${p.symbol} ${p.chain} | conf ${p.confidence} | safety ${p.safety} | h1 ${p.h1.toFixed(2)}% | liq $${Math.round(p.liquidity).toLocaleString()} | ${p.url}`
    )
  ].join('\n');

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, generatedAt: payload.generatedAt, picks })
  });

  return { sent: res.ok, status: res.status };
}

const args = parseArgs(process.argv.slice(2));
const command = (args._[0] || 'scan').toLowerCase();

if (command === 'doctor') {
  console.log(JSON.stringify({ node: process.version, runtime: 'ok', timestamp: new Date().toISOString() }, null, 2));
  process.exit(0);
}

if (command === 'backtest') {
  const out = await runBacktest({ snapshotPath: args.snapshot });
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const payload = await runScout({
  mode: args.mode,
  chainAllowlist: parseChains(args.chains),
  maxPicks: args['max-picks'] ? Number(args['max-picks']) : undefined,
  minLiquidityUsd: args['min-liq'] ? Number(args['min-liq']) : undefined,
  minVolume1h: args['min-vol1h'] ? Number(args['min-vol1h']) : undefined,
  maxAgeHours: args['max-age'] ? Number(args['max-age']) : undefined,
  minScore: args['min-score'] ? Number(args['min-score']) : undefined
});

let reportPath;
let snapshotPath;
let alertResult;

if (command === 'report' || toBool(args.report)) {
  reportPath = await saveMarkdownReport(payload);
}
if (command === 'snapshot' || toBool(args.snapshot)) {
  snapshotPath = await saveJsonSnapshot(payload);
}
if (command === 'alert' || args['alert-webhook'] || process.env.ALERT_WEBHOOK_URL) {
  const url = args['alert-webhook'] || process.env.ALERT_WEBHOOK_URL;
  if (url) alertResult = await sendWebhookAlert(payload, url);
}

console.log(
  JSON.stringify(
    {
      ...payload,
      outputs: {
        reportPath,
        snapshotPath,
        alert: alertResult
      }
    },
    null,
    2
  )
);
