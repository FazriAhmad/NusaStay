import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';

function Shell({ title, sub, children }: any) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-jungle-950/70" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl gold-grad grid place-items-center text-jungle-950"><BedDouble size={22} /></span>
            <span className="font-display font-bold text-2xl">NusaStay</span>
          </Link>
          <h2 className="font-display text-4xl font-bold leading-tight">Satu akun untuk<br />seluruh Nusantara.</h2>
          <p className="text-white/70 mt-3 max-w-md">Kelola reservasi, simpan wishlist, kumpulkan promo, dan checkout dalam 1 menit.</p>
          <div className="flex gap-6 mt-8 text-sm">
            <span><b className="font-display text-2xl block">8</b><span className="text-white/60">Properti curated</span></span>
            <span><b className="font-display text-2xl block">4.8★</b><span className="text-white/60">Rating rata-rata</span></span>
            <span><b className="font-display text-2xl block">12rb+</b><span className="text-white/60">Tamu puas</span></span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12 bg-[#faf8f2]">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="w-9 h-9 rounded-xl bg-jungle-800 text-sand-100 grid place-items-center"><BedDouble size={20} /></span>
            <span className="font-display font-bold text-xl text-jungle-900">NusaStay</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-jungle-950">{title}</h1>
          <p className="text-stone-500 text-sm mt-1.5 mb-7">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, ...props }: any) {
  return (
    <label className="flex items-center gap-2.5 border border-stone-200 bg-white rounded-xl px-3.5 py-3 focus-within:border-jungle-600 transition">
      <Icon size={17} className="text-stone-400 shrink-0" />
      <input {...props} className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400 placeholder:font-normal" />
    </label>
  );
}

export default function Login() {
  const { login } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('tamu@example.com');
  const [pass, setPass] = useState('tamu123');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await login(email, pass);
    setBusy(false);
    toast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) nav(email.includes('admin') ? '/admin' : '/');
  };
  return (
    <Shell title="Selamat datang kembali 👋" sub="Masuk untuk melanjutkan reservasi Anda.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <div className="relative">
          <Field icon={Lock} type={show ? 'text' : 'password'} required placeholder="Kata sandi" value={pass} onChange={(e: any) => setPass(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-stone-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
        </div>
        <div className="text-right"><Link to="/forgot-password" className="text-xs font-bold text-jungle-700 hover:underline">Lupa kata sandi?</Link></div>
        <button disabled={busy} className="font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-3.5 rounded-full transition disabled:opacity-60">{busy ? 'Memproses…' : 'Masuk'}</button>
      </form>
      <div className="bg-sand-50 border border-sand-200 rounded-xl p-3.5 mt-4 text-xs text-stone-600 leading-relaxed">
        <b>Akun demo:</b><br />Tamu → tamu@example.com / tamu123<br />Admin → admin@nusastay.id / admin123
      </div>
      <p className="text-sm text-stone-500 mt-5 text-center">Belum punya akun? <Link to="/register" className="font-bold text-jungle-700">Daftar gratis</Link></p>
    </Shell>
  );
}
