import { NextResponse } from 'next/server';
import { fetchPartnersFromCloudDB } from '../../../lib/db/client';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const partners = await fetchPartnersFromCloudDB();
    return NextResponse.json({
      success: true,
      dataStatus: 'Prototype Partner Data',
      partners
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
