import { SchemeEligibilityResult, EMIBreakdown, ChannelPartner, PartnerMatchResult } from '../../types';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'mr';

type PromptKey =
  | 'why_eligible'
  | 'how_much_borrow'
  | 'explain_emi'
  | 'what_documents'
  | 'what_next_step'
  | 'why_not_eligible'
  | 'which_condition_failed'
  | 'what_could_i_change'
  | 'other_suitable_schemes'
  | 'total_repayment'
  | 'subsidy_estimation'
  | 'where_apply'
  | 'nearest_partner'
  | 'how_far_branch';

const TRANSLATIONS: Record<PromptKey, Record<SupportedLanguage, string>> = {
  why_eligible: {
    en: 'Why am I eligible?',
    hi: 'मैं पात्र क्यों हूँ?',
    ta: 'நான் ஏன் தகுதியுடையவன்?',
    te: 'నేను ఎందుకు అర్హుడిని?',
    mr: 'मी पात्र का आहे?'
  },
  how_much_borrow: {
    en: 'How much can I borrow?',
    hi: 'मैं कितना ऋण ले सकता हूँ?',
    ta: 'நான் எவ்வளவு கடன் பெற முடியும்?',
    te: 'నేను ఎంత రుణం పొందవచ్చు?',
    mr: 'मी किती कर्ज घेऊ शकतो?'
  },
  explain_emi: {
    en: 'Explain my EMI',
    hi: 'मेरी ईएमआई (EMI) समझाइए',
    ta: 'என் தவணையை (EMI) விளக்குங்கள்',
    te: 'నా ఈఎమ్‌ఐ (EMI) వివరించండి',
    mr: 'माझा ईएमआय (EMI) समजावून सांगा'
  },
  what_documents: {
    en: 'What documents should I prepare?',
    hi: 'मुझे कौन से दस्तावेज तैयार करने चाहिए?',
    ta: 'நான் என்ன ஆவணங்களைத் தயாரிக்க வேண்டும்?',
    te: 'నేను ఏ పత్రాలను సిద్ధం చేసుకోవాలి?',
    mr: 'मी कोणती कागदपत्रे तयार करावीत?'
  },
  what_next_step: {
    en: 'What should I do next?',
    hi: 'मुझे आगे क्या करना चाहिए?',
    ta: 'நான் அடுத்து என்ன செய்ய வேண்டும்?',
    te: 'నేను తరువాత ఏమి చేయాలి?',
    mr: 'मी पुढे काय करावे?'
  },
  why_not_eligible: {
    en: 'Why am I not eligible?',
    hi: 'मैं पात्र क्यों नहीं हूँ?',
    ta: 'நான் ஏன் தகுதியற்றவன்?',
    te: 'నేను ఎందుకు అర్హుడిని కాను?',
    mr: 'मी पात्र का नाही?'
  },
  which_condition_failed: {
    en: 'Which condition did I fail?',
    hi: 'मेरी कौन सी शर्त पूरी नहीं हुई?',
    ta: 'நான் எந்த நிபந்தனையில் தவறிவிட்டேன்?',
    te: 'నేను ఏ నిబంధనను తప్పాను?',
    mr: 'माझी कोणती अट पूर्ण झाली नाही?'
  },
  what_could_i_change: {
    en: 'What could I change?',
    hi: 'पात्र होने के लिए मैं क्या बदल सकता हूँ?',
    ta: 'தகுதி பெற நான் என்ன மாற்றலாம்?',
    te: 'అర్హత పొందడానికి నేను ఏమి మార్చవచ్చు?',
    mr: 'पात्र होण्यासाठी मी काय बदलू शकतो?'
  },
  other_suitable_schemes: {
    en: 'Are there other suitable schemes?',
    hi: 'क्या अन्य उपयुक्त योजनाएं हैं?',
    ta: 'வேறு ஏற்ற திட்டங்கள் உள்ளவா?',
    te: 'ఇతర తగిన పథకాలు ఉన్నాయా?',
    mr: 'इतर योग्य योजना आहेत का?'
  },
  total_repayment: {
    en: 'How much will I repay in total?',
    hi: 'मुझे कुल कितना भुगतान करना होगा?',
    ta: 'நான் மொத்தமாக எவ்வளவு திருப்பிச் செலுத்த வேண்டும்?',
    te: 'నేను మొత్తంగా ఎంత తిరిగి చెల్లించాలి?',
    mr: 'मी एकूण किती परतफेड करेन?'
  },
  subsidy_estimation: {
    en: 'How was my subsidy estimated?',
    hi: 'मेरी सब्सिडी का आकलन कैसे हुआ?',
    ta: 'எனது மானியம் எவ்வாறு கணக்கிடப்பட்டது?',
    te: 'నా సబ్సిడీ ఎలా అంచనా వేయబడింది?',
    mr: 'माझ्या अनुदानाचे अंदाज कसे बांधले गेले?'
  },
  where_apply: {
    en: 'Where should I apply?',
    hi: 'मुझे कहां आवेदन करना चाहिए?',
    ta: 'நான் எங்கு விண்ணப்பிக்க வேண்டும்?',
    te: 'నేను ఎక్కడ దరఖాస్తు చేసుకోవాలి?',
    mr: 'मी कुठे अर्ज करावा?'
  },
  nearest_partner: {
    en: 'Which partner is nearest?',
    hi: 'सबसे नजदीकी पार्टनर कौन सा है?',
    ta: 'எந்த பங்குதாரர் அருகில் உள்ளார்?',
    te: 'ఏ భాగస్వామి దగ్గరగా ఉన్నారు?',
    mr: 'सर्वात जवळचा भागीदार कोणता आहे?'
  },
  how_far_branch: {
    en: 'How far is the partner branch?',
    hi: 'पार्टनर शाखा कितनी दूर है?',
    ta: 'பங்குதாரர் கிளை எவ்வளவு தொலைவில் உள்ளது?',
    te: 'భాగస్వామి బ్రాంచ్ ఎంత దూరంలో ఉంది?',
    mr: 'भागीदार शाखा किती लांब आहे?'
  }
};

