import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

const PORT = Number(process.env.SIM_API_PORT || 8790);

// In-memory state (we'll back with sqlite next)
let state = {
  chain: 'sepolia',
  ledger: process.env.LEDGER_ADDRESS || null,
  cycleIntervalSec: Number(process.env.TRADE_INTERVAL_SEC || 300),
  cycleEndsAt: Date.now() + 300_000,
  regime: 'NEUTRAL',
  trades: 0,
  lastDecision: 'waiting for first cycle…',
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
  positions: [] as any[],
  signals: {
    fearGreed: 62,
    sentiment: 0.72,
    funding: 0.01,
  },
  feed: [
    { agent: 'RESEARCH', color: 'blue', msg: 'Waiting for first cycle.', ts: new Date().toISOString() },
  ],
};

app.get('/status', (_req, res) => {
  const now = Date.now();
  const remainingMs = Math.max(0, state.cycleEndsAt - now);
  res.json({
    ok: true,
    chain: state.chain,
    ledger: state.ledger,
    regime: state.regime,
    trades: state.trades,
    cycle: {
      intervalSec: state.cycleIntervalSec,
      endsAt: state.cycleEndsAt,
      remainingSec: Math.floor(remainingMs / 1000),
    },
    lastDecision: state.lastDecision,
  });
});

app.get('/portfolio', (_req, res) => res.json({ ok: true, ...state.portfolio }));
app.get('/positions', (_req, res) => res.json({ ok: true, positions: state.positions }));
app.get('/signals', (_req, res) => res.json({ ok: true, ...state.signals }));
app.get('/feed', (_req, res) => res.json({ ok: true, items: state.feed.slice(-20).reverse() }));

// internal endpoint to update (runner will call)
app.post('/_update', (req, res) => {
  state = { ...state, ...(req.body || {}) };
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`sim api listening on ${PORT}`);
});
