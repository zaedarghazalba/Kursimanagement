'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateAttendance } from '@/lib/excelExport';
import { exportSeatingByRoom } from '@/lib/excelExport';
import PDFExport from '@/components/PDFExport';
import { FileSpreadsheet, Users, FileText, Filter, Loader2 } from 'lucide-react';

export default function AbsensiPage() {
  const { roomAssignments, students } = useAppStore();
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const fullAttendance = generateAttendance(roomAssignments);
  
  const uniqueRooms = Array.from(new Set(fullAttendance.map((a) => a.ruangan))).sort();
  const uniqueClasses = Array.from(new Set(fullAttendance.map((a) => a.kelas))).sort();

  const attendance = fullAttendance.filter((record) => {
    if (selectedRoom !== 'all' && record.ruangan !== selectedRoom) return false;
    if (selectedClass !== 'all' && record.kelas !== selectedClass) return false;
    return true;
  });

  const [isExportingDenah, setIsExportingDenah] = useState(false);

  const handleExportAttendance = async () => {
    if (roomAssignments.length === 0) return;
    setIsExporting(true);
    try {
      const res = await fetch('/api/export-absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: roomAssignments }),
      });
      if (!res.ok) throw new Error('Gagal generate Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Absensi_Ujian.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal membuat file Excel. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSeating = async () => {
    if (roomAssignments.length === 0) return;
    setIsExportingDenah(true);
    try {
      const res = await fetch('/api/export-denah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: roomAssignments }),
      });
      if (!res.ok) throw new Error('Gagal generate Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Denah_Ujian.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal membuat file Excel Denah. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsExportingDenah(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                Data Absensi
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                Lihat dan export data absensi ujian
              </p>
            </div>
          </div>
          {roomAssignments.length > 0 && (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <button
                onClick={handleExportAttendance}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-sm sm:text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExporting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileText className="w-4 h-4" />}
                <span className="sm:inline">{isExporting ? 'Membuat...' : 'Generate Absensi'}</span>
              </button>
              <button
                onClick={handleExportSeating}
                disabled={isExportingDenah}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-semibold text-sm sm:text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExportingDenah
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileSpreadsheet className="w-4 h-4" />}
                <span className="sm:inline">{isExportingDenah ? 'Membuat...' : 'Generate Denah'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {roomAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 text-lg font-medium">
            Belum ada data absensi. Generate denah tempat duduk terlebih dahulu.
          </p>
        </div>
      ) : (
        <>
          {/* PDF Export Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Export Denah PDF</h2>
            <p className="text-sm text-slate-600 mb-4">
              Generate dan download denah tempat duduk dalam format PDF dengan tampilan visual kotak untuk setiap kursi
            </p>
            <PDFExport assignments={roomAssignments} />
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-800 font-medium">
              Total Siswa Terdata: <span className="font-bold text-indigo-900">{fullAttendance.length}</span> siswa
              dari <span className="font-bold text-indigo-900">{students.length}</span> siswa
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-base sm:text-xl font-bold text-slate-800">Daftar Absensi</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 pl-3 pr-8"
                  >
                    <option value="all">Semua Ruangan</option>
                    {uniqueRooms.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 pl-3 pr-8"
                  >
                    <option value="all">Semua Kelas</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">No</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">NIS</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">NISN</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Nama</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Jenis Kelamin</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Agama</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Kelas</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">No Kursi</th>
                    <th className="px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Ruangan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={`${record.ruangan}-${record.nomorKursi}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 font-medium">{record.nomor}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-500">{record.nis || '-'}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-500">{record.nisn || '-'}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-800 font-semibold whitespace-nowrap">{record.nama}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">{record.jenisKelamin || '-'}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">{record.agama || '-'}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {record.kelas}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">{record.nomorKursi}</td>
                      <td className="px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">{record.ruangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
