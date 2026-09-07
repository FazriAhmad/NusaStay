# PRD — NusaStay

## 1. Ringkasan
Platform booking hotel berbasis web untuk 8 properti kurasi di Indonesia (Bali, Jakarta, Yogyakarta, Lombok, Bandung, Surabaya). Tamu bisa mencari, membandingkan, dan memesan kamar; admin mengelola katalog kamar, ketersediaan, reservasi, promo, dan laporan dari satu panel.

**Target pengguna:** wisatawan/pelancong (tamu) dan pengelola platform (admin tunggal — bukan multi-tenant).

**Stack aktual:**
- Backend: Laravel + Sanctum (token auth) + PostgreSQL
- Frontend: React + TypeScript + Vite + React Router + Tailwind CSS
- Pembayaran: **simulasi** — tidak ada integrasi payment gateway (Midtrans/Xendit dll). Tamu memilih metode (QRIS/VA/kartu/transfer) lalu status langsung `paid`/`unpaid`; admin bisa verifikasi manual.

---

## 2. Fitur Tamu

### 2.1 Akun
- Daftar, login/logout via token Sanctum.
- Lupa password: `POST /forgot-password` → `POST /reset-password` (built-in Laravel password broker, token sekali pakai).
- Edit profil (nama, email, telepon) & ganti password.

### 2.2 Cari & Jelajah Kamar
- Filter berdasarkan provinsi, tanggal check-in/out, jumlah tamu.
- Listing kamar dengan harga, rating, badge diskon (harga coret), featured.
- Detail kamar: galeri foto, fasilitas, deskripsi, ulasan tamu, kalender ketersediaan 30 hari ke depan (hijau/kuning/merah/diblokir dihitung dari stok riil).

### 2.3 Booking & Checkout
Alur: pilih tanggal & jumlah kamar → isi data tamu → checkout (kode promo, metode pembayaran) → konfirmasi.

**Aturan bisnis:**
- Ketersediaan dihitung per-malam dari `total_rooms` dikurangi reservasi aktif dan tanggal yang diblokir admin — dicek ulang di server saat submit untuk mencegah race condition/double-booking.
- Rincian harga: subtotal (harga × malam × jumlah kamar) − diskon promo + pajak (`tax_percent`) + biaya layanan (`service_fee`), semua dihitung di server, bukan client.
- Reservasi `unpaid` yang dibiarkan > 30 menit dibatalkan otomatis (command `app:cancel-expired-reservations`), kamar kembali tersedia.

### 2.4 Kode Promo
- Validasi kode saat checkout: aktif, belum kedaluwarsa, kuota tersisa, memenuhi minimum transaksi.
- Diskon persen (dengan batas maksimum) atau nominal tetap.
- Kuota berkurang saat reservasi berhasil dibuat, bukan saat divalidasi.

### 2.5 Reservasi Saya
- Tab: Akan Datang / Selesai / Dibatalkan.
- Tamu bisa: konfirmasi "saya sudah bayar" (untuk metode non-QRIS), batalkan reservasi (hanya di luar cutoff jam sebelum check-in), beri ulasan setelah menginap selesai & lunas.
- E-tiket per reservasi menampilkan status pembayaran (Lunas/Menunggu/Refund/Gagal) sesuai kondisi terkini — termasuk saat reservasi dibatalkan/di-refund oleh admin.
- Perubahan dari sisi admin (pembatalan, refund, update kamar) ikut ter-refresh otomatis saat tab tamu aktif kembali.

### 2.6 Ulasan
- Hanya bisa diberikan setelah tanggal check-out lewat & pembayaran lunas.
- Satu ulasan per reservasi, rating 1-5 + komentar + hingga beberapa foto.
- Rating rata-rata & jumlah ulasan di kamar ter-update otomatis setiap ada ulasan baru.

### 2.7 Wishlist
- Simpan/hapus kamar favorit, tersinkron per akun.

---

## 3. Fitur Admin

### 3.1 Dashboard
Ringkasan revenue (lunas), pembayaran menunggu, okupansi aktif, rating rata-rata, grafik revenue 7 hari terakhir, aktivitas reservasi terbaru.

### 3.2 Manajemen Kamar
- CRUD kamar: nama, hotel, lokasi, harga (+harga coret opsional), kapasitas, tipe kasur, luas, jumlah unit, status aktif/nonaktif, featured, deskripsi, fasilitas (multi-select), galeri foto (upload ke storage).

### 3.3 Ketersediaan
- Kalender per kamar: blokir/buka tanggal individual (maintenance, event) — terpisah dari okupansi akibat reservasi.

### 3.4 Bookings & Orders
- Lihat semua reservasi dengan filter status pembayaran/booking.
- Ubah status pembayaran cepat (unpaid/paid/refunded/failed).
- Batalkan reservasi (dengan alasan) & kelola permintaan refund (approve/reject) — riwayat tetap tersimpan, bukan hard delete.
- Restore reservasi yang dibatalkan membersihkan jejak pembatalan sepenuhnya.

### 3.5 Promo
- CRUD kode promo: tipe diskon (persen/nominal), batas maksimum diskon, minimum transaksi, kuota, masa berlaku, status aktif.

### 3.6 Fasilitas (Amenities)
- CRUD master data fasilitas kamar (nama + ikon).

### 3.7 Kontak
- Lihat & tandai pesan dari form kontak publik sebagai sudah dibaca, atau hapus.

### 3.8 Laporan
- Ringkasan booking & revenue per periode.
- Export data booking ke CSV.

### 3.9 Pengaturan
- Nama situs, tagline, kontak, alamat, pajak, biaya layanan, jam check-in/out, mode maintenance, pengumuman.

---

## 4. Non-Functional Requirements
- **Keamanan:** password di-hash (bcrypt via Laravel), token API via Sanctum, validasi request di server untuk semua endpoint tulis.
- **Konsistensi data:** ketersediaan kamar & harga selalu dihitung ulang di server saat booking dibuat — client tidak pernah jadi sumber kebenaran harga/stok.
- **Auditability:** setiap pembatalan mencatat siapa yang membatalkan (`user`/`admin`/`system`) dan alasannya.

## 5. Di Luar Cakupan (saat ini)
- Integrasi payment gateway sungguhan (Midtrans/Xendit/dll) — pembayaran masih simulasi.
- Login sosial (Google dll).
- Multi-hotel/multi-tenant dengan role admin bertingkat (super admin, hotel manager, finance) — sistem saat ini satu admin tunggal.
- Multi-bahasa & multi-currency.
