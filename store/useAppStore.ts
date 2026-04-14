import { create } from 'zustand';
import { Student, Room, RoomAssignment } from '@/lib/types';

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
  clearRoomAssignments: () => void;

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
                seat.seatId === seatId ? { ...seat, student } : seat
              ),
            }
          : assignment
      ),
    })),
  clearRoomAssignments: () => set({ roomAssignments: [] }),

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
