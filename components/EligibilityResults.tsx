import React, { useState } from 'react';
import { SchemeEligibilityResult, BeneficiaryProfile } from '../types';
import { CheckCircle2, XCircle, Award, ShieldCheck, Percent, ArrowRight, FileText, ExternalLink, HelpCircle, RefreshCw } from 'lucide-react';
import { DecisionAuditModal } from './DecisionAuditModal';

interface Props {
  results: SchemeEligibilityResult[];
  selectedSchemeId: string;
  onSelectScheme: (schemeResult: SchemeEligibilityResult) => void;
  profile: BeneficiaryProfile;
  realtimeUpdateNotification?: boolean;
  onRecalculateRealtime?: () => void;
}

export const EligibilityResults: React.FC<Props> = ({
  results,
  selectedSchemeId,
  onSelectScheme,
  profile,
  realtimeUpdateNotification = false,
  onRecalculateRealtime
}) => {
  const [activeTab, setActiveTab] = useState<'eligible' | 'all'>('eligible');
  const [auditResult, setAuditResult] = useState<SchemeEligibilityResult | null>(null);

  const eligibleCount = results.filter(r => r.isEligible).length;

  const displayResults = activeTab === 'eligible' 
    ? results.filter(r => r.isEligible) 
    : results;

  return (
    <div id="eligibility-matrix" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Realtime Database Update Banner Notification */}
      {realtimeUpdateNotification && (
        <div className="bg-blue-900 text-white px-5 py-3 text-xs flex items-center justify-between border-b border-blue-800 animate-pulse">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-blue-300 animate-spin" />
            <span>
              <strong className="font-bold text-white">Database Rules Updated:</strong> Statutory scheme parameters have changed in PostgreSQL. Recheck your recommendations using latest rules.
            </span>
          </div>
          {onRecalculateRealtime && (
            <button
              onClick={onRecalculateRealtime}
              className="bg-white text-blue-950 font-bold px-3 py-1 rounded text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              [Recalculate Now]
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Step 2 — Eligibility & Scheme Matching</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Evaluated by PostgreSQL Rule Engine (<code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 font-mono">lib/eligibility/engine.ts</code>)
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'eligible' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Eligible Schemes ({eligibleCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Evaluated Schemes ({results.length})
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="p-6 space-y-6">
        {displayResults.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-600 font-medium text-sm">No eligible schemes matched your current profile.</p>
            <p className="text-xs text-slate-500 mt-1">Try switching to "All Evaluated Schemes" tab to view specific failed conditions.</p>
          </div>
        ) : (
          displayResults.map((item, index) => {
            const isSelected = item.scheme.id === selectedSchemeId;
            const isTopMatch = index === 0 && item.isEligible;

            return (
              <div
                key={item.scheme.id}
                className={`border rounded-xl p-5 transition-all relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                    : isTopMatch
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                    : item.isEligible
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-200 bg-slate-50 opacity-90'
                }`}
              >
                {/* Top Ribbons / Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    {isTopMatch && (
                      <span className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        <Award className="w-3.5 h-3.5" />
                        <span>Best Fit Recommendation</span>
                      </span>
                    )}

                    <span className="bg-slate-100 text-slate-700 text-xs font-mono font-semibold px-2 py-0.5 rounded border border-slate-300">
                      {item.scheme.code}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      {item.scheme.ministry}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Match Score Badge */}
                    <div className="flex items-center space-x-1.5 bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-bold">
                      <span>Match Score:</span>
                      <span className={item.score > 70 ? 'text-emerald-400 font-extrabold' : 'text-blue-300'}>
                        {item.score}/100
                      </span>
                    </div>

                    {/* Eligibility Pill */}
                    {item.isEligible ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-300 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> Not Eligible
                      </span>
                    )}
                  </div>
                </div>

                {/* Scheme Title & Description */}
                <h3 className="text-base font-bold text-slate-900 mb-1">{item.scheme.name}</h3>
                <p className="text-xs text-slate-600 mb-3">{item.scheme.description}</p>

                {/* Why This Fits Section */}
                {item.isEligible && item.matchingHighlights && item.matchingHighlights.length > 0 && (
                  <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200/60 mb-4 text-xs">
                    <span className="font-bold text-blue-950 block mb-1">Why this is a strong fit:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-blue-900">
                      {item.matchingHighlights.slice(0, 4).map((hl, hIdx) => (
                        <li key={hIdx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Financial Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100/80 p-3 rounded-lg border border-slate-200 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {item.scheme.code === 'PMEGP' ? 'Max Project Cost for Subsidy' : 'Max Scheme Loan'}
                    </span>
                    <strong className="text-slate-900 text-sm">
                      ₹{(item.scheme.maxLoanAmount / 100000).toFixed(1)} Lakhs
                      {item.scheme.code === 'PMEGP' && <span className="text-[10px] text-slate-500 block font-normal">(Mfg: ₹50L / Service: ₹20L)</span>}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {item.subsidyPercentageEstimated > 0 ? 'Estimated Margin Money Subsidy' : 'Estimated Subsidy'}
                    </span>
                    <strong className="text-emerald-700 text-sm flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> {item.subsidyPercentageEstimated}% (₹{item.maxSubsidyAmountEstimated.toLocaleString('en-IN')})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Interest Rate</span>
                    <strong className="text-slate-900 text-sm">{item.scheme.interestRate}% p.a.</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Moratorium & Tenure</span>
                    <strong className="text-slate-900 text-sm">{item.scheme.moratoriumMonths}m M. / {item.scheme.maxTenureYears} Years</strong>
                  </div>
                </div>

                {/* Rule Verification Audit (Passed vs Failed Conditions) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                  {/* Passed Conditions */}
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                    <div className="font-bold text-emerald-900 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed Rules ({item.passedConditions.length})
                    </div>
                    <ul className="space-y-1 text-emerald-950">
                      {item.passedConditions.map((cond, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{cond.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Failed Conditions */}
                  <div className={`p-3 rounded-lg border ${
                    item.failedConditions.length > 0
                      ? 'bg-red-50/50 border-red-200 text-red-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <div className="font-bold mb-2 flex items-center gap-1">
                      <XCircle className={`w-4 h-4 ${item.failedConditions.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                      <span>Failed Rules ({item.failedConditions.length})</span>
                    </div>
                    {item.failedConditions.length === 0 ? (
                      <p className="text-slate-500 italic">No disqualifying conditions found.</p>
                    ) : (
                      <ul className="space-y-1">
                        {item.failedConditions.map((cond, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>{cond.message}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">Source: {item.scheme.sourceName || 'Official Guidelines'}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200">
                      Version: {item.scheme.ruleVersion || 'v2.6'}
                    </span>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setAuditResult(item)}
                      className="text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                    >
                      <HelpCircle className="w-3 h-3 text-blue-600" /> Why this result?
                    </button>
                    <span className="text-slate-300">|</span>
                    <a
                      href={item.scheme.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1 font-medium"
                    >
                      Official Guidelines <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {item.isEligible && (
                    <button
                      onClick={() => onSelectScheme(item)}
                      className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      <span>{isSelected ? 'Active Selected Scheme' : 'Select for EMI & Partner Routing'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Audit Modal */}
      {auditResult && (
        <DecisionAuditModal
          result={auditResult}
          profile={profile}
          onClose={() => setAuditResult(null)}
        />
      )}
    </div>
  );
};
