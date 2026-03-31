'use client';

import { useState } from 'react';

export function MockTradeButtons() {
  const [busy, setBusy] = useState(false);

  async function post(path: string, body?: any) {
    setBusy(true);
    try {
      await fetch(`/api/sim${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      // simplest: reload page to reflect server component data
      location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        disabled={busy}
        onClick={() => post('/_mock/open', { symbol: 'ETH', qty: 0.5, side: 'long' })}
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt1)', padding: '6px 10px', fontSize: 11, borderRadius: 4 }}
      >
        +0.5 ETH (mock)
      </button>
      <button
        disabled={busy}
        onClick={() => post('/_mock/close', { symbol: 'ETH' })}
        style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--txt2)', padding: '6px 10px', fontSize: 11, borderRadius: 4 }}
      >
        Close ETH
      </button>
    </div>
  );
}
