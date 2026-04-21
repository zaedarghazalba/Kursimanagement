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

    const logoTarakanBuffer = fs.existsSync(logoTarakanPath)
      ? fs.readFileSync(logoTarakanPath)
      : null;
    const logoSmpBuffer = fs.existsSync(logoSmpPath)
      ? fs.readFileSync(logoSmpPath)
      : null;

    for (const assignment of assignments) {
      const { rows, columns, seats, roomName } = assignment;

      const seatToNumberMap = new Map<string, number>();
      let currentNumber = 1;
      for (let c = 0; c < columns; c++) {
        const isUpward = c % 2 === 0;
        const rowIndices: number[] = [];
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

      const studentsInRoom = seats
        .filter((s) => s.student)
        .map((s) => ({
          ...s.student!,
          seatNumber: seatToNumberMap.get(s.seatId) || '',
        }));

      if (studentsInRoom.length === 0) continue;

      const safeRoomName = roomName.replace(/[\\/?*[\]:]/g, '').substring(0, 31);
      const ws = wb.addWorksheet(safeRoomName, {
        pageSetup: {
          paperSize: 9,
          orientation: 'portrait',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.5,
            right: 0.5,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
      });

      ws.columns = [
        { key: 'a', width: 5 },
        { key: 'b', width: 11 },
        { key: 'c', width: 32 },
        { key: 'd', width: 8 },
        { key: 'e', width: 5 },
        { key: 'f', width: 16 },
        { key: 'g', width: 16 },
        { key: 'h', width: 16 },
        { key: 'i', width: 10 },
      ];

      ws.getRow(1).height = 15;
      ws.getRow(2).height = 22;
      ws.getRow(3).height = 22;
      ws.getRow(4).height = 18;
      ws.getRow(5).height = 15;
      ws.getRow(6).height = 15;

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
        ws.addImage(logoSmpId, { tl: { col: 8.1, row: 0 }, ext: { width: 60, height: 80 } });
      }

      ws.getRow(7).height = 8;
      ws.getRow(8).height = 18;
      ws.getRow(9).height = 20;
      ws.getRow(10).height = 18;
      ws.getRow(11).height = 8;

      ws.mergeCells('A8:I8');
      ws.mergeCells('A9:I9');
      ws.mergeCells('A10:I10');

      const judulStyle: Partial<ExcelJS.Style> = {
        alignment: { horizontal: 'center', vertical: 'middle' },
        font: { bold: true, size: 12, name: 'Times New Roman' },
      };

      ws.getCell('A8').value = 'DAFTAR HADIR';
      ws.getCell('A8').style = judulStyle;
      ws.getCell('A9').value = `PESERTA STS/SAS SEMESTER GENAP`;
      ws.getCell('A9').style = judulStyle;
      ws.getCell('A10').value = 'TAHUN PELAJARAN 2025/2026';
      ws.getCell('A10').style = judulStyle;

      ws.getRow(12).height = 18;
      ws.getRow(13).height = 8;

      ws.getCell('A12').value = 'MATA PELAJARAN';
      ws.getCell('A12').style = { font: { bold: true, size: 10, name: 'Calibri' }, alignment: { vertical: 'middle' } };
      ws.mergeCells('A12:B12');
      ws.getCell('C12').value = ':';
      ws.getCell('C12').style = { font: { size: 10, name: 'Calibri' }, alignment: { vertical: 'middle', horizontal: 'center' } };

      ['D12', 'E12', 'F12'].forEach((addr) => {
        ws.getCell(addr).style = { border: { bottom: { style: 'thin' } } };
      });

      ws.getCell('G12').value = `RUANG :  ${roomName}`;
      ws.getCell('G12').style = { font: { bold: true, size: 10, name: 'Calibri' }, alignment: { vertical: 'middle', horizontal: 'right' } };
      ws.mergeCells('G12:I12');

      const headerRow = 14;
      ws.getRow(headerRow).height = 20;

      const thinBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' },
      };

      const headerStyle = (col: string, value: string) => {
        const cell = ws.getCell(`${col}${headerRow}`);
        cell.value = value;
        cell.style = {
          font: { bold: true, size: 10, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } },
          border: thinBorder,
        };
      };

      headerStyle('A', 'NO.');
      headerStyle('B', 'NO. KURSI');
      headerStyle('C', 'NAMA');
      headerStyle('D', 'KELAS');
      headerStyle('E', 'L/P');
      headerStyle('F', 'AGAMA');
      headerStyle('G', 'TANDA TANGAN');
      headerStyle('H', '');
      headerStyle('I', 'KET');

      ws.mergeCells(`G${headerRow}:H${headerRow}`);

      let nomor = 1;
      for (const student of studentsInRoom) {
        const dataRow = headerRow + nomor;
        ws.getRow(dataRow).height = 18;

        const colTT1 = nomor % 2 !== 0 ? `${nomor}` : '';
        const colTT2 = nomor % 2 === 0 ? `${nomor}` : '';

        const setDataCell = (col: string, value: string | number, alignH: ExcelJS.Alignment['horizontal'] = 'left') => {
          const cell = ws.getCell(`${col}${dataRow}`);
          cell.value = value;
          cell.style = {
            font: { size: 10, name: 'Calibri' },
            alignment: { horizontal: alignH, vertical: 'middle' },
            border: thinBorder,
          };
        };

        setDataCell('A', nomor,                        'center');
        setDataCell('B', student.seatNumber as number, 'center');
        setDataCell('C', student.nama);
        setDataCell('D', student.kelas,                'center');
        setDataCell('E', student.jenisKelamin || '',   'center');
        setDataCell('F', student.agama        || '');
        setDataCell('G', colTT1,                       'center');
        setDataCell('H', colTT2,                       'center');
        setDataCell('I', '');

        nomor++;
      }
    }

    // Generate buffer
    const buffer = await wb.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Absensi_Ujian.xlsx"',
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Gagal generate Excel' }, { status: 500 });
  }
}
