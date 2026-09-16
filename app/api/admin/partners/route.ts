import { NextRequest, NextResponse } from 'next/server';
import { upsertPartnerInDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id || !body.name || !body.branchName) {
      return NextResponse.json({ error: 'INVALID_PARTNER', message: 'partner id, name, and branchName are required.' }, { status: 400 });
    }

    await upsertPartnerInDB(body);
    return NextResponse.json({ success: true, message: `Partner '${body.id}' created/updated successfully.` });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE', message: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to upsert partner.' }, { status: 500 });
  }
}
