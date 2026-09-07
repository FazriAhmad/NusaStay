import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { formatIDR, downloadCSV } from '../../lib/utils';

export default function Reports() {
  const { bookings, rooms } = useStore();
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-09-07');
  const [payF, setPayF] = useState('');

  const list = useMemo(() => {
    let l = [...bookings].filter((b) => b.createdAt.slice(0, 10) >= from && b.createdAt.slice(0, 10) <= to);
    if (payF) l = l.filter((b) => b.payStatus === payF);
    return l.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [bookings, from, to, payF]);

  const revenue = list.filter((b) => b.payStatus === 'paid').reduce((s, b) => s + b.total, 0);
  const disc = list.reduce((s, b) => s + b.discount, 0);
  const nights = list.reduce((s, b) => s + Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000)) * b.roomsCount, 0);

  const perRoom = rooms.map((r) => {
    const bl = list.filter((b) => b.roomId === r.id && b.bookStatus !== 'cancelled');
    return { room: r, count: bl.length, rev: bl.filter((b) => b.payStatus === 'paid').reduce((s, b) => s + b.total, 0) };
  }).sort((a, b) => b.rev - a.rev);
  const maxRev = Math.max(1, ...perRoom.map((x) => x.rev));

  const exportCSV = () => {
    downloadCSV(`nusastay-report-${from}_${to}.csv`, [
      ['Kode', 'Tamu', 'Email', 'Kamar', 'Check-in', 'Check-out', 'Kamar(x)', 'Subtotal', 'Diskon', 'Promo', 'Total', 'Bayar', 'Status', 'Dibuat'],
      ...list.map((b) => [b.code, b.guestName, b.email, rooms.find((r) => r.id === b.roomId)?.name ?? b.roomId, b.checkIn, b.checkOut, String(b.roomsCount), String(b.subtotal), String(b.discount), b.promoCode, String(b.total), b.payStatus, b.bookStatus, b.createdAt]),
    ]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="font-display text-3xl font-bold text-jungle-950">Reports</h1><p className="text-stone-500 text-sm">Summary & export data booking</p></div>
        <button onClick={exportCSV} className="ml-auto font-bold text-sm bg-jungle-700 hover:bg-jungle-800 text-white px-5 py-2.5 rounded-full flex items-center gap-1.5"><Download size={16} /> Export CSV</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 bg-white border border-stone-200/70 rounded-2xl p-4">
        <label className="text-sm font-bold">Dari <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-stone-200 rounded-lg px-2.5 py-1.5 ml-1" /></label>
        <label className="text-sm font-bold">Sampai <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-stone-200 rounded-lg px-2.5 py-1.5 ml-1" /></label>
        <select value={payF} onChange={(e) => setPayF(e.target.value)} className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm font-bold">
          <option value="">Semua pembayaran</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="refunded">Refunded</option>
        </select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {[
          ['Revenue Lunas', formatIDR(revenue)], ['Total Booking', String(list.length)],
          ['Room-nights', nights + ' malam'], ['Diskon Promo', formatIDR(disc)],
        ].map(([l, v]) => (
          <div key={l} className="bg-white rounded-2xl border border-stone-200/70 p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">{l}</p><p className="font-display font-bold text-xl text-jungle-950">{v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5 mt-4">
        <h3 className="font-bold text-jungle-950 flex items-center gap-2"><FileSpreadsheet size={17} /> Revenue per Kamar</h3>
        <div className="flex flex-col gap-2.5 mt-4">
          {perRoom.map(({ room, count, rev }) => (
            <div key={room.id}>
              <div className="flex justify-between text-[13px] font-bold"><span>{room.name} <span className="text-stone-400 font-medium">({count} booking)</span></span><span className="text-jungle-800">{formatIDR(rev)}</span></div>
              <div className="h-2.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-jungle-700 to-emerald-400" style={{ width: `${(rev / maxRev) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200/70 p-1 mt-4 overflow-x-auto">
        <table className="w-full text-[13px] min-w-[760px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-stone-400 border-b">{['Kode', 'Tamu', 'Kamar', 'Periode', 'Total', 'Bayar', 'Status'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-4 py-2.5 font-mono font-bold">{b.code}</td>
                <td className="px-4 py-2.5">{b.guestName}</td>
                <td className="px-4 py-2.5">{rooms.find((r) => r.id === b.roomId)?.name}</td>
                <td className="px-4 py-2.5 text-stone-500">{b.checkIn} → {b.checkOut}</td>
                <td className="px-4 py-2.5 font-bold">{formatIDR(b.total)}</td>
                <td className="px-4 py-2.5">{b.payStatus}</td>
                <td className="px-4 py-2.5">{b.bookStatus}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-stone-400">Tidak ada data pada rentang ini.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
