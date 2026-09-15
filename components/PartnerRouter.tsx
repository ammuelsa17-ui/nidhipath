import React, { useState } from 'react';
import { PartnerMatchResult, ChannelPartner, BeneficiaryProfile, SchemeEligibilityResult, EMIBreakdown } from '../types';
import { MapPin, Navigation, Phone, Building2, ExternalLink, CheckCircle, MessageSquare } from 'lucide-react';
import { PartnerChatModal, PartnerCallModal, PartnerVisitModal } from './PartnerAssistanceModals';

interface Props {
  partners: PartnerMatchResult[];
  pinCode: string;
  selectedSchemeName: string;
  profile?: BeneficiaryProfile;
  selectedSchemeResult?: SchemeEligibilityResult;
  financialDetails?: EMIBreakdown | null;
  language?: string;
}

export const PartnerRouter: React.FC<Props> = ({
  partners,
  pinCode,
  selectedSchemeName,
  profile,
  selectedSchemeResult,
  financialDetails,
  language
}) => {
  const [chatPartner, setChatPartner] = useState<ChannelPartner | null>(null);
  const [callPartner, setCallPartner] = useState<ChannelPartner | null>(null);
  const [visitPartner, setVisitPartner] = useState<ChannelPartner | null>(null);

  return (
    <div id="partner-routing" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/30">
            <Navigation className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Step 6: Compatible Channel Partner Routing</h2>
            <p className="text-xs text-slate-300">
              Ranked nearby implementation branches for <strong className="text-white">{selectedSchemeName}</strong>
            </p>
          </div>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-mono">
          Compatibility Before Distance
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-blue-950">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Beneficiary PIN Area: <strong className="font-mono font-bold text-slate-900">{pinCode}</strong> — Displaying nearest scheme-compatible nodal branches.
              </span>
            </div>
            <span className="text-[11px] text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded font-mono shrink-0">
              {partners.length} Partner Branches Found
            </span>
          </div>
          <p className="text-[11px] text-slate-600 border-t border-blue-200/60 pt-2 italic">
            ℹ️ <strong>Prototype Partner Data:</strong> Structured partner records demonstrate the Haversine distance-based routing algorithm. Production deployment requires authorized and current Channel Partner data.
          </p>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((item, idx) => {
            const p = item.partner;
            const isTopRanked = idx === 0;

            return (
              <div
                key={p.id}
                className={`border rounded-xl p-5 transition-all relative flex flex-col justify-between ${
                  isTopRanked
                    ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center space-x-1 bg-slate-900 text-white text-[11px] font-mono px-2.5 py-0.5 rounded">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span className="uppercase">{p.type.replace('_', ' ')}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-900 text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" /> {item.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  {/* Partner Name & Branch */}
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{p.branchName}</p>
                  <p className="text-xs text-slate-500 mb-3 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{p.address}, {p.city}, {p.state} - {p.pinCode}</span>
                  </p>

                  {/* Match Reason */}
                  <div className="bg-slate-100 p-2.5 rounded-lg text-xs mb-4 text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item.matchingReason}</span>
                  </div>
                </div>

                {/* Assistance Action Buttons: Chat / Call Partner / Visit Guidance */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Prototype Partner Data • Assistance Flow:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setChatPartner(p)}
                      className="inline-flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 px-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => setCallPartner(p)}
                      className="inline-flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 px-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Partner</span>
                    </button>
                    <button
                      onClick={() => setVisitPartner(p)}
                      className="inline-flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-2 px-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Visit Guidance</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Assistance Modals */}
      {chatPartner && (
        <PartnerChatModal
          partner={chatPartner}
          selectedSchemeName={selectedSchemeName}
          onClose={() => setChatPartner(null)}
          profile={profile}
          selectedSchemeResult={selectedSchemeResult}
          financialDetails={financialDetails}
          language={language}
          nearbyPartners={partners}
        />
      )}
      {callPartner && (
        <PartnerCallModal
          partner={callPartner}
          onClose={() => setCallPartner(null)}
        />
      )}
      {visitPartner && (
        <PartnerVisitModal
          partner={visitPartner}
          onClose={() => setVisitPartner(null)}
        />
      )}
    </div>
  );
};
