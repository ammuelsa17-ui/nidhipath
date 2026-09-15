import React from 'react';
import { Info, AlertCircle } from 'lucide-react';

export const StatusBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-y border-amber-200 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">SIH 2026 Prototype Mode:</strong> Operating on verified local structured demo datasets. No live government APIs, live certificate verification, or live bank NPA data are claimed or simulated.
          </span>
        </div>
        <div className="flex items-center space-x-2 text-amber-700 font-mono text-[11px] shrink-0">
          <Info className="w-3.5 h-3.5" />
          <span>Future Authorized Integration Ready</span>
        </div>
      </div>
    </div>
  );
};
