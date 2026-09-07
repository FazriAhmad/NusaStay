import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, CalendarDays, Users, BedDouble, Copy, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore, type Booking } from '../../store/AppStore';
import { formatIDR, fmtDate } from '../../lib/utils';
import { useToast } from '../../components/Toast';

const PAY_BADGE: Record<Booking['payStatus'], { label: string; cls: string }> = {
  paid: { label: 'LUNAS', cls: 'bg-emerald-100 text-emerald-700' },
  unpaid: { label: 'MENUNGGU BAYAR', cls: 'bg-amber-100 text-amber-700' },
  refunded: { label: 'REFUND', cls: 'bg-sky-100 text-sky-700' },
  failed: { label: 'GAGAL', cls: 'bg-red-100 text-red-600' },
};

export default function SuccessPage() {
  const { id } = useParams();
  const { bookings, roomById } = useStore();
  const toast = useToast();
  const b = bookings.find((x) => x.id === id);
  if (!b) return <div className="p-20 text-center">Booking tidak ditemukan. <Link to="/" className="font-bold text-jungle-700">Ke beranda</Link></div>;
  const room = roomById(b.roomId);
  const cancelled = b.bookStatus === 'cancelled';
  const badge = PAY_BADGE[b.payStatus];
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl border border-stone-200/70 card-shadow p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
          {cancelled
            ? <XCircle size={72} className="mx-auto text-stone-400" />
            : <CheckCircle2 size={72} className="mx-auto text-emerald-500" />}
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-jungle-950 mt-4">{cancelled ? 'Reservasi Dibatalkan' : 'Pemesanan Berhasil! 🎉'}</h1>
        <p className="text-stone-500 text-sm mt-2">
          {cancelled
            ? (b.payStatus === 'refunded'
              ? <>Reservasi ini dibatalkan dan dana dikembalikan ke <b>{b.paymentMethod}</b> (simulasi demo).</>
              : <>Reservasi ini sudah dibatalkan. E-tiket tidak lagi berlaku.</>)
            : <>E-tiket dikirim ke <b>{b.email}</b> & WhatsApp <b>{b.phone}</b> (simulasi demo).</>}
        </p>
        <div className="flex items-center justify-center gap-2 mt-5">
          <span className="font-display text-2xl font-bold tracking-[.15em] bg-sand-50 border-2 border-dashed border-gold-500 text-jungle-900 px-6 py-2.5 rounded-2xl">{b.code}</span>
          <button onClick={() => { navigator.clipboard.writeText(b.code); toast('Kode booking disalin!'); }} className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200" title="Salin"><Copy size={17} /></button>
          <button onClick={() => window.print()} className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200" title="Cetak"><Printer size={17} /></button>
        </div>
        <div className="text-left bg-[#faf8f2] rounded-2xl p-5 mt-6 text-sm flex flex-col gap-2.5">
          <div className="flex gap-3 items-center">
            {room && <img src={room.images[0]} alt="" className="w-20 h-16 rounded-xl object-cover" />}
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">{room?.hotel}</p><p className="font-bold text-jungle-950">{room?.name}</p></div>
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-stone-600">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> In: <b>{fmtDate(b.checkIn)}</b></span>
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Out: <b>{fmtDate(b.checkOut)}</b></span>
            <span className="flex items-center gap-1.5"><Users size={14} /> {b.guests} tamu • {b.roomsCount} kamar</span>
            <span className="flex items-center gap-1.5"><BedDouble size={14} /> {b.paymentMethod}</span>
          </div>
          <div className="flex justify-between font-extrabold text-base text-jungle-900 border-t border-dashed border-stone-300 pt-2.5"><span>{b.payStatus === 'refunded' ? 'Total refund' : 'Total dibayar'}</span><span>{formatIDR(b.total)}</span></div>
        </div>
        {b.payStatus === 'unpaid' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4 text-sm text-amber-800">
            Selesaikan pembayaran <b>{b.paymentMethod}</b> maksimal <b>2×24 jam</b>. Status otomatis lunas setelah admin verifikasi (demo: ubah di halaman Reservasi Saya).
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <Link to="/my-reservations" className="flex-1 font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-3.5 rounded-full">Lihat Reservasi Saya</Link>
          <Link to="/rooms" className="flex-1 font-bold border-2 border-jungle-700 text-jungle-700 py-3.5 rounded-full hover:bg-jungle-50">Pesan Lagi</Link>
        </div>
      </motion.div>
    </div>
  );
}
