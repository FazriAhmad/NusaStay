import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, KeyRound, Lock } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';
import { Field } from './Login';

export default function Reset() {
  const { resetPassword } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [token, setToken] = useState('');
  const [pass, setPass] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) { toast('Kata sandi minimal 8 karakter', 'error'); return; }
    const r = await resetPassword(token, pass);
    toast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) nav('/login');
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#faf8f2]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/70 card-shadow p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-xl bg-jungle-800 text-sand-100 grid place-items-center"><BedDouble size={20} /></span>
          <span className="font-display font-bold text-xl text-jungle-900">NusaStay</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-jungle-950">Reset kata sandi</h1>
        <p className="text-stone-500 text-sm mt-1.5 mb-6">Tempel kode 6 digit dari langkah sebelumnya, lalu buat sandi baru.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field icon={KeyRound} required placeholder="Kode reset (cth. A1B2C3)" value={token} onChange={(e: any) => setToken(e.target.value)} />
          <Field icon={Lock} type="password" required placeholder="Kata sandi baru" value={pass} onChange={(e: any) => setPass(e.target.value)} />
          <button className="font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-3.5 rounded-full">Simpan Sandi Baru</button>
        </form>
        <p className="text-sm text-stone-500 mt-5 text-center"><Link to="/forgot-password" className="font-bold text-jungle-700">Minta kode baru</Link></p>
      </div>
    </div>
  );
}
