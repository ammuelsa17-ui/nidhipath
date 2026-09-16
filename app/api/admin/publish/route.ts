import { NextRequest, NextResponse } from 'next/server';
import { upsertSchemeInDB, DatabaseConnectionError } from '../../../../lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schemeId, newVersion, changeSummary, publishedBy } = body;

    if (!schemeId || !newVersion) {
      return NextResponse.json({ error: 'INVALID_PUBLISH_REQUEST', message: 'schemeId and newVersion are required.' }, { status: 400 });
    }

    // Safe Validation Stage
    if (typeof newVersion !== 'string' || !newVersion.startsWith('v')) {
      return NextResponse.json({
        error: 'VALIDATION_FAILED',
        message: 'Rule version string must follow version syntax (e.g. v2.7).'
      }, { status: 422 });
    }

    await upsertSchemeInDB({
      id: schemeId,
      ruleVersion: newVersion
    });

    return NextResponse.json({
      success: true,
      schemeId,
      publishedVersion: newVersion,
      status: 'PUBLISHED',
      message: `Rule version '${newVersion}' published successfully for scheme '${schemeId}'.`
    });
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError || err?.name === 'DatabaseConnectionError') {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE', message: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message || 'Failed to publish rule version.' }, { status: 500 });
  }
}
