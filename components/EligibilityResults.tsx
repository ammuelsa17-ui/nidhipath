import React, { useState } from 'react';
import { SchemeEligibilityResult } from '../types';
import { CheckCircle2, XCircle, Award, ShieldCheck, Percent, ArrowRight, FileText } from 'lucide-react';

interface Props {
  results: SchemeEligibilityResult[];
  selectedSchemeId: string;
  onSelectScheme: (schemeResult: SchemeEligibilityResult) => void;
}

export const EligibilityResults: React.FC<Props> = ({
  results,
  selectedSchemeId,
  onSelectScheme
}) => {
  const [activeTab, setActiveTab] = useState<'eligible' | 'all'>('eligible');
  const eligibleCount = results.filter(r => r.isEligible).length;

  const displayResults = activeTab === 'eligible' 
    ? results.filter(r => r.isEligible) 
    : results;

  return (
    <div id="eligibility-matrix" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Step 2: Rule-Based Scheme Matching Matrix</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Evaluated by deterministic logic module (<code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 font-mono">lib/eligibility/engine.ts</code>)
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
                <p className="text-xs text-slate-600 mb-4">{item.scheme.description}</p>

                {/* Key Financial Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100/80 p-3 rounded-lg border border-slate-200 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Max Scheme Loan</span>
                    <strong className="text-slate-900 text-sm">₹{(item.scheme.maxLoanAmount / 100000).toFixed(1)} Lakhs</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Estimated Subsidy</span>
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Source:</span>
                    <a
                      href={item.scheme.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono text-[11px]"
                    >
                      {item.scheme.officialSourceUrl}
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
    </div>
  );
};
