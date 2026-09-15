import React from 'react';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand logo & tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white">NidhiPath</span>
              <span className="bg-blue-900/80 text-blue-300 text-xs px-2 py-0.5 rounded font-mono border border-blue-700/50">
                Decision-Support Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Right Scheme. Right Channel. Right Guidance.
            </p>
          </div>
        </div>

        {/* SIH Core Principle Badge */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            Engine: <strong className="text-white">RULES DECIDE.</strong> Assistant: <strong className="text-blue-400">AI EXPLAINS.</strong>
          </span>
        </div>

        {/* Quick Nav Anchor Links */}
        <nav className="hidden sm:flex items-center space-x-6 text-sm text-slate-300">
          <a href="#beneficiary-input" className="hover:text-blue-400 transition-colors">1. Profile Input</a>
          <a href="#eligibility-matrix" className="hover:text-blue-400 transition-colors">2. Eligibility Engine</a>
          <a href="#financial-calc" className="hover:text-blue-400 transition-colors">3. Financial EMI</a>
          <a href="#partner-routing" className="hover:text-blue-400 transition-colors">4. Partner Router</a>
          <a href="#ai-guidance" className="hover:text-blue-400 transition-colors flex items-center gap-1 text-blue-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> 5. AI Guidance
          </a>
        </nav>
      </div>
    </header>
  );
};
