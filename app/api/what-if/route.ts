import { NextRequest, NextResponse } from 'next/server';
import { fetchSchemesFromCloudDB, DatabaseConnectionError } from '../../../lib/db/client';
import { runWhatIfSimulation } from '../../../lib/whatif/engine';
import { WhatIfRequest } from '../../../types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: WhatIfRequest = await req.json();

    if (!body || !body.profile) {
      return NextResponse.json({ error: 'INVALID_REQUEST', message: 'Profile required for What-If scenario simulation.' }, { status: 400 });
    }

    const schemes = await fetchSchemesFromCloudDB();
    const simulationResult = runWhatIfSimulation(schemes, body);

    return NextResponse.json({
      success: true,
      simulation: simulationResult
    });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'NidhiPath Database Connection Required — Please configure DATABASE_URL in environment settings.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to execute What-If simulation.' }, { status: 500 });
  }
}
