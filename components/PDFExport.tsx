'use client';

import { useState } from 'react';
import { RoomAssignment } from '@/lib/types';
import { generateSeatingPDF } from '@/lib/SeatingPDF';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';

interface PDFExportProps {
  assignments: RoomAssignment[];
}

export default function PDFExport({ assignments }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const blob = await generateSeatingPDF(assignments);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'Denah_Tempat_Duduk.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating || assignments.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>

        {pdfUrl && (
          <>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </>
        )}
      </div>

      {pdfUrl && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Preview PDF</h3>
          </div>
          <iframe
            src={pdfUrl}
            className="w-full h-[800px] border border-slate-200 rounded"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}
