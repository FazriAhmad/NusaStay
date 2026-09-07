import { useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { formatIDR, fmtDate } from '../../lib/utils';
import { useToast } from '../../components/Toast';

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700', unpaid: 'bg-amber-100 text-amber-700',
    refunded: 'bg-sky-100 text-sky-700', failed: 'bg-red-100 text-red-600',
    upcoming: 'bg-jungle-700/10 text-jungle-700', completed: 'bg-stone-200 text-stone-600', cancelled: 'bg-red-50 text-red-500',
  };
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${map[s] ?? 'bg-stone-100'}`}>{s.toUpperCase()}</span>;
}

export function BookingTable({ scope }: { scope: 'bookings' | 'orders' }) {
  const { bookings, roomById, updateBooking, cancelBooking } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [payF, setPayF] = useState('');
  const [bookF, setBookF] = useState('');

  let list = [...bookings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (q) list = list.filter((b) => (b.code + b.guestName + b.email + b.phone).toLowerCase().includes(q.toLowerCase()));
  if (payF) list = list.filter((b) => b.payStatus === payF);
  if (bookF) list = list.filter((b) => b.bookStatus === bookF);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2.5 flex-1 min-w-[200px]">
          <Search size={16} className="text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode / nama / email…" className="w-full text-sm font-semibold outline-none bg-transparent" />
        </label>
        <select value={payF} onChange={(e) => setPayF(e.target.value)} className="bg-white border border-stone-200 rounded-full px-4 py-2.5 text-sm font-bold outline-none">
          <option value="">Semua pembayaran</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option><option value="failed">Failed</option>
        </select>
        <select value={bookF} onChange={(e) => setBookF(e.target.value)} className="bg-white border border-stone-200 rounded-full px-4 py-2.5 text-sm font-bold outline-none">
          <option value="">Semua status</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <p className="text-xs text-stone-400 mt-2">{list.length} data • klik badge status untuk mengubah cepat</p>
      <div className="flex flex-col gap-3 mt-3">
        {list.map((b) => {
          const room = roomById(b.roomId);
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-stone-200/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm bg-jungle-950 text-sand-200 px-2.5 py-1 rounded-lg">{b.code}</span>
                <button title="Ubah status bayar" onClick={() => {
                  const order: any = { unpaid: 'paid', paid: 'refunded', refunded: 'paid', failed: 'unpaid' };
                  updateBooking(b.id, { payStatus: order[b.payStatus] ?? 'paid' });
                  toast(`Status bayar ${b.code} diperbarui`);
                }}><StatusBadge s={b.payStatus} /></button>
                <button title="Ubah status booking" onClick={() => {
                  const order: any = { upcoming: 'completed', completed: 'cancelled', cancelled: 'upcoming' };
                  updateBooking(b.id, { bookStatus: order[b.bookStatus] ?? 'upcoming' });
                  toast(`Status booking ${b.code} diperbarui`);
                }}><StatusBadge s={b.bookStatus} /></button>
                <span className="ml-auto font-extrabold text-jungle-800">{formatIDR(b.total)}</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-x-4 gap-y-1 mt-2.5 text-[13px] text-stone-600">
                <span><b className="text-jungle-950">{b.guestName}</b> • {b.phone}</span>
                <span>{room?.name} × {b.roomsCount} kmr • {b.guests} tamu</span>
                <span>{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</span>
                <span className="text-stone-400">{b.email} • via {b.paymentMethod}</span>
                <span className="text-stone-400">Sub {formatIDR(b.subtotal)} • disc {formatIDR(b.discount)} {b.promoCode && `(${b.promoCode})`}</span>
                {b.specialRequest && <span className="text-stone-400 italic">“{b.specialRequest}”</span>}
              </div>
              {scope === 'orders' && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-stone-200">
                  {(['unpaid', 'paid', 'refunded', 'failed'] as const).map((s) => (
                    <button key={s} onClick={() => { updateBooking(b.id, { payStatus: s }); toast(`Order ${b.code} → ${s}`); }} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${b.payStatus === s ? 'bg-jungle-700 text-white border-jungle-700' : 'border-stone-200 text-stone-500'}`}>{s}</button>
                  ))}
                  <span className="text-stone-300 text-xs self-center">|</span>
                  {b.bookStatus !== 'cancelled' ? (
                    <button onClick={() => { if (confirm(`Refund & batalkan ${b.code}?`)) { cancelBooking(b.id); toast(`Order ${b.code} di-refund & dibatalkan`); } }} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white">Refund + Cancel</button>
                  ) : (
                    <button onClick={() => { updateBooking(b.id, { bookStatus: 'upcoming' }); toast(`${b.code} diaktifkan kembali`); }} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-600 text-white">Restore</button>
                  )}
                </div>
              )}
              {scope === 'bookings' && b.bookStatus !== 'cancelled' && (
                <div className="mt-2.5"><button onClick={() => { if (confirm(`Batalkan ${b.code}?`)) { cancelBooking(b.id); toast('Reservasi dibatalkan'); } }} className="text-xs font-bold text-red-500 hover:underline">Batalkan reservasi</button></div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-dashed">Tidak ada data cocok.</p>}
      </div>
    </div>
  );
}

export default function BookingsAdmin() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Bookings</h1>
      <p className="text-stone-500 text-sm mt-1 mb-4">Kelola reservasi tamu — klik badge untuk ubah status cepat.</p>
      <BookingTable scope="bookings" />
    </div>
  );
}
