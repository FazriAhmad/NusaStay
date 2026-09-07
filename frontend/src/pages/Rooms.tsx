import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, SearchX } from 'lucide-react';
import { PROVINCES } from '../lib/data';
import { todayISO, addDaysISO } from '../lib/utils';
import { useStore } from '../store/AppStore';
import { RoomCard } from '../components/RoomCard';
import { PageHead } from '../components/Layout';

export default function Rooms() {
  const [sp, setSp] = useSearchParams();
  const { rooms, isAvailable } = useStore();
  const [q, setQ] = useState(sp.get('province') ? '' : '');
  const [province, setProvince] = useState(sp.get('province') ?? '');
  const [ci, setCi] = useState(sp.get('ci') ?? todayISO(7));
  const [co, setCo] = useState(sp.get('co') ?? todayISO(9));
  const [guests, setGuests] = useState(Number(sp.get('guests') ?? 2));
  const [sort, setSort] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [checkAvail, setCheckAvail] = useState(!!sp.get('ci'));

  const list = useMemo(() => {
    let out = rooms.filter((r) => r.status === 'active');
    if (province) out = out.filter((r) => r.province === province);
    if (q) out = out.filter((r) => (r.name + r.hotel + r.city).toLowerCase().includes(q.toLowerCase()));
    out = out.filter((r) => r.capacity >= guests && r.pricePerNight <= maxPrice);
    if (checkAvail && ci && co) out = out.filter((r) => isAvailable(r.id, ci, co, 1).ok);
    if (sort === 'cheap') out = [...out].sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === 'expensive') out = [...out].sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating);
    else out = [...out].sort((a, b) => b.reviewCount - a.reviewCount);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, province, q, guests, maxPrice, sort, checkAvail, ci, co]);

  const applyQS = (patch: Record<string, string>) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n);
  };

  return (
    <div className="pb-10">
      <PageHead title="Jelajahi Kamar" sub={`${list.length} properti tersedia • harga per malam termasuk pajak`} />
      <div className="max-w-7xl mx-auto px-4 mt-4 flex flex-col lg:flex-row gap-6">
        {/* FILTER */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-5 lg:sticky lg:top-20 flex flex-col gap-4">
            <h3 className="font-bold text-jungle-950 flex items-center gap-2"><SlidersHorizontal size={17} /> Filter Pencarian</h3>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Kata kunci</label>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama hotel / kota…" className="mt-1.5 w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-jungle-600" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Provinsi</label>
              <select value={province} onChange={(e) => { setProvince(e.target.value); applyQS({ province: e.target.value }); }} className="mt-1.5 w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-jungle-600 bg-white">
                <option value="">Semua Provinsi</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-in</label>
                <input type="date" value={ci} min={todayISO()} onChange={(e) => { setCi(e.target.value); applyQS({ ci: e.target.value }); }} className="mt-1.5 w-full border border-stone-200 rounded-xl px-2.5 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-out</label>
                <input type="date" value={co} min={addDaysISO(ci, 1)} onChange={(e) => { setCo(e.target.value); applyQS({ co: e.target.value }); }} className="mt-1.5 w-full border border-stone-200 rounded-xl px-2.5 py-2.5 text-sm outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm font-semibold bg-sand-50 border border-sand-200 rounded-xl px-3.5 py-2.5 cursor-pointer">
              <input type="checkbox" checked={checkAvail} onChange={(e) => setCheckAvail(e.target.checked)} className="accent-green-800 w-4 h-4" />
              Hanya yang tersedia di tanggal itu
            </label>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Tamu: {guests}</label>
              <input type="range" min={1} max={6} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full accent-green-800 mt-2" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Maks. Rp{(maxPrice / 1000000).toFixed(1)} jt</label>
              <input type="range" min={400000} max={2500000} step={100000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-green-800 mt-2" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Urutkan</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1.5 w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none bg-white">
                <option value="popular">Paling Populer</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="cheap">Harga Terendah</option>
                <option value="expensive">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </aside>
        {/* LIST */}
        <div className="flex-1">
          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-14 text-center">
              <SearchX size={40} className="mx-auto text-stone-300" />
              <h3 className="font-display font-bold text-xl text-jungle-950 mt-3">Tidak ada kamar cocok</h3>
              <p className="text-stone-500 text-sm mt-1">Coba longgarkan filter tanggal, tamu, atau harga.</p>
              <button onClick={() => { setProvince(''); setQ(''); setCheckAvail(false); setMaxPrice(2500000); setGuests(2); }} className="mt-4 font-bold text-sm bg-jungle-700 text-white px-5 py-2.5 rounded-full">Reset Filter</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {list.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
            </div>
          )}
          <p className="text-center text-xs text-stone-400 mt-8">Butuh bantuan? <Link to="/contact" className="font-bold text-jungle-700">Hubungi concierge kami →</Link></p>
        </div>
      </div>
    </div>
  );
}
