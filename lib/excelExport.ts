import * as XLSX from 'xlsx-js-style';
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

export const exportAttendance = (
  assignments: RoomAssignment[],
  selectedRoom: string = 'all',
  selectedClass: string = 'all'
) => {
  const wb = XLSX.utils.book_new();
  let hasData = false;

  for (const assignment of assignments) {
    const { rows, columns, seats } = assignment;

    // Compute dynamic snake numbers to match seating plan
    const seatToNumberMap = new Map<string, number>();
    let currentNumber = 1;
    for (let c = 0; c < columns; c++) {
      const isUpward = c % 2 === 0;
      const rowIndices = [];
      if (isUpward) {
        for (let r = rows - 1; r >= 0; r--) rowIndices.push(r);
      } else {
        for (let r = 0; r < rows; r++) rowIndices.push(r);
      }
      for (const r of rowIndices) {
        const index = r * columns + c;
        const seat = seats[index];
        if (seat && seat.type !== 'pengawas' && seat.type !== 'pintu') {
          seatToNumberMap.set(seat.seatId, currentNumber);
          currentNumber++;
        }
      }
    }

    // Collect all valid students in this room
    const studentsInRoom = seats.filter(s => s.student).map(s => ({
      ...s.student!,
      seatNumber: seatToNumberMap.get(s.seatId) || ''
    }));

    if (studentsInRoom.length === 0) continue;

    const wsData: any[][] = [];
    
    // Header bagian atas
    wsData.push([]); 
    wsData.push(['MATA PELAJARAN', '', '', '', '', 'RUANG :', assignment.roomName]); 
    wsData.push([]); 

    // Header tabel
    wsData.push([
      'NO.',
      'NO. KURSI', 
      'NAMA',
      'KELAS',
      'L/P',
      'AGAMA',
      'TANDA TANGAN',
      '', // Kolom kosong untuk span Tanda Tangan
      'KET'
    ]);

    let nomor = 1;

    for (const student of studentsInRoom) {
      // Tanda tangan zigzag (ganjil di kiri, genap di kanan)
      const colTT1 = nomor % 2 !== 0 ? `${nomor}` : '';
      const colTT2 = nomor % 2 === 0 ? `${nomor}` : '';

      wsData.push([
        nomor,
        student.seatNumber,
        student.nama,
        student.kelas,
        '', // L/P
        '', // AGAMA
        colTT1,
        colTT2,
        ''  // KET
      ]);
      nomor++;
    }

    hasData = true;
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Menggabungkan (merge) header dan cell TANDA TANGAN
    ws['!merges'] = [
      { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } }, // Header Tanda Tangan (Baris 4 karena tidak ada header KELAS)
    ];

    // Styling Data untuk border, dll
    const borderStyle = {
       top: { style: "thin" },
       bottom: { style: "thin" },
       left: { style: "thin" },
       right: { style: "thin" }
    };

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    for (let R = 3; R <= range.e.r; ++R) {
      for (let C = 0; C <= 8; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) ws[cell_ref] = { t: 's', v: '' };
        
        if (!ws[cell_ref].s) ws[cell_ref].s = {};
        ws[cell_ref].s.border = borderStyle;
        ws[cell_ref].s.alignment = { vertical: 'center' };
        
        // Header styles
        if (R === 3) {
          ws[cell_ref].s.font = { bold: true };
          ws[cell_ref].s.alignment.horizontal = 'center';
          ws[cell_ref].s.fill = { fgColor: { rgb: "FFEAEAEA" } };
        }
        
        // Center content for NO, NO. KURSI, KELAS
        if (R > 3 && [0, 1, 3, 4].includes(C)) {
          ws[cell_ref].s.alignment.horizontal = 'center';
        }
      }
    }

    // Atur lebar kolom biar rapi
    ws['!cols'] = [
      { wch: 5 },  // NO.
      { wch: 11 }, // NO. KURSI
      { wch: 30 }, // NAMA
      { wch: 8 },  // KELAS
      { wch: 5 },  // L/P
      { wch: 15 }, // AGAMA
      { wch: 15 }, // TANDA TANGAN Kiri
      { wch: 15 }, // TANDA TANGAN Kanan
      { wch: 10 }  // KET
    ];

    // Tambahkan sheet ke excel sesuai nama ruangannya
    const safeRoomName = assignment.roomName.replace(/[\\/?*\[\]]/g, '');
    let finalSheetName = safeRoomName.substring(0, 31);
    
    // Jika sheet name kembar (hanya jaga-jaga)
    let suffix = 1;
    const baseName = finalSheetName;
    while (wb.SheetNames.includes(finalSheetName)) {
       finalSheetName = `${baseName.substring(0, 28)}_${suffix}`;
       suffix++;
    }

    XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
  }

  // Jika tidak ada data sama sekali
  if (!hasData) {
    const ws = XLSX.utils.aoa_to_sheet([['Belum ada data absensi']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi Ujian');
  }

  // Simpan file
  XLSX.writeFile(wb, 'Absensi_Ujian.xlsx');
};

export const exportSeatingByRoom = (assignments: RoomAssignment[]) => {
  const wb = XLSX.utils.book_new();

  for (const assignment of assignments) {
    const { rows, columns, seats, roomName } = assignment;
    const wsData: any[][] = [];

    // Tentukan jumlah total baris/kolom Excel
    // Setiap "kursi" butuh 4 kolom Excel (No, Nama, Kelas, Spacer)
    // Setiap "kursi" butuh 2 baris Excel (Kursi, Spacer)
    const totalExcelCols = columns * 4;
    
    // Inisialisasi grid kosong
    // Kita siapkan baris sekitar header (4) + (rows * 2) + bottom parts (10)
    for (let i = 0; i < 4 + (rows * 2) + 10; i++) {
        wsData.push(new Array(totalExcelCols).fill(''));
    }

    // HEADER
    wsData[0][0] = { v: 'RUANG', s: { font: { bold: true, sz: 12 }, alignment: { horizontal: "center" } } };
    wsData[1][0] = { v: roomName, s: { font: { bold: true, sz: 20 }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" }, right: { style: "medium" } } } };
    
    wsData[0][Math.floor(totalExcelCols / 2) - 2] = { v: 'DENAH TEMPAT DUDUK PESERTA STS/SAS SEMESTER GENAP', s: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } } };
    wsData[1][Math.floor(totalExcelCols / 2) - 2] = { v: 'TAHUN PELAJARAN 2025/2026', s: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } } };

    const startRowIdx = 4;

    // Compute dynamic snake numbers
    const seatToNumberMap = new Map<string, number>();
    let currentNumber = 1;
    for (let c = 0; c < columns; c++) {
      const isUpward = c % 2 === 0;
      const rowIndices = [];
      if (isUpward) {
        for (let r = rows - 1; r >= 0; r--) rowIndices.push(r);
      } else {
        for (let r = 0; r < rows; r++) rowIndices.push(r);
      }
      for (const r of rowIndices) {
        const index = r * columns + c;
        const seat = seats[index];
        if (seat && seat.type !== 'pengawas' && seat.type !== 'pintu') {
          seatToNumberMap.set(seat.seatId, currentNumber);
          currentNumber++;
        }
      }
    }

    // Helper Styles
    const borderStyle = {
      top: { style: "medium", color: { auto: 1 } },
      bottom: { style: "medium", color: { auto: 1 } },
      left: { style: "medium", color: { auto: 1 } },
      right: { style: "medium", color: { auto: 1 } }
    };

    const getGradeColor = (kelas: string) => {
      const g = kelas.toLowerCase();
      if (g.includes('7') || g.includes('vii')) return "FF92D050"; // Green
      if (g.includes('8') || g.includes('viii')) return "FFFFFF00"; // Yellow
      if (g.includes('9') || g.includes('ix')) return "FFFF0000"; // Red
      return "FFFFFFFF"; // White
    };

    // GAMBAR KURSI
    for (let r = 0; r < rows; r++) {
      const excelRow = startRowIdx + (r * 2);

      for (let c = 0; c < columns; c++) {
        const excelCol = c * 4;
        const seatIndex = r * columns + c;
        const seat = seats[seatIndex];

        const snakeNumber = seatToNumberMap.get(seat?.seatId || '') || '';

        const baseAlign = { vertical: "center", horizontal: "center", wrapText: true };

        if (seat && seat.student) {
          const classColor = getGradeColor(seat.student.kelas);
          
          wsData[excelRow][excelCol] = { v: snakeNumber, s: { border: borderStyle, font: { bold: true }, alignment: baseAlign } };
          wsData[excelRow][excelCol + 1] = { v: seat.student.nama, s: { border: borderStyle, font: { bold: true }, alignment: baseAlign } };
          wsData[excelRow][excelCol + 2] = { v: seat.student.kelas, s: { border: borderStyle, fill: { fgColor: { rgb: classColor } }, font: { bold: true }, alignment: baseAlign } };
        } else if (seat && seat.type === 'pengawas') {
          wsData[excelRow][excelCol] = { v: '', s: { border: borderStyle } };
          wsData[excelRow][excelCol + 1] = { v: 'PENGAWAS', s: { border: borderStyle, font: { bold: true }, fill: { fgColor: { rgb: "FFFFC000" } }, alignment: baseAlign } };
          wsData[excelRow][excelCol + 2] = { v: '', s: { border: borderStyle } };
        } else if (seat && seat.type === 'pintu') {
          wsData[excelRow][excelCol] = { v: '', s: { border: borderStyle } };
          wsData[excelRow][excelCol + 1] = { v: 'PINTU', s: { border: borderStyle, font: { bold: true }, fill: { fgColor: { rgb: "FF92D050" } }, alignment: baseAlign } };
          wsData[excelRow][excelCol + 2] = { v: '', s: { border: borderStyle } };
        } else {
          // Empty seat (no name, no number, just bold box)
          wsData[excelRow][excelCol] = { v: '', s: { border: borderStyle } };
          wsData[excelRow][excelCol + 1] = { v: '', s: { border: borderStyle } };
          wsData[excelRow][excelCol + 2] = { v: '', s: { border: borderStyle } };
        }
      }
    }

    // BOTTOM MARKERS (AWAL, AKHIR, PAPAN TULIS)
    const bottomRow = startRowIdx + (rows * 2) + 1;
    
    wsData[bottomRow][1] = { v: '↑', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center", vertical: "center" }, fontConfig: { color: { rgb: "FF4F81BD" } } } };
    wsData[bottomRow + 1][1] = { v: 'AWAL', s: { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" }, border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }, fill: { fgColor: { rgb: "FFEAEAEA" } } } };

    const akhirCol = (columns - 1) * 4 + 1;
    wsData[bottomRow][akhirCol] = { v: '↓', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center", vertical: "center" }, fontConfig: { color: { rgb: "FF4F81BD" } } } };
    wsData[bottomRow + 1][akhirCol] = { v: 'AKHIR', s: { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" }, border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }, fill: { fgColor: { rgb: "FFEAEAEA" } } } };

    // PAPAN TULIS (Bottom most)
    const centerCol = Math.floor(columns / 2) * 4;
    const papanTulisRow = bottomRow + 3;
    wsData[papanTulisRow][centerCol] = { v: 'Papan Tulis', s: { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" }, border: { top: {style:"medium"}, bottom: {style:"medium"}, left: {style:"medium"}, right: {style:"medium"} } } };

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge Cells untuk layout
    const merges = [];

    // Header Merges
    merges.push({ s: { r: 1, c: 0 }, e: { r: 3, c: 1 } }); // RUANG number
    
    // PAPAN TULIS merged
    merges.push({ s: { r: papanTulisRow, c: 1 }, e: { r: papanTulisRow, c: totalExcelCols - 2 } });

    ws['!merges'] = merges;

    // Column Widths
    const colWidths = [];
    for (let c = 0; c < columns; c++) {
      colWidths.push({ wch: 4 });  // No
      colWidths.push({ wch: 18 }); // Nama
      colWidths.push({ wch: 6 });  // Kelas
      colWidths.push({ wch: 2 });  // Spacer
    }
    ws['!cols'] = colWidths;

    // Row heights (bisa disimulasikan agar mirip kotak)
    const rowHeights = [];
    for (let i = 0; i < wsData.length; i++) {
        // Baris yg berisi seat dibuat lebih tinggi
        if (i >= startRowIdx && i < startRowIdx + (rows * 2) && (i - startRowIdx) % 2 === 0) {
            rowHeights.push({ hpt: 30 });
        } else {
            rowHeights.push({ hpt: 15 });
        }
    }
    ws['!rows'] = rowHeights;

    XLSX.utils.book_append_sheet(wb, ws, assignment.roomName.substring(0, 31));
  }

  XLSX.writeFile(wb, 'Denah_Tempat_Duduk.xlsx');
};
