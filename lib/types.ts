export interface Student {
  id: string;
  nama: string;
  kelas: string;
}

export interface Room {
  id: string;
  nama: string;
  kapasitas: number;
}

export interface SeatPosition {
  row: number;
  col: number;
}

export interface SeatAssignment {
  seatId: string;
  student: Student | null;
  position: SeatPosition;
  type?: 'seat' | 'pengawas' | 'pintu' | 'empty';
}

export interface RoomAssignment {
  roomId: string;
  roomName: string;
  seats: SeatAssignment[];
  columns: number;
  rows: number;
  customLayout?: boolean;
  customRows?: number;
  customColumns?: number;
}

export interface AttendanceRecord {
  nomor: number;
  nama: string;
  kelas: string;
  nomorKursi: number;
  ruangan: string;
}
