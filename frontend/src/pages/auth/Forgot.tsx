import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Mail, KeyRound } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';
import { Field } from './Login';

export default function Forgot() {
  const { forgot } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await forgot(email);
    toast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok && r.token) setSent(r.token);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#faf8f2]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/70 card-shadow p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-xl bg-jungle-800 text-sand-100 grid place-items-center"><BedDouble size={20} /></span>
          <span className="font-display font-bold text-xl text-jungle-900">NusaStay</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-jungle-950">Lupa kata sandi?</h1>
        <p className="text-stone-500 text-sm mt-1.5 mb-6">Masukkan email terdaftar — kami kirim kode reset 6 digit (berlaku 30 menit).</p>
        {!sent ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field icon={Mail} type="email" required placeholder="Email terdaftar" value={email} onChange={(e: any) => setEmail(e.target.value)} />
            <button className="font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-3.5 rounded-full">Kirim Kode Reset</button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <KeyRound size={28} className="mx-auto text-emerald-600" />
            <p className="text-sm text-stone-600 mt-2">Kode reset Anda (mode demo):</p>
            <p className="font-display text-4xl font-bold tracking-[.2em] text-jungle-900 my-2">{sent}</p>
            <button onClick={() => nav('/reset-password')} className="font-bold text-sm bg-jungle-700 text-white px-6 py-2.5 rounded-full">Lanjut Reset →</button>
          </div>
        )}
        <p className="text-sm text-stone-500 mt-5 text-center"><Link to="/login" className="font-bold text-jungle-700">← Kembali masuk</Link></p>
      </div>
    </div>
  );
}
