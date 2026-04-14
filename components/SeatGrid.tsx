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
}

function SortableSeat({ seatId, student, position, roomId, hasConflict }: SeatProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: seatId,
    data: { roomId, student },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { updateSeatAssignment } = useAppStore();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg p-3 min-h-[100px] transition-all border-2 ${
        hasConflict
          ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-500 hover:border-rose-600 hover:shadow-lg animate-pulse'
          : student
          ? 'bg-gradient-to-br from-white to-indigo-50 border-indigo-300 hover:border-indigo-500 hover:shadow-lg'
          : 'bg-slate-50 border-slate-300 border-dashed'
      }`}
    >
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
            Kursi #{position + 1}
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
            <div className="text-sm text-slate-400 italic">Kosong</div>
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

    // Find the two seats and swap their students
    const newAssignments = roomAssignments.map((room) => {
      if (room.roomId !== activeRoomId) return room;

      const newSeats = room.seats.map((seat) => {
        if (seat.seatId === active.id) {
          const overSeat = room.seats.find((s) => s.seatId === over.id);
          return { ...seat, student: overSeat?.student || null };
        }
        if (seat.seatId === over.id) {
          const activeSeat = room.seats.find((s) => s.seatId === active.id);
          return { ...seat, student: activeSeat?.student || null };
        }
        return seat;
      });

      return { ...room, seats: newSeats };
    });

    setRoomAssignments(newAssignments);
  };

  const conflictInfo = checkSeatingConflicts(assignment);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">{assignment.roomName}</h3>
        <button
          onClick={() => setShowConflicts(!showConflicts)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            showConflicts
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {conflictInfo.hasConflicts
            ? `${conflictInfo.conflicts} Konflik`
            : 'Tidak Ada Konflik'}
        </button>
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
          {assignment.seats.map((seat, index) => (
            <SortableSeat
              key={seat.seatId}
              seatId={seat.seatId}
              student={seat.student}
              position={index}
              roomId={assignment.roomId}
              hasConflict={conflictSeats.has(seat.seatId)}
            />
          ))}
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
