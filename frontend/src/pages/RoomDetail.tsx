import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Users, Maximize, BedDouble, Heart, CalendarDays, Check, ChevronLeft, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/AppStore';
import { formatIDR, fmtDate, todayISO, addDaysISO, dateRange } from '../lib/utils';
import { Stars } from '../components/Layout';
import { AmenIcon } from '../components/AmenIcon';
import { RoomCard } from '../components/RoomCard';
import { useToast } from '../components/Toast';

export default function RoomDetail() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const { roomById, rooms, reviews, amenities, isAvailable, bookedCountOn, blocked, isSaved, toggleSaved, user } = useStore();
  const room = roomById(id ?? '');
  const [img, setImg] = useState(0);
  const [ci, setCi] = useState(sp.get('ci') ?? todayISO(7));
  const [co, setCo] = useState(sp.get('co') ?? todayISO(9));
  const [need, setNeed] = useState(1);

  const roomReviews = useMemo(() => reviews.filter((r) => r.roomId === id), [reviews, id]);
  const avail = useMemo(() => (room ? isAvailable(room.id, ci, co, need) : { ok: false, left: 0 }), [room, ci, co, need]);
  const related = rooms.filter((r) => r.id !== id && r.province === room?.province && r.status === 'active').slice(0, 3);
  const nights = Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
  const amenMap = Object.fromEntries(amenities.map((a) => [a.id, a]));

  // mini calendar: next 30 days availability dots
  const calDays = useMemo(() => {
    const out: { d: string; left: number }[] = [];
    if (!room) return out;
    const base = todayISO();
    for (let i = 0; i < 30; i++) {
      const d = addDaysISO(base, i);
      out.push({ d, left: room.totalRooms - bookedCountOn(room.id, d) - ((blocked[room.id] ?? []).includes(d) ? room.totalRooms : 0) });
    }
    return out;
  }, [room, bookedCountOn, blocked]);

  if (!room) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><h1 className="font-display text-3xl font-bold">Kamar tidak ditemukan</h1><Link to="/rooms" className="text-jungle-700 font-bold">← Kembali ke listing</Link></div>;
  const saved = isSaved(room.id);
  const disc = room.originalPrice ? Math.round((1 - room.pricePerNight / room.originalPrice) * 100) : 0;

  const goBooking = () => {
    if (!user) { toast('Masuk dulu untuk memesan kamar', 'info'); nav('/login'); return; }
    if (!avail.ok) { toast(avail.reason ?? 'Tidak tersedia', 'error'); return; }
    nav(`/booking/${room.id}?ci=${ci}&co=${co}&rooms=${need}`);
  };

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-jungle-700"><ChevronLeft size={16} /> Kembali</Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">{room.hotel} • {room.city}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-jungle-950">{room.name}</h1>
            <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-1.5"><MapPin size={15} /> {room.address}</p>
          </div>
          <button onClick={() => { if (!user) { toast('Masuk dulu untuk menyimpan', 'info'); return; } toggleSaved(room.id); toast(saved ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit'); }}
            className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-full border ${saved ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-stone-200 text-stone-600 hover:text-red-500'}`}>
            <Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>

        {/* GALLERY */}
        <div className="grid md:grid-cols-3 gap-3 mt-5">
          <motion.img key={img} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} src={room.images[img]} alt={room.name} className="md:col-span-2 h-72 md:h-[420px] w-full object-cover rounded-2xl" />
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {room.images.map((src: string, i: number) => (
              <button key={i} onClick={() => setImg(i)} className={`h-20 md:h-[132px] rounded-2xl overflow-hidden border-2 ${i === img ? 'border-jungle-600' : 'border-transparent'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6">
          <div className="flex flex-col gap-5">
            {/* META */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 bg-jungle-700 text-white font-extrabold px-3 py-1.5 rounded-full text-sm">★ {room.rating.toFixed(1)}</span>
                <span className="text-sm text-stone-500">{room.reviewCount} ulasan terverifikasi</span>
                <span className="flex items-center gap-1.5 text-sm text-stone-600"><Users size={15} /> Maks. {room.capacity} tamu</span>
                <span className="flex items-center gap-1.5 text-sm text-stone-600"><BedDouble size={15} /> {room.bed}</span>
                <span className="flex items-center gap-1.5 text-sm text-stone-600"><Maximize size={15} /> {room.size} m²</span>
              </div>
              <p className="text-stone-600 text-[15px] leading-relaxed mt-4">{room.description}</p>
            </div>
            {/* AMENITIES */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
              <h3 className="font-display font-bold text-xl text-jungle-950 mb-4">Fasilitas Kamar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((a: string) => (
                  <div key={a} className="flex items-center gap-2.5 text-sm font-semibold text-stone-700 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2.5">
                    <span className="text-jungle-700"><AmenIcon icon={amenMap[a]?.icon ?? 'ConciergeBell'} size={17} /></span>
                    {amenMap[a]?.name ?? a}
                  </div>
                ))}
              </div>
            </div>
            {/* CALENDAR AVAILABILITY */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
              <h3 className="font-display font-bold text-xl text-jungle-950 flex items-center gap-2"><CalendarDays size={20} /> Cek Ketersediaan — 30 Hari ke Depan</h3>
              <p className="text-xs text-stone-500 mt-1">Hijau = banyak, kuning = sisa sedikit, merah = penuh / diblokir. Klik tanggal untuk mengisi check-in.</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mt-4">
                {calDays.map(({ d, left }) => (
                  <button key={d} onClick={() => { setCi(d); setCo(addDaysISO(d, 1)); }}
                    className={`rounded-lg py-1.5 text-center border ${ci === d ? 'ring-2 ring-jungle-600 border-jungle-600' : 'border-stone-200'} ${left <= 0 ? 'bg-red-50' : left <= 3 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <span className="block text-[10px] font-bold text-stone-500">{new Date(d + 'T00:00:00').getDate()}/{new Date(d + 'T00:00:00').getMonth() + 1}</span>
                    <span className={`block text-xs font-extrabold ${left <= 0 ? 'text-red-600' : left <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>{left <= 0 ? '×' : left}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* REVIEWS */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
              <h3 className="font-display font-bold text-xl text-jungle-950 flex items-center gap-2"><MessageSquareQuote size={20} /> Ulasan Tamu ({roomReviews.length})</h3>
              <div className="flex flex-col gap-4 mt-4">
                {roomReviews.length === 0 && <p className="text-sm text-stone-500">Belum ada ulasan. Jadilah yang pertama menginap & berbagi cerita.</p>}
                {roomReviews.map((r) => (
                  <div key={r.id} className="border-b border-stone-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-full bg-jungle-700 text-white grid place-items-center font-bold text-sm">{r.userName.charAt(0)}</span>
                      <div><p className="text-sm font-bold">{r.userName}</p><p className="text-xs text-stone-400">{fmtDate(r.date)}</p></div>
                      <span className="ml-auto"><Stars v={r.rating} size={13} /></span>
                    </div>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{r.text}</p>
                    {r.photos.length > 0 && <div className="flex gap-2 mt-2">{r.photos.map((p: string, i: number) => <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover" />)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOOKING CARD */}
          <div className="lg:sticky lg:top-20 h-fit bg-white rounded-2xl border border-stone-200/70 card-shadow p-5">
            {disc > 0 && <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">Hemat {disc}% hari ini</span>}
            <div className="flex items-end gap-2 mt-1">
              <p className="font-extrabold text-2xl text-jungle-800">{formatIDR(room.pricePerNight)}<span className="text-xs font-medium text-stone-400">/malam</span></p>
              {room.originalPrice && <p className="text-sm text-stone-400 line-through mb-1">{formatIDR(room.originalPrice)}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-in</span><input type="date" value={ci} min={todayISO()} onChange={(e) => setCi(e.target.value)} className="w-full text-sm font-bold outline-none" /></label>
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-out</span><input type="date" value={co} min={addDaysISO(ci, 1)} onChange={(e) => setCo(e.target.value)} className="w-full text-sm font-bold outline-none" /></label>
            </div>
            <label className="block border border-stone-200 rounded-xl px-3 py-2.5 mt-2"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Jumlah kamar</span>
              <select value={need} onChange={(e) => setNeed(Number(e.target.value))} className="w-full text-sm font-bold outline-none bg-white">{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} kamar</option>)}</select>
            </label>
            <div className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm font-bold flex items-center gap-2 ${avail.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {avail.ok ? <><Check size={16} /> Tersedia — sisa {avail.left} kamar • {nights} malam</> : <><span>⚠</span> {avail.reason}</>}
            </div>
            <div className="text-sm text-stone-500 mt-3 flex flex-col gap-1.5">
              <div className="flex justify-between"><span>{formatIDR(room.pricePerNight)} × {nights} malam × {need} kamar</span><b className="text-jungle-950">{formatIDR(room.pricePerNight * nights * need)}</b></div>
              <div className="flex justify-between text-xs"><span>Pajak & biaya dihitung saat checkout</span></div>
            </div>
            <button onClick={goBooking} disabled={!avail.ok} className="w-full mt-4 font-bold bg-jungle-700 hover:bg-jungle-800 disabled:opacity-40 text-white py-3.5 rounded-full transition">Pesan Sekarang</button>
            <p className="text-[11px] text-stone-400 text-center mt-2">Gratis pembatalan • Bayar via QRIS / VA / Kartu</p>
            <p className="text-xs text-stone-500 mt-3 bg-sand-50 rounded-xl p-3">Check-in {fmtDate(ci)} • Check-out {fmtDate(co)} — {dateRange(ci, co).length} malam</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-jungle-950 mb-4">Juga di {room.province}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{related.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
