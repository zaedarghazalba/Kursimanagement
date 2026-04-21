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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-600" />
          Panduan Penggunaan Sistem
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1 */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
              1
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Persiapan Data (Upload)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Pastikan file Excel Anda memiliki 7 kolom berikut (urutan tidak masalah, namun pastikan Nama Header benar):
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 grid grid-cols-2 gap-2">
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>No</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>NIS</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>NISN</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>Nama</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>Jenis Kelamin</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>Agama</strong>
              </div>
              <div className="bg-white p-1.5 border rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <strong>Kelas</strong>
              </div>
            </div>
            <p className="text-[10px] text-indigo-600 mt-2 italic font-medium">
              * Pastikan tidak ada typo pada nama kolom di baris pertama Excel Anda.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
              2
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Manajemen Ruang & Layout</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Masuk ke menu <span className="font-semibold text-emerald-700">Ruangan</span> untuk menambah daftar ruang ujian. 
              Gunakan fitur <span className="font-semibold">Layout Settings</span> di halaman Denah untuk mengatur jumlah Baris, Kolom, dan Lorong (Aisle Gap) secara visual.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-sky-200">
              3
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Distribusi & Mode Seating</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              Pilih mode pembagian tempat duduk yang sesuai:
            </p>
            <ul className="text-sm space-y-1.5">
              <li className="flex items-center gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                <span className="font-semibold">Acak:</span> Meminimalkan konflik kelas yang sama duduk berdekatan.
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                <span className="font-semibold">Urut:</span> Membagi siswa sesuai urutan absen dari Excel.
              </li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-violet-200">
              4
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Edit Denah Manual</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gunakan fitur interaktif untuk hasil yang presisi:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-[11px] bg-violet-50 p-2 rounded border border-violet-100 text-violet-800">
                <strong>Drag & Drop:</strong> Tukar posisi antar siswa.
              </div>
              <div className="text-[11px] bg-violet-50 p-2 rounded border border-violet-100 text-violet-800">
                <strong>Pindah:</strong> Klik ikon panah untuk pindah ruangan.
              </div>
              <div className="text-[11px] bg-violet-50 p-2 rounded border border-violet-100 text-violet-800">
                <strong>Hapus:</strong> Hapus kursi kosong/berlebih.
              </div>
              <div className="text-[11px] bg-violet-50 p-2 rounded border border-violet-100 text-violet-800">
                <strong>Toggle:</strong> Klik kursi untuk set Meja Pengawas.
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative pl-12 md:col-span-2">
            <div className="absolute left-0 top-0 w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-amber-200">
              5
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Export Laporan Resmi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sistem akan menghasilkan file Excel profesional dengan **Kop Surat Resmi SMP Negeri 12 Tarakan**. 
              Buka menu <span className="font-semibold text-amber-700">Absensi</span> untuk mengunduh Daftar Hadir (Absensi) dan Denah Ruangan yang siap cetak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
