import React, { useState, useEffect } from 'react';
import { SchemeEligibilityResult, BeneficiaryProfile, EMIBreakdown } from '../types';
import { calculateEMI } from '../lib/finance/emi';
import { Calculator, DollarSign, Calendar, TrendingDown, Layers } from 'lucide-react';

interface Props {
  schemeResult: SchemeEligibilityResult;
  profile: BeneficiaryProfile;
  onFinancialCalculated?: (emiData: EMIBreakdown) => void;
}

export const FinancialCalculator: React.FC<Props> = ({
  schemeResult,
  profile,
  onFinancialCalculated
}) => {
  const scheme = schemeResult.scheme;

  const maxLoanPossible = Math.min(profile.estimatedCost, scheme.maxLoanAmount);

  const [loanAmount, setLoanAmount] = useState<number>(maxLoanPossible);
  const [tenureYears, setTenureYears] = useState<number>(scheme.maxTenureYears);
  const [emiDetails, setEmiDetails] = useState<EMIBreakdown>(
    calculateEMI(maxLoanPossible, scheme.interestRate, scheme.maxTenureYears, schemeResult.subsidyPercentageEstimated)
  );

  useEffect(() => {
    const updatedMax = Math.min(profile.estimatedCost, scheme.maxLoanAmount);
    setLoanAmount(updatedMax);
    setTenureYears(scheme.maxTenureYears);
    const updated = calculateEMI(
      updatedMax,
      scheme.interestRate,
      scheme.maxTenureYears,
      schemeResult.subsidyPercentageEstimated
    );
    setEmiDetails(updated);
    if (onFinancialCalculated) onFinancialCalculated(updated);
  }, [schemeResult, profile]);

  const handleLoanChange = (val: number) => {
    setLoanAmount(val);
    const updated = calculateEMI(val, scheme.interestRate, tenureYears, schemeResult.subsidyPercentageEstimated);
    setEmiDetails(updated);
    if (onFinancialCalculated) onFinancialCalculated(updated);
  };

  const handleTenureChange = (val: number) => {
    setTenureYears(val);
    const updated = calculateEMI(loanAmount, scheme.interestRate, val, schemeResult.subsidyPercentageEstimated);
    setEmiDetails(updated);
    if (onFinancialCalculated) onFinancialCalculated(updated);
  };

  return (
    <div id="financial-calc" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/30">
            <Calculator className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Step 3 — Financial Calculator</h2>
            <p className="text-xs text-slate-300">
              Deterministic Loan Math for <strong className="text-white">{scheme.shortName}</strong>
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-mono">
          Formula: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" /> Loan Parameters
          </h3>

          {/* Loan Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold text-slate-700">Loan Principal (P)</span>
              <strong className="text-blue-900 font-mono text-sm">₹{loanAmount.toLocaleString('en-IN')}</strong>
            </div>
            <input
              type="range"
              min={Math.min(10000, maxLoanPossible)}
              max={maxLoanPossible}
              step={10000}
              value={loanAmount}
              onChange={e => handleLoanChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>Min ₹10k</span>
              <span>Max ₹{maxLoanPossible.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold text-slate-700">Tenure (Years)</span>
              <strong className="text-blue-900 font-mono text-sm">{tenureYears} Years ({tenureYears * 12} Mos)</strong>
            </div>
            <input
              type="range"
              min={1}
              max={scheme.maxTenureYears}
              step={1}
              value={tenureYears}
              onChange={e => handleTenureChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>1 Year</span>
              <span>Max {scheme.maxTenureYears} Years</span>
            </div>
          </div>

          {/* Fixed Scheme Parameters */}
          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Interest Rate (p.a.):</span>
              <strong className="text-slate-900 font-mono">{scheme.interestRate}%</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Moratorium Period:</span>
              <strong className="text-slate-900 font-mono">{scheme.moratoriumMonths} Months</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Margin Money Subsidy:</span>
              <strong className="text-emerald-700 font-mono">{schemeResult.subsidyPercentageEstimated}%</strong>
            </div>
          </div>
        </div>

        {/* Results Metrics Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly EMI Card */}
            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block mb-1">Monthly Repayment (EMI)</span>
              <div className="text-2xl font-extrabold text-blue-400 font-mono">
                ₹{emiDetails.monthlyEMI.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                For {emiDetails.tenureMonths} consecutive months
              </span>
            </div>

            {/* Estimated Subsidy Savings Card */}
            <div className="bg-emerald-50 text-emerald-900 p-5 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-medium block mb-1">Estimated Margin Money Subsidy</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                ₹{emiDetails.estimatedSubsidyAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-800 mt-2 block font-medium">
                {schemeResult.subsidyPercentageEstimated}% Margin Subvention
              </span>
              <span className="text-[9px] text-slate-500 mt-1 block italic">
                *Subject to applicable scheme rules, bank sanction & conditions.
              </span>
            </div>

            {/* Total Interest Card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block mb-1">Total Interest Payable</span>
              <div className="text-2xl font-bold text-slate-800 font-mono">
                ₹{emiDetails.totalInterest.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Total Repayment: ₹{emiDetails.totalRepayment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* First Year Amortization Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" /> Year 1 Amortization Schedule (First 12 Months)
              </span>
              <span className="text-slate-500 font-mono">Currency: INR (₹)</span>
            </div>

            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Principal Paid</th>
                    <th className="px-4 py-2">Interest Paid</th>
                    <th className="px-4 py-2">Remaining Principal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {emiDetails.monthlyBreakdownFirstYear.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50">
                      <td className="px-4 py-1.5 font-bold">Month {row.month}</td>
                      <td className="px-4 py-1.5 text-emerald-700">₹{row.principal.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-1.5 text-amber-700">₹{row.interest.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-1.5 text-slate-900 font-semibold">₹{row.remainingBalance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
