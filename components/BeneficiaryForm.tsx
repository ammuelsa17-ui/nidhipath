import React, { useState } from 'react';
import { BeneficiaryProfile, ProjectCategory, SocialCategory, Gender, EducationLevel } from '../types';
import { UserCheck, Sparkles, Sliders, CheckCircle } from 'lucide-react';

interface Props {
  onProfileSubmit: (profile: BeneficiaryProfile) => void;
  initialProfile?: BeneficiaryProfile;
}

const PRESET_PERSONAS: { name: string; tag: string; profile: BeneficiaryProfile }[] = [
  {
    name: 'Demonstration Profile: Ramesh (SC Youth)',
    tag: 'SC Category • Stand-Up India & PMEGP Rules',
    profile: {
      applicantName: 'Ramesh Naik (Demo Profile)',
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
    }
  },
  {
    name: 'Demonstration Profile: Sunita (Rural Woman)',
    tag: 'Matches PMEGP 35% Rural Subsidy',
    profile: {
      applicantName: 'Sunita Devi (Demo Profile)',
      age: 32,
      gender: 'female',
      socialCategory: 'OBC',
      isDifferentlyAbled: false,
      education: '10th_pass',
      annualIncome: 180000,
      state: 'Karnataka',
      pinCode: '562112',
      locationType: 'rural',
      projectType: 'agro_processing',
      projectDescription: 'Establishing a solar-powered spice grinding & food packaging unit',
      estimatedCost: 1200000, // ₹12 Lakhs
      ownContribution: 120000,
      isFirstGeneration: true
    }
  },
  {
    name: 'Demonstration Profile: Mohd. Salim (Micro Vendor)',
    tag: 'Matches PM SVANidhi',
    profile: {
      applicantName: 'Mohd. Salim (Demo Profile)',
      age: 41,
      gender: 'male',
      socialCategory: 'MINORITY',
      isDifferentlyAbled: false,
      education: '8th_pass',
      annualIncome: 140000,
      state: 'Delhi',
      pinCode: '110001',
      locationType: 'urban',
      projectType: 'street_vending',
      projectDescription: 'Expanding fruit & vegetable street vending enterprise with cold box',
      estimatedCost: 40000, // ₹40,000
      ownContribution: 4000,
      isFirstGeneration: false
    }
  }
];

export const BeneficiaryForm: React.FC<Props> = ({ onProfileSubmit, initialProfile }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [profile, setProfile] = useState<BeneficiaryProfile>(
    initialProfile || PRESET_PERSONAS[0].profile
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSubmit(profile);
  };

  const applyPreset = (presetProfile: BeneficiaryProfile) => {
    setProfile(presetProfile);
    onProfileSubmit(presetProfile);
  };

  return (
    <div id="beneficiary-input" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/30">
              <UserCheck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Progressive Disclosure Assessment</h2>
              <p className="text-xs text-slate-300">Step {currentStep} of 2: {currentStep === 1 ? 'About You (Basic Profile & Socio-Economic)' : 'Your Need (Financial Metrics & Project)'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              1. About You
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              2. Your Need
            </button>
          </div>
        </div>
      </div>

      {/* Quick Preset Buttons for Fast Demoing */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>1-Click Demonstration Profiles:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_PERSONAS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p.profile)}
              className="text-left bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 p-2.5 rounded-lg transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{p.name}</div>
              <div className="text-[11px] text-blue-600 font-medium">{p.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section A: Demographic Details (Step 1) */}
        {(currentStep === 1 || true) && (
          <div className={currentStep !== 1 ? 'hidden sm:block opacity-60' : ''}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-slate-400" /> Step 1: Basic Profile & Socio-Economic Criteria</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">Demographics & Category</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Name</label>
                <input
                  type="text"
                  value={profile.applicantName || ''}
                  onChange={e => setProfile({ ...profile, applicantName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 18 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={e => setProfile({ ...profile, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="transgender">Transgender</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={profile.socialCategory}
                  onChange={e => setProfile({ ...profile, socialCategory: e.target.value as SocialCategory })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="MINORITY">Minority Category</option>
                  <option value="GENERAL">General Category</option>
                  <option value="EX_SERVICEMAN">Ex-Serviceman</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Status</label>
                <select
                  value={profile.education}
                  onChange={e => setProfile({ ...profile, education: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="10th_pass">10th Standard Pass</option>
                  <option value="8th_pass">8th Standard Pass</option>
                  <option value="12th_pass">12th Standard Pass</option>
                  <option value="graduate_plus">Graduate / Technical Degree</option>
                  <option value="below_8th">Below 8th Standard</option>
                  <option value="illiterate">No Formal Education</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  step="10000"
                  value={profile.annualIncome}
                  onChange={e => setProfile({ ...profile, annualIncome: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code / Area</label>
                <input
                  type="text"
                  maxLength={6}
                  value={profile.pinCode}
                  onChange={e => setProfile({ ...profile, pinCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  placeholder="560034"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Area Type</label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value="rural"
                      checked={profile.locationType === 'rural'}
                      onChange={() => setProfile({ ...profile, locationType: 'rural' })}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2">Rural Area (Higher Subsidy)</span>
                  </label>
                  <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value="urban"
                      checked={profile.locationType === 'urban'}
                      onChange={() => setProfile({ ...profile, locationType: 'urban' })}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2">Urban Area</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Enterprise & Financial Requirements (Step 2) */}
        <div className={`pt-4 border-t border-slate-200 ${currentStep !== 2 ? 'hidden sm:block' : ''}`}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-slate-400" /> Step 2: Financial Need & Enterprise Project</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">Financial Metrics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category / Activity</label>
              <select
                value={profile.projectType}
                onChange={e => setProfile({ ...profile, projectType: e.target.value as ProjectCategory })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="agro_processing">Agro / Food Processing Unit</option>
                <option value="manufacturing">Manufacturing / Production</option>
                <option value="services">Service Sector / Workshop</option>
                <option value="trading">Retail & Trading Business</option>
                <option value="street_vending">Micro / Street Vending</option>
                <option value="handicraft_artisan">Handicrafts & Traditional Artisan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Project Cost (₹)</label>
              <input
                type="number"
                step="50000"
                value={profile.estimatedCost}
                onChange={e => setProfile({ ...profile, estimatedCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Own Contribution / Equity (₹)</label>
              <input
                type="number"
                step="10000"
                value={profile.ownContribution}
                onChange={e => setProfile({ ...profile, ownContribution: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isFirstGeneration}
                onChange={e => setProfile({ ...profile, isFirstGeneration: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 font-medium">First Generation Entrepreneur (Greenfield Project)</span>
            </label>
          </div>
        </div>

        {/* Form Controls / Navigation */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <span>Proceed to Step 2: Financial Need →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <span>← Back to Step 1: Profile</span>
            </button>
          )}

          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-auto"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Find Suitable Schemes & Evaluate Eligibility</span>
          </button>
        </div>
      </form>
    </div>
  );
};
