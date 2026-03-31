'use client';

import { useEffect, useMemo, useState } from 'react';

export function RunnerControls() {
  const [status, setStatus] = useState<any>(null);
  const [cfg, setCfg] = useState<any>(null);
  const [now, setNow] = useState(Date.now());

  async function refresh() {
    const [st, cf] = await Promise.all([
      fetch('/api/sim/status', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/sim/agent/config', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    ]);
    setStatus(st);
    setCfg(cf?.config || null);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const k = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(k);
  }, []);

  const paused = Boolean(status?.runnerPaused);
  const endsAt = Number(status?.cycleEndsAt || 0);
  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : Number(status?.cycleRemainingSec || 0);

  const prog = useMemo(() => {
    const interval = Number(cfg?.intervalMs || 30000) / 1000;
    if (!interval) return 0;
    return Math.max(0, Math.min(1, remaining / interval));
  }, [remaining, cfg]);

  async function post(path: string, body?: any) {
    await fetch(`/api/sim${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    refresh();
  }

  async function setSpeed(mult: number) {
    // speed slider maps 1..5x; base 30s / mult
    const base = 30000;
    const next = Math.max(5000, Math.round(base / mult));
    await post('/agent/config', { intervalMs: next });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: 999, background: paused ? 'var(--gold)' : 'var(--green)' }} />
        <div style={{ fontSize: 11, color: 'var(--txt2)' }}>{paused ? 'Runner paused' : 'Runner active'}</div>
      </div>

      <button
        onClick={() => post(paused ? '/runner/resume' : '/runner/pause')}
        style={{ background: 'var(--goldfade)', border: '1px solid rgba(240,185,11,.3)', color: 'var(--gold)', padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}
      >
        {paused ? 'RESUME' : 'PAUSE'}
      </button>
      <button
        onClick={() => post('/runner/step')}
        style={{ background: 'var(--bluefade)', border: '1px solid rgba(24,144,255,.3)', color: 'var(--blue)', padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}
      >
        STEP
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--txt2)' }}>Speed</div>
        <input type="range" min={1} max={5} step={1} defaultValue={2} onChange={(e) => setSpeed(Number(e.target.value))} />
      </div>

      <div style={{ width: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--txt2)' }}>
          <span>NEXT</span>
          <span style={{ color: 'var(--gold)' }}>{remaining || '--'}s</span>
        </div>
        <div style={{ marginTop: 3, height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: '100%', background: 'var(--gold)', transition: 'width .4s' }} />
        </div>
      </div>
    </div>
  );
}
