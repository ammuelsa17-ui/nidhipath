import { NextRequest, NextResponse } from 'next/server';
import { upsertRuleInDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.schemeId || !body.field || !body.operator) {
      return NextResponse.json({ error: 'INVALID_RULE', message: 'schemeId, field, and operator are required.' }, { status: 400 });
    }

    await upsertRuleInDB(body);
    return NextResponse.json({ success: true, message: 'Eligibility rule created/updated successfully.' });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE', message: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to upsert rule.' }, { status: 500 });
  }
}
