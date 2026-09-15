import { AIExplanationRequest, AIExplanationResponse } from '../../types';

/**
 * AI EXPLANATION LAYER
 * Core Principle: RULES DECIDE. AI EXPLAINS.
 * The AI MUST NEVER determine or override eligibility.
 * It strictly explains verified deterministic outputs.
 */

const SYSTEM_PROMPT = `You are NidhiPath's AI Explanation Assistant for Indian entrepreneurs.
CRITICAL INSTRUCTION: Never override, alter, or calculate scheme eligibility yourself.
Eligibility has ALREADY been deterministically evaluated by the verified eligibility engine.
Your sole job is to explain the verified results clearly in simple, empathetic language, highlight key financial benefits, answer user questions, and guide them on next steps.`;

export async function generateAIExplanation(
  request: AIExplanationRequest
): Promise<AIExplanationResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      if (process.env.GEMINI_API_KEY) {
        return await callGeminiAPI(request, process.env.GEMINI_API_KEY);
      }
    } catch (err) {
      console.warn('AI API call failed, using robust fallback explanation:', err);
    }
  }

  // Fallback to local template generator (0 API key required, 100% reliable demo)
  return generateMockExplanation(request);
}

async function callGeminiAPI(
  request: AIExplanationRequest,
  apiKey: string
): Promise<AIExplanationResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const userContent = `
Beneficiary Profile:
- Applicant: ${request.profile.applicantName || 'Entrepreneur'} (${request.profile.age} yrs, ${request.profile.socialCategory}, ${request.profile.gender})
- Project: ${request.profile.projectType} (Estimated Cost: ₹${request.profile.estimatedCost.toLocaleString('en-IN')})
- Annual Income: ₹${request.profile.annualIncome.toLocaleString('en-IN')}
- Location: ${request.profile.locationType}, PIN ${request.profile.pinCode}

Verified Eligibility Result:
- Selected Scheme: ${request.selectedSchemeResult.scheme.name} (${request.selectedSchemeResult.scheme.code})
- Eligibility Status: ${request.selectedSchemeResult.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
- Match Score: ${request.selectedSchemeResult.score}/100
- Passed Conditions: ${request.selectedSchemeResult.passedConditions.map(c => c.message).join(' | ')}
- Failed Conditions: ${request.selectedSchemeResult.failedConditions.map(c => c.message).join(' | ')}
- Estimated Govt Subsidy: ₹${request.selectedSchemeResult.maxSubsidyAmountEstimated.toLocaleString('en-IN')} (${request.selectedSchemeResult.subsidyPercentageEstimated}%)

Language Requested: ${request.language || 'en'}
User Question: ${request.userQuestion || 'None'}

Please provide a JSON response with:
{
  "summary": "Clear 2-sentence summary of the eligibility outcome",
  "whyRecommended": ["Reason 1", "Reason 2", "Reason 3"],
  "eligibilityExplanation": "Simple explanation of why this scheme matches the user's profile",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${userContent}` }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textContent) {
    throw new Error('Empty text content from Gemini');
  }

  const parsed = JSON.parse(textContent);
  return {
    summary: parsed.summary || 'Scheme eligibility verified by rules engine.',
    whyRecommended: parsed.whyRecommended || [],
    eligibilityExplanation: parsed.eligibilityExplanation || '',
    nextSteps: parsed.nextSteps || [],
    source: 'gemini_api'
  };
}

