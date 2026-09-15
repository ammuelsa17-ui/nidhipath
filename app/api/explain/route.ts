import { NextRequest, NextResponse } from 'next/server';
import { generateAIExplanation } from '../../../lib/ai/provider';
import { AIExplanationRequest } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body: AIExplanationRequest = await req.json();

    if (!body.selectedSchemeResult || !body.profile) {
      return NextResponse.json(
        { error: 'Missing required context: profile and selectedSchemeResult are required.' },
        { status: 400 }
      );
    }

    const explanation = await generateAIExplanation(body);
    return NextResponse.json(explanation);
  } catch (error: any) {
    console.error('Error in /api/explain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
