import { Link } from 'react-router-dom';
import { Wallet, Clock, BedDouble, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { formatIDR, fmtDateTime, todayISO } from '../../lib/utils';

const PAY_BADGE: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  unpaid: 'bg-amber-100 text-amber-700',
  refunded: 'bg-sky-100 text-sky-700',
  failed: 'bg-red-100 text-red-600',
};

export default function Dashboard() {
  const { bookings, rooms, contacts, totalGuests, reviews } = useStore();
  const paid = bookings.filter((b) => b.payStatus === 'paid' && b.bookStatus !== 'cancelled');
  const revenue = paid.reduce((s, b) => s + b.total, 0);
  const unpaid = bookings.filter((b) => b.payStatus === 'unpaid' && b.bookStatus === 'upcoming');
  const upcoming = bookings.filter((b) => b.bookStatus === 'upcoming');
  const occupancy = rooms.length ? Math.round((upcoming.reduce((s, b) => s + b.roomsCount, 0) / Math.max(1, rooms.reduce((s, r) => s + r.totalRooms, 0))) * 100) : 0;
  const thisMonth = paid.filter((b) => b.createdAt.slice(0, 7) === todayISO().slice(0, 7)).reduce((s, b) => s + b.total, 0);

  const cards = [
    { icon: Wallet, label: 'Total Revenue (lunas)', value: formatIDR(revenue), sub: `${paid.length} transaksi • bulan ini ${formatIDR(thisMonth)}`, bg: 'bg-emerald-600' },
    { icon: Clock, label: 'Menunggu Pembayaran', value: String(unpaid.length), sub: `${formatIDR(unpaid.reduce((s, b) => s + b.total, 0))} tertahan`, bg: 'bg-amber-500' },
    { icon: BedDouble, label: 'Okupansi Aktif', value: occupancy + '%', sub: `${upcoming.length} reservasi upcoming`, bg: 'bg-jungle-700' },
    { icon: Star, label: 'Rating / Ulasan', value: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) + '★' : '-', sub: `${reviews.length} ulasan • ${totalGuests} tamu terdaftar`, bg: 'bg-gold-500' },
  ];

  // mini bar chart last 7 days revenue
  const days: { d: string; v: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const iso = dt.toISOString().slice(0, 10);
    days.push({ d: dt.toLocaleDateString('id-ID', { weekday: 'short' }), v: paid.filter((b) => b.createdAt.slice(0, 10) === iso).reduce((s, b) => s + b.total, 0) });
  }
  const maxV = Math.max(1, ...days.map((d) => d.v));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Dashboard</h1>
      <p className="text-stone-500 text-sm mt-1">Ringkasan bisnis per hari ini, Senin 7 Sep 2026.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5">
            <span className={`w-10 h-10 rounded-xl ${c.bg} text-white grid place-items-center`}><c.icon size={19} /></span>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-3">{c.label}</p>
            <p className="font-display text-2xl font-bold text-jungle-950">{c.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5">
          <h3 className="font-bold text-jungle-950 flex items-center gap-2"><TrendingUp size={17} /> Revenue 7 Hari Terakhir</h3>
          <div className="flex items-end gap-2 h-44 mt-4">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-stone-400">{d.v ? (d.v / 1000000).toFixed(1) + 'jt' : ''}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-jungle-800 to-emerald-400 transition-all" style={{ height: `${Math.max(4, (d.v / maxV) * 120)}px` }} />
                <span className="text-[11px] font-bold text-stone-500">{d.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5">
          <h3 className="font-bold text-jungle-950">Aktivitas Terbaru</h3>
          <div className="flex flex-col gap-2.5 mt-3 max-h-64 overflow-y-auto">
            {[...bookings].slice(0, 5).map((b) => (
              <div key={b.id} className="text-[13px] border-b border-stone-100 pb-2">
                <p className="font-bold">{b.code} <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${PAY_BADGE[b.payStatus] ?? 'bg-stone-100 text-stone-600'}`}>{b.payStatus}</span></p>
                <p className="text-stone-500">{b.guestName} • {formatIDR(b.total)}</p>
                <p className="text-[11px] text-stone-400">{fmtDateTime(b.createdAt)}</p>
              </div>
            ))}
            {contacts.filter((c) => !c.read).slice(0, 2).map((c) => (
              <div key={c.id} className="text-[13px] bg-red-50 rounded-xl p-2.5"><p className="font-bold">✉ {c.subject}</p><p className="text-stone-500">dari {c.name}</p></div>
            ))}
          </div>
          <Link to="/admin/bookings" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-jungle-700">Kelola bookings <ArrowRight size={15} /></Link>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {[
          ['/admin/room', '＋ Tambah Kamar Baru', 'Upload foto & atur harga'],
          ['/admin/availability', 'Atur Ketersediaan', 'Blokir tanggal maintenance'],
          ['/admin/promo', 'Buat Kode Promo', 'Dongkrak okupansi weekday'],
        ].map(([to, t, s]) => (
          <Link key={to} to={to} className="bg-jungle-950 hover:bg-jungle-900 text-white rounded-2xl p-5 transition">
            <b className="block">{t}</b><span className="text-xs text-white/60">{s}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
