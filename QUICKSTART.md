# Quick Start Guide - Sistem Manajemen Denah Ujian

## 🚀 Cara Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

### Production Mode

```bash
npm run build
npm run start
```

## 📋 Langkah Penggunaan Cepat

### 1️⃣ Upload Data Siswa

**Opsi A: Upload File Excel Sendiri**
1. Buat file Excel dengan kolom:
   - `nama` (kolom A)
   - `kelas` (kolom B)
   
2. Buka halaman **Upload**
3. Drag & drop file atau klik untuk memilih
4. Tunggu konfirmasi berhasil

**Opsi B: Gunakan Contoh Data**
- Download file contoh di: http://localhost:3000/contoh-data-siswa.xlsx
- Upload file tersebut

---

### 2️⃣ Tambah Ruangan

1. Buka halaman **Ruangan**
2. Klik **Tambah Ruangan**
3. Isi:
   - Nama Ruangan: `Ruang 1`
   - Kapasitas: `30`
4. Ulangi untuk menambah ruangan lain

**Contoh Setup:**
- Ruang 1: 30 kursi
- Ruang 2: 32 kursi  
- Ruang 3: 28 kursi
- **Total: 90 kursi** (untuk 90 siswa)

---

### 3️⃣ Generate Denah

1. Buka halaman **Denah**
2. Klik tombol **Generate Denah**
3. Tunggu proses selesai (loading indicator)
4. Lihat hasil per ruangan (klik tab ruangan)

**Fitur:**
- ✅ Drag & drop untuk tukar posisi
- ✅ Lihat konflik (siswa sekelas berdekatan)
- ✅ Generate ulang jika ada konflik

---

### 4️⃣ Export Data

1. Buka halaman **Absensi**
2. Klik **Export Absensi** → Download file Excel berisi:
   - No, Nama, Kelas, No Kursi, Ruangan
   
3. Klik **Export Denah** → Download file Excel berisi:
   - Denah grid per ruangan

---

## 🎯 Fitur Tambahan

### Validasi Konflik
- Di halaman Denah, klik tombol "Konflik"
- Akan ditampilkan jika ada siswa sekelas yang berdekatan
- Drag & drop untuk memperbaiki posisi

### Edit Ruangan
- Di halaman Ruangan, klik icon ✏️ untuk edit
- Ubah nama atau kapasitas
- Klik 💀 untuk hapus

### Reset Data
- Refresh browser untuk reset semua data
- Atau hapus data satu per satu

---

## ⚠️ Troubleshooting

### "Kapasitas tidak mencukupi"
**Solusi:** Tambahkan ruangan lagi sampai total kapasitas >= jumlah siswa

### "Generate denah gagal"
**Solusi:** 
- Coba generate ulang (sistem akan shuffle baru)
- Manual adjust dengan drag & drop

### "File Excel tidak bisa dibaca"
**Solusi:**
- Pastikan ada kolom `nama` dan `kelas`
- Download contoh file untuk referensi

---

## 📱 Navigasi Cepat

| Menu | Fungsi |
|------|--------|
| 🏠 Dashboard | Overview & panduan |
| 📤 Upload | Upload data siswa |
| 🚪 Ruangan | Kelola ruangan |
| 🔲 Denah | Generate & edit denah |
| 📄 Absensi | Lihat & export data |

---

## 💡 Tips

1. **Setup Ruangan Dulu** - Tambah beberapa ruangan sebelum generate
2. **Kapasitas Pas** - Sesuaikan total kapasitas dengan jumlah siswa
3. **Check Konflik** - Selalu cek konflik setelah generate
4. **Backup Data** - Export Excel untuk backup data

---

Untuk info lebih lanjut, lihat README.md
