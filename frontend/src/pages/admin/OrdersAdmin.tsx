import { BookingTable } from './BookingsAdmin';
import { useStore } from '../../store/AppStore';
import { formatIDR } from '../../lib/utils';

export default function OrdersAdmin() {
  const { bookings } = useStore();
  const gross = bookings.filter((b) => b.bookStatus !== 'cancelled').reduce((s, b) => s + b.total, 0);
  const refunded = bookings.filter((b) => b.payStatus === 'refunded').reduce((s, b) => s + b.total, 0);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Orders & Pembayaran</h1>
      <p className="text-stone-500 text-sm mt-1">Ubah status pembayaran, proses refund, restore order.</p>
      <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
        <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Gross order</p><p className="font-display font-bold text-xl text-jungle-950">{formatIDR(gross)}</p></div>
        <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Refunded</p><p className="font-display font-bold text-xl text-sky-600">{formatIDR(refunded)}</p></div>
        <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Net</p><p className="font-display font-bold text-xl text-emerald-600">{formatIDR(gross - refunded)}</p></div>
      </div>
      <BookingTable scope="orders" />
    </div>
  );
}
