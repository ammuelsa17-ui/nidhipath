import { NextRequest, NextResponse } from 'next/server';
import { fetchDecisionTraceFromDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trace = await fetchDecisionTraceFromDB(id);

    if (!trace) {
      return NextResponse.json({ error: 'NOT_FOUND', message: `Decision trace with ID '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({ success: true, trace });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch decision trace.' }, { status: 500 });
  }
}
