import { NextRequest, NextResponse } from 'next/server';
import { generateAIExplanation } from '../../../lib/ai/provider';
import { AIExplanationRequest } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body: AIExplanationRequest = await req.json();

    // 1. Required Objects Check
    if (!body || typeof body !== 'object' || !body.selectedSchemeResult || !body.profile) {
      return NextResponse.json(
        { error: 'Missing required context: profile and selectedSchemeResult are required.' },
        { status: 400 }
      );
    }

    // 2. userQuestion Size Limit (Max 500 chars)
    if (body.userQuestion !== undefined) {
      if (typeof body.userQuestion !== 'string' || body.userQuestion.length > 500) {
        return NextResponse.json(
          { error: 'Invalid userQuestion: must be a text string of 500 characters or less.' },
          { status: 400 }
        );
      }
    }

    // 3. contextId Size Limit (Max 100 chars)
    if (body.contextId !== undefined) {
      if (typeof body.contextId !== 'string' || body.contextId.length > 100) {
        return NextResponse.json(
          { error: 'Invalid contextId: must be a string of 100 characters or less.' },
          { status: 400 }
        );
      }
    }

    // 4. messageHistory Validation & Limits
    if (body.messageHistory !== undefined) {
      if (!Array.isArray(body.messageHistory)) {
        return NextResponse.json(
          { error: 'Invalid messageHistory: must be an array.' },
          { status: 400 }
        );
      }

      if (body.messageHistory.length > 10) {
        return NextResponse.json(
          { error: 'Invalid messageHistory: maximum 10 history messages allowed.' },
          { status: 400 }
        );
      }

      let totalHistoryLength = 0;
      for (const msg of body.messageHistory) {
        if (!msg || typeof msg !== 'object' || !['user', 'assistant'].includes(msg.role) || typeof msg.text !== 'string') {
          return NextResponse.json(
            { error: 'Invalid messageHistory item: each item must contain role ("user"|"assistant") and text string.' },
            { status: 400 }
          );
        }

        if (msg.text.length > 500) {
          return NextResponse.json(
            { error: 'Invalid messageHistory text: individual history message exceeds 500 character limit.' },
            { status: 400 }
          );
        }

        totalHistoryLength += msg.text.length;
      }

      if (totalHistoryLength > 4000) {
        return NextResponse.json(
          { error: 'Invalid messageHistory total size: total history text exceeds 4000 character limit.' },
          { status: 400 }
        );
      }
    }

    const explanation = await generateAIExplanation(body);
    return NextResponse.json(explanation);
  } catch (error: any) {
    console.error('Error in /api/explain validation or execution:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to process AI guidance request safely.' },
      { status: 500 }
    );
  }
}
