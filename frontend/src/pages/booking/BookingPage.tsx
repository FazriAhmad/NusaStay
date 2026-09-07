import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, MessageSquare, Users } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { formatIDR, nightsBetween, fmtDate, todayISO, addDaysISO } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export type Draft = { roomId: string; ci: string; co: string; roomsCount: number; guests: number; name: string; email: string; phone: string; request: string };

export function getDraft(roomId: string): Draft | null {
  try {
    const raw = sessionStorage.getItem('nusastay_draft_' + roomId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setDraft(roomId: string, d: Draft) {
  sessionStorage.setItem('nusastay_draft_' + roomId, JSON.stringify(d));
}

export default function BookingPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const { roomById, user, isAvailable } = useStore();
  const room = roomById(id ?? '');
  const prev = getDraft(id ?? '');

  const [ci, setCi] = useState(sp.get('ci') ?? prev?.ci ?? todayISO(7));
  const [co, setCo] = useState(sp.get('co') ?? prev?.co ?? todayISO(9));
  const [roomsCount, setRoomsCount] = useState(Number(sp.get('rooms') ?? prev?.roomsCount ?? 1));
  const [guests, setGuests] = useState(prev?.guests ?? 2);
  const [name, setName] = useState(prev?.name ?? user?.name ?? '');
  const [email, setEmail] = useState(prev?.email ?? user?.email ?? '');
  const [phone, setPhone] = useState(prev?.phone ?? user?.phone ?? '');
  const [request, setRequest] = useState(prev?.request ?? '');

  const nights = useMemo(() => nightsBetween(ci, co), [ci, co]);
  const avail = useMemo(() => (room ? isAvailable(room.id, ci, co, roomsCount) : { ok: false, left: 0, reason: '' }), [room, ci, co, roomsCount]);
  if (!room) return <div className="p-20 text-center">Kamar tidak ditemukan</div>;
  const subtotal = room.pricePerNight * nights * roomsCount;

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) { toast('Lengkapi nama, email & telepon', 'error'); return; }
    if (!avail.ok) { toast(avail.reason ?? 'Tidak tersedia', 'error'); return; }
    if (guests > room.capacity * roomsCount) { toast(`Kapasitas maks. ${room.capacity * roomsCount} tamu untuk ${roomsCount} kamar`, 'error'); return; }
    setDraft(room.id, { roomId: room.id, ci, co, roomsCount, guests, name, email, phone, request });
    nav(`/checkout/${room.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to={`/room/${room.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-jungle-700"><ChevronLeft size={16} /> Kembali ke detail</Link>
      {/* steps */}
      <div className="flex items-center gap-2 mt-4 mb-6 max-w-xl">
        {([['1', 'Data Tamu', true], ['2', 'Checkout', false], ['3', 'Selesai', false]] as Array<[string, string, boolean]>).map(([n, t, on], i) => (
          <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
            <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold ${on ? 'bg-jungle-700 text-white' : 'bg-stone-200 text-stone-500'}`}>{n}</span>
            <span className={`text-sm font-bold hidden sm:block ${on ? 'text-jungle-900' : 'text-stone-400'}`}>{t}</span>
            {i < 2 && <span className="flex-1 h-0.5 bg-stone-200 rounded mx-1" />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <form onSubmit={next} className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h2 className="font-display font-bold text-xl text-jungle-950">1 • Tanggal & Kamar</h2>
            <div className="grid sm:grid-cols-4 gap-3 mt-4">
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-in</span><input type="date" value={ci} min={todayISO()} onChange={(e) => setCi(e.target.value)} className="w-full text-sm font-bold outline-none" /></label>
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-out</span><input type="date" value={co} min={addDaysISO(ci, 1)} onChange={(e) => setCo(e.target.value)} className="w-full text-sm font-bold outline-none" /></label>
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Kamar</span><select value={roomsCount} onChange={(e) => setRoomsCount(Number(e.target.value))} className="w-full text-sm font-bold outline-none bg-white">{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
              <label className="border border-stone-200 rounded-xl px-3 py-2.5"><span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1"><Users size={11} /> Tamu</span><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full text-sm font-bold outline-none bg-white">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            </div>
            <p className={`mt-3 text-sm font-bold ${avail.ok ? 'text-emerald-600' : 'text-red-600'}`}>{avail.ok ? `✓ Tersedia — ${fmtDate(ci)} → ${fmtDate(co)} • ${nights} malam • sisa ${avail.left} kamar` : `⚠ ${avail.reason}`}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h2 className="font-display font-bold text-xl text-jungle-950">2 • Data Tamu</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3"><User size={17} className="text-stone-400" /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="w-full text-sm font-semibold outline-none" /></label>
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3"><Mail size={17} className="text-stone-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full text-sm font-semibold outline-none" /></label>
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3 sm:col-span-2"><Phone size={17} className="text-stone-400" /><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="No. WhatsApp aktif" className="w-full text-sm font-semibold outline-none" /></label>
              <label className="flex items-start gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3 sm:col-span-2"><MessageSquare size={17} className="text-stone-400 mt-0.5" /><textarea value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Permintaan khusus (opsional): lantai tinggi, honeymoon setup, extra bed…" rows={2} className="w-full text-sm font-semibold outline-none resize-none" /></label>
            </div>
          </div>
          <button disabled={!avail.ok} className="font-bold bg-jungle-700 hover:bg-jungle-800 disabled:opacity-40 text-white py-4 rounded-full">Lanjut ke Checkout →</button>
        </form>
        <aside className="h-fit bg-white rounded-2xl border border-stone-200/70 card-shadow p-5 lg:sticky lg:top-20">
          <div className="flex gap-3">
            <img src={room.images[0]} alt="" className="w-24 h-20 rounded-xl object-cover" />
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">{room.hotel}</p><p className="font-bold text-jungle-950 text-sm leading-snug">{room.name}</p><p className="text-xs text-stone-400">{room.city}</p></div>
          </div>
          <div className="border-t border-dashed border-stone-200 mt-4 pt-4 text-sm flex flex-col gap-2">
            <div className="flex justify-between text-stone-500"><span>{formatIDR(room.pricePerNight)} × {nights} malam</span><span>× {roomsCount} kmr</span></div>
            <div className="flex justify-between font-extrabold text-lg text-jungle-900"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
            <p className="text-xs text-stone-400">Promo, pajak (10%) & biaya layanan dihitung di checkout.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
