'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, X } from 'lucide-react';

interface RoomFormProps {
  editRoomId?: string;
  onCancel?: () => void;
}

export default function RoomForm({ editRoomId, onCancel }: RoomFormProps) {
  const { rooms, addRoom, updateRoom } = useAppStore();
  const editingRoom = editRoomId ? rooms.find((r) => r.id === editRoomId) : null;

  const [nama, setNama] = useState(editingRoom?.nama || '');
  const [kapasitas, setKapasitas] = useState(editingRoom?.kapasitas || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) return;

    if (editingRoom) {
      updateRoom(editingRoom.id, { nama, kapasitas });
      onCancel?.();
    } else {
      addRoom({
        id: uuidv4(),
        nama,
        kapasitas,
      });
      setNama('');
      setKapasitas(30);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Nama Ruangan
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Ruang 1, Lab Komputer"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Kapasitas
        </label>
        <input
          type="number"
          value={kapasitas}
          onChange={(e) => setKapasitas(parseInt(e.target.value) || 0)}
          min="1"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          {editingRoom ? 'Update' : 'Tambah'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
