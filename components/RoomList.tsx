'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Trash2, Edit2 } from 'lucide-react';
import RoomForm from './RoomForm';

export default function RoomList() {
  const { rooms, deleteRoom } = useAppStore();
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const totalKapasitas = rooms.reduce((sum, room) => sum + room.kapasitas, 0);

  return (
    <div className="space-y-4">
      {rooms.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Belum ada ruangan. Tambahkan ruangan pertama.</p>
      ) : (
        <>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800 font-medium">
              Total Kapasitas: <span className="font-bold text-indigo-900">{totalKapasitas}</span> kursi
            </p>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {editingRoomId === room.id ? (
                  <RoomForm
                    editRoomId={room.id}
                    onCancel={() => setEditingRoomId(null)}
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{room.nama}</h3>
                      <p className="text-sm text-slate-600">Kapasitas: <span className="font-semibold text-slate-700">{room.kapasitas}</span> siswa</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRoomId(room.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
