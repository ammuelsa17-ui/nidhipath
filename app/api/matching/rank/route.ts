import { NextRequest, NextResponse } from 'next/server';
import { fetchSchemesFromCloudDB, DatabaseConnectionError } from '../../../../lib/db/client';
import { evaluateEligibility } from '../../../../lib/eligibility/engine';
import { rankSchemes } from '../../../../lib/matching/ranker';
import { BeneficiaryProfile } from '../../../../types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile: BeneficiaryProfile = await req.json();

    if (!profile || typeof profile.age !== 'number') {
      return NextResponse.json({ error: 'INVALID_PROFILE', message: 'Valid beneficiary profile required.' }, { status: 400 });
    }

    const schemes = await fetchSchemesFromCloudDB();
    const evs = evaluateEligibility(profile, schemes);
    const ranked = rankSchemes(evs, profile);

    return NextResponse.json({
      success: true,
      bestFit: ranked.find(r => r.isEligible)?.scheme || null,
      ranked
    });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to rank schemes.' }, { status: 500 });
  }
}
