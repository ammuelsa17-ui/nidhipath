import React, { useState, useEffect } from 'react';
import { SchemeEligibilityResult, BeneficiaryProfile, EMIBreakdown, AIExplanationResponse } from '../types';
import { Sparkles, Languages, MessageSquare, Send, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  schemeResult: SchemeEligibilityResult;
  profile: BeneficiaryProfile;
  financialDetails?: EMIBreakdown;
}

export const AIAssistant: React.FC<Props> = ({
  schemeResult,
  profile,
  financialDetails
}) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'ta' | 'te' | 'mr'>('en');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);

  const fetchExplanation = async (question?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          selectedSchemeResult: schemeResult,
          financialDetails,
          language,
          userQuestion: question || userQuestion
        })
      });

      if (!res.ok) throw new Error('Failed to fetch AI explanation');
      const data: AIExplanationResponse = await res.json();
      setExplanation(data);
    } catch (err) {
      console.error('Error getting AI explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [schemeResult, profile, language]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    fetchExplanation(userQuestion);
  };

  return (
    <div id="ai-guidance" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <Sparkles className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Step 5: AI Multilingual Guidance Assistant</h2>
              {explanation?.source === 'gemini_api' ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                  Gemini API Connected
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-200 text-[11px] px-2 py-0.5 rounded border border-blue-400/30 font-mono">
                  Offline Rule Assistant
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Explains verified eligibility & financial calculations in plain language
            </p>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700 text-xs">
          <Languages className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-2"
          >
            <option value="en" className="bg-slate-900 text-white">English</option>
            <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
            <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
            <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
            <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
          </select>
        </div>
      </div>

      {/* System Mandate Disclaimer */}
      <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 text-[11px] text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <strong className="text-slate-800">System Instruction:</strong> "Never override or determine eligibility. Explain only verified results."
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">Context Loaded: {schemeResult.scheme.code}</span>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Cpu className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-medium">Generating verified explanation...</p>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* Summary Banner */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-950">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                Verified Outcome Summary
              </h3>
              <p className="text-sm font-semibold">{explanation.summary}</p>
            </div>

            {/* Why Recommended & Simple Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Why Selected Scheme Matches You
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {explanation.whyRecommended.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Plain Language Guidance
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-slate-200">
                  {explanation.eligibilityExplanation}
                </p>
                {explanation.nextSteps && explanation.nextSteps.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-800 block mb-1">Actionable Next Steps:</span>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                      {explanation.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* User Interactive Q&A Bar */}
        <form onSubmit={handleAskQuestion} className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Ask the AI Assistant a question about your verified results:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              placeholder="e.g. Can I get a loan if I don't own land? Or how do I submit the DPR?"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <span>Ask Assistant</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
