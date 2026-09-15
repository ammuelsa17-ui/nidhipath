import React, { useState } from 'react';
import { ChannelPartner } from '../types';
import { MessageSquare, Phone, MapPin, X, Send, Bot, AlertTriangle, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ChatModalProps {
  partner: ChannelPartner;
  selectedSchemeName: string;
  onClose: () => void;
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
}

export const PartnerChatModal: React.FC<ChatModalProps> = ({ partner, selectedSchemeName, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello! Welcome to NidhiPath Partner Assistance for ${partner.branchName} (${partner.name}). How can I assist you regarding your application for ${selectedSchemeName}?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const quickPrompts = [
    'What documents should I carry?',
    'Do I need to visit the office in person?',
    'What should I ask the nodal officer?',
    'Where is the office located?',
    'What is the next step for subsidy?'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    let replyText = '';
    let requiresConfirmation = false;

    const q = query.toLowerCase();
    if (q.includes('document')) {
      replyText = `For ${selectedSchemeName} processing at ${partner.branchName}, bring: 1) Aadhaar Card & PAN Card, 2) Social Category / Caste Certificate (SC/ST/OBC), 3) Detailed Project Report (DPR) / Cost Estimate, 4) Bank Account Passbook / 6-Month Statement, 5) Passport-size Photographs.`;
    } else if (q.includes('visit') || q.includes('office')) {
      replyText = `${partner.branchName} is located at ${partner.address}, ${partner.city}, ${partner.state} - ${partner.pinCode}. Working hours are usually 10:00 AM - 5:00 PM on business days.`;
    } else if (q.includes('ask') || q.includes('question')) {
      replyText = `When speaking with Nodal Officer ${partner.nodalOfficerName || 'Branch Manager'}, ask: 1) "Has the margin money subsidy target for ${selectedSchemeName} been allocated for this quarter?", 2) "What is the expected CGTMSE / CGFSI credit guarantee processing duration?", 3) "Can I get a checklist for loan appraisal?"`;
    } else if (q.includes('subsidy') || q.includes('next step')) {
      replyText = `Next Step: Submit your basic DPR and documents to ${partner.branchName}. Once the credit committee approves your loan application, the margin money subsidy request will be submitted through the nodal agency portal.`;
    } else {
      replyText = `This information requires confirmation from the Channel Partner. Please call the partner or visit the office.`;
      requiresConfirmation = true;
    }

    const assistantMsg: ChatMessage = {
      sender: 'assistant',
      text: replyText,
      timestamp: 'Just now',
      isConfirmationNeeded: requiresConfirmation
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    if (!textToSend) setInputQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">NidhiPath Partner Assistance</h3>
              <p className="text-[11px] text-slate-300">{partner.branchName} • {partner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This assistant provides guidance based on verified scheme guidelines. It is not an employee of {partner.name}.</span>
        </div>

        {/* Messages Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                {msg.isConfirmationNeeded && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-600" />
                    <span>Action Required: Call or Visit branch for official confirmation.</span>
                  </div>
                )}
                <span className="block text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Quick Demo Questions:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-300 transition-all text-left"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about partner assistance..."
            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
              <h3 className="text-sm font-bold text-slate-900">Call Channel Partner</h3>
              <p className="text-xs text-slate-500">Nodal Branch Direct Contact</p>
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
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Nodal Officer</span>
            <strong className="text-slate-800">{partner.nodalOfficerName || 'Branch Nodal Manager'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Official Phone Number</span>
            <a href={`tel:${partner.contactPhone}`} className="text-emerald-700 font-mono text-base font-extrabold hover:underline">
              {partner.contactPhone}
            </a>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Official Email</span>
            <span className="font-mono text-slate-700">{partner.contactEmail}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-900 italic">
          ℹ️ <strong>Prototype Partner Data:</strong> Phone number and officer details represent structured prototype records for demonstration. Production deployment connects authorized institutional directory data.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
            Close
          </button>
          <a
            href={`tel:${partner.contactPhone}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Call Now
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
              <h3 className="text-sm font-bold text-slate-900">Visit Channel Partner Branch</h3>
              <p className="text-xs text-slate-500">Physical Nodal Office Location</p>
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
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Walk-in Nodal Office Guidance:
          </p>
          <p className="text-slate-700">Please carry your printed DPR, Identity Proof (Aadhaar/PAN), and Income/Caste Certificate for direct walk-in consultation.</p>
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
