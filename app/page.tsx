'use client';

import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { Upload, DoorOpen, Grid3X3, FileText, Users, AlertCircle, Trash2 } from 'lucide-react';

export default function HomePage() {
  const { students, rooms, roomAssignments, clearAllData } = useAppStore();

  const totalKapasitas = rooms.reduce((sum, room) => sum + room.kapasitas, 0);
  const isReady = students.length > 0 && rooms.length > 0;
  const hasEnoughCapacity = totalKapasitas >= students.length;

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      clearAllData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="mb-3 sm:mb-0 sm:mr-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 sm:mb-2">
              Sistem Manajemen Denah Ujian
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              Kelola pembagian tempat duduk ujian siswa dengan mudah dan otomatis
            </p>
          </div>
          {(students.length > 0 || rooms.length > 0) && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-semibold text-sm sm:text-base w-full sm:w-auto justify-center shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Reset Data
            </button>
          )}
        </div>
      </div>

      {!isReady && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-6 mb-4 sm:mb-8 text-sm sm:text-base">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2 text-sm sm:text-base">
                Langkah yang Belum Dilengkapi
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-700">
                {students.length === 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
                    <Link href="/upload" className="underline hover:text-amber-900 font-medium">
                      Upload data siswa →
                    </Link>
                  </li>
                )}
                {rooms.length === 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
                    <Link href="/ruangan" className="underline hover:text-amber-900 font-medium">
                      Tambah ruangan →
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isReady && !hasEnoughCapacity && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-800 mb-2">Kapasitas Tidak Mencukupi</h3>
              <p className="text-sm text-rose-700">
                Total kapasitas ruangan ({totalKapasitas}) kurang dari jumlah siswa ({students.length}).
                <Link href="/ruangan" className="underline ml-1 hover:text-rose-900 font-medium">
                  Tambah ruangan →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1">{students.length}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Siswa Terupload</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1">{rooms.length}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Ruangan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-sky-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1">{totalKapasitas}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Total Kapasitas</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-violet-100 rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-violet-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1">
            {roomAssignments.length > 0 ? '✓' : '-'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Denah Generated</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Panduan Penggunaan</h2>
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-lg">
              1
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base md:text-lg">Upload Data Siswa</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Upload file Excel dengan kolom <code className="bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm text-slate-800 font-medium">nama</code> dan <code className="bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm text-slate-800 font-medium">kelas</code>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-lg">
              2
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base md:text-lg">Pengaturan Ruangan</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Tambahkan ruangan dan tentukan kapasitas masing-masing ruangan
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-lg">
              3
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base md:text-lg">Generate Denah</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Sistem akan otomatis membagi siswa dan membuat denah tempat duduk
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-lg">
              4
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base md:text-lg">Export Data</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Export data absensi dan denah ke format Excel atau PDF
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
