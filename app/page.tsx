'use client';

import React, { useState, useTransition } from 'react';
import { BeneficiaryProfile, SchemeEligibilityResult, PartnerMatchResult, EMIBreakdown } from '../types';
import { evaluateEligibility } from '../lib/eligibility/engine';
import { rankSchemes } from '../lib/matching/ranker';
import { findNearbyPartners } from '../lib/routing/partnerRouter';
import { calculateSchemeEMI } from '../lib/finance/emi';

import { BeneficiaryForm } from '../components/BeneficiaryForm';
import { EligibilityResults } from '../components/EligibilityResults';
import { FinancialCalculator } from '../components/FinancialCalculator';
import { PartnerRouter } from '../components/PartnerRouter';
import { AIAssistant } from '../components/AIAssistant';

import { Compass, ShieldCheck, Calculator, Navigation, Sparkles, ArrowDown } from 'lucide-react';

// Default initial preset profile tailored for SIH26092 Target SC Beneficiary
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
  const [evaluations, setEvaluations] = useState<SchemeEligibilityResult[]>(() => {
    const raw = evaluateEligibility(INITIAL_PROFILE);
    return rankSchemes(raw, INITIAL_PROFILE);
  });

  const [selectedSchemeResult, setSelectedSchemeResult] = useState<SchemeEligibilityResult>(() => {
    const raw = evaluateEligibility(INITIAL_PROFILE);
    const ranked = rankSchemes(raw, INITIAL_PROFILE);
    return ranked.find(r => r.isEligible) || ranked[0];
  });

  const [partners, setPartners] = useState<PartnerMatchResult[]>(() => {
    return findNearbyPartners(INITIAL_PROFILE.pinCode, selectedSchemeResult.scheme.id);
  });

  const [financialDetails, setFinancialDetails] = useState<EMIBreakdown>(() => {
    return calculateSchemeEMI(
      INITIAL_PROFILE.estimatedCost,
      selectedSchemeResult.scheme,
      selectedSchemeResult.subsidyPercentageEstimated
    );
  });

  const handleProfileSubmit = (newProfile: BeneficiaryProfile) => {
    setProfile(newProfile);
    const rawEvaluations = evaluateEligibility(newProfile);
    const ranked = rankSchemes(rawEvaluations, newProfile);
    setEvaluations(ranked);

    // Pick top eligible scheme
    const topEligible = ranked.find(r => r.isEligible) || ranked[0];
    setSelectedSchemeResult(topEligible);

    // Recalculate partners & finance
    setPartners(findNearbyPartners(newProfile.pinCode, topEligible.scheme.id));
    setFinancialDetails(
      calculateSchemeEMI(
        newProfile.estimatedCost,
        topEligible.scheme,
        topEligible.subsidyPercentageEstimated
      )
    );
  };

  const handleSelectScheme = (schemeRes: SchemeEligibilityResult) => {
    setSelectedSchemeResult(schemeRes);
    setPartners(findNearbyPartners(profile.pinCode, schemeRes.scheme.id));
    setFinancialDetails(
      calculateSchemeEMI(
        profile.estimatedCost,
        schemeRes.scheme,
        schemeRes.subsidyPercentageEstimated
      )
    );
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-600/30 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-400/30 font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>AI-Driven Decision Support System for Marginalized Entrepreneurs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NidhiPath — <span className="text-blue-400">Right Scheme.</span> Right Channel. Right Guidance.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminating credit access barriers for micro-entrepreneurs. Deterministic, rule-based algorithms evaluate official statutory criteria first, while an AI assistant explains verified financial benefits and routes beneficiaries to nearby implementation partners.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Rule Eligibility Engine</span>
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

      {/* CONTINUOUS JOURNEY STEP 1: BENEFICIARY PROFILE */}
      <section className="scroll-mt-20">
        <BeneficiaryForm onProfileSubmit={handleProfileSubmit} initialProfile={profile} />
      </section>

      <div className="flex justify-center text-slate-300">
        <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
      </div>

      {/* CONTINUOUS JOURNEY STEP 2: ELIGIBILITY MATRIX */}
      <section className="scroll-mt-20">
        <EligibilityResults
          results={evaluations}
          selectedSchemeId={selectedSchemeResult.scheme.id}
          onSelectScheme={handleSelectScheme}
        />
      </section>

      <div className="flex justify-center text-slate-300">
        <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
      </div>

      {/* CONTINUOUS JOURNEY STEP 3: FINANCIAL CALCULATOR */}
      <section className="scroll-mt-20">
        <FinancialCalculator
          schemeResult={selectedSchemeResult}
          profile={profile}
          onFinancialCalculated={setFinancialDetails}
        />
      </section>

      <div className="flex justify-center text-slate-300">
        <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
      </div>

      {/* CONTINUOUS JOURNEY STEP 4: PARTNER ROUTING */}
      <section className="scroll-mt-20">
        <PartnerRouter
          partners={partners}
          pinCode={profile.pinCode}
          selectedSchemeName={selectedSchemeResult.scheme.shortName}
        />
      </section>

      <div className="flex justify-center text-slate-300">
        <ArrowDown className="w-6 h-6 animate-bounce text-blue-500" />
      </div>

      {/* CONTINUOUS JOURNEY STEP 5: AI EXPLANATION & GUIDANCE */}
      <section className="scroll-mt-20">
        <AIAssistant
          schemeResult={selectedSchemeResult}
          profile={profile}
          financialDetails={financialDetails}
        />
      </section>
    </div>
  );
}
