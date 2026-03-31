import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

const app = express();
app.use(express.json());

const PORT = Number(process.env.SIM_API_PORT || 8790);


const AGENT_CONFIG_PATH = path.join(process.cwd(), 'agent-config.json');

function loadAgentConfig() {
  try {
    return JSON.parse(fs.readFileSync(AGENT_CONFIG_PATH, 'utf-8'));
  } catch {
    return {
      mode: 'steady',
      targetEthWeight: 0.30,
      rebalanceDrift: 0.07,
      stopLossPct: -0.09,
      intervalMs: 30000,
      soulPreset: 'Calm',
      instructions: '',
    };
  }
}

function saveAgentConfig(cfg: any) {
  fs.writeFileSync(AGENT_CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

let state = {
  agentConfig: loadAgentConfig(),
  chain: 'sepolia',
  ledger: process.env.LEDGER_ADDRESS || null,
  cycleIntervalSec: Number(process.env.TRADE_INTERVAL_SEC || 300),
  cycleEndsAt: Date.now() + 300_000,
  regime: 'NEUTRAL',
  trades: 0,
  lastDecision: 'waiting for first cycle…',
  ticker: {
    ETH: { price: 0, changePct: 0 },
    USDC: { price: 1, changePct: 0 },
  },
  portfolio: {
    valueUsd: 1000,
    startedUsd: 1000,
    pnlUsd: 0,
    pnlPct: 0,
    winRate: null as null | number,
    wins: 0,
    losses: 0,
    sharpe: null as null | number,
  },
  positions: [] as {
    asset: string;
    side: 'LONG' | 'SHORT';
    sizeUsd: number;
    entry: number;
    pnlUsd: number;
    pnlPct: number;
    stopLossPct?: number;
    confidence?: number;
  }[],
  signals: {
    fearGreed: 62,
    sentiment: 0.72,
    funding: 0.01,
  },
  feed: [
    { agent: 'RESEARCH', color: 'blue', msg: 'Waiting for first cycle.', ts: new Date().toISOString() },
  ] as { agent: string; color: string; msg: string; ts: string }[],
};


function computePortfolio() {
  const ethPx = Number(state.ticker?.ETH?.price || 0);
  const cashUsd = Number((state as any).cashUsd ?? 10_000);
  const positions = Array.isArray((state as any).positions) ? (state as any).positions : [];

  let exposureUsd = 0;
  let unrealizedPnlUsd = 0;

  for (const p of positions) {
    if (p.symbol !== 'ETH') continue;
    const qty = Number(p.qty || 0);
    const entry = Number(p.entryPrice || 0);
    const mark = ethPx || Number(p.markPrice || 0);
    const pnl = qty * (mark - entry);
    exposureUsd += qty * mark;
    unrealizedPnlUsd += pnl;
  }

  const valueUsd = cashUsd + exposureUsd;
  const pnlPct = valueUsd > 0 ? (unrealizedPnlUsd / valueUsd) * 100 : 0;

  return {
    valueUsd,
    cashUsd,
    exposureUsd,
    unrealizedPnlUsd,
    unrealizedPnlPct: pnlPct,
    ethPx,
    positionsCount: positions.length,
  };
}

app.get('/status', (req, res) => {
  const st = (state as any).status || {};
  res.json({ ok: true, ...st });
});

app.get('/agent/config', (_req, res) => {
  res.json({ ok: true, config: (state as any).agentConfig || loadAgentConfig() });
});

app.post('/agent/config', express.json(), (req, res) => {
  const next = { ...loadAgentConfig(), ...(req.body || {}) };
  (state as any).agentConfig = next;
  saveAgentConfig(next);
  res.json({ ok: true, config: next });
});


app.get('/ticker', (_req, res) => res.json({ ok: true, ...state.ticker }));
app.get('/portfolio', (req, res) => {
  const p = computePortfolio();
  res.json({ ok: true, ...p });
});

app.get('/positions', (req, res) => {
  const ethPx = Number(state.ticker?.ETH?.price || 0);
  const positions = Array.isArray((state as any).positions) ? (state as any).positions : [];
  const out = positions.map((p: any) => {
    const qty = Number(p.qty || 0);
    const entry = Number(p.entryPrice || 0);
    const mark = p.symbol === 'ETH' && ethPx ? ethPx : Number(p.markPrice || 0);
    const pnlUsd = qty * (mark - entry);
    const pnlPct = entry ? ((mark - entry) / entry) * 100 : 0;
    return {
      ...p,
      markPrice: mark,
      pnlUsd,
      pnlPct,
    };
  });
  res.json({ ok: true, positions: out });
});

app.get('/signals', (_req, res) => res.json({ ok: true, ...state.signals }));
app.get('/feed', (req, res) => {
  const feed = Array.isArray((state as any).feed) ? (state as any).feed : [];
  res.json({ ok: true, items: feed.slice(-50).reverse() });
});


app.post('/_update', express.json(), (req, res) => {
  const body = req.body || {};

  // feedAppend: push one item
  if (body.feedAppend) {
    const feed = Array.isArray((state as any).feed) ? (state as any).feed : [];
    feed.push(body.feedAppend);
    (state as any).feed = feed.slice(-500);
  }

  // statusPatch: shallow merge
  if (body.statusPatch) {
    (state as any).status = { ...((state as any).status || {}), ...body.statusPatch };
  }

  res.json({ ok: true });
});


async function updatePrices() {
  try {
    const spot: any = await fetchJson('https://api.coinbase.com/v2/prices/ETH-USD/spot');
    const px = Number(spot?.data?.amount || 0);
    // 24h change not provided by this endpoint; keep last changePct as-is
    if (Number.isFinite(px) && px > 0) {
      state = {
        ...state,
        ticker: {
          ...state.ticker,
          ETH: { price: px, changePct: state.ticker?.ETH?.changePct ?? 0 }
        }
      };
    }
  } catch {
    // ignore
  }
}

setInterval(updatePrices, 30_000);
updatePrices();


// Mock trading helpers (dev only)
app.post('/_mock/open', express.json(), (req, res) => {
  const symbol = String((req.query.symbol || req.body?.symbol || 'ETH')).toUpperCase();
  const side = String((req.query.side || req.body?.side || 'long')).toLowerCase();
  const qty = Number(req.query.qty || req.body?.qty || 1);
  const px = symbol === 'ETH' ? Number(state.ticker?.ETH?.price || 0) : 0;
  if (!px) return res.status(400).json({ ok: false, error: 'no price yet' });

  const positions = Array.isArray((state as any).positions) ? (state as any).positions : [];
  const signedQty = side == 'short' ? -Math.abs(qty) : Math.abs(qty);

  // replace existing position for symbol
  const next = positions.filter((p: any) => p.symbol !== symbol);
  next.push({ symbol, qty: signedQty, entryPrice: px, openedAt: Date.now() });
  state = { ...(state as any), positions: next };

  res.json({ ok: true, position: next.find((p: any) => p.symbol === symbol) });
});

app.post('/_mock/close', express.json(), (req, res) => {
  const symbol = String((req.query.symbol || req.body?.symbol || 'ETH')).toUpperCase();
  const positions = Array.isArray((state as any).positions) ? (state as any).positions : [];
  const next = positions.filter((p: any) => p.symbol !== symbol);
  state = { ...(state as any), positions: next };
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`sim api listening on ${PORT}`);
});
