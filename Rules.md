Kamu adalah seorang senior full-stack developer yang ahli dalam membangun aplikasi modern menggunakan React dan Next.js.

Saya ingin kamu membangun sebuah aplikasi web untuk mengatur denah tempat duduk ujian siswa SMP dengan sistem pembagian berdasarkan kapasitas ruangan.

---

## 🏗️ Tech Stack

- Gunakan Next.js versi terbaru (App Router)
- Gunakan React versi terbaru
- Gunakan TypeScript
- Gunakan Tailwind CSS
- Gunakan Zustand atau Context API untuk state management
- Gunakan library xlsx untuk import/export Excel
- Gunakan @dnd-kit untuk fitur drag and drop
- Aplikasi harus siap di-deploy ke Vercel

---

## 🎯 KONSEP UTAMA (PENTING)

Sistem TIDAK membagi siswa berdasarkan kelas.

Melainkan:

- Semua siswa dianggap sebagai satu kumpulan (pool)
- Kemudian dibagi ke dalam beberapa ruangan berdasarkan kapasitas ruangan yang ditentukan oleh user

---

## 🎯 FITUR UTAMA

### 1. Upload Data Siswa

- Upload file Excel (.xlsx)
- Format data:
  - nama
  - kelas

- Data disimpan ke state global

---

### 2. Pengaturan Ruangan (FITUR UTAMA)

- User dapat membuat beberapa ruangan

- Setiap ruangan memiliki:
  - Nama ruangan (contoh: "Ruang 1", "Lab Komputer")
  - Kapasitas (contoh: 29, 32, dll)

- Fitur yang harus ada:
  - Tambah ruangan
  - Edit kapasitas
  - Hapus ruangan

---

### 3. Pembagian Siswa Otomatis

- Setelah ruangan dibuat:
  - Semua siswa dibagi ke ruangan secara berurutan sesuai kapasitas

Contoh:

- Total siswa: 90
- Ruangan:
  - Ruang A (29)
  - Ruang B (32)
  - Ruang C (29)

Hasil:

- Ruang A → 29 siswa
- Ruang B → 32 siswa
- Ruang C → sisa siswa

---

### 4. Generate Denah Tempat Duduk

Untuk SETIAP ruangan:

- Buat denah dalam bentuk grid
- Acak posisi siswa
- Aturan:
  - Siswa dari KELAS YANG SAMA tidak boleh duduk bersebelahan (kiri, kanan, depan, belakang)

---

### 5. Algoritma Penempatan

- Harus mempertimbangkan:
  - Kapasitas ruangan
  - Larangan siswa sekelas berdekatan

- Gunakan:
  - Backtracking ATAU
  - Shuffle + retry

- Jika gagal:
  - Sistem harus mencoba ulang secara otomatis

---

### 6. Tampilan Denah

- Tampilkan per ruangan
- Menampilkan:
  - Nama siswa
  - Kelas
  - Nomor kursi

- Ada fitur untuk berpindah antar ruangan (tab atau dropdown)

---

### 7. Custom Denah (Manual)

- Bisa drag & drop antar kursi
- Bisa tukar posisi siswa
- Opsional:
  - Bisa pindahkan siswa antar ruangan

- Perubahan disimpan di state

---

### 8. Generate Absensi

- Berdasarkan posisi duduk
- Format:
  - nomor
  - nama
  - kelas
  - nomor kursi
  - ruangan

---

### 9. Export Data

- Export ke Excel:
  - Data absensi
  - Denah per ruangan

---

## 📁 Struktur Project

/app
/upload
/ruangan
/denah
/absensi

/components
RoomForm.tsx
RoomList.tsx
SeatGrid.tsx
UploadExcel.tsx
DragDropSeat.tsx

/lib
roomDistributor.ts
seatingGenerator.ts
excelUtils.ts

/store
useStudentStore.ts

---

## 🧠 DESAIN ALGORITMA

### 1. Distribusi Siswa ke Ruangan

Input:

- daftar siswa
- daftar ruangan (nama + kapasitas)

Proses:

- Loop ruangan satu per satu
- Isi ruangan hingga kapasitas terpenuhi
- Lanjut ke ruangan berikutnya
- Berhenti jika semua siswa sudah terbagi

---

### 2. Validasi Posisi Duduk

- Cek posisi:
  - kiri
  - kanan
  - atas
  - bawah

- Jika ada siswa dengan kelas yang sama → tidak valid
- Cari posisi lain

---

## ⚙️ EDGE CASE

- Kapasitas total < jumlah siswa → tampilkan peringatan
- Ada kursi kosong → diperbolehkan
- Distribusi tidak merata
- Satu kelas terlalu dominan

---

## 🎨 UI/UX

- Desain clean dan modern
- Halaman pengaturan ruangan
- Tombol:
  - Upload
  - Tambah Ruangan
  - Generate
  - Reset
  - Export

- Ada loading indicator saat generate

---

## 🚀 CARA OUTPUT

- Bangun step-by-step
- Urutan:
  1. Setup project
  2. Upload Excel
  3. Pengaturan ruangan
  4. Distribusi siswa
  5. Generate denah
  6. Tampilan grid
  7. Drag & drop
  8. Export

---

## 🔥 FITUR TAMBAHAN

- Mode validasi:
  - Tandai jika ada siswa sekelas berdekatan

- Mode debug:
  - Tampilkan alasan gagal generate

---
