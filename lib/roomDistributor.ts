import { Student, Room, RoomAssignment, SeatAssignment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export interface DistributionResult {
  success: boolean;
  assignments: RoomAssignment[];
  unassignedStudents: Student[];
  message: string;
}

export type SeatingMode = 'acak' | 'urut';

export interface DistributionOptions {
  customRows?: number;
  customColumns?: number;
  seatingMode?: SeatingMode;
}

export const distributeStudentsToRooms = (
  students: Student[],
  rooms: Room[],
  options?: DistributionOptions
): DistributionResult => {
  if (rooms.length === 0) {
    return {
      success: false,
      assignments: [],
      unassignedStudents: students,
      message: 'Tidak ada ruangan. Tambahkan ruangan terlebih dahulu.',
    };
  }

  if (students.length === 0) {
    return {
      success: false,
      assignments: [],
      unassignedStudents: [],
      message: 'Tidak ada data siswa. Upload data siswa terlebih dahulu.',
    };
  }

  const totalKapasitas = rooms.reduce((sum, room) => sum + room.kapasitas, 0);

  if (totalKapasitas < students.length) {
    return {
      success: false,
      assignments: [],
      unassignedStudents: students,
      message: `Kapasitas total (${totalKapasitas}) kurang dari jumlah siswa (${students.length}). Tambahkan ruangan lagi.`,
    };
  }

  const mode = options?.seatingMode ?? 'acak';

  let orderedStudents: Student[];

  if (mode === 'urut') {
    orderedStudents = [...students].sort((a, b) => {
      const kelasCompare = a.kelas.localeCompare(b.kelas, 'id');
      if (kelasCompare !== 0) return kelasCompare;
      return a.nama.localeCompare(b.nama, 'id');
    });
  } else {
    const studentsByClass = new Map<string, Student[]>();
    students.forEach(s => {
      if (!studentsByClass.has(s.kelas)) studentsByClass.set(s.kelas, []);
      studentsByClass.get(s.kelas)!.push(s);
    });

    for (const [key, arr] of studentsByClass) {
      studentsByClass.set(key, shuffleArray(arr));
    }

    const mixedStudents: Student[] = [];
    let hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (const classStudents of studentsByClass.values()) {
        if (classStudents.length > 0) {
          mixedStudents.push(classStudents.shift()!);
          hasMore = true;
        }
      }
    }
    orderedStudents = mixedStudents;
  }

  const assignments: RoomAssignment[] = [];
  let studentIndex = 0;

  for (const room of rooms) {
    const seats: SeatAssignment[] = [];
    
    // Calculate layout BEFORE creating seats
    const columns = options?.customColumns || calculateOptimalColumns(room.kapasitas);
    let rows = options?.customRows || Math.ceil(room.kapasitas / columns);
    
    // Check how many students go into this room
    const studentsInThisRoom = Math.min(orderedStudents.length - studentIndex, room.kapasitas);
    
    // Ensure grid is large enough for students
    if (rows * columns < studentsInThisRoom) {
      rows = Math.ceil(studentsInThisRoom / columns);
    }

    const totalSeatsInGrid = rows * columns;
    const maxSeats = Math.min(totalSeatsInGrid, room.kapasitas);

    for (let i = 0; i < maxSeats; i++) {
      if (studentIndex < orderedStudents.length) {
        seats.push({
          seatId: uuidv4(),
          student: orderedStudents[studentIndex],
          position: { row: Math.floor(i / columns), col: i % columns },
          type: 'seat'
        });
        studentIndex++;
      } else {
        seats.push({
          seatId: uuidv4(),
          student: null,
          position: { row: Math.floor(i / columns), col: i % columns },
          type: 'empty'
        });
      }
    }

    assignments.push({
      roomId: room.id,
      roomName: room.nama,
      seats,
      columns,
      rows,
    });
  }

  const unassignedStudents = orderedStudents.slice(studentIndex);

  return {
    success: unassignedStudents.length === 0,
    assignments,
    unassignedStudents,
    message: unassignedStudents.length === 0
      ? `Berhasil membagi ${students.length} siswa ke ${rooms.length} ruangan`
      : `Ada ${unassignedStudents.length} siswa yang belum terdistribusi`,
  };
};

const calculateOptimalColumns = (kapasitas: number): number => {
  const sqrt = Math.sqrt(kapasitas);
  const cols = Math.round(sqrt * 1.3);
  return Math.max(1, Math.min(cols, kapasitas));
};
