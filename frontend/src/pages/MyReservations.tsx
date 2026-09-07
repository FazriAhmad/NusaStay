import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX, Star, Upload, X, BadgeCheck, Clock, Ban, Wallet } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { formatIDR, fmtDate, fileToDataURL } from '../lib/utils';
import { PageHead } from '../components/Layout';
import { useToast } from '../components/Toast';

const TABS = [['upcoming', 'Akan Datang'], ['completed', 'Selesai'], ['cancelled', 'Dibatalkan']] as const;

export default function MyReservations() {
  const { myBookings, roomById, cancelBooking, addReview, reviews, user, updateBooking } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const list = myBookings.filter((b) => b.bookStatus === tab);
  const reviewedIds = new Set(reviews.filter((r) => r.userName === user?.name).map((r) => r.roomId + r.date));

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = await Promise.all([...files].slice(0, 4 - photos.length).map(fileToDataURL));
    setPhotos((p) => [...p, ...arr].slice(0, 4));
  };

  const submitReview = async (bookingId: string) => {
    if (text.trim().length < 10) { toast('Ulasan minimal 10 karakter', 'error'); return; }
    await addReview(bookingId, { rating, text: text.trim(), photos });
    setReviewFor(null); setText(''); setRating(5); setPhotos([]);
    toast('Terima kasih! Ulasan Anda dipublikasikan.');
  };

  return (
    <div className="pb-12">
      <PageHead title="Reservasi Saya" sub="Riwayat booking, pembatalan, konfirmasi bayar & ulasan menginap" />
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-2 bg-white border border-stone-200/70 rounded-full p-1.5 w-fit">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === k ? 'bg-jungle-700 text-white' : 'text-stone-500 hover:text-jungle-700'}`}>
              {label} ({myBookings.filter((b) => b.bookStatus === k).length})
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4 mt-5">
          {list.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
              <CalendarX size={40} className="mx-auto text-stone-300" />
              <p className="font-bold text-jungle-950 mt-3">Belum ada reservasi {tab === 'upcoming' ? 'mendatang' : tab}</p>
              <Link to="/rooms" className="inline-block mt-3 text-sm font-bold bg-jungle-700 text-white px-6 py-2.5 rounded-full">Cari Kamar →</Link>
            </div>
          )}
          {list.map((b) => {
            const room = roomById(b.roomId);
            const canReview = b.bookStatus === 'completed' && !reviews.some((r) => r.roomId === b.roomId && r.userName === user?.name && r.date >= b.checkIn);
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {room && <img src={room.images[0]} alt="" className="w-full sm:w-44 h-32 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-jungle-950 text-sand-200 px-2.5 py-1 rounded-lg">{b.code}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${b.payStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : b.payStatus === 'refunded' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.payStatus === 'paid' ? 'LUNAS' : b.payStatus === 'refunded' ? 'REFUNDED' : b.payStatus === 'failed' ? 'GAGAL' : 'BELUM BAYAR'}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">{b.bookStatus.toUpperCase()}</span>
                    </div>
                    <p className="font-display font-bold text-lg text-jungle-950 mt-1.5">{room?.name} <span className="text-xs font-sans font-medium text-stone-400">• {room?.hotel}</span></p>
                    <p className="text-sm text-stone-500">{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} • {b.guests} tamu • {b.roomsCount} kamar • {b.paymentMethod}</p>
                    {b.promoCode && <p className="text-xs text-emerald-600 font-bold mt-0.5">Promo {b.promoCode} (hemat {formatIDR(b.discount)})</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="font-extrabold text-jungle-800">{formatIDR(b.total)}</span>
                      {b.bookStatus === 'upcoming' && (
                        <>
                          {b.payStatus === 'unpaid' && (
                            <button onClick={() => { updateBooking(b.id, { payStatus: 'paid' }); toast('Pembayaran dikonfirmasi (simulasi). Status: LUNAS'); }} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-full flex items-center gap-1.5"><Wallet size={13} /> Saya Sudah Bayar</button>
                          )}
                          <button onClick={() => { if (confirm(`Batalkan reservasi ${b.code}? ${b.payStatus === 'paid' ? 'Dana akan di-refund otomatis.' : ''}`)) { cancelBooking(b.id); toast(b.payStatus === 'paid' ? 'Reservasi dibatalkan & dana di-refund.' : 'Reservasi dibatalkan.'); } }} className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-full flex items-center gap-1.5"><Ban size={13} /> Batalkan</button>
                        </>
                      )}
                      {canReview && !reviewedIds.has(b.roomId + 'x') && (
                        <button onClick={() => setReviewFor(reviewFor === b.id ? null : b.id)} className="text-xs font-bold bg-gold-400/20 hover:bg-gold-400/30 text-gold-600 px-3.5 py-2 rounded-full flex items-center gap-1.5"><Star size={13} /> {reviewFor === b.id ? 'Tutup' : 'Beri Ulasan'}</button>
                      )}
                      <Link to={`/booking/success/${b.id}`} className="text-xs font-bold text-stone-400 hover:text-jungle-700 underline">E-tiket</Link>
                    </div>
                    {reviewFor === b.id && (
                      <div className="bg-sand-50 border border-sand-200 rounded-2xl p-4 mt-3">
                        <p className="text-sm font-bold flex items-center gap-1.5"><BadgeCheck size={15} className="text-jungle-700" /> Bagaimana pengalaman menginap Anda?</p>
                        <div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => setRating(s)}><Star size={24} className={s <= rating ? 'text-gold-400 fill-amber-400' : 'text-stone-300'} fill={s <= rating ? 'currentColor' : 'none'} /></button>)}</div>
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Ceritakan kebersihan, pelayanan, makanan… (min. 10 karakter)" className="w-full mt-2 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-jungle-600 resize-none bg-white" />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {photos.map((p, i) => (
                            <span key={i} className="relative"><img src={p} alt="" className="w-16 h-16 rounded-xl object-cover" /><button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button></span>
                          ))}
                          {photos.length < 4 && (
                            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 grid place-items-center cursor-pointer text-stone-400 hover:border-jungle-600 hover:text-jungle-600">
                              <Upload size={18} /><input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                            </label>
                          )}
                          <span className="text-[11px] text-stone-400 self-center flex items-center gap-1"><Clock size={12} /> Maks. 4 foto</span>
                        </div>
                        <button onClick={() => submitReview(b.id)} className="mt-3 text-sm font-bold bg-jungle-700 text-white px-5 py-2.5 rounded-full">Kirim Ulasan</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
