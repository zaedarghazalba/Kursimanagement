'use client';

import { useAppStore } from '@/store/useAppStore';
import { generateAttendance } from '@/lib/excelExport';
import { exportAttendance, exportSeatingByRoom } from '@/lib/excelExport';
import PDFExport from '@/components/PDFExport';
import { Download, FileSpreadsheet, Users, FileText } from 'lucide-react';

export default function AbsensiPage() {
  const { roomAssignments, students } = useAppStore();

  const attendance = generateAttendance(roomAssignments);

  const handleExportAttendance = () => {
    if (roomAssignments.length === 0) return;
    exportAttendance(roomAssignments);
  };

  const handleExportSeating = () => {
    if (roomAssignments.length === 0) return;
    exportSeatingByRoom(roomAssignments);
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
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-sm sm:text-base shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="sm:inline">Excel</span>
              </button>
              <button
                onClick={handleExportSeating}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-semibold text-sm sm:text-base shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="sm:inline">PDF</span>
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
              Total Siswa Terdata: <span className="font-bold text-indigo-900">{attendance.length}</span> siswa
              dari <span className="font-bold text-indigo-900">{students.length}</span> siswa
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold text-slate-800 mb-4">Daftar Absensi</h2>
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">No</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Nama</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Kelas</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">No Kursi</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Ruangan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={`${record.ruangan}-${record.nomorKursi}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 font-medium">{record.nomor}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-800 font-semibold whitespace-nowrap">{record.nama}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {record.kelas}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">{record.nomorKursi}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">{record.ruangan}</td>
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
