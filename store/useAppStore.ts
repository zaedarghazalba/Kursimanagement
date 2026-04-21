import { create } from 'zustand';
import { Student, Room, RoomAssignment, SeatAssignment } from '@/lib/types';

interface AppState {
  // Students
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudents: (students: Student[]) => void;
  clearStudents: () => void;

  // Rooms
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  clearRooms: () => void;

  // Room Assignments
  roomAssignments: RoomAssignment[];
  setRoomAssignments: (assignments: RoomAssignment[]) => void;
  updateSeatAssignment: (roomId: string, seatId: string, student: Student | null) => void;
  updateSeatType: (roomId: string, seatId: string, type: 'seat' | 'pengawas' | 'pintu' | 'empty') => void;
  addEmptyRowTop: (roomId: string) => void;
  addEmptyRowBottom: (roomId: string) => void;
  addEmptyColumnLeft: (roomId: string) => void;
  addEmptyColumnRight: (roomId: string) => void;
  clearRoomAssignments: () => void;
  moveStudent: (fromRoomId: string, studentId: string, toRoomId: string) => void;
  deleteSeat: (roomId: string, seatId: string) => void;

  // UI State
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  
  // Custom Layout Settings
  customRows: number;
  customColumns: number;
  aisleGap: number;
  setCustomRows: (rows: number) => void;
  setCustomColumns: (cols: number) => void;
  setAisleGap: (gap: number) => void;

