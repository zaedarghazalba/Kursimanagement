'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { RoomAssignment, Student } from '@/lib/types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertTriangle, ArrowRightLeft, Trash2 } from 'lucide-react';
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

  const { updateSeatType, moveStudent, deleteSeat, rooms } = useAppStore();
  const [showMoveMenu, setShowMoveMenu] = useState(false);

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
          {/* Move Button */}
          {student && (
            <div className="absolute top-2 right-2 flex flex-col items-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenu(!showMoveMenu);
                }}
                className={`p-1.5 rounded-full transition-all border ${
                  showMoveMenu 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-inner' 
                    : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm'
                }`}
                title="Pindah Ruangan"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              {showMoveMenu && (
                <div 
                  className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pindah Ke Ruangan:</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {rooms.filter(r => r.id !== roomId).length > 0 ? (
                      rooms.filter(r => r.id !== roomId).map(room => (
                        <button
                          key={room.id}
                          onClick={() => {
                            moveStudent(roomId, student.id, room.id);
                            setShowMoveMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                          {room.nama}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-[10px] text-slate-400 italic">Tidak ada ruangan lain</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conflict Indicator (Moved slightly to not overlap with Move button if both exist) */}
          {hasConflict && !showMoveMenu && (
            <div className="absolute top-2 right-10">
              <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-sm">
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
              <GripVertical className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-1 font-medium text-slate-500">
                Kursi #{position}
              </div>
              {student ? (
                <>
                  <div className="font-semibold text-sm truncate text-slate-800">
                    {student.nama}
                  </div>
                  {student.nis && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{student.nis}</div>
                  )}
                  <div className="text-xs px-2 py-1 rounded mt-1 inline-block font-semibold bg-indigo-100 text-indigo-700">
                    {student.kelas}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400 italic">Kosong <span className="text-[10px] block mt-1">(Klik ubah)</span></div>
              )}
            </div>
          </div>

          {/* Delete Button (Only for empty seats) */}
          {!student && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Hapus kursi ini?')) {
                  deleteSeat(roomId, seatId);
                }
              }}
              className="absolute top-2 right-2 p-1.5 bg-white text-slate-300 hover:text-rose-600 hover:border-rose-300 border border-slate-200 rounded-full transition-all shadow-sm z-10"
              title="Hapus Kursi"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

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
  seatingMode: 'acak' | 'urut';
}

export default function SeatGrid({ assignment, seatingMode }: SeatGridProps) {
  const { roomAssignments, setRoomAssignments, aisleGap } = useAppStore();
  const [showConflicts, setShowConflicts] = useState(false);

  const cols = assignment.columns;
  const rows = assignment.rows;

  const conflictSeats = new Set<string>();
  const { seats, columns } = assignment;

  if (seatingMode === 'acak') {
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      if (!seat || !seat.student) continue;

      const row = Math.floor(i / columns);
      const col = i % columns;

      const neighbors = [];
      if (col > 0) neighbors.push(i - 1);
      if (col < columns - 1) neighbors.push(i + 1);
      if (row > 0) neighbors.push(i - columns);
      if (row < Math.ceil(seats.length / columns) - 1) neighbors.push(i + columns);

      for (const neighborIdx of neighbors) {
        const neighbor = seats[neighborIdx];
        if (neighbor && neighbor.student && neighbor.student.kelas === seat.student.kelas) {
          conflictSeats.add(seat.seatId);
          conflictSeats.add(neighbor.seatId);
        }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeRoomId = active.data.current?.roomId;
    const overRoomId = over.data.current?.roomId;
    if (activeRoomId !== overRoomId) return;

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

  const seatToNumberMap = new Map<string, number>();
  let currentNumber = 1;
  for (let c = 0; c < cols; c++) {
    const isDownward = c % 2 === 0;
    const rowIndices = [];
    if (isDownward) {
      for (let r = 0; r < rows; r++) rowIndices.push(r);
    } else {
      for (let r = rows - 1; r >= 0; r--) rowIndices.push(r);
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

  const midPoint = Math.ceil(cols / 2);
  const gridTemplateColumns = aisleGap > 0 && cols > 2
    ? `repeat(${midPoint}, minmax(0, 1fr)) ${aisleGap * 1.5}rem repeat(${cols - midPoint}, minmax(0, 1fr))`
    : `repeat(${cols}, minmax(0, 1fr))`;

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-slate-800">{assignment.roomName}</h3>
          
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline-block">Tambah Kosong:</span>
            <button
              onClick={() => useAppStore.getState().addEmptyRowTop(assignment.roomId)}
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              + Atas
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyRowBottom(assignment.roomId)}
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              + Bawah
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyColumnLeft(assignment.roomId)}
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              + Kiri
            </button>
            <button
              onClick={() => useAppStore.getState().addEmptyColumnRight(assignment.roomId)}
              className="px-2 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              + Kanan
            </button>

            {seatingMode === 'acak' && conflictSeats.size > 0 && (
              <>
                <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block"></div>
                <button
                  onClick={() => setShowConflicts(!showConflicts)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showConflicts
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 shadow-sm'
                  }`}
                >
                  ⚠ {conflictSeats.size / 2} Konflik
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {seatingMode === 'acak' && showConflicts && conflictInfo.hasConflicts && (
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
              </ul>
            </div>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: gridTemplateColumns,
            columnGap: '0.75rem',
            rowGap: '0.75rem',
          }}
        >
          {assignment.seats.map((seat, idx) => {
            const dynamicNo = seatToNumberMap.get(seat.seatId) || 0;
            const colIdx = idx % cols;
            const isAtAisle = aisleGap > 0 && cols > 2 && colIdx === midPoint - 1;

            return (
              <div key={seat.seatId} className="contents">
                <SortableSeat
                  seatId={seat.seatId}
                  student={seat.student}
                  position={dynamicNo}
                  roomId={assignment.roomId}
                  hasConflict={conflictSeats.has(seat.seatId)}
                  type={seat.type}
                />
                {isAtAisle && <div className="hidden sm:block" />}
              </div>
            );
          })}
        </div>
        
        {aisleGap > 0 && (
          <div className="mt-4 text-center text-sm text-slate-500">
            <div className="inline-block px-3 py-1 bg-slate-100 rounded">
              Lorong Aktif (Tengah)
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
