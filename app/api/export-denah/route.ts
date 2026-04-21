import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { RoomAssignment } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { assignments }: { assignments: RoomAssignment[] } = await req.json();

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data' }, { status: 400 });
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'SMP Negeri 12 Tarakan';
    wb.created = new Date();

    const publicDir = path.join(process.cwd(), 'public');
    const logoTarakanPath = path.join(publicDir, 'Tarakan.png');
    const logoSmpPath = path.join(publicDir, 'SMP 12.png');

    const logoTarakanBuffer = fs.existsSync(logoTarakanPath) ? fs.readFileSync(logoTarakanPath) : null;
    const logoSmpBuffer = fs.existsSync(logoSmpPath) ? fs.readFileSync(logoSmpPath) : null;

    for (const assignment of assignments) {
      const { rows, columns, seats, roomName } = assignment;

      const safeRoomName = roomName.replace(/[\\/?*[\]:]/g, '').substring(0, 31);
      const ws = wb.addWorksheet(safeRoomName, {
        pageSetup: {
          paperSize: 9,
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });

      // 1. KOP SURAT (Same as Attendance)
      ws.mergeCells('B1:H1');
      ws.mergeCells('B2:H2');
      ws.mergeCells('B3:H3');
      ws.mergeCells('B4:H4');
      ws.mergeCells('B5:H5');

      const kopStyle: Partial<ExcelJS.Style> = {
        alignment: { horizontal: 'center', vertical: 'middle' },
      };

      ws.getCell('B1').value = 'PEMERINTAH KOTA TARAKAN';
      ws.getCell('B1').style = { ...kopStyle, font: { bold: true, size: 13, name: 'Times New Roman' } };
      ws.getCell('B2').value = 'DINAS PENDIDIKAN';
      ws.getCell('B2').style = { ...kopStyle, font: { bold: true, size: 13, name: 'Times New Roman' } };
      ws.getCell('B3').value = 'SMP NEGERI 12 TARAKAN';
      ws.getCell('B3').style = { ...kopStyle, font: { bold: true, size: 16, name: 'Times New Roman' } };
      ws.getCell('B4').value = 'Jl. Aki Balak RT. 13 Kel. Juata Kerikil Kec. Tarakan Utara';
      ws.getCell('B4').style = { ...kopStyle, font: { size: 9, name: 'Times New Roman' } };
      ws.getCell('B5').value = 'Telp. (0551) 3807291, E-mail:smpn12trk@gmail.com Kota Tarakan – Kalimantan Utara';
      ws.getCell('B5').style = { ...kopStyle, font: { size: 9, name: 'Times New Roman' } };

      const row6 = ws.getRow(6);
      row6.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: { style: 'medium' }, bottom: { style: 'thin' } };
      });

      if (logoTarakanBuffer) {
        const logoTarakanId = wb.addImage({ buffer: logoTarakanBuffer as any, extension: 'png' });
        ws.addImage(logoTarakanId, { tl: { col: 0, row: 0 }, ext: { width: 60, height: 80 } });
      }

      if (logoSmpBuffer) {
        const logoSmpId = wb.addImage({ buffer: logoSmpBuffer as any, extension: 'png' });
        // Use a position that is relative to the width of the denah
        const rightCol = Math.max(8, columns * 3 - 1);
        ws.addImage(logoSmpId, { tl: { col: rightCol, row: 0 }, ext: { width: 60, height: 80 } });
      }

      // 2. JUDUL DENAH
      ws.mergeCells(8, 1, 8, Math.max(9, columns * 3));
      const titleCell = ws.getCell(8, 1);
      titleCell.value = 'DENAH TEMPAT DUDUK PESERTA UJIAN';
      titleCell.style = { 
        font: { bold: true, size: 14, name: 'Times New Roman' },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };

      ws.mergeCells(9, 1, 9, Math.max(9, columns * 3));
      const roomCell = ws.getCell(9, 1);
      roomCell.value = `RUANGAN: ${roomName}`;
      roomCell.style = { 
        font: { bold: true, size: 12, name: 'Times New Roman' },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };

      // 3. SEATING GRID
      const startRow = 11;
      const colWidths = [];
      for (let c = 0; c < columns; c++) {
        colWidths.push({ width: 5 });  // No Kursi
        colWidths.push({ width: 25 }); // Nama
        colWidths.push({ width: 8 });  // Kelas
      }
      ws.columns = colWidths;

      // Compute snake numbers (same logic as before)
      const seatToNumberMap = new Map<string, number>();
      let currentNumber = 1;
      for (let c = 0; c < columns; c++) {
        const isDownward = c % 2 === 0;
        const rowIndices = [];
        if (isDownward) {
          for (let r = 0; r < rows; r++) rowIndices.push(r);
        } else {
          for (let r = rows - 1; r >= 0; r--) rowIndices.push(r);
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

      const borderStyle: Partial<ExcelJS.Borders> = {
        top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' }
      };

      for (let r = 0; r < rows; r++) {
        const rowHeight = 35;
        ws.getRow(startRow + (r * 2)).height = rowHeight;
        ws.getRow(startRow + (r * 2) + 1).height = 10; // Spacer row

        for (let c = 0; c < columns; c++) {
          const seatIdx = r * columns + c;
          const seat = seats[seatIdx];
          const colBase = (c * 3) + 1;
          
          const snakeNo = seatToNumberMap.get(seat?.seatId || '') || '';
          
          const cells = [
            ws.getCell(startRow + (r * 2), colBase),
            ws.getCell(startRow + (r * 2), colBase + 1),
            ws.getCell(startRow + (r * 2), colBase + 2)
          ];

          cells.forEach(cell => {
            cell.border = borderStyle;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          });

          if (seat && seat.student) {
            cells[0].value = snakeNo;
            cells[0].font = { bold: true };
            
            cells[1].value = seat.student.nama;
            cells[1].font = { bold: true, size: 10 };
            
            cells[2].value = seat.student.kelas;
            cells[2].font = { bold: true };
            
            // Background color for classes
            const g = seat.student.kelas.toLowerCase();
            let color = 'FFFFFFFF';
            if (g.includes('7') || g.includes('vii')) color = 'FF92D050';
            else if (g.includes('8') || g.includes('viii')) color = 'FFFFFF00';
            else if (g.includes('9') || g.includes('ix')) color = 'FFFF0000';
            
            cells[2].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
          } else if (seat && seat.type === 'pengawas') {
            cells[1].value = 'PENGAWAS';
            cells[1].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
            cells[1].font = { bold: true };
          } else if (seat && seat.type === 'pintu') {
            cells[1].value = 'PINTU';
            cells[1].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
            cells[1].font = { bold: true };
          }
        }
      }

      // PAPAN TULIS at the bottom
      const boardRow = startRow + (rows * 2) + 2;
      ws.mergeCells(boardRow, 1, boardRow, Math.max(9, columns * 3));
      const boardCell = ws.getCell(boardRow, 1);
      boardCell.value = '========== PAPAN TULIS ==========';
      boardCell.style = { 
        alignment: { horizontal: 'center', vertical: 'middle' },
        font: { bold: true, italic: true }
      };
    }

    const buffer = await wb.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Denah_Ujian.xlsx"',
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Gagal generate Excel' }, { status: 500 });
  }
}
