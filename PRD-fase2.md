# PRD Fase 2 — Harmoni Stay (di luar Payment Gateway)

> Lanjutan dari `PRD.md`. Fokus ke gap antara PRD v1 dan implementasi saat ini, tidak termasuk integrasi payment gateway (Midtrans/Xendit) yang sengaja di-exclude untuk fase ini.

## 0. Ringkasan Prioritas

| # | Fitur | Prioritas | Kompleksitas | Alasan urutan |
|---|---|---|---|---|
| 1 | Review & Rating | Must | Sedang | Trust signal buat calon tamu, PRD asli sudah minta, belum ada sama sekali di backend |
| 2 | Auto-cancel booking pending | Must | Kecil | Bug bisnis nyata: kamar bisa "tersandera" reservasi unpaid tanpa batas waktu |
| 3 | Lupa password | Should | Kecil | Kebutuhan dasar akun, saat ini user yang lupa password nggak bisa recovery sendiri |
| 4 | Kebijakan pembatalan & refund | Should | Sedang | Melengkapi alur booking yang sudah ada (destroy reservation) jadi proses yang auditable |
| 5 | Kode promo/voucher | Could | Sedang | Nice-to-have untuk marketing, tidak blocking alur inti |
| 6 | Laporan & export | Could | Sedang | Berguna buat admin real, tapi dashboard stats basic sudah cukup jalan sekarang |
| 7 | Role admin bertingkat | Won't (fase ini) | Besar | Belum ada kebutuhan operasional multi-admin, over-engineering kalau dipaksa sekarang |

---

## 1. Review & Rating

**Tujuan:** tamu yang sudah checkout bisa kasih rating & ulasan, ditampilkan di halaman detail kamar.

**Data model baru:**
- Tabel `reviews`: `id`, `reservation_id` (unique, FK), `room_id` (FK), `user_id` (FK), `rating` (1-5), `comment` (text, nullable), `photos` (JSON array path, max 5), `created_at`.

**Aturan bisnis:**
- Hanya bisa review kalau `reservation.status = completed` (checkout sudah lewat).
- Satu review per reservation (bukan per user — user bisa nginap berkali-kali).
- Rating agregat (`avg_rating`, `review_count`) di-cache di tabel `rooms` (kolom baru), di-update tiap ada review baru — biar listing/search nggak perlu JOIN+AVG tiap request.

**API:**
- `POST /api/reservations/{id}/review` (auth, milik sendiri, status completed, belum pernah review)
- `GET /api/rooms/{id}/reviews` (public, paginated)

**Frontend:**
- Form review di halaman "My Reservation" untuk booking yang sudah completed.
- Section review + rating breakdown di halaman detail kamar (`app/room/[id]`).

**Acceptance criteria:**
- Booking yang belum completed tidak muncul opsi review.
- Upload foto divalidasi format (jpg/png) & ukuran (maks 2MB/foto).
- Rating rata-rata kamar ter-update real-time setelah submit review.

---

## 2. Auto-cancel Booking Pending

**Tujuan:** reservasi `unpaid` yang dibiarkan lebih dari 30 menit otomatis dibatalkan, kamar kembali tersedia.

**Implementasi:**
- Scheduled job Laravel (`schedule:run` via cron, atau queue job dengan delay saat reservasi dibuat) yang cek reservasi `payment_status = unpaid` dan `created_at < now() - 30 menit` → update jadi `cancelled`.
- Kirim notifikasi (existing notification system) ke user bahwa booking dibatalkan karena timeout.

**Acceptance criteria:**
- Reservasi yang sudah `paid` tidak pernah kena auto-cancel meskipun job jalan.
- Kamar yang reservasinya di-auto-cancel langsung balik available di endpoint `/api/rooms/availability`.
- Ada log/audit trail (siapa/apa yang membatalkan: `system` vs `user` vs `admin`).

---

## 3. Lupa Password

**Tujuan:** user bisa reset password sendiri lewat email, tanpa bantuan admin.

**Implementasi:**
- Pakai fitur bawaan Laravel (`Illuminate\Auth\Passwords`) — bukan bikin dari nol.
- `POST /api/forgot-password` (kirim link/token ke email)
- `POST /api/reset-password` (token + password baru)
- Token expired 60 menit (sesuai PRD v1).

