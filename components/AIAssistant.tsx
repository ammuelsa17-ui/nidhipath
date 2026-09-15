import React, { useState, useEffect } from 'react';
import { SchemeEligibilityResult, BeneficiaryProfile, EMIBreakdown, AIExplanationResponse, ChannelPartner, PartnerMatchResult } from '../types';
import { getDynamicQuickPrompts } from '../lib/ai/prompts';
import { Sparkles, Languages, MessageSquare, Send, CheckCircle2, ShieldAlert, Cpu, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  schemeResult: SchemeEligibilityResult;
  profile: BeneficiaryProfile;
  financialDetails?: EMIBreakdown;
  topPartner?: ChannelPartner;
  nearbyPartners?: PartnerMatchResult[];
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  explanation?: AIExplanationResponse;
  isError?: boolean;
  timestamp: string;
}

export const AIAssistant: React.FC<Props> = ({
  schemeResult,
  profile,
  financialDetails,
  topPartner,
  nearbyPartners
}) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'ta' | 'te' | 'mr'>('en');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [messageHistory, setMessageHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset conversation history when selected scheme or profile changes
  useEffect(() => {
    setMessageHistory([]);
    setThreadMessages([]);
    setErrorMessage(null);
  }, [schemeResult.scheme.id, profile]);

  // Compute dynamic prompt options
  const quickPrompts = getDynamicQuickPrompts({
    selectedSchemeResult: schemeResult,
    financialDetails,
    selectedPartner: topPartner,
    nearbyPartners,
    language
  });

  const fetchExplanation = async (question?: string) => {
    setLoading(true);
    setErrorMessage(null);
    const qText = question || userQuestion;
    const isUserQuery = Boolean(qText && qText.trim());

    if (isUserQuery) {
      const userMsg: ThreadMessage = {
        id: Date.now() + '-user',
        role: 'user',
        text: qText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setThreadMessages(prev => [...prev, userMsg]);
    }

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          selectedSchemeResult: schemeResult,
          financialDetails,
          selectedPartner: topPartner,
          nearbyPartners,
          language,
          userQuestion: isUserQuery ? qText.trim().slice(0, 500) : undefined,
          messageHistory: messageHistory.slice(-10)
        })
      });

      if (!res.ok) throw new Error('Failed to fetch AI explanation');
      const data: AIExplanationResponse = await res.json();
      setExplanation(data);

      if (isUserQuery) {
        const assistantReplyText = (data.summary + ' ' + (data.eligibilityExplanation || '')).trim().slice(0, 500);
        const assistantMsg: ThreadMessage = {
          id: Date.now() + '-assistant',
          role: 'assistant',
          explanation: data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setThreadMessages(prev => [...prev, assistantMsg]);
        setMessageHistory(prev => {
          const updated = [
            ...prev,
            { role: 'user' as const, text: qText.trim().slice(0, 500) },
            { role: 'assistant' as const, text: assistantReplyText }
          ];
          return updated.slice(-10);
        });
        setUserQuestion('');
      }
    } catch (err) {
      console.error('Error getting AI explanation:', err);
      const friendlyError = 'AI guidance is temporarily unavailable. Please try again or continue with the displayed NidhiPath assessment results.';
      setErrorMessage(friendlyError);

      if (isUserQuery) {
        setThreadMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-error',
            role: 'assistant',
            isError: true,
            text: friendlyError,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [schemeResult, profile, language, topPartner]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || loading) return;
    fetchExplanation(userQuestion);
  };

  const handleQuickPromptClick = (promptText: string) => {
    if (loading) return;
    fetchExplanation(promptText);
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
                  Rule Assistant Active
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
            aria-label="Select guidance language"
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
        {loading && !explanation && threadMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Cpu className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-medium">Generating verified explanation...</p>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* Primary Verified Outcome Summary */}
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

        {/* Global Error Banner */}
        {errorMessage && threadMessages.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchExplanation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Visible Multi-Turn Conversation Thread */}
        {threadMessages.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Guidance Q&A Conversation
            </h3>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
              {threadMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-br-none text-xs max-w-[85%] shadow-sm">
                      <p>{msg.text}</p>
                      <span className="block text-[9px] text-blue-200 mt-1 text-right">{msg.timestamp}</span>
                    </div>
                  ) : msg.isError ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl rounded-bl-none text-xs max-w-[85%] space-y-1">
                      <p>{msg.text}</p>
                      <span className="block text-[9px] text-amber-600 text-right">{msg.timestamp}</span>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-bl-none text-xs max-w-[85%] space-y-2 shadow-sm">
                      {msg.explanation && (
                        <>
                          <p className="font-semibold text-slate-900">{msg.explanation.summary}</p>
                          <p className="text-slate-700 leading-relaxed">{msg.explanation.eligibilityExplanation}</p>
                          {msg.explanation.whyRecommended && msg.explanation.whyRecommended.length > 0 && (
                            <div className="bg-blue-50/80 p-2 rounded-lg text-[11px] text-blue-900 space-y-0.5 border border-blue-100">
                              <strong className="block text-[10px] uppercase font-mono text-blue-700">Matching Highlights:</strong>
                              <ul className="list-disc list-inside space-y-0.5">
                                {msg.explanation.whyRecommended.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {msg.explanation.nextSteps && msg.explanation.nextSteps.length > 0 && (
                            <div className="bg-slate-100 p-2 rounded-lg text-[11px] text-slate-800 space-y-0.5 border border-slate-200">
                              <strong className="block text-[10px] uppercase font-mono text-slate-600">Actionable Next Steps:</strong>
                              <ol className="list-decimal list-inside space-y-0.5">
                                {msg.explanation.nextSteps.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </>
                      )}
                      <span className="block text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none text-xs text-slate-600 flex items-center gap-2 shadow-sm">
                    <Cpu className="w-4 h-4 animate-spin text-blue-600" />
                    <span>NidhiPath AI is processing guidance...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Contextual Quick Prompts */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Contextual Guidance Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((promptText, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => handleQuickPromptClick(promptText)}
                className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 transition-all font-medium disabled:opacity-50 text-left"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* User Interactive Q&A Input Bar */}
        <form onSubmit={handleAskQuestion} className="pt-2">
          <label htmlFor="ai-question-input" className="block text-xs font-semibold text-slate-700 mb-2">
            Ask the AI Assistant a question about your verified results:
          </label>
          <div className="flex gap-2">
            <input
              id="ai-question-input"
              type="text"
              value={userQuestion}
              disabled={loading}
              onChange={e => setUserQuestion(e.target.value)}
              placeholder="e.g. Can I get a loan if I don't own land? Or how do I submit the DPR?"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !userQuestion.trim()}
              aria-label="Send question to AI assistant"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
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
