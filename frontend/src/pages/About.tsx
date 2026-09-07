import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Award, Users, MapPinned, ArrowRight } from 'lucide-react';
import { PageHead } from '../components/Layout';
import { useStore } from '../store/AppStore';

export default function About() {
  const { settings } = useStore();
  return (
    <div className="pb-12">
      <PageHead title="Tentang NusaStay" sub="Hospitality Nusantara dengan standar dunia" />
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <motion.img initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} src="/images/hotel-bali.jpg" alt="NusaStay resort" className="rounded-3xl object-cover h-80 lg:h-auto w-full card-shadow" />
          <div className="bg-white rounded-3xl border border-stone-200/70 p-8 flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-gold-600">Cerita Kami — Sejak 2019</p>
            <h2 className="font-display text-3xl font-bold text-jungle-950 mt-2 leading-tight">Merayakan keindahan menginap di Indonesia.</h2>
            <p className="text-stone-600 text-[15px] leading-relaxed mt-4">{settings.siteName} lahir di Uluwatu dari satu vila tebing 6 kamar. Hari ini kami mengkurasi 8 properti dari Bali hingga Surabaya — tiap properti dipilih langsung tim kami: kasur diuji tidur, sarapan dicicipi, dan WiFi di-speedtest.</p>
            <p className="text-stone-600 text-[15px] leading-relaxed mt-3">Misi kami sederhana: <b>{settings.tagline}</b> — tanpa biaya tersembunyi, dengan CS berbahasa Indonesia 24/7.</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[[Award, '4.8/5', 'Rating tamu'], [Users, '120rb+', 'Tamu / tahun'], [MapPinned, '6', 'Provinsi']].map(([Icon, v, l]: any, i) => (
                <div key={i} className="bg-sand-50 border border-sand-200 rounded-2xl p-4 text-center">
                  <Icon size={20} className="mx-auto text-jungle-700" /><b className="font-display text-2xl text-jungle-950 block mt-1">{v}</b><span className="text-xs text-stone-500">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            [Leaf, 'Berkelanjutan', 'Amenities isi ulang, linen microfiber hemat air, dan 30% bahan makanan dari petani lokal sekitar properti.'],
            [Award, 'Standar NusaStay+', 'Audit kebersihan 120 titik tiap bulan. Kamar gagal audit tidak dijual sampai lolos re-check.'],
            [Users, 'Tim Lokal Juara', '92% staf direkrut dari komunitas sekitar — dilatih hospitality 3 bulan sebelum melayani tamu.'],
          ].map(([Icon, t, d]: any, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-jungle-950 text-white rounded-3xl p-7">
              <span className="w-11 h-11 rounded-2xl gold-grad text-jungle-950 grid place-items-center"><Icon size={21} /></span>
              <h3 className="font-display font-bold text-xl mt-4">{t}</h3>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/rooms" className="inline-flex items-center gap-2 bg-jungle-700 hover:bg-jungle-800 text-white font-bold px-7 py-3.5 rounded-full">Rasakan Sendiri <ArrowRight size={17} /></Link>
        </div>
      </div>
    </div>
  );
}
