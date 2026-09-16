import { NextRequest, NextResponse } from 'next/server';
import { upsertSchemeInDB, fetchSchemesFromCloudDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id || !body.code || !body.name || body.interestRate === undefined) {
      return NextResponse.json({ error: 'INVALID_SCHEME', message: 'Scheme id, code, name, and interestRate are required.' }, { status: 400 });
    }

    await upsertSchemeInDB(body);
    return NextResponse.json({ success: true, message: `Scheme '${body.id}' created/updated successfully.` });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE', message: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to upsert scheme.' }, { status: 500 });
  }
}
