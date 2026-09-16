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
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to query database.' }, { status: 500 });
  }
}
