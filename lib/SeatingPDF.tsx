import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { RoomAssignment } from '@/lib/types';

// Dynamic styles for seat boxes - will be calculated at runtime
const getSeatStyle = (totalRows: number, seatHeight: number) => {
  const fontSize = Math.max(3.5, seatHeight * 0.12);
  return {
    seatBox: {
      borderWidth: 1,
      borderColor: '#6366f1',
      borderRadius: 2,
      marginRight: 2,
      padding: 2,
      backgroundColor: '#ffffff',
      flex: 1,
      height: seatHeight,
    },
    seatBoxEmpty: {
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 2,
      marginRight: 2,
      padding: 2,
      backgroundColor: '#f8fafc',
      borderStyle: 'dashed' as const,
      flex: 1,
      height: seatHeight,
    },
    seatNumber: {
      fontSize: Math.max(4, seatHeight * 0.15),
      fontWeight: 'bold' as const,
      color: '#334155',
    },
    studentName: {
      fontSize,
      fontWeight: 'bold' as const,
      color: '#0f172a',
    },
    studentClass: {
      fontSize,
      color: '#4f46e5',
      backgroundColor: '#eef2ff',
      padding: 0.5,
      borderRadius: 1,
      textAlign: 'center' as const,
    },
    emptyText: {
      fontSize,
      color: '#94a3b8',
      textAlign: 'center' as const,
    },
  };
};

// Static styles
const staticStyles = StyleSheet.create({
  page: {
    padding: 15,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontSize: 9,
    marginBottom: 6,
    textAlign: 'center',
    color: '#475569',
  },
  roomTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: 3,
    borderRadius: 2,
  },
  gridContainer: {
    marginBottom: 5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 1,
    borderWidth: 1,
  },
  legendBoxNormal: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  legendText: {
    fontSize: 6,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 15,
    right: 15,
    textAlign: 'center',
    fontSize: 6,
    color: '#64748b',
    borderTop: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 3,
  },
});

const SeatingPDF = ({ assignments }: { assignments: RoomAssignment[] }) => {
  return (
    <Document>
      {assignments.map((assignment, roomIndex) => {
        // Use assignment's own columns/rows
        const cols = assignment.columns || 6;
        const totalRows = assignment.rows || Math.ceil(assignment.seats.length / cols);

        // A4 landscape: 842 x 595 points
        // Content area after padding: ~812 x 565
        // Reserve space for: title(20) + subtitle(15) + roomTitle(12) + legend(12) + footer(12) = 71
        const headerSpace = 70;
        const footerSpace = 15;
        const availableHeight = 595 - 15 - 15 - headerSpace - footerSpace; // 458 points
        const rowGap = 2;
        const totalGaps = (totalRows - 1) * rowGap;
        const seatHeight = Math.max(18, (availableHeight - totalGaps) / totalRows);

        const seatStyle = getSeatStyle(totalRows, seatHeight);

        return (
          <Page key={roomIndex} size="A4" style={staticStyles.page} orientation="landscape">
            {/* Header */}
            <Text style={staticStyles.title}>DENAH TEMPAT DUDUK UJIAN</Text>
            <Text style={staticStyles.subtitle}>
              {assignment.roomName} - Tahun Ajaran 2025/2026
            </Text>

            {/* Room Title */}
            <Text style={staticStyles.roomTitle}>
              {assignment.roomName} | {assignment.seats.filter(s => s.student).length} Siswa | {totalRows} baris × {cols} kolom
            </Text>

            {/* Legend */}
            <View style={staticStyles.legendContainer}>
              <View style={staticStyles.legendItem}>
                <View style={[staticStyles.legendBox, staticStyles.legendBoxNormal]} />
                <Text style={staticStyles.legendText}>Terisi</Text>
              </View>
              <View style={staticStyles.legendItem}>
                <View style={[staticStyles.legendBox, { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderStyle: 'dashed' as const }]} />
                <Text style={staticStyles.legendText}>Kosong</Text>
              </View>
            </View>

            {/* Grid - ALL rows on ONE page with auto-height */}
            <View style={staticStyles.gridContainer}>
              {Array.from({ length: totalRows }).map((_, rowIndex) => (
                <View key={rowIndex} style={{ ...staticStyles.gridRow, marginBottom: rowGap }}>
                  {Array.from({ length: cols }).map((_, colIndex) => {
                    const seatIndex = rowIndex * cols + colIndex;
                    const seat = assignment.seats[seatIndex];

                    if (!seat) return null;

                    const seatNumber = seatIndex + 1;

                    return seat.student ? (
                      <View key={colIndex} style={seatStyle.seatBox}>
                        <Text style={seatStyle.seatNumber}>#{seatNumber}</Text>
                        <Text style={seatStyle.studentName}>
                          {seat.student.nama}
                        </Text>
                        <Text style={seatStyle.studentClass}>{seat.student.kelas}</Text>
                      </View>
                    ) : (
                      <View key={colIndex} style={seatStyle.seatBoxEmpty}>
                        <Text style={seatStyle.seatNumber}>#{seatNumber}</Text>
                        <Text style={seatStyle.emptyText}>Kosong</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Footer */}
            <Text style={staticStyles.footer}>
              Dicetak: {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Page>
        );
      })}
    </Document>
  );
};

export const generateSeatingPDF = async (assignments: RoomAssignment[]) => {
  const pdfDocument = (
    <SeatingPDF assignments={assignments} />
  );

  const blob = await pdf(pdfDocument).toBlob();
  return blob;
};

export default SeatingPDF;
