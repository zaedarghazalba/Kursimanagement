'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { readExcelFile } from '@/lib/excelUtils';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadExcel() {
  const { students, addStudents } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus('error');
      setMessage('File harus berformat Excel (.xlsx atau .xls)');
      return;
    }

    setUploadStatus('idle');
    setMessage('Membaca file...');

    const result = await readExcelFile(file);

    if (result.success) {
      addStudents(result.students);
      setUploadStatus('success');
      setMessage(`Berhasil mengupload ${result.count} siswa`);
    } else {
      setUploadStatus('error');
      setMessage(result.error || 'Terjadi kesalahan');
    }
  }, [addStudents]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Upload Data Siswa</h2>
        <p className="text-sm text-slate-600 mb-4 sm:mb-6">
          Upload file Excel dengan kolom <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-medium text-xs sm:text-sm">nama</code> dan <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-medium text-xs sm:text-sm">kelas</code>
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileSpreadsheet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-slate-400" />
            <p className="text-base sm:text-lg text-slate-700 mb-2 font-medium">
              Drag & drop file Excel
            </p>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">atau klik untuk memilih file</p>
            <p className="text-xs text-slate-500 sm:hidden">atau klik pilih file</p>
          </label>
        </div>

        {uploadStatus !== 'idle' && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              uploadStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Data Siswa Terupload ({students.length} siswa)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kelas</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((student, index) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-slate-800 font-medium">{student.nama}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">
                        {student.kelas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 10 && (
              <p className="text-sm text-slate-500 mt-4 text-center font-medium">
                Menampilkan 10 dari {students.length} siswa
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
