'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { distributeStudentsToRooms } from '@/lib/roomDistributor';
import { generateSeatingArrangement } from '@/lib/seatingGenerator';
import SeatGrid from '@/components/SeatGrid';
import LayoutSettings from '@/components/LayoutSettings';
import { Shuffle, AlertCircle, CheckCircle, Loader2, Settings, Grid3X3 } from 'lucide-react';

export default function DenahPage() {
  const { students, rooms, roomAssignments, setRoomAssignments, activeRoomId, setActiveRoomId, customColumns } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleGenerate = async () => {
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'Upload data siswa terlebih dahulu' });
      return;
    }

    if (rooms.length === 0) {
      setMessage({ type: 'error', text: 'Tambahkan ruangan terlebih dahulu' });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Distribute students to rooms WITH custom columns
    const distribution = distributeStudentsToRooms(students, rooms, {
      customColumns: customColumns || undefined,
    });

    if (!distribution.success) {
      setMessage({ type: 'error', text: distribution.message });
      setIsGenerating(false);
      return;
    }

    // Generate seating arrangement
    const seatingResult = generateSeatingArrangement(distribution.assignments);

    setRoomAssignments(seatingResult.assignments);
    setMessage({ type: 'success', text: seatingResult.message });

    // Set active room to first room
    if (seatingResult.assignments.length > 0 && !activeRoomId) {
      setActiveRoomId(seatingResult.assignments[0].roomId);
    }

    setIsGenerating(false);
  };

  const activeAssignment = roomAssignments.find((a) => a.roomId === activeRoomId);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                Denah Tempat Duduk
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                Generate dan atur denah tempat duduk ujian
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                showSettings
                  ? 'bg-white text-indigo-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:inline">Layout</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base shadow-sm"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="sm:inline">{isGenerating ? 'Loading...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : message.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-sky-50 text-sky-800 border border-sky-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {showSettings && (
        <div className="mb-6">
          <LayoutSettings />
        </div>
      )}

      {roomAssignments.length > 0 && (
        <>
          {/* Room Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {roomAssignments.map((assignment) => (
                <button
                  key={assignment.roomId}
                  onClick={() => setActiveRoomId(assignment.roomId)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 font-medium ${
                    activeRoomId === assignment.roomId
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {assignment.roomName}
                </button>
              ))}
            </div>
          </div>

          {/* Seat Grid */}
          {activeAssignment && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <SeatGrid assignment={activeAssignment} />
            </div>
          )}
        </>
      )}

      {roomAssignments.length === 0 && !message && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-lg font-medium">
            Klik tombol &quot;Generate Denah&quot; untuk membuat denah tempat duduk
          </p>
        </div>
      )}
    </div>
  );
}
