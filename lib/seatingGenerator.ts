import { Student, RoomAssignment, SeatAssignment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface SeatingGenerationResult {
  success: boolean;
  assignments: RoomAssignment[];
  message: string;
  attempts?: number;
}

export const generateSeatingArrangement = (
  assignments: RoomAssignment[]
): SeatingGenerationResult => {
  const newAssignments: RoomAssignment[] = [];
  let totalAttempts = 0;

  for (const assignment of assignments) {
    const students = assignment.seats
      .filter((s) => s.student !== null)
      .map((s) => s.student!);

    if (students.length === 0) {
      newAssignments.push(assignment);
      continue;
    }

    const result = tryGenerateSeating(assignment, students);
    totalAttempts += result.attempts;
    newAssignments.push(result.assignment);
  }

  // Check total conflicts
  let totalConflicts = 0;
  newAssignments.forEach(assignment => {
    const conflictInfo = checkSeatingConflicts(assignment);
    totalConflicts += conflictInfo.conflicts;
  });

  return {
    success: totalConflicts === 0,
    assignments: newAssignments,
    message: totalConflicts === 0
      ? '✅ Denah tempat duduk berhasil dibuat tanpa konflik'
      : `⚠️ Denah dibuat dengan ${totalConflicts} konflik. Coba generate ulang.`,
    attempts: totalAttempts,
  };
};

const tryGenerateSeating = (
  assignment: RoomAssignment,
  students: Student[]
): { success: boolean; assignment: RoomAssignment; attempts: number } => {
  const { columns, seats } = assignment;
  const rows = Math.ceil(seats.length / columns);

  // Group students by class
  const studentsByClass = new Map<string, Student[]>();
  students.forEach(student => {
    if (!studentsByClass.has(student.kelas)) {
      studentsByClass.set(student.kelas, []);
    }
    studentsByClass.get(student.kelas)!.push(student);
  });

  // Try multiple times with different strategies
  const maxAttempts = 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Shuffle students within each class for variety
    const classGroups = new Map<string, Student[]>();
    for (const [kelas, classStudents] of studentsByClass) {
      classGroups.set(kelas, shuffleArray([...classStudents]));
    }

    // Try to place using constraint satisfaction
    const result = placeWithConstraint(classGroups, seats, columns, rows, assignment);
    
    if (result.success) {
      return {
        success: true,
        assignment: result.assignment!,
        attempts: attempt + 1,
      };
    }
  }

  // Fallback: use best effort
  const bestEffort = createBestEffort(studentsByClass, seats, columns, rows, assignment);
  const conflictInfo = checkSeatingConflicts(bestEffort);

  return {
    success: conflictInfo.conflicts === 0,
    assignment: bestEffort,
    attempts: maxAttempts,
  };
};

const placeWithConstraint = (
  classGroups: Map<string, Student[]>,
  seats: SeatAssignment[],
  columns: number,
  rows: number,
  originalAssignment: RoomAssignment
): { success: boolean; assignment?: RoomAssignment } => {
  const grid = new Array(rows * columns).fill(null) as (Student | null)[];
  const usedStudents = new Set<string>();

  // Get sorted classes by size (largest first for harder constraints)
  const sortedClasses = Array.from(classGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);

  // Try to place all students
  for (const [kelas, classStudents] of sortedClasses) {
    let placed = 0;

    for (const student of classStudents) {
      if (placed >= classStudents.length) break;

      // Find best seat for this student
      let bestSeatIdx = -1;
      let maxMinDistance = -1;

      for (let seatIdx = 0; seatIdx < grid.length; seatIdx++) {
        if (grid[seatIdx] !== null) continue;
        if (usedStudents.has(student.id)) continue;

        const row = Math.floor(seatIdx / columns);
        const col = seatIdx % columns;

        // Check if any neighbor has same class
        let hasConflict = false;
        let minDistanceToSameClass = Infinity;

        // Check all neighbors
        const neighborOffsets = [
          -1, // left
          1,  // right
          -columns, // up
          columns,  // down
        ];

        for (const offset of neighborOffsets) {
          const neighborIdx = seatIdx + offset;
          const neighborRow = Math.floor(neighborIdx / columns);
          const neighborCol = neighborIdx % columns;

          // Validate neighbor is within bounds
          if (
            neighborRow < 0 || neighborRow >= rows ||
            neighborCol < 0 || neighborCol >= columns ||
            neighborIdx < 0 || neighborIdx >= grid.length
          ) continue;

          const neighbor = grid[neighborIdx];
          if (neighbor && neighbor.kelas === student.kelas) {
            hasConflict = true;
            break;
          }

          // Calculate distance to same class students
          if (neighbor && neighbor.kelas !== student.kelas) {
            const dist = Math.abs(row - neighborRow) + Math.abs(col - neighborCol);
            minDistanceToSameClass = Math.min(minDistanceToSameClass, dist);
          }
        }

        if (hasConflict) continue;

        // Prefer seats that maximize distance from same class
        if (minDistanceToSameClass > maxMinDistance) {
          maxMinDistance = minDistanceToSameClass;
          bestSeatIdx = seatIdx;
        }
      }

      if (bestSeatIdx >= 0) {
        grid[bestSeatIdx] = student;
        usedStudents.add(student.id);
        placed++;
      } else {
        // Couldn't place this student without conflict
        return { success: false };
      }
    }

    if (placed < classStudents.length) {
      return { success: false };
    }
  }

  // All students placed successfully
  const newSeats: SeatAssignment[] = seats.map((seat, index) => ({
    ...seat,
    student: grid[index],
  }));

  return {
    success: true,
    assignment: { ...originalAssignment, seats: newSeats },
  };
};

