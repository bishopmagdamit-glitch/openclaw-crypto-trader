import fetch from 'node-fetch';

const BASE = process.env.SIM_API_BASE || 'http://127.0.0.1:8790';
const INTERVAL_MS = Number(process.env.SIM_RUNNER_INTERVAL_MS || 30_000);

const TARGET_ETH_WEIGHT = 0.30; // 30%
const REBALANCE_DRIFT = 0.07; // 7 percentage points
const STOP_LOSS_PCT = -0.09; // -9%

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: { 'accept': 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${path}`);
  return (await r.json()) as T;
}

async function postJson<T>(path: string, body?: any): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'accept': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    // @ts-ignore
    return { ok: false, raw: text };
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function nowTs() {
  return Date.now();
}

async function logFeed(kind: string, msg: string, data?: any) {
  const entry = {
    ts: nowTs(),
    kind,
    msg,
    data: data || null,
  };
  await postJson('/_update', { feedAppend: entry, statusPatch: { lastDecision: msg } });
}

async function cycle() {
  const ticker: any = await getJson('/ticker');
  const portfolio: any = await getJson('/portfolio');
  const positionsRes: any = await getJson('/positions');
  const positions: any[] = positionsRes?.positions || [];

  const ethPx = Number(ticker?.ETH?.price || portfolio?.ethPx || 0);
  const valueUsd = Number(portfolio?.valueUsd || 0);
  const exposureUsd = Number(portfolio?.exposureUsd || 0);
  const cashUsd = Number(portfolio?.cashUsd || 0);

  const ethWeight = valueUsd > 0 ? exposureUsd / valueUsd : 0;
  const drift = ethWeight - TARGET_ETH_WEIGHT; // + means overweight

  const ethPos = positions.find((p) => (p.symbol || p.asset) === 'ETH');
  const qty = Number(ethPos?.qty || 0);
  const entry = Number(ethPos?.entryPrice || 0);
  const mark = Number(ethPos?.markPrice || ethPx || 0);
  const pnlPct = entry ? (mark - entry) / entry : 0;

  // 1) Balance first
  if (Math.abs(drift) >= REBALANCE_DRIFT && ethPx > 0) {
    const targetExposureUsd = TARGET_ETH_WEIGHT * valueUsd;
    const deltaUsd = targetExposureUsd - exposureUsd; // + means need buy

    // conservative sizing: trade up to 25% of cash or the required delta, whichever smaller
    const maxBuyUsd = cashUsd * 0.25;
    const buyUsd = clamp(deltaUsd, 0, maxBuyUsd);

    // For sell, just close position if overweight (ETH-only simplification)
    if (deltaUsd < 0 && qty !== 0) {
      await postJson('/_mock/close', { symbol: 'ETH' });
      await logFeed('rebalance', `REBALANCE: closed ETH to reduce weight (${(ethWeight * 100).toFixed(1)}%→${(TARGET_ETH_WEIGHT * 100).toFixed(0)}%)`, {
        ethWeight,
        target: TARGET_ETH_WEIGHT,
      });
      return;
    }

    if (buyUsd > 0) {
      const buyQty = buyUsd / ethPx;
      await postJson('/_mock/open', { symbol: 'ETH', qty: buyQty, side: 'long' });
      await logFeed('rebalance', `REBALANCE: bought ${(buyQty).toFixed(3)} ETH toward ${(TARGET_ETH_WEIGHT * 100).toFixed(0)}% target`, {
        buyUsd,
        ethPx,
        ethWeight,
        target: TARGET_ETH_WEIGHT,
      });
      return;
    }
  }

  // 2) Momentum second
  if (qty !== 0 && pnlPct <= STOP_LOSS_PCT) {
    await postJson('/_mock/close', { symbol: 'ETH' });
    await logFeed('momentum', `MOMENTUM: stop-loss hit (${(pnlPct * 100).toFixed(2)}%), closed ETH`, { pnlPct });
    return;
  }

  // simplified: no "buy winners" yet (needs recent window). We'll log HOLD.
  await logFeed('hold', `HOLD: balanced (${(ethWeight * 100).toFixed(1)}%), no stop-loss trigger`, { ethWeight, pnlPct });
}

async function main() {
  await logFeed('start', `RUNNER START: steady mode (30% ETH target), ${Math.round(INTERVAL_MS / 1000)}s cycle`);

  // loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const t0 = Date.now();
    try {
      await cycle();
    } catch (e: any) {
      await logFeed('error', `ERROR: ${String(e?.message || e)}`);
    }
    const dt = Date.now() - t0;
    const sleepMs = Math.max(1000, INTERVAL_MS - dt);
    await new Promise((r) => setTimeout(r, sleepMs));
  }
}

main();
