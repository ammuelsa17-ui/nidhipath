import React from 'react';
import { ReadinessResult } from '../types';
import { FileCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  readiness: ReadinessResult;
}

export const ApplicationReadiness: React.FC<Props> = ({ readiness }) => {
  const getBadgeColor = (status: string) => {
    if (status === 'READY') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'PARTIALLY_READY') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Readiness Engine</h3>
            <p className="text-[11px] text-slate-500">Statutory Document Verification Checklist for {readiness.schemeName}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-mono ${getBadgeColor(readiness.status)}`}>
          Readiness: {readiness.readinessScore}% ({readiness.status.replace('_', ' ')})
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all ${
              readiness.readinessScore >= 80 ? 'bg-emerald-600' : readiness.readinessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${readiness.readinessScore}%` }}
          />
        </div>
      </div>

      {/* Mandatory Documents Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-800 block text-[11px]">Mandatory Statutory Documents ({readiness.mandatoryDocuments.length})</span>
          <ul className="space-y-1 text-slate-700">
            {readiness.mandatoryDocuments.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{doc.documentName}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1 text-blue-950">
          <span className="font-bold block text-[11px] flex items-center gap-1 text-blue-900">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Next Best Action
          </span>
          <p className="text-[11px] leading-relaxed text-blue-900">{readiness.nextBestAction}</p>
        </div>
      </div>
    </div>
  );
};
