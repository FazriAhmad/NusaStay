import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';
import { Field } from './Login';

export default function Register() {
  const { register } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) { toast('Kata sandi minimal 8 karakter', 'error'); return; }
    setBusy(true);
    const r = await register(name, email, pass);
    setBusy(false);
    toast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) nav('/');
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/images/room-villa.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-jungle-950/70" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <h2 className="font-display text-4xl font-bold leading-tight">Daftar & dapatkan<br />potongan Rp50rb 🎉</h2>
          <p className="text-white/70 mt-3 max-w-md">Gunakan kode NUSA50 di pemesanan pertama Anda. Tanpa kartu kredit, gratis selamanya.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12 bg-[#faf8f2]">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="w-9 h-9 rounded-xl bg-jungle-800 text-sand-100 grid place-items-center"><BedDouble size={20} /></span>
            <span className="font-display font-bold text-xl text-jungle-900">NusaStay</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-jungle-950">Buat akun baru</h1>
          <p className="text-stone-500 text-sm mt-1.5 mb-7">Gratis — cuma butuh 20 detik.</p>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field icon={UserIcon} required placeholder="Nama lengkap" value={name} onChange={(e: any) => setName(e.target.value)} />
            <Field icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
            <div className="relative">
              <Field icon={Lock} type={show ? 'text' : 'password'} required placeholder="Kata sandi (min. 8 karakter)" value={pass} onChange={(e: any) => setPass(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-stone-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <button disabled={busy} className="font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-3.5 rounded-full transition disabled:opacity-60">{busy ? 'Memproses…' : 'Daftar Sekarang'}</button>
          </form>
          <p className="text-sm text-stone-500 mt-5 text-center">Sudah punya akun? <Link to="/login" className="font-bold text-jungle-700">Masuk</Link></p>
        </div>
      </div>
    </div>
  );
}
