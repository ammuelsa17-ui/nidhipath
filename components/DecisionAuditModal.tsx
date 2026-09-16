import React from 'react';
import { SchemeEligibilityResult, BeneficiaryProfile } from '../types';
import { X, ShieldCheck, FileText, CheckCircle2, XCircle, ExternalLink, Hash, Clock } from 'lucide-react';

interface Props {
  result: SchemeEligibilityResult;
  profile: BeneficiaryProfile;
  onClose: () => void;
}

export const DecisionAuditModal: React.FC<Props> = ({
  result,
  profile,
  onClose
}) => {
  const scheme = result.scheme;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>NidhiPath Decision Audit Trail</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono border border-emerald-400/30">
                  {scheme.ruleVersion || 'v2.6'}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Statutory Rule Evaluation & Audit Record for <strong className="text-white">{scheme.shortName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Audit Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue-600" /> Rule Version
              </span>
              <strong className="text-slate-900 font-mono text-sm">{scheme.ruleVersion || 'v2.6'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                <FileText className="text-blue-600 w-3 h-3" /> Official Guideline Source
              </span>
              <a
                href={scheme.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-semibold hover:text-blue-800 inline-flex items-center gap-1"
              >
                {scheme.sourceName || 'Official FAQ'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" /> Effective Date
              </span>
              <strong className="text-slate-900 font-mono">{scheme.sourceEffectiveDate || '2026-01-07'}</strong>
            </div>
          </div>

          {/* Beneficiary Inputs Profile Grounding */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Evaluated Beneficiary Inputs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 font-mono">
              <div>Age: <strong>{profile.age} yrs</strong></div>
              <div>Category: <strong>{profile.socialCategory}</strong></div>
              <div>Gender: <strong>{profile.gender}</strong></div>
              <div>Income: <strong>₹{profile.annualIncome.toLocaleString('en-IN')}</strong></div>
              <div>Cost: <strong>₹{profile.estimatedCost.toLocaleString('en-IN')}</strong></div>
              <div>Type: <strong>{profile.projectType}</strong></div>
              <div>Location: <strong>{profile.locationType}</strong></div>
              <div>First Gen: <strong>{profile.isFirstGeneration ? 'Yes' : 'No'}</strong></div>
            </div>
          </div>

          {/* Evaluated Rules Rationale List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Rule-by-Rule Deterministic Evaluation Trace
            </h3>

            {/* Passed Rules */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Passed Conditions ({result.passedConditions.length})
              </span>
              <div className="space-y-1.5">
                {result.passedConditions.map((cond, i) => (
                  <div key={i} className="bg-white p-2.5 rounded border border-emerald-200/80 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-950 block">{cond.conditionName}</span>
                      <span className="text-slate-600 text-[11px]">{cond.message}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      Requirement: {cond.requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Rules */}
            {result.failedConditions.length > 0 && (
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-2">
                <span className="font-bold text-red-900 block flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Failed Conditions ({result.failedConditions.length})
                </span>
                <div className="space-y-1.5">
                  {result.failedConditions.map((cond, i) => (
                    <div key={i} className="bg-white p-2.5 rounded border border-red-200/80 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-red-950 block">{cond.conditionName}</span>
                        <span className="text-red-700 text-[11px]">{cond.message}</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-700 bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                        Requirement: {cond.requirement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">Decision Trace ID: trace_{scheme.code.toLowerCase()}_2026</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
