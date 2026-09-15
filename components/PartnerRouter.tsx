import React from 'react';
import { PartnerMatchResult } from '../types';
import { MapPin, Navigation, Phone, Mail, Building2, ExternalLink, CheckCircle } from 'lucide-react';

interface Props {
  partners: PartnerMatchResult[];
  pinCode: string;
  selectedSchemeName: string;
}

export const PartnerRouter: React.FC<Props> = ({
  partners,
  pinCode,
  selectedSchemeName
}) => {
  return (
    <div id="partner-routing" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/30">
            <Navigation className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Step 4: Compatible Channel Partner Routing</h2>
            <p className="text-xs text-slate-300">
              Ranked nearby implementation branches for <strong className="text-white">{selectedSchemeName}</strong>
            </p>
          </div>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-mono">
          Haversine Distance Engine
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
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

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((item, idx) => {
            const p = item.partner;
            const isTopRanked = idx === 0;

            return (
              <div
                key={p.id}
                className={`border rounded-xl p-5 transition-all relative ${
                  isTopRanked
                    ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
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

                {/* Nodal Officer & Contacts */}
                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                  {p.nodalOfficerName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nodal Officer:</span>
                      <strong className="text-slate-900">{p.nodalOfficerName}</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Helpline:</span>
                    <a href={`tel:${p.contactPhone}`} className="text-blue-600 font-mono font-medium hover:underline">
                      {p.contactPhone}
                    </a>
                  </div>
                </div>

                {/* Directions / Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-slate-300"
                  >
                    <span>View Branch Directions</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
