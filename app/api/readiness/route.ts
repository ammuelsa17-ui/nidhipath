import { NextRequest, NextResponse } from 'next/server';
import { fetchSchemeByIdFromCloudDB, DatabaseConnectionError } from '../../../lib/db/client';
import { evaluateApplicationReadiness } from '../../../lib/readiness/engine';
import { BeneficiaryProfile } from '../../../types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schemeId, profile, providedDocumentIds = [] } = body;

    if (!schemeId || !profile) {
      return NextResponse.json({ error: 'INVALID_REQUEST', message: 'schemeId and profile are required.' }, { status: 400 });
    }

    const scheme = await fetchSchemeByIdFromCloudDB(schemeId);
    if (!scheme) {
      return NextResponse.json({ error: 'NOT_FOUND', message: `Scheme '${schemeId}' not found.` }, { status: 404 });
    }

    const readiness = evaluateApplicationReadiness(scheme, profile as BeneficiaryProfile, providedDocumentIds);
    return NextResponse.json({ success: true, readiness });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to evaluate readiness.' }, { status: 500 });
  }
}
