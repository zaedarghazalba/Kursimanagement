import * as XLSX from 'xlsx-js-style';
import { Student } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface ExcelUploadResult {
  success: boolean;
  count: number;
  students: Student[];
  error?: string;
}

const getCol = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
};

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
          const nama  = getCol(row, 'Nama', 'nama', 'NAMA', 'Nama Siswa', 'nama siswa');
          const kelas = getCol(row, 'Kelas', 'kelas', 'KELAS', 'Kelas Siswa', 'Class', 'class');
          const nis   = getCol(row, 'NIS',  'nis',  'Nis');
          const nisn  = getCol(row, 'NISN', 'nisn', 'Nisn');
          const jk    = getCol(row, 'Jenis Kelamin', 'jenis kelamin', 'Jenis_Kelamin', 'JK', 'jk', 'L/P');
          const agama = getCol(row, 'Agama', 'agama', 'AGAMA');
          const noRaw = row['No'] ?? row['no'] ?? row['NO'] ?? row['Nomor'] ?? '';
          const no    = noRaw !== '' ? Number(noRaw) : students.length + 1;

          if (nama && kelas) {
            students.push({
              id: uuidv4(),
              no: isNaN(Number(no)) ? students.length + 1 : Number(no),
              nis,
              nisn,
              nama,
              jenisKelamin: jk,
              agama,
              kelas,
            });
          }
        }

        if (students.length === 0) {
          resolve({
            success: false,
            count: 0,
            students: [],
            error: 'Tidak ada data siswa valid. Pastikan file memiliki kolom "Nama" dan "Kelas".',
          });
        } else {
          resolve({ success: true, count: students.length, students });
        }
      } catch {
        resolve({
          success: false,
          count: 0,
          students: [],
          error: 'Gagal membaca file Excel. Pastikan format file benar.',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, count: 0, students: [], error: 'Gagal membaca file.' });
    };

    reader.readAsBinaryString(file);
  });
};
