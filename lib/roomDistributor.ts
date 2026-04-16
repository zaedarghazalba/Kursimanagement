import { Student, Room, RoomAssignment, SeatAssignment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface DistributionResult {
  success: boolean;
  assignments: RoomAssignment[];
  unassignedStudents: Student[];
  message: string;
}

export interface DistributionOptions {
  customColumns?: number;
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

  // Acak secara terstruktur (Round-Robin per kelas) untuk mencampur grade di satu ruangan
  const studentsByClass = new Map<string, Student[]>();
  students.forEach(s => {
    if (!studentsByClass.has(s.kelas)) studentsByClass.set(s.kelas, []);
    studentsByClass.get(s.kelas)!.push(s);
  });

  const mixedStudents: Student[] = [];
  let hasMore = true;
  while(hasMore) {
    hasMore = false;
    for (const classStudents of studentsByClass.values()) {
      if (classStudents.length > 0) {
        mixedStudents.push(classStudents.shift()!);
        hasMore = true;
      }
    }
  }

  const assignments: RoomAssignment[] = [];
  let studentIndex = 0;
  const unassignedStudents: Student[] = [];

  for (const room of rooms) {
    const seats: SeatAssignment[] = [];

    for (let i = 0; i < room.kapasitas; i++) {
      if (studentIndex < mixedStudents.length) {
        seats.push({
          seatId: uuidv4(),
          student: mixedStudents[studentIndex],
          position: { row: 0, col: 0 }, // Will be calculated later
          type: 'seat'
        });
        studentIndex++;
      } else {
        seats.push({
          seatId: uuidv4(),
          student: null,
          position: { row: 0, col: 0 },
          type: 'empty'
        });
      }
    }

    // Calculate rows and columns for the room
    const columns = options?.customColumns || calculateOptimalColumns(room.kapasitas);
    const rows = Math.ceil(room.kapasitas / columns);

    // Assign positions to seats
    seats.forEach((seat, index) => {
      seat.position = {
        row: Math.floor(index / columns),
        col: index % columns,
      };
    });

    assignments.push({
      roomId: room.id,
      roomName: room.nama,
      seats,
      columns,
      rows,
    });
  }

  // Any remaining students
  for (let i = studentIndex; i < students.length; i++) {
    unassignedStudents.push(students[i]);
  }

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
  // Try to find a good aspect ratio (approximately 4:3 or 16:9)
  const sqrt = Math.sqrt(kapasitas);
  const cols = Math.round(sqrt * 1.3); // Slightly wider than square
  return Math.min(cols, kapasitas);
};
