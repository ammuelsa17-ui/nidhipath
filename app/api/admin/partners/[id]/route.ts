import { NextRequest, NextResponse } from 'next/server';
import { upsertPartnerInDB, DatabaseConnectionError } from '../../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await upsertPartnerInDB({ ...body, id });
    return NextResponse.json({ success: true, message: `Partner '${id}' updated successfully in database.` });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE', message: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to patch partner.' }, { status: 500 });
  }
}