**Acceptance criteria:**
- Email yang tidak terdaftar tetap dapat response sukses generik (hindari enumerasi akun).
- Token sekali pakai, invalid setelah dipakai atau expired.
- Reset password memicu revoke semua token Sanctum aktif (force re-login di device lain).

---

## 4. Kebijakan Pembatalan & Refund

**Tujuan:** alur cancel booking yang sudah ada (`DELETE /reservations/{id}`) jadi proses yang mengikuti cutoff time & bisa direview admin, bukan langsung hilang.

**Data model:**
- Tambah kolom di `reservations`: `cancellation_reason` (nullable text), `refund_status` (enum: `none`, `requested`, `approved`, `rejected`), `cancelled_by` (enum: `user`, `admin`, `system`).

**Aturan bisnis:**
- User hanya bisa cancel kalau masih di luar cutoff time hotel (misal H-1 sebelum check-in — ambil dari `settings` yang sudah ada).
- Cancel yang sudah `paid` → status jadi `cancelled` + `refund_status = requested`, bukan langsung hilang/refund otomatis (belum ada payment gateway, jadi refund tetap manual dulu).
- Admin approve/reject refund dari panel admin, dengan alasan.

**API:**
- `POST /api/reservations/{id}/cancel` (ganti `DELETE`, biar semantiknya jelas ini bukan hard-delete)
- `PATCH /api/reservations/{id}/refund` (admin only, approve/reject)

**Acceptance criteria:**
- Reservasi yang sudah lewat cutoff time tidak bisa dibatalkan user sendiri (harus hubungi admin).
- Riwayat pembatalan & refund tetap muncul di "Booking Saya" (bukan hard delete dari database).

---

## 5. Kode Promo/Voucher

**Tujuan:** admin bisa buat kode diskon, user input saat booking.

**Data model baru:**
- Tabel `promo_codes`: `code` (unique), `discount_type` (percent/fixed), `discount_value`, `min_transaction`, `quota`, `used_count`, `valid_from`, `valid_until`, `active`.

**Aturan bisnis:**
- Validasi saat apply: kode aktif, belum expired, kuota belum habis, transaksi memenuhi minimum.
- Kuota berkurang saat booking berhasil dibuat (bukan saat apply — biar tidak "reserved" kuota oleh orang yang batal checkout).

**API:**
- `POST /api/promo/validate` (cek kode + hitung diskon)
- CRUD admin `/api/promo-codes` (admin only)

**Acceptance criteria:**
- Kode yang sudah dipakai user yang sama tidak bisa dipakai dua kali di reservasi berbeda (kalau aturan "sekali pakai per user" diinginkan — perlu keputusan produk, default: tidak dibatasi per-user, hanya kuota global).
- Diskon ter-refleksi jelas di ringkasan harga sebelum checkout.

---

## 6. Laporan & Export

**Tujuan:** admin bisa lihat tren & export data buat kebutuhan pembukuan.

**Implementasi:**
- Extend `/api/admin/stats` yang sudah ada dengan filter rentang tanggal & group-by (harian/bulanan).
- `GET /api/admin/reports/export?type=bookings&format=csv` — generate CSV pakai `League\Csv` atau `Laravel Excel` (cek dulu apakah composer package tersedia sebelum nambah dependency baru).

**Acceptance criteria:**
- Export mengikuti filter yang sedang aktif di dashboard (tanggal, status, hotel — bukan selalu semua data).
- File CSV/Excel bisa dibuka langsung dengan format tanggal & currency yang benar (bukan angka mentah tanpa format).

---

## 7. Role Admin Bertingkat — Ditunda

PRD v1 minta super admin/hotel manager/finance, tapi sistem saat ini single-hotel (bukan multi-tenant), jadi pemisahan role granular ini belum ada kebutuhan nyata — satu admin sudah cukup pegang semua. **Tidak dikerjakan di fase ini**, revisit kalau platform berkembang jadi benar-benar multi-hotel/multi-tenant.

---

## Pertanyaan Terbuka (butuh keputusan sebelum implementasi)

1. Auto-cancel: dijalankan via Laravel scheduler (perlu cron aktif di server) atau delayed queue job per-reservasi? Tergantung environment deploy (shared hosting biasanya nggak bisa cron custom).
2. Refund: karena belum ada payment gateway asli, refund fase ini murni administratif (approve/reject status) — uang tetap ditransfer manual di luar sistem. Konfirmasi ini cukup untuk sekarang?
3. Promo: dibatasi sekali pakai per user atau cuma kuota global?
