import { NextResponse } from 'next/server';
import { fetchSchemesFromCloudDB } from '../../../lib/db/client';

export async function GET() {
  try {
    const schemes = await fetchSchemesFromCloudDB();
    return NextResponse.json({
      success: true,
      dataStatus: 'Prototype Dataset • Based on Official Sources',
      schemes
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
