import { useMemo, useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { todayISO, addDaysISO } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export default function Availability() {
  const { rooms, bookedCountOn, blocked, toggleBlock, bookings } = useStore();
  const toast = useToast();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [start, setStart] = useState(todayISO());
  const room = rooms.find((r) => r.id === roomId);

  const days = useMemo(() => {
    const out: { d: string; used: number; isBlock: boolean }[] = [];
    for (let i = 0; i < 21; i++) {
      const d = addDaysISO(start, i);
      out.push({ d, used: room ? bookedCountOn(room.id, d) : 0, isBlock: room ? (blocked[room.id] ?? []).includes(d) : false });
    }
    return out;
  }, [start, room, bookedCountOn, blocked]);

  const upcomingForRoom = bookings.filter((b) => b.roomId === roomId && b.bookStatus === 'upcoming');

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Ketersediaan Kamar</h1>
      <p className="text-stone-500 text-sm mt-1">Klik tanggal untuk blokir / buka (maintenance, event, dll). Maks. blokir memengaruhi pencarian tamu realtime.</p>
      <div className="flex flex-wrap gap-2 mt-4">
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="border border-stone-200 bg-white rounded-full px-4 py-2.5 text-sm font-bold outline-none">
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.city}</option>)}
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border border-stone-200 bg-white rounded-full px-4 py-2.5 text-sm font-bold outline-none" />
      </div>

      {room && (
        <div className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5 mt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" /> Tersedia</span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" /> Hampir penuh</span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-red-400 inline-block" /> Penuh</span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-stone-800 inline-block" /> Diblokir</span>
            <span className="ml-auto text-stone-400">Total unit: {room.totalRooms}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">
            {days.map(({ d, used, isBlock }) => {
              const left = room.totalRooms - used;
              const dt = new Date(d + 'T00:00:00');
              return (
                <button key={d} onClick={() => { toggleBlock(room.id, d); toast(isBlock ? `Blokir ${d} dibuka` : `Tanggal ${d} diblokir`); }}
                  className={`rounded-xl border-2 p-2 text-center transition ${isBlock ? 'bg-stone-800 border-stone-800 text-white' : left <= 0 ? 'bg-red-50 border-red-200' : left <= 3 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isBlock ? 'text-white/60' : 'text-stone-400'}`}>{dt.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                  <span className={`block font-display font-bold text-lg ${isBlock ? 'text-white' : 'text-jungle-950'}`}>{dt.getDate()}</span>
                  <span className={`block text-[10px] font-bold ${isBlock ? 'text-white/70' : left <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>{isBlock ? 'BLOKIR' : `${used}/${room.totalRooms} terisi`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-5 mt-4">
        <h3 className="font-bold text-jungle-950">Booking Upcoming — {room?.name} ({upcomingForRoom.length})</h3>
        {upcomingForRoom.length === 0 && <p className="text-sm text-stone-400 mt-2">Tidak ada booking upcoming untuk kamar ini.</p>}
        <div className="flex flex-col gap-2 mt-3">
          {upcomingForRoom.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2 text-sm border-b border-stone-100 pb-2">
              <span className="font-mono font-bold bg-jungle-950 text-sand-200 px-2 py-0.5 rounded text-xs">{b.code}</span>
              <span className="font-semibold">{b.guestName}</span>
              <span className="text-stone-400 text-xs">{b.checkIn} → {b.checkOut} • {b.roomsCount} kmr</span>
              <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${b.payStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{b.payStatus === 'paid' ? <><CheckCircle2 size={11} /> LUNAS</> : <><Ban size={11} /> UNPAID</>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
