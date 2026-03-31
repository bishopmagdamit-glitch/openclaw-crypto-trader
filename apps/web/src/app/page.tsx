import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)' }}>OPENCLAW</div>
      <div style={{ marginTop: 10, color: 'var(--txt2)' }}>Trading sim UI</div>
      <div style={{ marginTop: 16 }}>
        <Link href="/terminal" style={{ padding: '6px 14px', borderRadius: 4, background: 'var(--goldfade)', color: 'var(--gold)' }}>
          Open Terminal
        </Link>
      </div>
    </main>
  );
}
