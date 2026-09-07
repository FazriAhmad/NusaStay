import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, BadgePercent, QrCode, Landmark, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { formatIDR, calcPromo, todayISO } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import { getDraft } from './BookingPage';

const METHODS = [
  { id: 'QRIS', icon: QrCode, desc: 'Scan & bayar instan' },
  { id: 'Virtual Account BCA', icon: Landmark, desc: 'Cek otomatis 24 jam' },
  { id: 'Kartu Kredit', icon: CreditCard, desc: 'Visa / Mastercard / JCB' },
  { id: 'Transfer Bank', icon: Banknote, desc: 'BCA / Mandiri / BRI' },
];

export default function CheckoutPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { roomById, user, promos, createBooking, settings, isAvailable } = useStore();
  const room = roomById(id ?? '');
  const draft = getDraft(id ?? '');
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [method, setMethod] = useState('QRIS');
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);

  const nights = useMemo(() => {
    if (!draft) return 1;
    return Math.max(1, Math.round((new Date(draft.co).getTime() - new Date(draft.ci).getTime()) / 86400000));
  }, [draft]);

  const subtotal = room && draft ? room.pricePerNight * nights * draft.roomsCount : 0;
  const promo = promos.find((p) => p.code === applied);
  const discount = promo ? calcPromo(promo, subtotal) : 0;
  const tax = Math.round(((subtotal - discount) * settings.taxPercent) / 100);
  const total = subtotal - discount + tax + settings.serviceFee;

  if (!room || !draft) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Data pemesanan hilang</h1>
        <p className="text-stone-500 text-sm mt-2">Silakan ulangi dari halaman kamar.</p>
        <Link to={`/room/${id}`} className="inline-block mt-4 font-bold text-sm bg-jungle-700 text-white px-6 py-2.5 rounded-full">Kembali</Link>
      </div>
    );
  }

  const applyPromo = () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    const p = promos.find((x) => x.code === c);
    if (!p) { setPromoMsg('Kode tidak dikenal. Coba HEMAT20 / NUSA50 / BALI15.'); setApplied(null); return; }
    if (!p.active) { setPromoMsg(`Kode ${c} sedang nonaktif.`); setApplied(null); return; }
    if (new Date(p.validUntil) < new Date(todayISO())) { setPromoMsg(`Kode ${c} sudah kedaluwarsa (${p.validUntil}).`); setApplied(null); return; }
    if (p.used >= p.quota) { setPromoMsg(`Kuota kode ${c} habis.`); setApplied(null); return; }
    if (subtotal < p.minSpend) { setPromoMsg(`Min. belanja ${formatIDR(p.minSpend)} untuk kode ini.`); setApplied(null); return; }
    const d = calcPromo(p, subtotal);
    if (d <= 0) { setPromoMsg('Promo tidak memberi potongan untuk nominal ini.'); setApplied(null); return; }
    setApplied(c);
    setPromoMsg(`✓ Promo ${c} diterapkan: hemat ${formatIDR(d)}!`);
  };

  const pay = async () => {
    if (!agree) { toast('Centang persetujuan syarat & ketentuan dulu', 'error'); return; }
    const chk = isAvailable(room.id, draft.ci, draft.co, draft.roomsCount);
    if (!chk.ok) { toast(chk.reason ?? 'Kamar habis', 'error'); return; }
    setPaying(true);
    const isQRIS = method === 'QRIS';
    await new Promise((r) => setTimeout(r, isQRIS ? 1600 : 700));
    const b = await createBooking({
      roomId: room.id, userId: user!.id, guestName: draft.name, email: draft.email, phone: draft.phone,
      checkIn: draft.ci, checkOut: draft.co, guests: draft.guests, roomsCount: draft.roomsCount,
      subtotal, discount, promoCode: applied ?? '', total,
      payStatus: isQRIS ? 'paid' : 'unpaid', bookStatus: 'upcoming', paymentMethod: method, specialRequest: draft.request,
    });
    setPaying(false);
    if (!b) return;
    sessionStorage.removeItem('nusastay_draft_' + room.id);
    nav(`/booking/success/${b.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to={`/booking/${room.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-jungle-700"><ChevronLeft size={16} /> Kembali ke data tamu</Link>
      <div className="flex items-center gap-2 mt-4 mb-6 max-w-xl">
        {([['1', 'Data Tamu', true], ['2', 'Checkout', true], ['3', 'Selesai', false]] as Array<[string, string, boolean]>).map(([n, t, on], i) => (
          <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
            <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold ${on ? 'bg-jungle-700 text-white' : 'bg-stone-200 text-stone-500'}`}>{on ? '✓' : n}</span>
            <span className={`text-sm font-bold hidden sm:block ${on ? 'text-jungle-900' : 'text-stone-400'}`}>{t}</span>
            {i < 2 && <span className="flex-1 h-0.5 bg-stone-200 rounded mx-1" />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-5">
          {/* PROMO */}
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h2 className="font-display font-bold text-xl text-jungle-950 flex items-center gap-2"><BadgePercent size={20} className="text-gold-600" /> Kode Promo</h2>
            <div className="flex gap-2 mt-3">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="cth. HEMAT20" className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold tracking-widest uppercase outline-none focus:border-jungle-600" />
              <button onClick={applyPromo} className="font-bold text-sm bg-jungle-950 text-white px-6 rounded-xl hover:bg-jungle-800">Terapkan</button>
            </div>
            {promoMsg && <p className={`text-sm font-semibold mt-2 ${applied ? 'text-emerald-600' : 'text-red-500'}`}>{promoMsg}</p>}
            {applied && <button onClick={() => { setApplied(null); setCode(''); setPromoMsg(''); }} className="text-xs font-bold text-stone-400 underline mt-1">Hapus promo</button>}
            <div className="flex flex-wrap gap-2 mt-3">
              {promos.filter((p) => p.active).map((p) => (
                <button key={p.code} onClick={() => { setCode(p.code); }} className="text-xs font-bold border border-dashed border-gold-500 text-gold-600 px-3 py-1.5 rounded-full hover:bg-gold-400/10">{p.code} — {p.description}</button>
              ))}
            </div>
          </div>
          {/* PAYMENT */}
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h2 className="font-display font-bold text-xl text-jungle-950">Metode Pembayaran</h2>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-4">
              {METHODS.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} className={`flex items-center gap-3 border-2 rounded-2xl p-4 text-left transition ${method === m.id ? 'border-jungle-600 bg-jungle-700/[.04]' : 'border-stone-200 hover:border-stone-300'}`}>
                  <span className={`w-10 h-10 rounded-xl grid place-items-center ${method === m.id ? 'bg-jungle-700 text-white' : 'bg-stone-100 text-stone-500'}`}><m.icon size={19} /></span>
                  <span><b className="text-sm block">{m.id}</b><span className="text-xs text-stone-400">{m.desc}</span></span>
                  {method === m.id && <span className="ml-auto w-5 h-5 rounded-full bg-jungle-600 text-white grid place-items-center text-xs">✓</span>}
                </button>
              ))}
            </div>
            <label className="flex items-start gap-2.5 mt-5 text-sm text-stone-600 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5 accent-green-800" />
              Saya menyetujui <b>syarat & ketentuan</b>, kebijakan pembatalan (refund otomatis jika dibatalkan H-1), dan jam check-in {settings.checkInTime} / check-out {settings.checkOutTime}.
            </label>
          </div>
        </div>
        {/* SUMMARY */}
        <aside className="h-fit bg-jungle-950 text-white rounded-2xl card-shadow p-6 lg:sticky lg:top-20">
          <h3 className="font-display font-bold text-lg">Ringkasan Pesanan</h3>
          <div className="flex gap-3 mt-3">
            <img src={room.images[0]} alt="" className="w-20 h-16 rounded-xl object-cover" />
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold-400">{room.hotel}</p><p className="font-bold text-sm leading-snug">{room.name}</p></div>
          </div>
          <div className="text-sm mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            <div className="flex justify-between text-white/70"><span>Check-in → Check-out</span><span className="text-white font-semibold text-right">{draft.ci} → {draft.co}</span></div>
            <div className="flex justify-between text-white/70"><span>Tamu / Kamar</span><span className="text-white font-semibold">{draft.guests} tamu • {draft.roomsCount} kamar</span></div>
            <div className="flex justify-between text-white/70"><span>Subtotal ({nights} malam)</span><span className="text-white font-semibold">{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between text-white/70"><span>Diskon {applied ? `(${applied})` : ''}</span><span className="text-emerald-400 font-semibold">-{formatIDR(discount)}</span></div>
            <div className="flex justify-between text-white/70"><span>Pajak ({settings.taxPercent}%)</span><span className="text-white font-semibold">{formatIDR(tax)}</span></div>
            <div className="flex justify-between text-white/70"><span>Biaya layanan</span><span className="text-white font-semibold">{formatIDR(settings.serviceFee)}</span></div>
            <div className="flex justify-between font-extrabold text-xl border-t border-white/10 pt-3"><span>Total</span><span className="text-sand-300">{formatIDR(total)}</span></div>
          </div>
          <button onClick={pay} disabled={paying} className="w-full mt-5 font-bold gold-grad text-jungle-950 py-4 rounded-full disabled:opacity-60 flex items-center justify-center gap-2">
            {paying ? <><span className="w-5 h-5 border-2 border-jungle-950/30 border-t-jungle-950 rounded-full animate-spin" /> Memproses {method}…</> : <><ShieldCheck size={18} /> Bayar {formatIDR(total)}</>}
          </button>
          <p className="text-[11px] text-white/50 text-center mt-2">QRIS = lunas otomatis • VA/Transfer = bayar lalu konfirmasi di “Reservasi Saya” (demo)</p>
        </aside>
      </div>
    </div>
  );
}
