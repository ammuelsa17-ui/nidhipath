import { NextResponse } from 'next/server';
import { fetchSchemesFromCloudDB, DatabaseConnectionError } from '../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schemes = await fetchSchemesFromCloudDB();
    return NextResponse.json({
      success: true,
      dataStatus: 'Authoritative PostgreSQL Database Dataset',
      schemes
    });
  } catch (err: any) {
    console.error('Error fetching schemes from database:', err?.message || err);
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('db') || k.toLowerCase().includes('postgres') || k.toLowerCase().includes('database') || k.toLowerCase().includes('url') || k.startsWith('VERCEL'));
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: err?.message || 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.',
        errName: err?.name,
        detectedEnvKeys: envKeys
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to query database.' }, { status: 500 });
  }
}
