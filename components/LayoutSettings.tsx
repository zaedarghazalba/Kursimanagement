'use client';

import { useAppStore } from '@/store/useAppStore';
import { Settings, Grid3X3 } from 'lucide-react';

export default function LayoutSettings() {
  const { customRows, customColumns, aisleGap, setCustomRows, setCustomColumns, setAisleGap } = useAppStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
        <h3 className="text-base sm:text-lg font-bold text-slate-800">Pengaturan Layout</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            Jumlah Baris
          </label>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={customRows}
              onChange={(e) => setCustomRows(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            Jumlah Kolom
          </label>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={customColumns}
              onChange={(e) => setCustomColumns(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            Jarak Lorong (Gap)
          </label>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={aisleGap}
              onChange={(e) => setAisleGap(parseInt(e.target.value) || 0)}
              min="0"
              max="5"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">0 = tanpa lorong</p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs sm:text-sm text-slate-600">
          <span className="font-semibold">Total Kapasitas:</span> {customRows * customColumns} kursi 
          ({customRows} baris × {customColumns} kolom)
        </p>
      </div>
    </div>
  );
}
