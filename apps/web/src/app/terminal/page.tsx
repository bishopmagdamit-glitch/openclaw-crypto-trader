import { headers } from 'next/headers';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Portfolio = {
  valueUsd: number;
  startedUsd: number;
  pnlUsd: number;
  pnlPct: number;
  wins: number;
  losses: number;
  winRate: number | null;
  sharpe: number | null;
};

type FeedItem = { agent: string; color: string; msg: string; ts: string };
type Ticker = { ETH: { price: number; changePct: number }; USDC: { price: number; changePct: number } };

type Signals = { fearGreed: number; sentiment: number; funding: number };
type Position = { asset: string; side: 'LONG' | 'SHORT'; sizeUsd: number; entry: number; pnlUsd: number; pnlPct: number; stopLossPct?: number; confidence?: number };

type Status = {
  lastDecision?: string;
  cycle?: { remainingSec?: number };
  chain?: string;
  ledger?: string | null;
  trades?: number;
};

async function fetchJSON(path: string) {
  try {
    const h = await headers();
    const proto = h.get('x-forwarded-proto') || 'https';
    const host = h.get('x-forwarded-host') || h.get('host');
    const base = host ? `${proto}://${host}` : '';
    const res = await fetch(`${base}/api/sim${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchStatus(): Promise<Status | null> {
  const base = process.env.NEXT_PUBLIC_SIM_API_BASE;
  if (!base) return null;
  const res = await fetch(`${base}/status`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

function HexLogo() {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        background: 'var(--gold)',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
    />
  );
}

function Topbar({ status }: { status: Status | null }) {
  const remaining = status?.cycle?.remainingSec;
  return (
    <div
      style={{
        height: 52,
        background: 'var(--bg1)',
        borderBottom: `1px solid var(--border)`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HexLogo />
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)' }}>OPENCLAW</div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 14 }}>
          {['Terminal', 'Research', 'Memory', 'Journal', 'Settings'].map((t) => (
            <div
              key={t}
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                color: t === 'Terminal' ? 'var(--gold)' : 'var(--txt2)',
                background: t === 'Terminal' ? 'var(--goldfade)' : 'transparent',
                letterSpacing: 0.5,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: '3px 10px', borderRadius: 12, background: 'var(--goldfade)', color: 'var(--gold)', fontWeight: 600, fontSize: 10, letterSpacing: 0.5 }}>
          NEUTRAL
        </div>
        <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--green)', opacity: 0.9 }} />
        <div className="mono" style={{ background: 'var(--bg2)', border: `1px solid var(--border2)`, borderRadius: 4, padding: '3px 10px', color: 'var(--gold)', fontSize: 11 }}>
          cycle {typeof remaining === 'number' ? `${remaining}s` : '--'}
        </div>
      </div>
    </div>

  );
}

function Ticker({ ticker }: { ticker: Ticker | null }) {
  const rows = [
    {
      sym: 'ETH',
      px: ticker?.ETH?.price ? Number(ticker.ETH.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
      ch: ticker?.ETH ? `${Number(ticker.ETH.changePct || 0).toFixed(2)}%` : '—',
      up: (ticker?.ETH?.changePct ?? 0) >= 0,
    },
    {
      sym: 'USDC',
      px: ticker?.USDC?.price ? Number(ticker.USDC.price).toFixed(3) : '—',
      ch: ticker?.USDC ? `${Number(ticker.USDC.changePct || 0).toFixed(2)}%` : '—',
      up: (ticker?.USDC?.changePct ?? 0) >= 0,
    },
  ];

  return (
    <>
      <div
        style={{
          height: 34,
          background: 'var(--bg1)',
          borderBottom: `1px solid var(--border)`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 28,
          overflow: 'hidden',
        }}
      >
        {rows.map((x) => (
          <div key={x.sym} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{x.sym}</span>
            <span className="mono" style={{ fontSize: 12 }}>{x.px}</span>
            <span style={{ fontSize: 11, color: x.up ? 'var(--green)' : 'var(--red)' }}>{x.ch}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Statusbar({ status }: { status: Status | null }) {
  return (
    <div style={{ height: 28, background: 'var(--bg1)', borderTop: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
      <div className="mono" style={{ display: 'flex', gap: 20, fontSize: 10, color: 'var(--txt2)' }}>
        <span>
          <span style={{ color: 'var(--txt3)' }}>CHAIN</span> {status?.chain || 'sepolia'}
        </span>
        <span>
          <span style={{ color: 'var(--txt3)' }}>CONTRACT</span> {status?.ledger ? String(status.ledger).slice(0, 6) + '…' : '—'}
        </span>
        <span>
          <span style={{ color: 'var(--txt3)' }}>TRADES</span> {status?.trades ?? 0}
        </span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--gold)' }}>
        LAST DECISION: {status?.lastDecision || '—'}
      </div>
    </div>

  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: 'var(--bg1)', border: `1px solid var(--border)`, borderRadius: 6, padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg1)', border: `1px solid var(--border)`, borderRadius: 6, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.8, color: 'var(--txt2)', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color }}>{value}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--txt2)', marginTop: 4 }}>{sub}</div>
    </div>

  );
}

export default async function Terminal() {
  const [status, portfolioRes, feedRes, signalsRes, positionsRes, tickerRes] = await Promise.all([
    fetchStatus(),
    fetchJSON('/portfolio'),
    fetchJSON('/feed'),
    fetchJSON('/signals'),
    fetchJSON('/positions'),
    fetchJSON('/ticker'),
  ]);

  const portfolio: Portfolio | null = portfolioRes && portfolioRes.ok ? portfolioRes : null;
  const feed: FeedItem[] = feedRes && feedRes.ok ? (feedRes.items || []) : [];
  const signals: Signals | null = signalsRes && signalsRes.ok ? signalsRes : null;
  const positions: Position[] = positionsRes && positionsRes.ok ? (positionsRes.positions || []) : [];
  const ticker: Ticker | null = tickerRes && tickerRes.ok ? tickerRes : null;


  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar status={status} />
      <Ticker ticker={ticker} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 280px' }}>
        <aside style={{ background: 'var(--bg1)', borderRight: `1px solid var(--border)`, padding: '16px 0' }}>
          <div style={{ padding: '4px 16px 6px', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Watchlist</div>
          <div style={{ padding: '7px 16px', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>ETH</div>
              <div style={{ fontSize: 11, color: 'var(--green)' }}>—</div>
            </div>
          </div>

          <div style={{ padding: '4px 16px 6px', marginTop: 12, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Allocation</div>
          <div style={{ padding: '7px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--txt2)' }}>
              <span>USDC</span>
              <span className="mono">100%</span>
            </div>
            <div style={{ marginTop: 6, background: 'var(--bg3)', height: 3, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--txt3)' }} />
            </div>
          </div>

          <div style={{ padding: '4px 16px 6px', marginTop: 12, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Risk</div>
          <div style={{ padding: '7px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--txt2)' }}>Max trade</span>
            <span className="mono" style={{ color: 'var(--green)' }}>
              $50
            </span>
          </div>
        </aside>

        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            <MetricCard
              label="Portfolio Value"
              value={portfolio && typeof (portfolio as any).valueUsd === 'number' ? `$${(portfolio as any).valueUsd.toFixed(0)}` : '—'}
              sub={portfolio ? `Started at $${portfolio.startedUsd.toFixed(0)}` : '—'}
              color="var(--gold)"
            />
            <MetricCard
              label="Total P&L"
              value={portfolio ? `${portfolio.pnlUsd >= 0 ? '+' : ''}$${portfolio.pnlUsd.toFixed(0)}` : '—'}
              sub={portfolio ? `${portfolio.pnlPct.toFixed(2)}%` : '—'}
              color={portfolio ? (portfolio.pnlUsd >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--txt)'}
            />
            <MetricCard
              label="Win Rate"
              value={portfolio && portfolio.winRate !== null ? `${(portfolio.winRate * 100).toFixed(0)}%` : '—'}
              sub={portfolio ? `${portfolio.wins} wins / ${portfolio.losses} losses` : '—'}
              color="var(--txt)"
            />
            <MetricCard
              label="Sharpe"
              value={portfolio && portfolio.sharpe !== null ? portfolio.sharpe.toFixed(2) : '—'}
              sub="30-day rolling"
              color="var(--gold)"
            />
          </div>

          <Panel title="Portfolio">
            <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>
              chart placeholder
            </div>
          </Panel>

          <Panel title="Positions">
            {positions.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>No positions.</div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.9fr 0.9fr 0.9fr 0.8fr', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  {['ASSET','SIDE','SIZE','ENTRY','P&L','CONF'].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--txt3)' }}>{h}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 0 }}>
                  {positions.map((p) => (
                    <div key={p.asset} className="mono" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.9fr 0.9fr 0.9fr 0.8fr', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>{p.asset}</div>
                      <div style={{ color: p.side === 'LONG' ? 'var(--green)' : 'var(--red)' }}>{p.side}</div>
                      <div style={{ textAlign: 'right' }}>${p.sizeUsd.toFixed(0)}</div>
                      <div style={{ textAlign: 'right' }}>${p.entry.toFixed(2)}</div>
                      <div style={{ textAlign: 'right', color: p.pnlUsd >= 0 ? 'var(--green)' : 'var(--red)' }}>{p.pnlUsd >= 0 ? '+' : ''}${p.pnlUsd.toFixed(0)} ({p.pnlPct.toFixed(2)}%)</div>
                      <div style={{ textAlign: 'right', color: 'var(--gold)' }}>{(p.confidence ?? 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </section>

        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <Panel title="Agent feed">
            <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflow: 'hidden' }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 4, padding: '8px 10px', borderLeft: `3px solid var(--blue)` }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 3 }}>RESEARCH</div>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.45 }}>Waiting for first cycle.</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 3 }}>—</div>
              </div>
            </div>
          </Panel>

          <Panel title="Signals">
            {signals ? (
              <div>
                {[
                  { n: 'Fear&Greed', v: signals.fearGreed, c: 'var(--gold)' },
                  { n: 'Sentiment', v: Math.round(signals.sentiment * 100), c: 'var(--green)' },
                  { n: 'Funding', v: Math.min(100, Math.max(0, Math.round((signals.funding + 0.05) * 1000))), c: 'var(--gold)' },
                ].map((x) => (
                  <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 90, flexShrink: 0, fontSize: 11, color: 'var(--txt2)' }}>{x.n}</div>
                    <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${x.v}%`, height: '100%', background: x.c }} />
                    </div>
                    <div className="mono" style={{ width: 32, textAlign: 'right', fontSize: 10, color: 'var(--txt2)' }}>{x.n === 'Funding' ? signals.funding.toFixed(3) : x.n === 'Sentiment' ? signals.sentiment.toFixed(2) : String(signals.fearGreed)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>No signals.</div>
            )}
          </Panel>

          <Panel title="Memory">
            <div style={{ background: 'var(--bg2)', borderRadius: 4, padding: '8px 10px' }}>
              <div style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, background: 'var(--goldfade)', color: 'var(--gold)', marginBottom: 4 }}>LESSON</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--txt2)', lineHeight: 1.5 }}>Awaiting first trade cycle.</div>
            </div>
          </Panel>
        </section>
      </div>

      <Statusbar status={status} />
    </main>
  );
}