function getTranslation(key: PromptKey, lang: SupportedLanguage): string {
  return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.en;
}

export interface DynamicPromptInput {
  selectedSchemeResult?: SchemeEligibilityResult | null;
  financialDetails?: EMIBreakdown | null;
  selectedPartner?: ChannelPartner | null;
  nearbyPartners?: PartnerMatchResult[] | null;
  language?: string;
}

export function getDynamicQuickPrompts(input: DynamicPromptInput): string[] {
  const langKey = (input.language || 'en').toLowerCase() as SupportedLanguage;
  const validLang: SupportedLanguage = ['en', 'hi', 'ta', 'te', 'mr'].includes(langKey) ? langKey : 'en';

  const prompts: string[] = [];
  const isEligible = input.selectedSchemeResult?.isEligible ?? true;
  const hasSelectedPartner = Boolean(input.selectedPartner);

  if (isEligible) {
    prompts.push(getTranslation('why_eligible', validLang));
    prompts.push(getTranslation('how_much_borrow', validLang));

    if (input.financialDetails && input.financialDetails.monthlyEMI > 0) {
      prompts.push(getTranslation('explain_emi', validLang));
    }

    if (hasSelectedPartner) {
      prompts.push(getTranslation('where_apply', validLang));
      if (input.nearbyPartners && input.nearbyPartners.length > 0) {
        prompts.push(getTranslation('how_far_branch', validLang));
      }
      prompts.push(getTranslation('what_documents', validLang));
      prompts.push(getTranslation('what_next_step', validLang));
      if (input.financialDetails && input.financialDetails.totalRepayment > 0) {
        prompts.push(getTranslation('total_repayment', validLang));
      }
    } else {
      prompts.push(getTranslation('what_documents', validLang));
      prompts.push(getTranslation('what_next_step', validLang));

      if (input.financialDetails && input.financialDetails.totalRepayment > 0) {
        prompts.push(getTranslation('total_repayment', validLang));
      }

      if (input.nearbyPartners && input.nearbyPartners.length > 0) {
        prompts.push(getTranslation('nearest_partner', validLang));
      }
    }

    const subsidyPercent = input.selectedSchemeResult?.subsidyPercentageEstimated || 0;
    const subsidyAmount = input.financialDetails?.estimatedSubsidyAmount || input.selectedSchemeResult?.maxSubsidyAmountEstimated || 0;
    if (subsidyPercent > 0 || subsidyAmount > 0) {
      prompts.push(getTranslation('subsidy_estimation', validLang));
    }
  } else {
    prompts.push(getTranslation('why_not_eligible', validLang));
    if (input.selectedSchemeResult?.failedConditions && input.selectedSchemeResult.failedConditions.length > 0) {
      prompts.push(getTranslation('which_condition_failed', validLang));
    }
    prompts.push(getTranslation('what_could_i_change', validLang));
    prompts.push(getTranslation('other_suitable_schemes', validLang));

    if (hasSelectedPartner) {
      prompts.push(getTranslation('where_apply', validLang));
      prompts.push(getTranslation('what_next_step', validLang));
    } else {
      prompts.push(getTranslation('what_next_step', validLang));
      if (input.nearbyPartners && input.nearbyPartners.length > 0) {
        prompts.push(getTranslation('nearest_partner', validLang));
      }
    }
  }

  // Deduplicate and constrain to max 6 prompts
  const uniquePrompts = Array.from(new Set(prompts));
  return uniquePrompts.slice(0, 6);
}
