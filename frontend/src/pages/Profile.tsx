import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Camera } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { PageHead } from '../components/Layout';
import { useToast } from '../components/Toast';
import { fileToDataURL } from '../lib/utils';

export default function Profile() {
  const { user, updateProfile, changePassword, myBookings } = useStore();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [oldP, setOldP] = useState('');
  const [newP, setNewP] = useState('');
  if (!user) return null;
  const spent = myBookings.filter((b) => b.payStatus === 'paid').reduce((s, b) => s + b.total, 0);
  return (
    <div className="pb-12">
      <PageHead title="Profil Saya" sub="Kelola data akun & keamanan" />
      <div className="max-w-5xl mx-auto px-4 mt-4 grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="bg-jungle-950 text-white rounded-2xl p-6 text-center h-fit">
          <label className="relative inline-block cursor-pointer group">
            {user.avatar ? <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-gold-400/50" /> : <span className="w-24 h-24 rounded-full gold-grad text-jungle-950 grid place-items-center font-display font-bold text-4xl mx-auto">{user.name.charAt(0).toUpperCase()}</span>}
            <span className="absolute bottom-1 right-1 bg-white text-jungle-900 rounded-full p-1.5 shadow group-hover:scale-110 transition"><Camera size={14} /></span>
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { updateProfile({ avatar: await fileToDataURL(f) }); toast('Foto profil diperbarui'); } }} />
          </label>
          <h2 className="font-display font-bold text-xl mt-3">{user.name}</h2>
          <p className="text-white/60 text-sm">{user.email}</p>
          <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-widest bg-gold-400/20 text-gold-400 px-3 py-1 rounded-full">{user.role}</span>
          <div className="grid grid-cols-2 gap-2 mt-5 text-center">
            <div className="bg-white/10 rounded-xl p-3"><b className="font-display text-xl block">{myBookings.length}</b><span className="text-[11px] text-white/60">Total booking</span></div>
            <div className="bg-white/10 rounded-xl p-3"><b className="font-display text-xl block">{myBookings.filter((b) => b.payStatus === 'paid').length}</b><span className="text-[11px] text-white/60">Lunas</span></div>
          </div>
          <p className="text-xs text-white/50 mt-3">Total belanja terverifikasi: Rp{spent.toLocaleString('id-ID')}</p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h3 className="font-display font-bold text-lg text-jungle-950">Data Profil</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3"><UserIcon size={17} className="text-stone-400" /><input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm font-semibold outline-none" placeholder="Nama" /></label>
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3 bg-stone-50"><Mail size={17} className="text-stone-400" /><input value={user.email} disabled className="w-full text-sm font-semibold outline-none bg-transparent text-stone-400" /></label>
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3 sm:col-span-2"><Phone size={17} className="text-stone-400" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-sm font-semibold outline-none" placeholder="No. WhatsApp" /></label>
            </div>
            <button onClick={() => { updateProfile({ name, phone }); toast('Profil berhasil diperbarui'); }} className="mt-4 text-sm font-bold bg-jungle-700 text-white px-6 py-2.5 rounded-full">Simpan Perubahan</button>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h3 className="font-display font-bold text-lg text-jungle-950">Ganti Kata Sandi</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3"><Lock size={17} className="text-stone-400" /><input type="password" value={oldP} onChange={(e) => setOldP(e.target.value)} className="w-full text-sm font-semibold outline-none" placeholder="Sandi lama" /></label>
              <label className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-3"><Lock size={17} className="text-stone-400" /><input type="password" value={newP} onChange={(e) => setNewP(e.target.value)} className="w-full text-sm font-semibold outline-none" placeholder="Sandi baru (min. 8)" /></label>
            </div>
            <button onClick={async () => { if (newP.length < 8) { toast('Sandi baru minimal 8 karakter', 'error'); return; } const r = await changePassword(oldP, newP); toast(r.msg, r.ok ? 'success' : 'error'); if (r.ok) { setOldP(''); setNewP(''); } }} className="mt-4 text-sm font-bold border-2 border-jungle-700 text-jungle-700 px-6 py-2.5 rounded-full hover:bg-jungle-50">Ganti Sandi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