  // Persistence
  loadFromStorage: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY = 'denah-ujian-data';

export const useAppStore = create<AppState>((set, get) => ({
  // Students
  students: [],
  setStudents: (students) => set({ students }),
  addStudents: (students) =>
    set((state) => ({ students: [...state.students, ...students] })),
  clearStudents: () => set({ students: [] }),

  // Rooms
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  updateRoom: (roomId, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
    })),
  deleteRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== roomId),
    })),
  clearRooms: () => set({ rooms: [] }),

  // Room Assignments
  roomAssignments: [],
  setRoomAssignments: (assignments) => set({ roomAssignments: assignments }),
  updateSeatAssignment: (roomId, seatId, student) =>
    set((state) => ({
      roomAssignments: state.roomAssignments.map((assignment) =>
        assignment.roomId === roomId
          ? {
              ...assignment,
              seats: assignment.seats.map((seat) =>
                seat.seatId === seatId ? { ...seat, student, type: student ? 'seat' : seat.type } : seat
              ),
            }
          : assignment
      ),
    })),
  updateSeatType: (roomId, seatId, type) =>
    set((state) => ({
      roomAssignments: state.roomAssignments.map((assignment) =>
        assignment.roomId === roomId
          ? {
              ...assignment,
              seats: assignment.seats.map((seat) =>
                seat.seatId === seatId ? { ...seat, type, student: type !== 'seat' ? null : seat.student } : seat
              ),
            }
          : assignment
      ),
    })),
  addEmptyRowBottom: (roomId) =>
    set((state) => {
      const assignment = state.roomAssignments.find(a => a.roomId === roomId);
      if (!assignment) return state;
      
      const newSeats: SeatAssignment[] = [...assignment.seats];
      for (let i = 0; i < assignment.columns; i++) {
        newSeats.push({
          seatId: crypto.randomUUID(),
          student: null,
          position: { row: assignment.rows, col: i },
          type: 'empty'
        });
      }
      
      return {
        roomAssignments: state.roomAssignments.map((a) =>
          a.roomId === roomId ? { ...a, rows: a.rows + 1, seats: newSeats } : a
        ),
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, kapasitas: r.kapasitas + assignment.columns } : r
        )
      };
    }),
  addEmptyRowTop: (roomId) =>
    set((state) => {
      const assignment = state.roomAssignments.find(a => a.roomId === roomId);
      if (!assignment) return state;

      const addedSeats: SeatAssignment[] = [];
      for (let i = 0; i < assignment.columns; i++) {
        addedSeats.push({
          seatId: crypto.randomUUID(),
          student: null,
          position: { row: 0, col: i },
          type: 'empty'
        });
      }
      
      return {
        roomAssignments: state.roomAssignments.map((a) =>
          a.roomId === roomId ? { ...a, rows: a.rows + 1, seats: [...addedSeats, ...a.seats] } : a
        ),
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, kapasitas: r.kapasitas + assignment.columns } : r
        )
      };
    }),
  addEmptyColumnRight: (roomId) =>
    set((state) => {
      const assignment = state.roomAssignments.find(a => a.roomId === roomId);
      if (!assignment) return state;

      const newSeats: SeatAssignment[] = [];
      for (let r = 0; r < assignment.rows; r++) {
        for (let c = 0; c < assignment.columns; c++) {
          newSeats.push(assignment.seats[r * assignment.columns + c]);
        }
        newSeats.push({
          seatId: crypto.randomUUID(),
          student: null,
          position: { row: r, col: assignment.columns },
          type: 'empty'
        });
      }
      
      return {
        roomAssignments: state.roomAssignments.map((a) =>
          a.roomId === roomId ? { ...a, columns: a.columns + 1, seats: newSeats } : a
        ),
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, kapasitas: r.kapasitas + assignment.rows } : r
        )
      };
    }),
  addEmptyColumnLeft: (roomId) =>
    set((state) => {
      const assignment = state.roomAssignments.find(a => a.roomId === roomId);
      if (!assignment) return state;

      const newSeats: SeatAssignment[] = [];
      for (let r = 0; r < assignment.rows; r++) {
        newSeats.push({
          seatId: crypto.randomUUID(),
          student: null,
          position: { row: r, col: 0 },
          type: 'empty'
        });
        for (let c = 0; c < assignment.columns; c++) {
          newSeats.push(assignment.seats[r * assignment.columns + c]);
        }
      }

      return {
        roomAssignments: state.roomAssignments.map((a) =>
          a.roomId === roomId ? { ...a, columns: a.columns + 1, seats: newSeats } : a
        ),
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, kapasitas: r.kapasitas + assignment.rows } : r
        )
      };
    }),
  clearRoomAssignments: () => set({ roomAssignments: [] }),
  moveStudent: (fromRoomId, studentId, toRoomId) => {
    set((state) => {
      const fromRoom = state.roomAssignments.find(r => r.roomId === fromRoomId);
      const toRoom = state.roomAssignments.find(r => r.roomId === toRoomId);
      if (!fromRoom || !toRoom) return state;

      // Find student and remove from old seat
      let studentToMove: Student | null = null;
      const newFromSeats = fromRoom.seats.map(seat => {
        if (seat.student?.id === studentId) {
          studentToMove = seat.student;
          return { ...seat, student: null };
        }
        return seat;
      });

      if (!studentToMove) return state;

      // Find first empty/available seat in target room
      let targetIdx = toRoom.seats.findIndex(s => s.type === 'empty' && !s.student);
      let newToSeats = [...toRoom.seats];
      let newToRows = toRoom.rows;
      let newToKapasitas = state.rooms.find(r => r.id === toRoomId)?.kapasitas || toRoom.seats.length;

      if (targetIdx === -1) {
        // No empty seat? Add exactly ONE seat
        const newSeatIdx = toRoom.seats.length;
        const newSeat: SeatAssignment = {
          seatId: crypto.randomUUID(),
          student: null,
          position: { 
            row: Math.floor(newSeatIdx / toRoom.columns), 
            col: newSeatIdx % toRoom.columns 
          },
          type: 'empty'
        };
        newToSeats.push(newSeat);
        
        // Update rows if we just started a new row
        newToRows = Math.ceil(newToSeats.length / toRoom.columns);
        newToKapasitas += 1;
        targetIdx = newSeatIdx;
      }

      // Assign student to target seat
      newToSeats[targetIdx] = { 
        ...newToSeats[targetIdx], 
        student: studentToMove,
        type: 'seat'
      };

      return {
        roomAssignments: state.roomAssignments.map(r => {
          if (r.roomId === fromRoomId) return { ...r, seats: newFromSeats };
          if (r.roomId === toRoomId) return { ...r, seats: newToSeats, rows: newToRows };
          return r;
        }),
        rooms: state.rooms.map(r => 
          r.id === toRoomId ? { ...r, kapasitas: newToKapasitas } : r
        )
      };
    });
  },
  deleteSeat: (roomId, seatId) => {
    set((state) => {
      const assignment = state.roomAssignments.find(a => a.roomId === roomId);
      if (!assignment) return state;

      const newSeats = assignment.seats.filter(s => s.seatId !== seatId);
      
      // Recalculate rows if needed
      const newRows = Math.ceil(newSeats.length / assignment.columns);

      return {
        roomAssignments: state.roomAssignments.map(a => 
          a.roomId === roomId ? { ...a, seats: newSeats, rows: newRows } : a
        ),
        rooms: state.rooms.map(r => 
          r.id === roomId ? { ...r, kapasitas: Math.max(0, r.kapasitas - 1) } : r
        )
      };
    });
  },

  // UI State
  activeRoomId: null,
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),
  
  // Custom Layout Settings
  customRows: 5,
  customColumns: 6,
  aisleGap: 2,
  setCustomRows: (rows) => set({ customRows: rows }),
  setCustomColumns: (cols) => set({ customColumns: cols }),
  setAisleGap: (gap) => set({ aisleGap: gap }),

  // Persistence
  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          set({
            students: data.students || [],
            rooms: data.rooms || [],
            roomAssignments: data.roomAssignments || [],
            customRows: data.customRows || 5,
            customColumns: data.customColumns || 6,
            aisleGap: data.aisleGap !== undefined ? data.aisleGap : 2,
          });
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  },

  clearAllData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      students: [],
      rooms: [],
      roomAssignments: [],
      activeRoomId: null,
      customRows: 5,
      customColumns: 6,
      aisleGap: 2,
    });
  },
}));

// Auto-save to localStorage on state changes
const saveToStorage = (state: AppState) => {
  if (typeof window !== 'undefined') {
    try {
      const dataToSave = {
        students: state.students,
        rooms: state.rooms,
        roomAssignments: state.roomAssignments,
        customRows: state.customRows,
        customColumns: state.customColumns,
        aisleGap: state.aisleGap,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Subscribe to store changes and auto-save
if (typeof window !== 'undefined') {
  useAppStore.subscribe(saveToStorage);
}
