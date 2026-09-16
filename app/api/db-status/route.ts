import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rawUrl = typeof process !== 'undefined' ? (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || process.env.NEXT_PUBLIC_DATABASE_URL) : undefined;
  const dbUrl = (rawUrl || '').trim();

  const info = {
    hasDbUrl: Boolean(dbUrl),
    rawType: typeof rawUrl,
    length: dbUrl.length,
    prefix: dbUrl ? dbUrl.substring(0, 15) + '...' : 'NONE',
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
  };

  if (!dbUrl) {
    return NextResponse.json({ status: 'NO_URL', info }, { status: 503 });
  }

  try {
    const mod = 'pg';
    const { Pool } = await import(mod);
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    const res = await pool.query('SELECT NOW() as current_time, COUNT(*) as scheme_count FROM schemes');
    await pool.end();

    return NextResponse.json({
      status: 'CONNECTED',
      info,
      queryResult: res.rows[0]
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'CONNECTION_ERROR',
      info,
      errorName: err?.name,
      errorMessage: err?.message || String(err)
    }, { status: 500 });
  }
}
