import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Copy } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import type { Promo } from '../../lib/data';
import { formatIDR, todayISO } from '../../lib/utils';
import { useToast } from '../../components/Toast';

const EMPTY: Promo = { code: '', type: 'percent', value: 10, maxDiscount: 100000, minSpend: 0, validUntil: todayISO(90), quota: 100, used: 0, active: true, description: '' };

export default function PromoAdmin() {
  const { promos, upsertPromo, deletePromo } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Promo | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = () => {
    if (!editing) return;
    const code = editing.code.trim().toUpperCase().replace(/\s/g, '');
    if (!code) { toast('Kode promo wajib diisi', 'error'); return; }
    if (isNew && promos.some((p) => p.code === code)) { toast('Kode sudah dipakai', 'error'); return; }
    upsertPromo({ ...editing, code });
    toast(isNew ? `Promo ${code} dibuat` : `Promo ${code} diperbarui`);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div><h1 className="font-display text-3xl font-bold text-jungle-950">Kode Promo</h1><p className="text-stone-500 text-sm">{promos.filter((p) => p.active).length} aktif dari {promos.length} total</p></div>
        <button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} className="ml-auto font-bold text-sm bg-jungle-700 hover:bg-jungle-800 text-white px-5 py-2.5 rounded-full flex items-center gap-1.5"><Plus size={16} /> Buat Promo</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {promos.map((p) => {
          const expired = new Date(p.validUntil) < new Date(todayISO());
          const out = p.used >= p.quota;
          return (
            <div key={p.code} className={`rounded-2xl border card-shadow p-5 ${p.active && !expired && !out ? 'bg-jungle-950 text-white border-jungle-950' : 'bg-white border-stone-200/70'}`}>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl tracking-wide">{p.code}</span>
                <button onClick={() => { navigator.clipboard.writeText(p.code); toast('Kode disalin'); }} className="opacity-60 hover:opacity-100"><Copy size={15} /></button>
                <span className={`ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full ${!p.active ? 'bg-stone-200 text-stone-500' : expired ? 'bg-red-500 text-white' : out ? 'bg-amber-400 text-jungle-950' : 'bg-emerald-500 text-white'}`}>
                  {!p.active ? 'NONAKTIF' : expired ? 'KEDALUWARSA' : out ? 'KUOTA HABIS' : 'AKTIF'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${p.active ? 'text-white/70' : 'text-stone-500'}`}>{p.description || `${p.type === 'percent' ? p.value + '%' : formatIDR(p.value)} • maks ${formatIDR(p.maxDiscount)} • min ${formatIDR(p.minSpend)}`}</p>
              <div className="mt-3 h-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-gold-400 rounded-full" style={{ width: `${Math.min(100, (p.used / Math.max(1, p.quota)) * 100)}%` }} /></div>
              <p className={`text-xs mt-1 ${p.active ? 'text-white/60' : 'text-stone-400'}`}>{p.used}/{p.quota} dipakai • s.d. {p.validUntil}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditing({ ...p }); setIsNew(false); }} className="text-xs font-bold px-3.5 py-2 rounded-full bg-white/15 border border-current flex items-center gap-1"><Pencil size={12} /> Edit</button>
                <button onClick={() => { upsertPromo({ ...p, active: !p.active }); toast(`Promo ${p.code} ${p.active ? 'dinonaktifkan' : 'diaktifkan'}`); }} className="text-xs font-bold px-3.5 py-2 rounded-full bg-white/15 border border-current">{p.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                <button onClick={() => { if (confirm(`Hapus promo ${p.code}?`)) { deletePromo(p.code); toast('Promo dihapus'); } }} className="text-xs font-bold px-3.5 py-2 rounded-full bg-red-500/20 text-red-400 border border-red-400/40 flex items-center gap-1"><Trash2 size={12} /> Hapus</button>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[90] bg-jungle-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display font-bold text-2xl">{isNew ? 'Buat Promo' : 'Edit ' + editing.code}</h2><button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-stone-100"><X size={18} /></button></div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label className="block sm:col-span-2"><span className="lbl">Kode *</span><input value={editing.code} disabled={!isNew} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="inp tracking-widest font-mono" placeholder="cth. HEMAT25" /></label>
              <label className="block"><span className="lbl">Tipe</span><select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as 'percent' | 'flat' })} className="inp bg-white"><option value="percent">Persen (%)</option><option value="flat">Nominal (Rp)</option></select></label>
              <label className="block"><span className="lbl">Nilai {editing.type === 'percent' ? '(%)' : '(Rp)'}</span><input type="number" min={1} value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Maks. diskon (Rp)</span><input type="number" min={0} value={editing.maxDiscount} onChange={(e) => setEditing({ ...editing, maxDiscount: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Min. belanja (Rp)</span><input type="number" min={0} value={editing.minSpend} onChange={(e) => setEditing({ ...editing, minSpend: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Berlaku hingga</span><input type="date" value={editing.validUntil} onChange={(e) => setEditing({ ...editing, validUntil: e.target.value })} className="inp" /></label>
              <label className="block"><span className="lbl">Kuota</span><input type="number" min={1} value={editing.quota} onChange={(e) => setEditing({ ...editing, quota: Number(e.target.value) })} className="inp" /></label>
              <label className="block sm:col-span-2"><span className="lbl">Deskripsi</span><input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="inp" placeholder="cth. Diskon 20% s.d. Rp300rb" /></label>
              <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 accent-green-800" /> Aktif</label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 font-bold border-2 border-stone-200 py-3 rounded-full">Batal</button>
              <button onClick={save} className="flex-1 font-bold bg-jungle-700 text-white py-3 rounded-full">Simpan</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#a8a29e}.inp{margin-top:6px;width:100%;border:1px solid #e7e5e4;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;outline:none}.inp:focus{border-color:#166b41}`}</style>
    </div>
  );
}
