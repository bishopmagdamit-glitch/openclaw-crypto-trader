'use client';

import { useEffect, useMemo, useState } from 'react';
import { RunnerControls } from './RunnerControls';
import { MockTradeButtons } from './MockTradeButtons';

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ background: 'var(--bg1)', border: `1px solid var(--border)`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
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

export function TerminalLive() {
  const [status, setStatus] = useState<any>(null);
  const [ticker, setTicker] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);

  async function refresh() {
    const [st, tk, pf, ps, fd] = await Promise.all([
      fetch('/api/sim/status', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/sim/ticker', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/sim/portfolio', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/sim/positions', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/sim/feed', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    ]);

    setStatus(st && st.ok ? st : null);
    setTicker(tk && tk.ok ? tk : null);
    setPortfolio(pf && pf.ok ? pf : null);
    setPositions(ps && ps.ok ? ps.positions || [] : []);
    setFeedItems(fd && fd.ok ? fd.items || [] : []);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, []);

  const ethPx = ticker?.ETH?.price ? Number(ticker.ETH.price) : 0;

  const tickerRows = useMemo(() => {
    return [
      {
        sym: 'ETH',
        px: ethPx ? ethPx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
        ch: `${Number(ticker?.ETH?.changePct || 0).toFixed(2)}%`,
        up: Number(ticker?.ETH?.changePct || 0) >= 0,
      },
      {
        sym: 'USDC',
        px: '1.000',
        ch: '0.00%',
        up: true,
      },
    ];
  }, [ticker, ethPx]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 52, background: 'var(--bg1)', borderBottom: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 18, height: 18, background: 'var(--gold)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)' }}>OPENCLAW</div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 14 }}>
            <a href="/terminal" style={{ padding: '6px 14px', borderRadius: 4, color: 'var(--gold)', background: 'var(--goldfade)', letterSpacing: 0.5, fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>Terminal</a>
            <a href="/agent" style={{ padding: '6px 14px', borderRadius: 4, color: 'var(--txt2)', background: 'transparent', letterSpacing: 0.5, fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>Agent</a>
          </div>
        </div>
        <RunnerControls />
      </div>

      <div style={{ height: 34, background: 'var(--bg1)', borderBottom: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 28, overflow: 'hidden' }}>
        {tickerRows.map((x) => (
          <div key={x.sym} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{x.sym}</span>
            <span className="mono" style={{ fontSize: 12 }}>{x.px}</span>
            <span style={{ fontSize: 11, color: x.up ? 'var(--green)' : 'var(--red)' }}>{x.ch}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 280px' }}>
        <aside style={{ background: 'var(--bg1)', borderRight: `1px solid var(--border)`, padding: '16px 0' }}>
          <div style={{ padding: '4px 16px 6px', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Watchlist</div>
          <div style={{ padding: '7px 16px', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>ETH</div>
              <div style={{ fontSize: 11, color: 'var(--txt2)' }}>{ethPx ? `$${ethPx.toFixed(2)}` : '—'}</div>
            </div>
          </div>
        </aside>

        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
            <MetricCard
              label="Portfolio Value"
              value={portfolio && typeof portfolio.valueUsd === 'number' ? `$${portfolio.valueUsd.toFixed(0)}` : '—'}
              sub={portfolio && typeof portfolio.cashUsd === 'number' ? `Cash $${portfolio.cashUsd.toFixed(0)}` : '—'}
              color="var(--gold)"
            />
            <MetricCard
              label="Unrealized P&L"
              value={portfolio && typeof portfolio.unrealizedPnlUsd === 'number' ? `${portfolio.unrealizedPnlUsd >= 0 ? '+' : ''}$${portfolio.unrealizedPnlUsd.toFixed(0)}` : '—'}
              sub={portfolio && typeof portfolio.unrealizedPnlPct === 'number' ? `${portfolio.unrealizedPnlPct.toFixed(2)}%` : '—'}
              color={portfolio && portfolio.unrealizedPnlUsd < 0 ? 'var(--red)' : 'var(--green)'}
            />
            <MetricCard
              label="Exposure"
              value={portfolio && typeof portfolio.exposureUsd === 'number' ? `$${portfolio.exposureUsd.toFixed(0)}` : '—'}
              sub={portfolio && typeof portfolio.targetEthWeight === 'number' ? `Target ${(portfolio.targetEthWeight * 100).toFixed(0)}%` : '—'}
              color="var(--txt)"
            />
            <MetricCard
              label="ETH Price"
              value={ethPx ? `$${ethPx.toFixed(2)}` : '—'}
              sub={positions.length ? `Positions ${positions.length}` : 'No positions'}
              color="var(--txt)"
            />
          </div>

          <Panel title="Positions">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>{positions.length} open</div>
              <MockTradeButtons />
            </div>
            {positions.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>No positions.</div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.0fr 0.8fr 0.9fr 0.9fr 1.1fr 0.8fr', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  {['ASSET', 'QTY', 'ENTRY', 'MARK', 'P&L', 'OPENED'].map((h, i) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--txt3)', textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 0 }}>
                  {positions.map((p: any, idx: number) => (
                    <div key={String(p.symbol || idx)} className="mono" style={{ display: 'grid', gridTemplateColumns: '1.0fr 0.8fr 0.9fr 0.9fr 1.1fr 0.8fr', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ textAlign: 'left' }}>{String(p.symbol || '—')}</div>
                      <div style={{ textAlign: 'right' }}>{Number(p.qty || 0).toFixed(3)}</div>
                      <div style={{ textAlign: 'right' }}>${Number(p.entryPrice || 0).toFixed(2)}</div>
                      <div style={{ textAlign: 'right' }}>${Number(p.markPrice || 0).toFixed(2)}</div>
                      <div style={{ textAlign: 'right', color: Number(p.pnlUsd || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {Number(p.pnlUsd || 0) >= 0 ? '+' : ''}${Number(p.pnlUsd || 0).toFixed(0)} ({Number(p.pnlPct || 0).toFixed(2)}%)
                      </div>
                      <div style={{ textAlign: 'right' }}>{p.openedAt ? new Date(p.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </section>

        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <Panel title="Agent feed">
            {feedItems.length > 0 ? (
              <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflow: 'hidden' }}>
                {feedItems.slice(0, 6).map((it: any, idx: number) => (
                  <div key={it.ts || idx} style={{ background: 'var(--bg2)', borderRadius: 4, padding: '8px 10px', borderLeft: `3px solid var(--blue)` }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 3 }}>{String(it.kind || 'RUN').toUpperCase()}</div>
                    <div className="mono" style={{ fontSize: 11, lineHeight: 1.45 }}>{it.msg || '—'}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 3 }}>{it.ts ? new Date(it.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>Waiting for first cycle.</div>
            )}
          </Panel>

          <Panel title="System">
            <div className="mono" style={{ fontSize: 10, color: 'var(--txt2)', lineHeight: 1.6 }}>
              Last action: {status?.lastAction || '—'}
              <br />
              Runner paused: {String(Boolean(status?.runnerPaused))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
