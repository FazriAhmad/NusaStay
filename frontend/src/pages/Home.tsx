import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, CalendarDays, Users, BadgePercent, ShieldCheck, Headset, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { PROVINCES } from '../lib/data';
import { todayISO, addDaysISO, formatIDR } from '../lib/utils';
import { useStore } from '../store/AppStore';
import { RoomCard } from '../components/RoomCard';
import { Stars } from '../components/Layout';

export default function Home() {
  const nav = useNavigate();
  const { rooms, settings, reviews, promos } = useStore();
  const [province, setProvince] = useState('');
  const [ci, setCi] = useState(todayISO(7));
  const [co, setCo] = useState(todayISO(9));
  const [guests, setGuests] = useState('2');

  const featured = rooms.filter((r) => r.featured && r.status === 'active').slice(0, 3);
  const popular = [...rooms].filter((r) => r.status === 'active').sort((a, b) => b.rating - a.rating).slice(0, 6);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/rooms?province=${encodeURIComponent(province)}&ci=${ci}&co=${co}&guests=${guests}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[86vh] flex items-center">
        <img src="/images/hero.jpg" alt="Resort" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-grad" />
        <div className="relative max-w-7xl mx-auto px-4 w-full py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 backdrop-blur text-sand-100 border border-white/25 px-3.5 py-1.5 rounded-full">
              <Sparkles size={13} className="text-gold-400" /> {settings.announcement.slice(0, 72)}…
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.05] mt-4">
              Menginap Terbaik<br />di <span className="text-sand-300 italic">Nusantara</span>
            </h1>
            <p className="text-sand-100/85 mt-4 text-base md:text-lg max-w-xl">Dari cliff resort Uluwatu hingga joglo heritage Yogya — 8 properti curated, harga transparan, promo tiap minggu.</p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-8 bg-white rounded-2xl md:rounded-full card-shadow p-2.5 grid md:grid-cols-[1.3fr_1fr_1fr_.8fr_auto] gap-2 items-stretch max-w-4xl">
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-sand-50">
              <MapPin size={19} className="text-jungle-700 shrink-0" />
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Provinsi</span>
                <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-transparent text-sm font-bold text-jungle-950 outline-none">
                  <option value="">Semua Destinasi</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </span>
            </label>
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-sand-50 border-t md:border-t-0 md:border-l border-stone-100">
              <CalendarDays size={19} className="text-jungle-700 shrink-0" />
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-in</span>
                <input type="date" value={ci} min={todayISO()} onChange={(e) => setCi(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-sand-50 border-t md:border-t-0 md:border-l border-stone-100">
              <CalendarDays size={19} className="text-jungle-700 shrink-0" />
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-out</span>
                <input type="date" value={co} min={addDaysISO(ci, 1)} onChange={(e) => setCo(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-sand-50 border-t md:border-t-0 md:border-l border-stone-100">
              <Users size={19} className="text-jungle-700 shrink-0" />
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Tamu</span>
                <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Tamu</option>)}
                </select>
              </span>
            </label>
            <button className="bg-jungle-700 hover:bg-jungle-800 text-white font-bold rounded-xl md:rounded-full px-7 py-3.5 flex items-center justify-center gap-2 transition">
              <Search size={18} /> Cari
            </button>
          </motion.form>

          <div className="flex flex-wrap gap-2 mt-4">
            {['Bali', 'DI Yogyakarta', 'DKI Jakarta'].map((p) => (
              <button key={p} onClick={() => { setProvince(p); nav(`/rooms?province=${encodeURIComponent(p)}&ci=${ci}&co=${co}&guests=${guests}`); }}
                className="text-xs font-bold text-white/90 border border-white/30 hover:bg-white/15 backdrop-blur px-3.5 py-1.5 rounded-full">📍 {p}</button>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-7xl mx-auto px-4 -mt-0 py-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [ShieldCheck, 'Pembayaran Aman', 'QRIS, VA, kartu & transfer'],
          [BadgePercent, 'Promo Tiap Minggu', 'HEMAT20 s.d. Rp300rb'],
          [Wallet, 'Refund Fleksibel', 'Otomatis saat pembatalan'],
          [Headset, 'CS 24/7 Bahasa ID', settings.supportPhone],
        ].map(([Icon, t, s]: any, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-stone-200/70 p-4 flex gap-3 items-start">
            <span className="w-10 h-10 rounded-xl bg-jungle-700/10 text-jungle-700 grid place-items-center shrink-0"><Icon size={19} /></span>
            <span><b className="text-sm text-jungle-950 block">{t}</b><span className="text-xs text-stone-500">{s}</span></span>
          </motion.div>
        ))}
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-5">
          <div><h2 className="font-display text-2xl md:text-3xl font-bold text-jungle-950">Properti Unggulan</h2><p className="text-stone-500 text-sm mt-1">Pilihan editor dengan rating tertinggi minggu ini</p></div>
          <Link to="/rooms" className="hidden sm:flex items-center gap-1 text-sm font-bold text-jungle-700 hover:gap-2 transition-all">Lihat Semua <ArrowRight size={16} /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
        </div>
      </section>

      {/* PROMO */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-jungle-950 mb-1">Promo Aktif</h2>
        <p className="text-stone-500 text-sm mb-5">Salin kode & tempel saat checkout untuk potongan langsung</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {promos.filter((p) => p.active).slice(0, 3).map((p) => (
            <div key={p.code} className="relative overflow-hidden rounded-2xl bg-jungle-900 text-white p-5 card-shadow">
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-gold-400/20" />
              <div className="absolute -right-2 top-10 w-20 h-20 rounded-full bg-gold-400/10" />
              <p className="text-xs font-bold tracking-widest text-gold-400 uppercase">Kode Promo</p>
              <p className="font-display text-3xl font-bold mt-1 tracking-wide">{p.code}</p>
              <p className="text-sm text-white/75 mt-1">{p.description}</p>
              <p className="text-xs text-white/50 mt-2">Berlaku s.d. {p.validUntil} • Min. {p.minSpend ? formatIDR(p.minSpend) : 'tanpa min.'}</p>
              <Link to="/rooms" className="inline-block mt-4 text-sm font-bold bg-white text-jungle-900 px-4 py-2 rounded-full hover:bg-sand-100">Pakai Sekarang</Link>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-jungle-950 mb-1">Paling Disukai Tamu</h2>
        <p className="text-stone-500 text-sm mb-5">Diurutkan dari rating & ulasan terverifikasi</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popular.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="bg-jungle-950 mt-12 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center">Kata Mereka yang Sudah Menginap</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-7">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-white/[.06] border border-white/10 rounded-2xl p-5">
                <Stars v={r.rating} />
                <p className="text-sand-100/90 text-sm mt-2.5 leading-relaxed">“{r.text}”</p>
                <p className="text-gold-400 text-xs font-bold mt-3">{r.userName} • Terverifikasi menginap</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rooms" className="inline-flex items-center gap-2 gold-grad text-jungle-950 font-bold px-7 py-3 rounded-full">Mulai Cari Kamar <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
