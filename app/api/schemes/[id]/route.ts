import { NextRequest, NextResponse } from 'next/server';
import { fetchSchemeByIdFromCloudDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheme = await fetchSchemeByIdFromCloudDB(id);
    if (!scheme) {
      return NextResponse.json({ error: 'NOT_FOUND', message: `Scheme with ID or code '${id}' not found.` }, { status: 404 });
    }
    return NextResponse.json({ success: true, scheme });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch scheme.' }, { status: 500 });
  }
}
