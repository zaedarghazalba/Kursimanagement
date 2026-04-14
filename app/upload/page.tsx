'use client';

import UploadExcel from '@/components/UploadExcel';
import { Upload } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              Upload Data Siswa
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              Upload file Excel dengan kolom nama dan kelas
            </p>
          </div>
        </div>
      </div>
      <UploadExcel />
    </div>
  );
}
