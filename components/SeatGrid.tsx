'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { RoomAssignment, Student } from '@/lib/types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertTriangle } from 'lucide-react';
import { checkSeatingConflicts } from '@/lib/seatingGenerator';

interface SeatProps {
  seatId: string;
  student: Student | null;
  position: number;
  roomId: string;
  hasConflict: boolean;
  type?: 'seat' | 'pengawas' | 'pintu' | 'empty';
}

function SortableSeat({ seatId, student, position, roomId, hasConflict, type = 'empty' }: SeatProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: seatId,
    data: { roomId, student, type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { updateSeatType } = useAppStore();

  const handleSeatClick = () => {
    if (student) return; // Jangan ubah kursi yang sudah ada siswanya
    
    // Cycle toggle: empty -> pengawas -> pintu -> empty
    const nextType = type === 'empty' || type === 'seat' ? 'pengawas' : type === 'pengawas' ? 'pintu' : 'empty';
    updateSeatType(roomId, seatId, nextType);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleSeatClick}
      className={`relative rounded-lg p-3 min-h-[100px] transition-all border-2 ${
        hasConflict
          ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-500 hover:border-rose-600 hover:shadow-lg animate-pulse'
          : student
          ? 'bg-gradient-to-br from-white to-indigo-50 border-indigo-300 hover:border-indigo-500 hover:shadow-lg'
          : type === 'pengawas'
          ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 cursor-pointer shadow-sm hover:shadow-md'
          : type === 'pintu'
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-400 cursor-pointer shadow-sm hover:shadow-md'
          : 'bg-slate-50 border-slate-300 border-dashed cursor-pointer hover:bg-slate-100 hover:border-slate-400'
      }`}
    >
      {type === 'pengawas' ? (
        <div className="flex flex-col items-center justify-center h-full text-amber-700 absolute inset-0">
           <div className="font-bold text-sm">Meja Pengawas</div>
           <div className="text-[10px] opacity-70 mt-1">(Klik ubah)</div>
        </div>
      ) : type === 'pintu' ? (
        <div className="flex flex-col items-center justify-center h-full text-emerald-700 absolute inset-0">
           <div className="font-bold text-sm text-center px-1">Pintu Masuk / Keluar</div>
           <div className="text-[10px] opacity-70 mt-1">(Klik ubah)</div>
        </div>
      ) : (
        <>
          {/* Conflict Indicator */}
          {hasConflict && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}

          {/* Visual Desk/Chair Icon */}
          <div className="absolute top-2 left-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              hasConflict 
                ? 'bg-rose-200 border-rose-400' 
                : 'bg-slate-200 border-slate-300'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                hasConflict ? 'bg-rose-500' : 'bg-slate-400'
              }`}></div>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-8">
            <div {...attributes} {...listeners} className="cursor-move mt-1">
              <GripVertical className={`w-4 h-4 ${
                hasConflict ? 'text-rose-500' : 'text-slate-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs mb-1 font-medium ${
                hasConflict ? 'text-rose-600' : 'text-slate-500'
              }`}>
                Kursi #{position} 
              </div>
              {student ? (
                <>
                  <div className={`font-semibold text-sm truncate ${
                    hasConflict ? 'text-rose-800' : 'text-slate-800'
                  }`}>
                    {student.nama}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded mt-1 inline-block font-semibold ${
                    hasConflict 
                      ? 'bg-rose-200 text-rose-800' 
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {student.kelas}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400 italic">Kosong <span className="text-[10px] block mt-1">(Klik ubah)</span></div>
              )}
            </div>
          </div>

          {/* Desk Visual */}
          {student && (
            <div className="absolute bottom-2 right-2">
              <div className={`w-6 h-3 rounded border ${
                hasConflict 
                  ? 'bg-rose-300 border-rose-400' 
                  : 'bg-indigo-200 border-indigo-300'
              }`}></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SeatGridProps {
  assignment: RoomAssignment;
}

export default function SeatGrid({ assignment }: SeatGridProps) {
  const { roomAssignments, setRoomAssignments, customRows, customColumns, aisleGap } = useAppStore();
  const [showConflicts, setShowConflicts] = useState(false);

  // ALWAYS use assignment's own columns/rows for consistency
  // Custom settings only affect new generations, not existing assignments
  const cols = assignment.columns;
  const rows = assignment.rows;

  // Build conflict map
  const conflictSeats = new Set<string>();
  const { seats, columns } = assignment;

  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    if (!seat || !seat.student) continue;

    const row = Math.floor(i / columns);
    const col = i % columns;

    // Check all 4 neighbors
    const neighbors = [];
    if (col > 0) neighbors.push(i - 1); // left
    if (col < columns - 1) neighbors.push(i + 1); // right
    if (row > 0) neighbors.push(i - columns); // up
    if (row < Math.ceil(seats.length / columns) - 1) neighbors.push(i + columns); // down

    for (const neighborIdx of neighbors) {
      const neighbor = seats[neighborIdx];
      if (neighbor && neighbor.student && neighbor.student.kelas === seat.student.kelas) {
        conflictSeats.add(seat.seatId);
        conflictSeats.add(neighbor.seatId);
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeRoomId = active.data.current?.roomId;
    const overRoomId = over.data.current?.roomId;

    if (activeRoomId !== overRoomId) {
      // Cross-room swap not supported yet
      return;
    }

    // Find the two seats and swap their students AND types
    const newAssignments = roomAssignments.map((room) => {
      if (room.roomId !== activeRoomId) return room;

      const newSeats = room.seats.map((seat) => {
        if (seat.seatId === active.id) {
          const overSeat = room.seats.find((s) => s.seatId === over.id);
          return { ...seat, student: overSeat?.student || null, type: overSeat?.type || 'empty' };
        }
        if (seat.seatId === over.id) {
          const activeSeat = room.seats.find((s) => s.seatId === active.id);
          return { ...seat, student: activeSeat?.student || null, type: activeSeat?.type || 'empty' };
        }
        return seat;
      });

      return { ...room, seats: newSeats };
    });

    setRoomAssignments(newAssignments);
  };

  const conflictInfo = checkSeatingConflicts(assignment);

  // Compute dynamic snake numbers (excluding Pengawas and Pintu)
  const seatToNumberMap = new Map<string, number>();
  let currentNumber = 1;
  for (let c = 0; c < cols; c++) {
    const isUpward = c % 2 === 0;
    const rowIndices = [];
    if (isUpward) {
      for (let r = rows - 1; r >= 0; r--) rowIndices.push(r);
    } else {
      for (let r = 0; r < rows; r++) rowIndices.push(r);
    }
    for (const r of rowIndices) {
      const index = r * cols + c;
      const seat = seats[index];
      if (seat && seat.type !== 'pengawas' && seat.type !== 'pintu') {
        seatToNumberMap.set(seat.seatId, currentNumber);
        currentNumber++;
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-slate-800">{assignment.roomName}</h3>
          
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline-block">Tambah Kosong:</span>
            <button
              onClick={() => useAppStore.getState().addEmptyRowTop(assignment.roomId)}
              title="Tambah Baris Atas"
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm flex items-center gap-1"
            >
              + Atas
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyRowBottom(assignment.roomId)}
              title="Tambah Baris Bawah"
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm flex items-center gap-1"
            >
              + Bawah
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyColumnLeft(assignment.roomId)}
              title="Tambah Kolom Kiri"
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm flex items-center gap-1"
            >
              + Kiri
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyColumnRight(assignment.roomId)}
              title="Tambah Kolom Kanan"
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm flex items-center gap-1"
            >
              + Kanan
            </button>
            
            <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block"></div>
            
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showConflicts
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {conflictInfo.hasConflicts
                ? `${conflictInfo.conflicts} Konflik`
                : 'Tidak Ada Konflik'}
            </button>
          </div>
        </div>
      </div>

      {showConflicts && conflictInfo.hasConflicts && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">
                Ditemukan {conflictInfo.conflicts} konflik
              </h4>
              <ul className="space-y-1 text-sm text-amber-700">
                {conflictInfo.details.slice(0, 5).map((detail, i) => (
                  <li key={i}>• {detail}</li>
                ))}
                {conflictInfo.details.length > 5 && (
                  <li className="text-amber-600 italic">
                    ...dan {conflictInfo.details.length - 5} konflik lainnya
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: `${aisleGap * 0.75}rem`,
          }}
        >
          {assignment.seats.map((seat) => {
            const dynamicNo = seatToNumberMap.get(seat.seatId) || 0;

            return (
              <SortableSeat
                key={seat.seatId}
                seatId={seat.seatId}
                student={seat.student}
                position={dynamicNo}
                roomId={assignment.roomId}
                hasConflict={conflictSeats.has(seat.seatId)}
                type={seat.type}
              />
            );
          })}
        </div>
        
        {/* Aisle/Gap Indicator */}
        {aisleGap > 0 && (
          <div className="mt-4 text-center text-sm text-slate-500">
            <div className="inline-block px-3 py-1 bg-slate-100 rounded">
              Lorong: {aisleGap} kolom
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
