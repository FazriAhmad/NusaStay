# PRD — Aplikasi Booking Hotel

## 1. Ringkasan
Platform booking hotel berbasis web yang memungkinkan pengguna mencari, membandingkan, dan memesan kamar hotel secara online, serta memungkinkan admin mengelola hotel, kamar, booking, dan pengguna.

**Target pengguna:** wisatawan/pelancong (customer) dan pengelola platform (admin).

**Stack rekomendasi:** Laravel (backend/API) + Next.js (frontend), PostgreSQL, Sanctum untuk auth, Midtrans/Xendit untuk pembayaran.

---

## 2. Fitur Customer

### 2.1 Registrasi & Login
| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Daftar akun | Registrasi via email + password, verifikasi email | Must |
| Login/logout | Autentikasi session/token (Sanctum) | Must |
| Lupa password | Reset via link email, token expired dalam 60 menit | Must |
| Login Google | OAuth2 Google (Socialite) | Should |

**Acceptance criteria:**
- Password minimal 8 karakter, disimpan hash (bcrypt).
- Email harus unik & terverifikasi sebelum booking pertama.
- Login gagal 5x berturut-turut → rate limit 1 menit.

### 2.2 Pencarian Hotel
- Input: lokasi/nama hotel (autocomplete), tanggal check-in & check-out, jumlah tamu, jumlah kamar.
- Validasi: check-out > check-in, tanggal tidak boleh di masa lalu.
- Hasil: daftar hotel yang punya kamar tersedia sesuai rentang tanggal & kapasitas.

### 2.3 Daftar & Detail Hotel
Menampilkan: galeri foto, nama & lokasi (peta), rentang harga kamar, daftar fasilitas hotel, rating & ringkasan ulasan, daftar tipe kamar dengan harga & ketersediaan real-time, kebijakan hotel (check-in/out time, cancellation policy, aturan anak/hewan).

### 2.4 Filter & Sorting
- Sort: harga termurah/termahal, rating tertinggi, jarak terdekat.
- Filter: rentang harga, fasilitas (multi-select), tipe kamar, rating minimum.
- Filter & sort bersifat kombinatif dan ter-refleksi di URL query (agar bisa di-share/bookmark).

### 2.5 Booking Kamar
Alur: pilih tipe & jumlah kamar → isi data tamu (nama, kontak per kamar bila diperlukan) → ringkasan pesanan (rincian harga, pajak, diskon) → input kode promo/voucher → lanjut ke pembayaran.

**Aturan bisnis kunci:**
- Ketersediaan kamar dikunci (row lock) saat proses booking untuk mencegah double-booking.
- Reservasi berstatus `pending` dibatalkan otomatis jika pembayaran tidak selesai dalam 30 menit (hold kamar sementara).
- Kode promo divalidasi: masa berlaku, kuota, syarat minimum transaksi.

### 2.6 Pembayaran
- Metode: transfer bank (manual/VA), e-wallet (QRIS), virtual account, kartu kredit/debit — via payment gateway (Midtrans/Xendit).
- Status pembayaran: `pending`, `paid`, `failed`, `expired`.
- Update status booking otomatis via webhook dari payment gateway.

### 2.7 Booking Saya
- Tab: booking aktif (upcoming) & riwayat (selesai/dibatalkan).
- Detail reservasi: info hotel, kamar, tanggal, harga, status pembayaran.
- Batalkan booking: hanya jika sesuai kebijakan pembatalan hotel (cutoff time), status berubah `cancelled`, proses refund bila applicable.
- Download/cetak bukti booking (PDF/voucher berisi QR/kode booking).

### 2.8 Review & Rating
- Hanya customer yang sudah menyelesaikan stay (checkout terlewati & status `completed`) yang bisa memberi rating (1-5) dan ulasan teks.
- Upload foto pengalaman menginap (maks. 5 foto per ulasan, validasi format & ukuran).
- Satu ulasan per booking.

---

## 3. Fitur Admin

### 3.1 Dashboard
Ringkasan: total hotel, total kamar, total booking, pendapatan (harian/bulanan), daftar booking terbaru (real-time/near real-time).

### 3.2 Manajemen Hotel
- CRUD hotel: nama, deskripsi, lokasi (alamat + koordinat), foto (multi-upload), fasilitas (checklist master data), kebijakan.
- Soft delete (hotel yang punya riwayat booking tidak dihapus permanen).

### 3.3 Manajemen Kamar
- CRUD tipe kamar per hotel: nama tipe, harga (bisa musiman), jumlah unit, fasilitas kamar, foto.
- Kalender ketersediaan per tipe kamar (block/unblock tanggal untuk maintenance).

### 3.4 Manajemen Booking
- Lihat semua reservasi dengan filter (status, hotel, tanggal, customer).
- Konfirmasi booking manual (untuk pembayaran transfer manual yang perlu verifikasi).
- Kelola pembatalan & refund (approve/reject, catat alasan).

### 3.5 Manajemen Pengguna
- Data customer (lihat, non-aktifkan akun bila fraud/abuse).
- Akun admin & role (super admin, hotel manager, finance) dengan hak akses berbeda.

### 3.6 Laporan
- Laporan booking (per periode, per hotel, per status).
- Laporan pendapatan (gross/net setelah komisi & refund).
- Hotel paling banyak dipesan (leaderboard).
- Statistik bulanan/tahunan (grafik tren booking & revenue).
- Export laporan ke CSV/Excel.

---

## 4. Non-Functional Requirements
- **Keamanan:** hash password, HTTPS, proteksi CSRF/XSS/SQLi, rate limiting login & booking.
- **Konsistensi data:** transaksi database (DB transaction + row lock) untuk mencegah race condition saat booking kamar terakhir.
- **Skalabilitas:** cache untuk hasil pencarian hotel (Redis), queue untuk kirim email/notifikasi.
- **Auditability:** log perubahan status booking & pembayaran.

## 5. Out of Scope (v1)
- Multi-bahasa & multi-currency.
- Loyalty/membership program.
- Chat langsung dengan hotel.

## 6. Metrik Sukses
- Conversion rate pencarian → booking.
- Tingkat pembatalan booking.
- Waktu rata-rata proses booking (search sampai pembayaran selesai).
