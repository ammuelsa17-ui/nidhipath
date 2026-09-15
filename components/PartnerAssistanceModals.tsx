import React, { useState, useEffect, useRef } from 'react';
import { ChannelPartner, BeneficiaryProfile, SchemeEligibilityResult, EMIBreakdown, PartnerMatchResult, AIExplanationResponse } from '../types';
import { getDynamicQuickPrompts } from '../lib/ai/prompts';
import { MessageSquare, Phone, MapPin, X, Send, Bot, AlertTriangle, ExternalLink, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface ChatModalProps {
  partner: ChannelPartner;
  selectedSchemeName: string;
  onClose: () => void;
  profile?: BeneficiaryProfile;
  selectedSchemeResult?: SchemeEligibilityResult;
  financialDetails?: EMIBreakdown | null;
  language?: string;
  nearbyPartners?: PartnerMatchResult[];
}

interface CallModalProps {
  partner: ChannelPartner;
  onClose: () => void;
}

interface VisitModalProps {
  partner: ChannelPartner;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isConfirmationNeeded?: boolean;
  whyRecommended?: string[];
  nextSteps?: string[];
}

export const PartnerChatModal: React.FC<ChatModalProps> = ({
  partner,
  selectedSchemeName,
  onClose,
  profile,
  selectedSchemeResult,
  financialDetails,
  language = 'en',
  nearbyPartners
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello! I am NidhiPath AI Guidance. I provide AI-guided assistance based on calculated scheme parameters and verified eligibility rules for ${selectedSchemeName} at ${partner.branchName} (${partner.name}). How can I assist you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [messageHistory, setMessageHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate dynamic prompts based on current application context
  const quickPrompts = getDynamicQuickPrompts({
    selectedSchemeResult,
    financialDetails,
    selectedPartner: partner,
    nearbyPartners,
    language
  });

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      if (profile && selectedSchemeResult) {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile,
            selectedSchemeResult,
            financialDetails: financialDetails || undefined,
            selectedPartner: partner,
            nearbyPartners,
            language,
            userQuestion: query.slice(0, 500),
            messageHistory: messageHistory.slice(-10)
          })
        });

        if (res.ok) {
          const data: AIExplanationResponse = await res.json();
          let fullReplyText = data.summary;
          if (data.eligibilityExplanation) {
            fullReplyText += ` ${data.eligibilityExplanation}`;
          }

          const qLower = query.toLowerCase();
          const requiresConfirmation = qLower.includes('appointment') ||
                                        qLower.includes('live status') ||
                                        qLower.includes('official sanction') ||
                                        qLower.includes('file application');

          const assistantMsg: ChatMessage = {
            sender: 'assistant',
            text: fullReplyText,
            whyRecommended: data.whyRecommended,
            nextSteps: data.nextSteps,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isConfirmationNeeded: requiresConfirmation
          };

          setMessages(prev => [...prev, assistantMsg]);
          setMessageHistory(prev => {
            const updated = [
              ...prev,
              { role: 'user' as const, text: query.slice(0, 500) },
              { role: 'assistant' as const, text: fullReplyText.slice(0, 500) }
            ];
            return updated.slice(-10);
          });
          setLoading(false);
          return;
        }
      }

      // Fallback response if context missing or fetch fails
      const fallbackText = `NidhiPath AI Guidance for ${selectedSchemeName} at ${partner.branchName}: Answers are generated based on available scheme guidelines. Please contact or visit ${partner.name} for official institutional verification.`;
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isConfirmationNeeded: true
      };

      setMessages(prev => [...prev, assistantMsg]);
      setMessageHistory(prev => [
        ...prev,
        { role: 'user' as const, text: query.slice(0, 500) },
        { role: 'assistant' as const, text: fallbackText.slice(0, 500) }
      ].slice(-10));
    } catch (err) {
      console.error('Error in partner chat AI explanation:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `NidhiPath AI Guidance is unable to connect right now. Please check your network connection or call ${partner.name} directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isConfirmationNeeded: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                NidhiPath AI Guidance
                <span className="text-[10px] bg-blue-500/30 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-400/30">
                  Unified Backend
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                AI-guided assistance for <strong className="text-white">{partner.branchName}</strong> ({partner.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI guidance"
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>AI Guidance Only:</strong> Not a live chat with channel partner staff. Answers use current application context and verified scheme guidelines.
          </span>
        </div>

        {/* Messages Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
              }`}>
                <p>{msg.text}</p>

                {msg.whyRecommended && msg.whyRecommended.length > 0 && (
                  <div className="bg-blue-50/80 p-2 rounded-lg text-[11px] text-blue-900 space-y-1 border border-blue-100">
                    <strong className="block text-[10px] uppercase font-mono text-blue-700">Key Recommended Reasons:</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.whyRecommended.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.nextSteps && msg.nextSteps.length > 0 && (
                  <div className="bg-slate-100 p-2 rounded-lg text-[11px] text-slate-800 space-y-1 border border-slate-200">
                    <strong className="block text-[10px] uppercase font-mono text-slate-600">Recommended Next Steps:</strong>
                    <ol className="list-decimal list-inside space-y-0.5">
                      {msg.nextSteps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {msg.isConfirmationNeeded && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Action Required: Please call or visit the partner for official confirmation.</span>
                  </div>
                )}
                <span className="block text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-none p-3 text-xs text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>NidhiPath AI is processing guidance...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Suggested Guidance Questions:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => handleSend(qp)}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-300 transition-all text-left disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            disabled={loading}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask NidhiPath AI about scheme rules, financial terms, or documents..."
            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            aria-label="Send message"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PartnerCallModal: React.FC<CallModalProps> = ({ partner, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Call Partner</h3>
              <p className="text-xs text-slate-500">Prototype Contact Information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Institution / Branch</span>
            <strong className="text-slate-900 text-sm font-bold">{partner.name} — {partner.branchName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Designated Officer</span>
            <strong className="text-slate-800">{partner.nodalOfficerName || 'Branch Nodal Manager'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Prototype Contact Number</span>
            <a href={`tel:${partner.contactPhone}`} className="text-emerald-700 font-mono text-base font-extrabold hover:underline">
              {partner.contactPhone}
            </a>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Prototype Contact Email</span>
            <span className="font-mono text-slate-700">{partner.contactEmail}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Prototype Partner Data
          </p>
          <p className="text-amber-800">
            Prototype contact data — production requires authorized institutional contact data. Production deployment requires authorized and current Channel Partner data.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
            Close
          </button>
          <a
            href={`tel:${partner.contactPhone}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Call Partner
          </a>
        </div>
      </div>
    </div>
  );
};

export const PartnerVisitModal: React.FC<VisitModalProps> = ({ partner, onClose }) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${partner.name} ${partner.branchName} ${partner.address}`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Visit Guidance</h3>
              <p className="text-xs text-slate-500">Physical Branch Location</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Branch Name</span>
            <strong className="text-slate-900 text-sm font-bold">{partner.branchName} ({partner.name})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Physical Address</span>
            <p className="text-slate-800 leading-relaxed font-medium">{partner.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">District & State</span>
              <strong className="text-slate-800">{partner.city}, {partner.state}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">PIN Code</span>
              <strong className="text-slate-800 font-mono">{partner.pinCode}</strong>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-[11px] text-blue-900 space-y-1">
          <p className="font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Visit Guidance & Advice:
          </p>
          <p className="text-slate-700">Please confirm office timings, availability and required documents before visiting. Production deployment requires authorized and current Channel Partner data.</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
            Close
          </button>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Map Directions
          </a>
        </div>
      </div>
    </div>
  );
};
