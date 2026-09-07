import { useState } from 'react';
import { Camera, Lock } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';
import { fileToDataURL } from '../../lib/utils';

export default function AdminProfile() {
  const { user, updateProfile, changePassword, bookings } = useStore();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [oldP, setOldP] = useState('');
  const [newP, setNewP] = useState('');
  if (!user) return null;
  const handled = bookings.length;
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Profil Admin</h1>
      <p className="text-stone-500 text-sm mt-1 mb-4">Identitas operator & keamanan akun.</p>
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="bg-jungle-950 text-white rounded-2xl p-6 text-center h-fit">
          <label className="relative inline-block cursor-pointer">
            {user.avatar ? <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-gold-400/50" /> : <span className="w-24 h-24 rounded-full gold-grad text-jungle-950 grid place-items-center font-display font-bold text-4xl mx-auto">{user.name.charAt(0)}</span>}
            <span className="absolute bottom-1 right-1 bg-white text-jungle-900 rounded-full p-1.5"><Camera size={14} /></span>
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { updateProfile({ avatar: await fileToDataURL(f) }); toast('Foto profil diperbarui'); } }} />
          </label>
          <h2 className="font-display font-bold text-xl mt-3">{user.name}</h2>
          <p className="text-white/60 text-sm">{user.email}</p>
          <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-widest bg-gold-400/20 text-gold-400 px-3 py-1 rounded-full">Administrator</span>
          <p className="text-xs text-white/50 mt-3">{handled} booking dikelola sistem</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h3 className="font-bold text-jungle-950">Data Diri</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <label className="block"><span className="lbl">Nama</span><input value={name} onChange={(e) => setName(e.target.value)} className="inp" /></label>
              <label className="block"><span className="lbl">Telepon</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="inp" /></label>
            </div>
            <button onClick={() => { updateProfile({ name, phone }); toast('Profil admin diperbarui'); }} className="mt-4 text-sm font-bold bg-jungle-700 text-white px-6 py-2.5 rounded-full">Simpan</button>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h3 className="font-bold text-jungle-950 flex items-center gap-2"><Lock size={16} /> Ganti Kata Sandi</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <input type="password" value={oldP} onChange={(e) => setOldP(e.target.value)} placeholder="Sandi lama" className="inp" />
              <input type="password" value={newP} onChange={(e) => setNewP(e.target.value)} placeholder="Sandi baru" className="inp" />
            </div>
            <button onClick={async () => { if (newP.length < 8) { toast('Minimal 8 karakter', 'error'); return; } const r = await changePassword(oldP, newP); toast(r.msg, r.ok ? 'success' : 'error'); if (r.ok) { setOldP(''); setNewP(''); } }} className="mt-4 text-sm font-bold border-2 border-jungle-700 text-jungle-700 px-6 py-2.5 rounded-full">Ganti Sandi</button>
          </div>
        </div>
      </div>
      <style>{`.lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#a8a29e}.inp{margin-top:6px;width:100%;border:1px solid #e7e5e4;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;outline:none}.inp:focus{border-color:#166b41}`}</style>
    </div>
  );
}