function generateMockExplanation(
  request: AIExplanationRequest
): AIExplanationResponse {
  const { selectedSchemeResult, profile, financialDetails, language = 'en' } = request;
  const scheme = selectedSchemeResult.scheme;

  const isHi = language === 'hi';
  const isTa = language === 'ta';
  const isTe = language === 'te';
  const isMr = language === 'mr';

  let summary = '';
  let whyRecommended: string[] = [];
  let eligibilityExplanation = '';
  let nextSteps: string[] = [];
  let multilingualNote = '';

  if (selectedSchemeResult.isEligible) {
    if (isHi) {
      summary = `बधाई हो! आपका आवेदन ${scheme.name} (${scheme.code}) के लिए पात्र पाया गया है।`;
      eligibilityExplanation = `नियम इंजन की जांच के अनुसार, आपकी वार्षिक आय (₹${profile.annualIncome.toLocaleString('en-IN')}) और परियोजना लागत (₹${profile.estimatedCost.toLocaleString('en-IN')}) इस योजना के मानदंडों को पूरा करती है।`;
      whyRecommended = [
        `अनुमानित सरकारी सब्सिडी: ${selectedSchemeResult.subsidyPercentageEstimated}% (लगभग ₹${selectedSchemeResult.maxSubsidyAmountEstimated.toLocaleString('en-IN')})`,
        `100% बिना किसी गारंटी/कोलेटरल के ऋण (CGFMSE कवर)`,
        `मासिक किश्त (EMI): लगभग ₹${financialDetails?.monthlyEMI.toLocaleString('en-IN') || '---'}`
      ];
      nextSteps = [
        'नजदीकी नोडल बैंक शाखा से संपर्क करें (नीचे सूचीबद्ध)',
        'प्रस्तावित परियोजना रिपोर्ट (Project Report) और आधार/पैन पत्र तैयार रखें',
        'सरकारी पोर्टल पर आधिकारिक ऑनलाइन आवेदन जमा करें'
      ];
      multilingualNote = 'हिंदी व्याख्या मोड (नियम आधारित परिणाम)';
    } else if (isTa) {
      summary = `வாழ்த்துக்கள்! உங்கள் விண்ணப்பம் ${scheme.shortName} திட்டத்திற்கு தகுதியானது.`;
      eligibilityExplanation = `விதிமுறைகளின்படி உங்கள் ஆண்டு வருமானம் மற்றும் திட்ட செலவு இந்த திட்டத்தின் வரம்பிற்குள் உள்ளது.`;
      whyRecommended = [
        `மதிப்பிடப்பட்ட அரசு மானியம்: ${selectedSchemeResult.subsidyPercentageEstimated}%`,
        `பிணையமற்ற கடன் வசதி (Collateral-Free Loan)`,
        `மாத தவணை (EMI): ₹${financialDetails?.monthlyEMI.toLocaleString('en-IN') || '---'}`
      ];
      nextSteps = [
        'அருகிலுள்ள வங்கி கிளையை தொடர்புகொள்ளவும்',
        'திட்ட அறிக்கை தயாரிக்கவும்'
      ];
      multilingualNote = 'தமிழ் விளக்கம் (Verified Rule Result)';
    } else if (isTe) {
      summary = `అభినందనలు! మీ ప్రొఫైల్ ${scheme.shortName} పథకానికి అర్హత పొందింది.`;
      eligibilityExplanation = `మీ వార్షిక ఆదాయం మరియు ప్రాజెక్ట్ ఖర్చు నియమ నిబంధనలకు అనుగుణంగా ఉన్నాయి.`;
      whyRecommended = [
        `ప్రభుత్వ సబ్సిడీ: ${selectedSchemeResult.subsidyPercentageEstimated}%`,
        `పూచీకత్తు లేని రుణం (Collateral-free loan)`
      ];
      nextSteps = ['సమీప బ్యాంక్ శాఖను సందర్శించండి'];
      multilingualNote = 'తెలుగు వివరణ (Verified Rule Result)';
    } else if (isMr) {
      summary = `अभिनंदन! तुमचे प्रोफाईल ${scheme.shortName} योजनेसाठी पात्र आहे.`;
      eligibilityExplanation = `नियमांनुसार तुमचे वार्षिक उत्पन्न आणि प्रकल्प खर्च या योजनेच्या अटी पूर्ण करतात.`;
      whyRecommended = [
        `अंदाजे सरकारी अनुदान: ${selectedSchemeResult.subsidyPercentageEstimated}% (₹${selectedSchemeResult.maxSubsidyAmountEstimated.toLocaleString('en-IN')})`,
        `विना तारण कर्ज सुविधा`
      ];
      nextSteps = ['जवळच्या नोडल बँकेशी संपर्क साधा'];
      multilingualNote = 'मराठी स्पष्टीकरण (Verified Rule Result)';
    } else {
      // English
      summary = `Great news! Your profile meets all eligibility requirements for ${scheme.name} (${scheme.code}).`;
      eligibilityExplanation = `The deterministic eligibility engine confirmed that your annual income of ₹${profile.annualIncome.toLocaleString('en-IN')} and project cost of ₹${profile.estimatedCost.toLocaleString('en-IN')} satisfy all statutory scheme thresholds.`;
      whyRecommended = [
        `High Government Subsidy Coverage: ${selectedSchemeResult.subsidyPercentageEstimated}% (Est. ₹${selectedSchemeResult.maxSubsidyAmountEstimated.toLocaleString('en-IN')})`,
        `100% Collateral-Free Credit under Credit Guarantee Cover`,
        `Competitive Interest Rate of ${scheme.interestRate}% p.a. with ${scheme.moratoriumMonths} months moratorium`,
        `Estimated Monthly EMI: ₹${financialDetails?.monthlyEMI.toLocaleString('en-IN') || '---'}`
      ];
      nextSteps = [
        'Visit the nearest recommended Nodal Channel Partner listed below',
        'Prepare your Detailed Project Report (DPR), Aadhaar, and Bank Statements',
        'Apply directly through the official Government portal link provided'
      ];
      multilingualNote = 'English Explanation (Verified Rule Result Engine)';
    }
  } else {
    summary = `Your profile is currently not eligible for ${scheme.name}.`;
    eligibilityExplanation = `The scheme requires specific criteria that were not satisfied: ${selectedSchemeResult.failedConditions.map(c => c.message).join('; ')}.`;
    whyRecommended = [
      'We recommend exploring alternative schemes like MUDRA or PM SVANidhi listed below that match your project cost and category.'
    ];
    nextSteps = [
      'Adjust project cost or select a matching project category',
      'Review alternative schemes recommended on this dashboard'
    ];
  }

  if (request.userQuestion && request.userQuestion.trim().length > 0) {
    eligibilityExplanation += `\n\nRegarding your question ("${request.userQuestion}"): NidhiPath recommends submitting your verified DPR through our routed channel partner branch for priority processing.`;
  }

  return {
    summary,
    whyRecommended,
    eligibilityExplanation,
    nextSteps,
    multilingualNote,
    source: 'mock_fallback'
  };
}
