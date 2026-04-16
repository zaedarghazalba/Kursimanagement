import * as XLSX from 'xlsx-js-style';
import { Student } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface ExcelUploadResult {
  success: boolean;
  count: number;
  students: Student[];
  error?: string;
}

export const readExcelFile = (file: File): Promise<ExcelUploadResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const students: Student[] = [];

        for (const row of jsonData) {
          // Flexible column name detection - tries various formats
          const nama = row['nama'] || row['Nama'] || row['NAMA'] || 
                       row['Nama Siswa'] || row['nama siswa'] || 
                       row['Name'] || row['name'] || row['NAME'] ||
                       Object.values(row).find((val: unknown) => typeof val === 'string' && val.trim().length > 0);
          
          const kelas = row['kelas'] || row['Kelas'] || row['KELAS'] || 
                        row['Kelas Siswa'] || row['kelas siswa'] ||
                        row['Class'] || row['class'] || row['CLASS'] ||
                        row['Tingkat'] || row['tingkat'];

          if (nama && kelas) {
            students.push({
              id: uuidv4(),
              nama: String(nama).trim(),
              kelas: String(kelas).trim(),
            });
          }
        }

        if (students.length === 0) {
          resolve({
            success: false,
            count: 0,
            students: [],
            error: 'Tidak ada data siswa yang valid. Pastikan file memiliki kolom "nama" dan "kelas".',
          });
        } else {
          resolve({
            success: true,
            count: students.length,
            students,
          });
        }
      } catch (error) {
        resolve({
          success: false,
          count: 0,
          students: [],
          error: 'Gagal membaca file Excel. Pastikan format file benar.',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        count: 0,
        students: [],
        error: 'Gagal membaca file.',
      });
    };

    reader.readAsBinaryString(file);
  });
};
