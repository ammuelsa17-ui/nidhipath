import { NextRequest, NextResponse } from 'next/server';
import { logDecisionTraceToDB, DatabaseConnectionError } from '../../../lib/db/client';
import { DecisionLogTrace } from '../../../types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const trace: DecisionLogTrace = await req.json();

    if (!trace || !trace.id || !trace.beneficiaryProfile) {
      return NextResponse.json({ error: 'INVALID_TRACE', message: 'Valid DecisionLogTrace payload required.' }, { status: 400 });
    }

    await logDecisionTraceToDB(trace);
    return NextResponse.json({ success: true, loggedId: trace.id });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to log decision trace.' }, { status: 500 });
  }
}
