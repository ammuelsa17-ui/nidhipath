import { NextRequest, NextResponse } from 'next/server';
import { fetchPartnersFromCloudDB, DatabaseConnectionError } from '../../../lib/db/client';
import { findNearbyPartners } from '../../../lib/routing/partnerRouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pinCode, selectedSchemeId } = body;

    if (!pinCode || typeof pinCode !== 'string') {
      return NextResponse.json({ error: 'INVALID_REQUEST', message: 'Valid pinCode is required.' }, { status: 400 });
    }

    const partners = await fetchPartnersFromCloudDB(selectedSchemeId);
    const rankedPartners = findNearbyPartners(pinCode, selectedSchemeId, partners);

    return NextResponse.json({
      success: true,
      pinCode,
      partnerCount: rankedPartners.length,
      partners: rankedPartners
    });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to route partners.' }, { status: 500 });
  }
}
