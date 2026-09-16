'use client';

import React, { useState, useEffect } from 'react';
import { Scheme, ChannelPartner, SchemeSource, RuleVersion, DBEligibilityRule } from '../../types';
import { ShieldCheck, Database, Save, CheckCircle2, AlertTriangle, Send, RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schemes' | 'rules' | 'documents' | 'partners' | 'sources' | 'versions'>('schemes');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [partners, setPartners] = useState<ChannelPartner[]>([]);
  const [sources, setSources] = useState<SchemeSource[]>([]);
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Selected for edit/validate/publish workflow
  const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<DBEligibilityRule> | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partial<ChannelPartner> | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const res = await fetch('/api/schemes', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || data.error === 'DATABASE_UNAVAILABLE') {
        setDbError(data.message || 'Database Connection Required — Please configure DATABASE_URL in environment settings.');
        setLoading(false);
        return;
      }
      setSchemes(data.schemes || []);
    } catch (err: any) {
      setDbError(err?.message || 'Failed to fetch admin data from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateScheme = (scheme: Partial<Scheme>) => {
    const errors: string[] = [];
    if (!scheme.name || scheme.name.trim().length === 0) errors.push('Scheme Name is required.');
    if (!scheme.code || scheme.code.trim().length === 0) errors.push('Scheme Code is required.');
    if (scheme.interestRate === undefined || scheme.interestRate < 0 || scheme.interestRate > 30) {
      errors.push('Interest Rate must be between 0% and 30%.');
    }
    if (scheme.maxLoanAmount === undefined || scheme.maxLoanAmount <= 0) {
      errors.push('Maximum Loan Amount must be greater than 0.');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveScheme = async () => {
    if (!editingScheme) return;
    if (!handleValidateScheme(editingScheme)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/schemes/${editingScheme.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScheme)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishStatus(`Successfully updated scheme ${editingScheme.code} in PostgreSQL database.`);
        setEditingScheme(null);
        await loadAdminData();
      } else {
        setValidationErrors([data.message || 'Failed to update scheme.']);
      }
    } catch (err: any) {
      setValidationErrors([err?.message || 'Server error updating scheme.']);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishRuleVersion = async (schemeId: string, version: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId,
          newVersion: version,
          changeSummary: 'Admin statutory rule update via NidhiPath Admin Data Portal',
          publishedBy: 'MoSJE Nodal Administrator'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishStatus(`Rule Version '${version}' published to PostgreSQL database for ${schemeId}.`);
        await loadAdminData();
      } else {
        setValidationErrors([data.message || 'Failed to publish rule version.']);
      }
    } catch (err: any) {
      setValidationErrors([err?.message || 'Publish server error.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold text-white">NidhiPath Admin Data Portal</span>
                <span className="bg-emerald-900/80 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono border border-emerald-700/50">
                  PostgreSQL Master
                </span>
              </div>
              <p className="text-xs text-slate-400">Statutory Data Management • Edit &rarr; Validate &rarr; Preview &rarr; Publish Workflow</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public App</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {dbError ? (
          <div className="bg-red-950 border border-red-800 p-6 rounded-2xl text-red-200 space-y-3">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-base">
              <AlertTriangle className="w-6 h-6" />
              <span>DATABASE CONNECTION REQUIRED (HTTP 503)</span>
            </div>
            <p className="text-xs">{dbError}</p>
            <button
              onClick={loadAdminData}
              className="bg-red-800 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Retry PostgreSQL Connection
            </button>
          </div>
        ) : (
          <>
            {/* Status Notifications */}
            {publishStatus && (
              <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {publishStatus}
                </span>
                <button onClick={() => setPublishStatus(null)} className="text-emerald-400 hover:text-white font-mono">&times;</button>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-red-950/80 border border-red-700 text-red-200 px-4 py-3 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" /> Safe Publishing Validation Failed:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Admin Tabs */}
            <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto">
              {(['schemes', 'rules', 'documents', 'partners', 'sources', 'versions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Panel: Schemes */}
            {activeTab === 'schemes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300">Statutory Schemes Master Dataset ({schemes.length} Active Schemes)</span>
                  <span className="font-mono text-slate-400 text-[11px]">Sole Source: PostgreSQL/Supabase</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {schemes.map((scheme) => (
                    <div key={scheme.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-700/50">
                              {scheme.code}
                            </span>
                            <h3 className="font-bold text-white text-sm">{scheme.name}</h3>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">{scheme.ministry}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded text-xs font-mono border border-emerald-700/50">
                            Version: {scheme.ruleVersion || 'v2.6'}
                          </span>
                          <button
                            onClick={() => setEditingScheme(scheme)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" /> Edit Parameters
                          </button>
                        </div>
                      </div>

                      {/* Financial & Rule Summary Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Interest Rate</span>
                          <strong className="text-emerald-400 font-bold text-sm">{scheme.interestRate}% p.a.</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Max Loan Ceiling</span>
                          <strong className="text-white text-sm">₹{(scheme.maxLoanAmount / 100000).toFixed(1)} Lakhs</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Max Subsidy</span>
                          <strong className="text-amber-400 text-sm">{scheme.maxSubsidyPercent}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Tenure / Moratorium</span>
                          <strong className="text-slate-300 text-sm">{scheme.maxTenureYears}y / {scheme.moratoriumMonths}m</strong>
                        </div>
                      </div>

                      {/* Rule Versioning Quick Publish Action */}
                      <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
                        <span>Source: <a href={scheme.officialSourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{scheme.sourceName || 'Official FAQ'}</a></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePublishRuleVersion(scheme.id, `v${(parseFloat((scheme.ruleVersion || 'v2.6').replace('v', '')) + 0.1).toFixed(1)}`)}
                            disabled={saving}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3 text-blue-400" /> Publish Next Version
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheme Editing Modal */}
            {editingScheme && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Edit Scheme Parameters: {editingScheme.code}</h3>
                    <button onClick={() => setEditingScheme(null)} className="text-slate-400 hover:text-white font-mono">&times;</button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Interest Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingScheme.interestRate ?? 8.0}
                        onChange={e => setEditingScheme({ ...editingScheme, interestRate: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Max Loan Amount (₹)</label>
                      <input
                        type="number"
                        step="50000"
                        value={editingScheme.maxLoanAmount ?? 4500000}
                        onChange={e => setEditingScheme({ ...editingScheme, maxLoanAmount: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Rule Version Tag</label>
                      <input
                        type="text"
                        value={editingScheme.ruleVersion ?? 'v2.6'}
                        onChange={e => setEditingScheme({ ...editingScheme, ruleVersion: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                    <button onClick={() => setEditingScheme(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                    <button onClick={handleSaveScheme} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Save to PostgreSQL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
