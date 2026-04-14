import * as XLSX from 'xlsx';
import { RoomAssignment, AttendanceRecord } from '@/lib/types';

export const generateAttendance = (
  assignments: RoomAssignment[]
): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  let nomor = 1;

  for (const assignment of assignments) {
    for (const seat of assignment.seats) {
      if (seat.student) {
        const seatNumber = seat.position.row * assignment.columns + seat.position.col + 1;
        records.push({
          nomor: nomor++,
          nama: seat.student.nama,
          kelas: seat.student.kelas,
          nomorKursi: seatNumber,
          ruangan: assignment.roomName,
        });
      }
    }
  }

  return records;
};

export const exportToExcel = (
  data: any[][],
  sheetNames: string[],
  fileName: string
) => {
  const wb = XLSX.utils.book_new();

  data.forEach((rowData, index) => {
    const ws = XLSX.utils.json_to_sheet(rowData);
    
    // Set column widths for better printing
    const colWidths = rowData.length > 0 ? 
      Object.keys(rowData[0]).map((key) => ({
        wch: Math.max(key.length, 15)
      })) : [];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, sheetNames[index]);
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportAttendance = (assignments: RoomAssignment[]) => {
  const attendance = generateAttendance(assignments);

  // Add signature column and format for printing
  const data = attendance.map((record) => ({
    'No': record.nomor,
    'Nama Siswa': record.nama,
    'Kelas': record.kelas,
    'No Kursi': record.nomorKursi,
    'Ruangan': record.ruangan,
    'Tanda Tangan': '', // Empty column for signature
  }));

  exportToExcel([data], ['Absensi Ujian'], 'Absensi_Ujian');
};

export const exportSeatingByRoom = (assignments: RoomAssignment[]) => {
  const sheets: any[][] = [];
  const sheetNames: string[] = [];

  for (const assignment of assignments) {
    const roomData: any[] = [];

    // Add header
    roomData.push({
      'DENAH TEMPAT DUDUK': assignment.roomName,
      'A': '',
      'B': '',
      'C': '',
      'D': '',
      'E': '',
      'F': '',
    });
    roomData.push({}); // Empty row

    // Create grid representation with desk visual
    for (let row = 0; row < assignment.rows; row++) {
      const rowData: any = { 'Baris': row + 1 };
      
      for (let col = 0; col < assignment.columns; col++) {
        const seatIndex = row * assignment.columns + col;
        const seat = assignment.seats[seatIndex];
        
        if (seat && seat.student) {
          // Desk/student format with visual indicator
          rowData[`Kursi ${col + 1}`] = `┌─────────────────┐\n│ ${seat.student.nama}\n│ ${seat.student.kelas}\n└─────────────────┘`;
        } else {
          rowData[`Kursi ${col + 1}`] = `┌─────────────────┐\n│ (Kosong)\n└─────────────────┘`;
        }
      }
      
      roomData.push(rowData);
    }

    sheets.push(roomData);
    sheetNames.push(assignment.roomName);
  }

  exportToExcel(sheets, sheetNames, 'Denah_Tempat_Duduk');
};
