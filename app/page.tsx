'use client';

import React, { useState, useEffect } from 'react';
import { BeneficiaryProfile, SchemeEligibilityResult, PartnerMatchResult, EMIBreakdown, ReadinessResult, WhatIfResponse } from '../types';
import { calculateSchemeEMI } from '../lib/finance/emi';

import { StatusBanner } from '../components/StatusBanner';
import { BeneficiaryForm } from '../components/BeneficiaryForm';
import { EligibilityResults } from '../components/EligibilityResults';
import { FinancialCalculator } from '../components/FinancialCalculator';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { ApplicationReadiness } from '../components/ApplicationReadiness';
import { PartnerRouter } from '../components/PartnerRouter';
import { AIAssistant } from '../components/AIAssistant';

import { Compass, ShieldCheck, Calculator, Navigation, Sparkles, ArrowDown, RefreshCw } from 'lucide-react';

const INITIAL_PROFILE: BeneficiaryProfile = {
  applicantName: 'Ramesh Naik',
  age: 29,
  gender: 'male',
  socialCategory: 'SC',
  isDifferentlyAbled: false,
  education: 'graduate_plus',
  annualIncome: 250000,
  state: 'Karnataka',
  pinCode: '560034',
  locationType: 'urban',
  projectType: 'manufacturing',
  projectDescription: 'Setting up an eco-friendly paper packaging manufacturing plant',
  estimatedCost: 2500000, // ₹25 Lakhs
  ownContribution: 250000,
  isFirstGeneration: true
};

