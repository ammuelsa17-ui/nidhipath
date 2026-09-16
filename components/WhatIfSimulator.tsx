import React, { useState } from 'react';
import { BeneficiaryProfile, WhatIfResponse, SocialCategory, ProjectCategory } from '../types';
import { Sliders, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface Props {
  profile: BeneficiaryProfile;
  onRunSimulation: (modifiedParams: {
    modifiedCost?: number;
    modifiedIncome?: number;
    modifiedCategory?: SocialCategory;
    modifiedLocation?: 'urban' | 'rural';
    modifiedActivity?: ProjectCategory;
  }) => Promise<WhatIfResponse | null>;
}

export const WhatIfSimulator: React.FC<Props> = ({
  profile,
  onRunSimulation
}) => {
  const [cost, setCost] = useState<number>(profile.estimatedCost);
  const [income, setIncome] = useState<number>(profile.annualIncome);
  const [category, setCategory] = useState<SocialCategory>(profile.socialCategory);
  const [location, setLocation] = useState<'urban' | 'rural'>(profile.locationType);
  const [activity, setActivity] = useState<ProjectCategory>(profile.projectType);
  const [simulation, setSimulation] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSimulate = async () => {
    setLoading(true);
    const res = await onRunSimulation({
      modifiedCost: cost,
      modifiedIncome: income,
      modifiedCategory: category,
      modifiedLocation: location,
      modifiedActivity: activity
    });
    setSimulation(res);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">What-If Real-Time Scenario Simulator</h3>
            <p className="text-[11px] text-slate-400">Test parameter variations to see instant scheme ranking & loan shifts</p>
          </div>
        </div>
        <span className="bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded font-mono text-[10px] border border-blue-700/50">
          Real-Time Rule Re-evaluation
        </span>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Test Project Cost (₹)</label>
          <input
            type="number"
            step={50000}
            value={cost}
            onChange={e => setCost(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white text-xs"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Test Annual Income (₹)</label>
          <input
            type="number"
            step={25000}
            value={income}
            onChange={e => setIncome(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white text-xs"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Test Social Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as SocialCategory)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
          >
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST">ST (Scheduled Tribe)</option>
            <option value="OBC">OBC</option>
            <option value="GENERAL">General</option>
            <option value="MINORITY">Minority</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          {loading ? 'Simulating Engine...' : 'Run Scenario Simulation'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Simulation Results Comparison */}
      {simulation && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="border-r border-slate-700 pr-3">
              <span className="text-slate-400 text-[10px] block font-mono">BASELINE BEST FIT</span>
              <strong className="text-slate-200 text-xs block">{simulation.originalBestFit}</strong>
            </div>
            <div className="pl-1">
              <span className="text-blue-400 text-[10px] block font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> SIMULATED BEST FIT
              </span>
              <strong className="text-emerald-400 text-xs block font-extrabold">{simulation.newBestFit}</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px]">
            <span className="font-bold text-slate-300 block mb-1">Why ranking changed:</span>
            <ul className="space-y-1 text-slate-400">
              {simulation.reasonsForChange.map((reason, rIdx) => (
                <li key={rIdx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
