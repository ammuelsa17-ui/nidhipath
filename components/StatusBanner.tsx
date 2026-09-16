import React from 'react';
import { Info, AlertTriangle, Database, RefreshCw } from 'lucide-react';

interface Props {
  dbUnavailable?: boolean;
  dbErrorMessage?: string;
  onRetry?: () => void;
  lastUpdatedDate?: string;
}

export const StatusBanner: React.FC<Props> = ({
  dbUnavailable = false,
  dbErrorMessage,
  onRetry,
  lastUpdatedDate = '16 Sep 2026'
}) => {
  if (dbUnavailable) {
    return (
      <div className="bg-red-900 text-white border-y border-red-700 px-4 py-3 text-xs shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-300 shrink-0" />
            <div>
              <strong className="font-bold text-sm block">DATABASE SERVICE UNAVAILABLE (HTTP 503)</strong>
              <span className="text-red-200">
                {dbErrorMessage || 'PostgreSQL database connection required. Please configure DATABASE_URL in environment settings.'}
              </span>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-1.5 bg-white text-red-900 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition-colors shrink-0 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-y border-slate-800 text-slate-300 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold text-white">PostgreSQL Single Source of Truth:</strong> Dynamic rule engine powered by PostgreSQL database rules.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px] shrink-0">
          <span>Scheme Rules Updated: {lastUpdatedDate}</span>
          <span className="text-slate-600">|</span>
          <a href="/admin" className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
            Admin Portal &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
