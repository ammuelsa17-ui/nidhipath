import { NextRequest, NextResponse } from 'next/server';
import { fetchSchemesFromCloudDB, DatabaseConnectionError } from '../../../../lib/db/client';
import { evaluateEligibility } from '../../../../lib/eligibility/engine';
import { rankSchemes } from '../../../../lib/matching/ranker';
import { BeneficiaryProfile } from '../../../../types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile: BeneficiaryProfile = await req.json();

    if (!profile || typeof profile.age !== 'number' || typeof profile.annualIncome !== 'number' || typeof profile.estimatedCost !== 'number') {
      return NextResponse.json({ error: 'INVALID_PROFILE', message: 'Valid beneficiary profile with age, annualIncome, and estimatedCost is required.' }, { status: 400 });
    }

    const schemes = await fetchSchemesFromCloudDB();
    const evaluations = evaluateEligibility(profile, schemes);
    const rankedResults = rankSchemes(evaluations, profile);

    return NextResponse.json({
      success: true,
      evaluatedCount: schemes.length,
      eligibleCount: rankedResults.filter(r => r.isEligible).length,
      results: rankedResults
    });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to evaluate eligibility.' }, { status: 500 });
  }
}