export default function HomePage() {
  const [profile, setProfile] = useState<BeneficiaryProfile>(INITIAL_PROFILE);
  const [evaluations, setEvaluations] = useState<SchemeEligibilityResult[]>([]);
  const [selectedSchemeResult, setSelectedSchemeResult] = useState<SchemeEligibilityResult | null>(null);
  const [partners, setPartners] = useState<PartnerMatchResult[]>([]);
  const [financialDetails, setFinancialDetails] = useState<EMIBreakdown | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [dbUnavailable, setDbUnavailable] = useState<boolean>(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [realtimeNotice, setRealtimeNotice] = useState<boolean>(false);

  useEffect(() => {
    executePipeline(INITIAL_PROFILE);
  }, []);

  const executePipeline = async (targetProfile: BeneficiaryProfile) => {
    setLoading(true);
    setDbUnavailable(false);
    setDbErrorMessage(null);

    try {
      // 1. Server API Eligibility Evaluation
      const evalRes = await fetch('/api/eligibility/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetProfile)
      });
      const evalData = await evalRes.json();

      if (!evalRes.ok || evalData.error === 'DATABASE_UNAVAILABLE') {
        setDbUnavailable(true);
        setDbErrorMessage(evalData.message || 'PostgreSQL database connection required. Please configure DATABASE_URL in environment settings.');
        setLoading(false);
        return;
      }

      const ranked: SchemeEligibilityResult[] = evalData.results || [];
      setEvaluations(ranked);

      const topEligible = ranked.find(r => r.isEligible) || ranked[0] || null;
      setSelectedSchemeResult(topEligible);

      if (topEligible) {
        // 2. Server API Partner Routing
        const routeRes = await fetch('/api/routing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinCode: targetProfile.pinCode, selectedSchemeId: topEligible.scheme.id })
        });
        const routeData = await routeRes.json();
        const partnerList: PartnerMatchResult[] = routeData.partners || [];
        setPartners(partnerList);

        // 3. EMI Financial Math
        const emi = calculateSchemeEMI(
          targetProfile.estimatedCost,
          topEligible.scheme,
          topEligible.subsidyPercentageEstimated
        );
        setFinancialDetails(emi);

        // 4. Server API Application Readiness
        const readyRes = await fetch('/api/readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schemeId: topEligible.scheme.id, profile: targetProfile })
        });
        const readyData = await readyRes.json();
        setReadiness(readyData.readiness || null);
      }
    } catch (err: any) {
      setDbUnavailable(true);
      setDbErrorMessage(err?.message || 'Failed to communicate with PostgreSQL database server.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = (newProfile: BeneficiaryProfile) => {
    setProfile(newProfile);
    executePipeline(newProfile);
  };

  const handleSelectScheme = async (schemeRes: SchemeEligibilityResult) => {
    setSelectedSchemeResult(schemeRes);

    try {
      const routeRes = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: profile.pinCode, selectedSchemeId: schemeRes.scheme.id })
      });
      const routeData = await routeRes.json();
      setPartners(routeData.partners || []);

      const emi = calculateSchemeEMI(
        profile.estimatedCost,
        schemeRes.scheme,
        schemeRes.subsidyPercentageEstimated
      );
      setFinancialDetails(emi);

      const readyRes = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId: schemeRes.scheme.id, profile })
      });
      const readyData = await readyRes.json();
      setReadiness(readyData.readiness || null);
    } catch (err) {
      console.warn('Error updating selected scheme details:', err);
    }
  };

  const handleRunWhatIf = async (modifiedParams: any): Promise<WhatIfResponse | null> => {
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, ...modifiedParams })
      });
      const data = await res.json();
      return data.simulation || null;
    } catch (err) {
      console.warn('What-If simulation failed:', err);
      return null;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Database Status Banner */}
      <StatusBanner
        dbUnavailable={dbUnavailable}
        dbErrorMessage={dbErrorMessage || undefined}
        onRetry={() => executePipeline(profile)}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-8 shadow-xl border border-slate-800 relative overflow-hidden max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-600/30 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-400/30 font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>PostgreSQL Single Source of Truth • Pure Database-Driven System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NidhiPath — <span className="text-blue-400">Right Scheme.</span> Right Channel. Right Guidance.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminating credit access barriers for micro-entrepreneurs. Deterministic, rule-based algorithms evaluate official statutory criteria directly from PostgreSQL database records, while an AI assistant explains verified financial benefits.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1. PostgreSQL Rule Engine</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>2. EMI Financial Math</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Navigation className="w-4 h-4 text-purple-400" />
              <span>3. Haversine Partner Router</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>4. AI Multilingual Layer</span>
            </div>
          </div>
        </div>
      </section>

      {dbUnavailable ? (
        <div className="max-w-7xl mx-auto p-12 bg-white rounded-2xl border border-red-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Database Service Connection Required</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {dbErrorMessage || 'PostgreSQL database connection required. Please configure DATABASE_URL in environment settings.'}
          </p>
          <button
            onClick={() => executePipeline(profile)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors shadow"
          >
            Retry Database Connection
          </button>
        </div>
      ) : loading ? (
        <div className="max-w-7xl mx-auto p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Querying PostgreSQL database & evaluating statutory rules...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          {/* STEP 1: BENEFICIARY PROFILE */}
          <section className="scroll-mt-20">
            <BeneficiaryForm onProfileSubmit={handleProfileSubmit} initialProfile={profile} />
          </section>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
          </div>

          {/* STEP 2: ELIGIBILITY MATRIX */}
          {selectedSchemeResult && (
            <section className="scroll-mt-20">
              <EligibilityResults
                results={evaluations}
                selectedSchemeId={selectedSchemeResult.scheme.id}
                onSelectScheme={handleSelectScheme}
                profile={profile}
                realtimeUpdateNotification={realtimeNotice}
                onRecalculateRealtime={() => executePipeline(profile)}
              />
            </section>
          )}

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
          </div>

          {/* WHAT-IF SIMULATOR & READINESS ROW */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WhatIfSimulator profile={profile} onRunSimulation={handleRunWhatIf} />
            {readiness && <ApplicationReadiness readiness={readiness} />}
          </section>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
          </div>

          {/* STEP 3: FINANCIAL CALCULATOR */}
          {selectedSchemeResult && (
            <section className="scroll-mt-20">
              <FinancialCalculator
                schemeResult={selectedSchemeResult}
                profile={profile}
                onFinancialCalculated={setFinancialDetails}
              />
            </section>
          )}

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
          </div>

          {/* STEP 4: PARTNER ROUTING */}
          {selectedSchemeResult && (
            <section className="scroll-mt-20">
              <PartnerRouter
                partners={partners}
                pinCode={profile.pinCode}
                selectedSchemeName={selectedSchemeResult.scheme.shortName}
                profile={profile}
                selectedSchemeResult={selectedSchemeResult}
                financialDetails={financialDetails}
              />
            </section>
          )}

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
          </div>

          {/* STEP 5: AI EXPLANATION & GUIDANCE */}
          {selectedSchemeResult && (
            <section className="scroll-mt-20">
              <AIAssistant
                schemeResult={selectedSchemeResult}
                profile={profile}
                financialDetails={financialDetails || undefined}
                topPartner={partners[0]?.partner}
                nearbyPartners={partners}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
