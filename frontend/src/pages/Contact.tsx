import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { PageHead } from '../components/Layout';
import { useToast } from '../components/Toast';

export default function Contact() {
  const { settings, addContact } = useStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) { toast('Pesan minimal 10 karakter', 'error'); return; }
    addContact({ name, email, subject: subject || 'Pertanyaan umum', message });
    setName(''); setEmail(''); setSubject(''); setMessage('');
    toast('Pesan terkirim! Tim kami membalas maks. 1×24 jam.');
  };
  return (
    <div className="pb-12">
      <PageHead title="Hubungi Kami" sub="Concierge siap membantu 24/7 — balasan maks. 1×24 jam" />
      <div className="max-w-6xl mx-auto px-4 mt-4 grid lg:grid-cols-[340px_1fr] gap-5">
        <div className="flex flex-col gap-3">
          {[
            [MapPin, 'Kantor Pusat', settings.address],
            [Mail, 'Email', settings.supportEmail],
            [Phone, 'Telepon / WA', settings.supportPhone],
            [Clock, 'Jam Operasional', `Check-in ${settings.checkInTime} • Check-out ${settings.checkOutTime} • CS 24/7`],
          ].map(([Icon, t, d]: any, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200/70 p-5 flex gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-jungle-700/10 text-jungle-700 grid place-items-center shrink-0"><Icon size={19} /></span>
              <span><b className="text-sm text-jungle-950 block">{t}</b><span className="text-sm text-stone-500">{d}</span></span>
            </div>
          ))}
          <div className="rounded-2xl overflow-hidden card-shadow h-44">
            <iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=106.79%2C-6.24%2C106.84%2C-6.21&layer=mapnik&marker=-6.225%2C106.815" className="w-full h-full border-0" />
          </div>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-6 md:p-8">
          <h2 className="font-display font-bold text-2xl text-jungle-950">Kirim Pesan</h2>
          <p className="text-sm text-stone-500 mt-1 mb-5">Pesan Anda masuk ke dashboard admin (menu Contacts).</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-stone-400">Nama</span><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="mt-1.5 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-jungle-600" /></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-stone-400">Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@anda.com" className="mt-1.5 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-jungle-600" /></label>
          </div>
          <label className="block mt-3"><span className="text-xs font-bold uppercase tracking-widest text-stone-400">Subjek</span><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="cth. Antar-jemput bandara, early check-in…" className="mt-1.5 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-jungle-600" /></label>
          <label className="block mt-3"><span className="text-xs font-bold uppercase tracking-widest text-stone-400">Pesan</span><textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Tulis kebutuhan Anda sedetail mungkin…" className="mt-1.5 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-jungle-600 resize-none" /></label>
          <button className="mt-5 font-bold bg-jungle-700 hover:bg-jungle-800 text-white px-7 py-3.5 rounded-full flex items-center gap-2"><Send size={16} /> Kirim Pesan</button>
        </form>
      </div>
    </div>
  );
}
