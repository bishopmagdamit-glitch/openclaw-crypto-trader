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

function Topbar() {
  return (
    <div style={{ height: 52, background: 'var(--bg1)', borderBottom: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HexLogo />
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)' }}>OPENCLAW</div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 14 }}>
          {['Terminal', 'Research', 'Memory', 'Journal', 'Settings'].map((t) => (
            <div key={t} style={{ padding: '6px 14px', borderRadius: 4, color: t === 'Terminal' ? 'var(--gold)' : 'var(--txt2)', background: t === 'Terminal' ? 'var(--goldfade)' : 'transparent', letterSpacing: 0.5, fontWeight: 500, fontSize: 13 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: '3px 10px', borderRadius: 12, background: 'var(--goldfade)', color: 'var(--gold)', fontWeight: 600, fontSize: 10, letterSpacing: 0.5 }}>NEUTRAL</div>
        <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--green)', opacity: 0.9 }} />
        <div className="mono" style={{ background: 'var(--bg2)', border: `1px solid var(--border2)`, borderRadius: 4, padding: '3px 10px', color: 'var(--gold)', fontSize: 11 }}>
          cycle 00:42
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  return (
    <div style={{ height: 34, background: 'var(--bg1)', borderBottom: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 28, overflow: 'hidden' }}>
      {[
        { sym: 'ETH', px: '3,420.15', ch: '+1.2%', up: true },
        { sym: 'USDC', px: '1.000', ch: '0.0%', up: true },
      ].map((x) => (
        <div key={x.sym} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{x.sym}</span>
          <span className="mono" style={{ fontSize: 12 }}>{x.px}</span>
          <span style={{ fontSize: 11, color: x.up ? 'var(--green)' : 'var(--red)' }}>{x.ch}</span>
        </div>
      ))}
    </div>
  );
}

function Statusbar() {
  return (
    <div style={{ height: 28, background: 'var(--bg1)', borderTop: `1px solid var(--border)`, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
      <div className="mono" style={{ display: 'flex', gap: 20, fontSize: 10, color: 'var(--txt2)' }}>
        <span><span style={{ color: 'var(--txt3)' }}>CHAIN</span> sepolia</span>
        <span><span style={{ color: 'var(--txt3)' }}>CONTRACT</span> —</span>
        <span><span style={{ color: 'var(--txt3)' }}>GAS</span> —</span>
        <span><span style={{ color: 'var(--txt3)' }}>TRADES</span> 0</span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--gold)' }}>
        LAST DECISION: waiting for first cycle…
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

export default function Terminal() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <Ticker />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 280px' }}>
        {/* Sidebar */}
        <aside style={{ background: 'var(--bg1)', borderRight: `1px solid var(--border)`, padding: '16px 0' }}>
          <div style={{ padding: '4px 16px 6px', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Watchlist</div>
          <div style={{ padding: '7px 16px', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>ETH</div>
              <div style={{ fontSize: 11, color: 'var(--green)' }}>+1.2%</div>
            </div>
          </div>

          <div style={{ padding: '4px 16px 6px', marginTop: 12, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Allocation</div>
          <div style={{ padding: '7px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--txt2)' }}>
              <span>USDC</span><span className="mono">100%</span>
            </div>
            <div style={{ marginTop: 6, background: 'var(--bg3)', height: 3, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--txt3)' }} />
            </div>
          </div>

          <div style={{ padding: '4px 16px 6px', marginTop: 12, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--txt3)' }}>Risk</div>
          <div style={{ padding: '7px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--txt2)' }}>Max trade</span><span className="mono" style={{ color: 'var(--green)' }}>$50</span>
          </div>
        </aside>

        {/* Center */}
        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            <MetricCard label="Portfolio Value" value="$1,000" sub="Started at $1,000" color="var(--gold)" />
            <MetricCard label="Total P&L" value="+$0" sub="0.00%" color="var(--green)" />
            <MetricCard label="Win Rate" value="—" sub="0 wins / 0 losses" color="var(--txt)" />
            <MetricCard label="Sharpe" value="—" sub="30-day rolling" color="var(--gold)" />
          </div>

          <Panel title="Portfolio">
            <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>
              chart placeholder
            </div>
          </Panel>

          <Panel title="Positions">
            <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>No positions.</div>
          </Panel>
        </section>

        {/* Right */}
        <section style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <Panel title="Agent feed">
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 4, padding: '8px 10px', borderLeft: `3px solid var(--blue)` }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 3 }}>RESEARCH</div>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.45 }}>Waiting for first cycle.</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 3 }}>—</div>
              </div>
            </div>
          </Panel>

          <Panel title="Signals">
            {[
              { n: 'Fear&Greed', v: 62, c: 'var(--gold)' },
              { n: 'Sentiment', v: 72, c: 'var(--green)' },
              { n: 'Funding', v: 40, c: 'var(--gold)' },
            ].map((x) => (
              <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 90, flexShrink: 0, fontSize: 11, color: 'var(--txt2)' }}>{x.n}</div>
                <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${x.v}%`, height: '100%', background: x.c }} />
                </div>
                <div className="mono" style={{ width: 32, textAlign: 'right', fontSize: 10, color: 'var(--txt2)' }}>{Math.round(x.v / 10) / 10}</div>
              </div>
            ))}
          </Panel>

          <Panel title="Memory">
            <div style={{ background: 'var(--bg2)', borderRadius: 4, padding: '8px 10px' }}>
              <div style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, background: 'var(--goldfade)', color: 'var(--gold)', marginBottom: 4 }}>LESSON</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--txt2)', lineHeight: 1.5 }}>Awaiting first trade cycle.</div>
            </div>
          </Panel>
        </section>
      </div>

      <Statusbar />
    </main>
  );
}