const createBestEffort = (
  classGroups: Map<string, Student[]>,
  seats: SeatAssignment[],
  columns: number,
  rows: number,
  originalAssignment: RoomAssignment
): RoomAssignment => {
  const grid = new Array(rows * columns).fill(null) as (Student | null)[];
  const usedStudents = new Set<string>();

  // Sort by class size
  const sortedClasses = Array.from(classGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);

  for (const [kelas, classStudents] of sortedClasses) {
    for (const student of classStudents) {
      if (usedStudents.has(student.id)) continue;

      // Find seat with minimum conflicts
      let bestSeatIdx = -1;
      let minConflicts = Infinity;

      for (let seatIdx = 0; seatIdx < grid.length; seatIdx++) {
        if (grid[seatIdx] !== null) continue;

        const conflicts = countConflicts(grid, seatIdx, student, columns, rows);

        if (conflicts < minConflicts) {
          minConflicts = conflicts;
          bestSeatIdx = seatIdx;
        }

        if (conflicts === 0) break;
      }

      if (bestSeatIdx >= 0) {
        grid[bestSeatIdx] = student;
        usedStudents.add(student.id);
      }
    }
  }

  const newSeats: SeatAssignment[] = seats.map((seat, index) => ({
    ...seat,
    student: grid[index],
  }));

  return { ...originalAssignment, seats: newSeats };
};

const countConflicts = (
  grid: (Student | null)[],
  seatIdx: number,
  student: Student,
  columns: number,
  rows: number
): number => {
  const row = Math.floor(seatIdx / columns);
  const col = seatIdx % columns;
  let conflicts = 0;

  const neighborOffsets = [-1, 1, -columns, columns];

  for (const offset of neighborOffsets) {
    const neighborIdx = seatIdx + offset;
    const neighborRow = Math.floor(neighborIdx / columns);
    const neighborCol = neighborIdx % columns;

    if (
      neighborRow < 0 || neighborRow >= rows ||
      neighborCol < 0 || neighborCol >= columns ||
      neighborIdx < 0 || neighborIdx >= grid.length
    ) continue;

    const neighbor = grid[neighborIdx];
    if (neighbor && neighbor.kelas === student.kelas) {
      conflicts++;
    }
  }

  return conflicts;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const checkSeatingConflicts = (
  assignment: RoomAssignment
): { hasConflicts: boolean; conflicts: number; details: string[] } => {
  const { seats, columns } = assignment;
  const conflicts: string[] = [];
  let conflictCount = 0;
  const checkedPairs = new Set<string>();

  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    if (!seat.student) continue;

    const row = Math.floor(i / columns);
    const col = i % columns;

    // Check right and down only (avoid duplicates)
    const checkOffsets = [
      { offset: 1, check: col < columns - 1 }, // right
      { offset: columns, check: true }, // down
    ];

    for (const { offset, check } of checkOffsets) {
      if (!check) continue;

      const neighborIdx = i + offset;
      if (neighborIdx >= seats.length) continue;

      const neighbor = seats[neighborIdx];
      if (neighbor.student && neighbor.student.kelas === seat.student.kelas) {
        const pairKey = [seat.seatId, neighbor.seatId].sort().join('-');
        if (!checkedPairs.has(pairKey)) {
          checkedPairs.add(pairKey);
          conflictCount++;
          conflicts.push(
            `${seat.student.nama} (${seat.student.kelas}) berdekatan dengan ${neighbor.student.nama} (${neighbor.student.kelas})`
          );
        }
      }
    }
  }

  return {
    hasConflicts: conflictCount > 0,
    conflicts: conflictCount,
    details: conflicts,
  };
};
