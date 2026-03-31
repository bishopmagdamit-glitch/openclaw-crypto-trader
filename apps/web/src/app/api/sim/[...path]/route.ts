import { NextResponse } from 'next/server';

const base = process.env.SIM_API_BASE;

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    if (!base) return NextResponse.json({ ok: false, error: 'missing SIM_API_BASE' }, { status: 500 });
    const { path } = await ctx.params;
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const target = `${base}/${path.join('/')}${qs ? `?${qs}` : ''}`;
    const res = await fetch(target, { cache: 'no-store' });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
