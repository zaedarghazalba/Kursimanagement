'use client';

import { useState } from 'react';
import RoomForm from '@/components/RoomForm';
import RoomList from '@/components/RoomList';
import { Plus, DoorOpen } from 'lucide-react';

export default function RuanganPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <DoorOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                Pengaturan Ruangan
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                Buat dan kelola ruangan dengan kapasitas custom
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-sm sm:text-base w-full sm:w-auto justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Ruangan
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Ruangan Baru</h2>
          <RoomForm />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Daftar Ruangan</h2>
        <RoomList />
      </div>
    </div>
  );
}
