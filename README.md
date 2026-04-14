# Sistem Manajemen Denah Ujian SMP

Aplikasi web untuk mengatur denah tempat duduk ujian siswa SMP dengan sistem pembagian berdasarkan kapasitas ruangan.

## 🚀 Fitur Utama

- ✅ **Upload Data Siswa** - Import data siswa dari file Excel (.xlsx)
- ✅ **Pengaturan Ruangan** - Buat dan kelola multiple ruangan dengan kapasitas custom
- ✅ **Pembagian Otomatis** - Distribusi siswa ke ruangan berdasarkan kapasitas
- ✅ **Generate Denah** - Algoritma otomatis untuk membuat denah tempat duduk
- ✅ **Drag & Drop** - Atur ulang posisi siswa dengan drag and drop
- ✅ **Validasi Konflik** - Deteksi siswa sekelas yang duduk berdekatan
- ✅ **Export Excel** - Export data absensi dan denah ke Excel
- ✅ **Responsive UI** - Design modern dengan Tailwind CSS

## 🛠️ Tech Stack

- **Next.js 16** - App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** - State management
- **@dnd-kit** - Drag and drop functionality
- **xlsx** - Excel import/export
- **lucide-react** - Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Cara Penggunaan

### Step 1: Upload Data Siswa

1. Klik menu **Upload**
2. Siapkan file Excel dengan format:
   - Kolom `nama` - Nama siswa
   - Kolom `kelas` - Kelas siswa (contoh: 7A, 8B, 9C)
3. Drag & drop atau klik untuk upload
4. Contoh data bisa di-download di: `/contoh-data-siswa.xlsx`

### Step 2: Pengaturan Ruangan

1. Klik menu **Ruangan**
2. Klik **Tambah Ruangan**
3. Isi nama ruangan dan kapasitas (jumlah kursi)
4. Ulangi untuk menambah ruangan lain
5. Pastikan total kapasitas >= jumlah siswa

### Step 3: Generate Denah

1. Klik menu **Denah**
2. Klik **Generate Denah**
3. Sistem akan otomatis:
   - Membagi siswa ke ruangan sesuai kapasitas
   - Mengacak posisi duduk
   - Menghindari siswa sekelas berdekatan
4. Gunakan tab untuk berpindah antar ruangan
5. Drag & drop untuk mengatur ulang posisi

### Step 4: Export Data

1. Klik menu **Absensi**
2. Klik **Export Absensi** untuk data absensi
3. Klik **Export Denah** untuk denah per ruangan

## 🏗️ Struktur Project

```
/app
  /upload         - Halaman upload siswa
  /ruangan        - Halaman pengaturan ruangan
  /denah          - Halaman generate denah
  /absensi        - Halaman data absensi
  layout.tsx      - Root layout dengan navigasi
  page.tsx        - Homepage/dashboard

/components
  UploadExcel.tsx - Komponen upload Excel
  RoomForm.tsx    - Form ruangan
  RoomList.tsx    - List ruangan
  SeatGrid.tsx    - Grid denah dengan drag & drop
  Navigation.tsx  - Navigasi utama

/lib
  types.ts            - TypeScript types
  excelUtils.ts       - Utility baca Excel
  roomDistributor.ts  - Algoritma distribusi ruangan
  seatingGenerator.ts - Algoritma generate denah
  excelExport.ts      - Export ke Excel

/store
  useAppStore.ts  - Zustand global state
```

## 🧠 Algoritma

### Distribusi Siswa ke Ruangan

1. Loop melalui semua ruangan
2. Isi setiap ruangan hingga kapasitas terpenuhi
3. Lanjut ke ruangan berikutnya
4. Berhenti jika semua siswa sudah terbagi

### Generate Denah Tempat Duduk

1. Shuffle semua siswa secara random
2. Tempatkan siswa ke kursi
3. Validasi: cek apakah ada siswa sekelas berdekatan (kiri, kanan, depan, belakang)
4. Jika valid → selesai
5. Jika tidak valid → shuffle ulang (max 100 attempts)
6. Jika tetap tidak valid → tampilkan dengan warning

## 🎨 Screenshots

### Dashboard
Menampilkan overview data siswa, ruangan, dan status generate

### Upload
Interface untuk upload file Excel dengan drag & drop

### Ruangan
Form untuk menambah dan edit ruangan

### Denah
Grid view denah tempat duduk dengan drag & drop

### Absensi
Tabel data absensi siap export

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Run development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Build untuk Production

```bash
npm run build
npm run start
```

## 📦 Deploy ke Vercel

Aplikasi ini siap di-deploy ke Vercel:

1. Push code ke GitHub
2. Import project di Vercel
3. Deploy otomatis

## 🐛 Troubleshooting

### Kapasitas tidak mencukupi
- Pastikan total kapasitas semua ruangan >= jumlah siswa
- Tambahkan ruangan jika perlu

### Generate denah gagal
- Sistem akan otomatis retry hingga 100 kali
- Jika tetap gagal, denah tetap ditampilkan dengan warning
- Gunakan drag & drop untuk manual adjustment

### Format Excel salah
- Pastikan kolom bernama `nama` dan `kelas` (lowercase)
- Download contoh file di halaman Upload

## 📝 License

MIT License

## 👨‍💻 Author

Sistem Manajemen Denah Ujian SMP

---

Built with ❤️ using Next.js and React
