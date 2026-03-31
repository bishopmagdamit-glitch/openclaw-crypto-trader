import { headers } from 'next/headers';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export default async function AgentPage() {
  const cfgRes = await fetchJSON('/agent/config');
  const cfg = cfgRes?.config || {};

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg0)', color: 'var(--txt)' }}>
      <div style={{ padding: 16, maxWidth: 920, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 12 }}>Agent Config</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <section style={{ background: 'var(--bg1)', border: `1px solid var(--border)`, borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 10 }}>Runner (Live)</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)', lineHeight: 1.6 }}>
              Mode: {String(cfg.mode || 'steady')}
              <br />
              Target ETH: {Math.round(Number(cfg.targetEthWeight ?? 0.3) * 100)}%
              <br />
              Rebalance drift: {Math.round(Number(cfg.rebalanceDrift ?? 0.07) * 100)}%
              <br />
              Stop-loss: {Math.round(Number(cfg.stopLossPct ?? -0.09) * 100)}%
              <br />
              Cycle: {Math.round(Number(cfg.intervalMs ?? 30000) / 1000)}s
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--txt2)' }}>
              (UI controls next — this is the live config readout.)
            </div>
          </section>

          <section style={{ background: 'var(--bg1)', border: `1px solid var(--border)`, borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 10 }}>Soul</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--txt2)', lineHeight: 1.6 }}>
              Preset: {String(cfg.soulPreset || 'Calm')}
              <br />
              Instructions: {cfg.instructions ? String(cfg.instructions).slice(0, 140) : '—'}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--txt2)' }}>
              Saved now, will fully drive decisions once LLM brain is enabled.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
