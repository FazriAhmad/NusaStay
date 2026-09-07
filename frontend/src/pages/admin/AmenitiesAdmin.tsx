import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import type { Amenity } from '../../lib/data';
import { uid } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import { AmenIcon } from '../../components/AmenIcon';

const ICONS = ['Wifi', 'Waves', 'Sparkles', 'Coffee', 'Snowflake', 'Tv', 'Dumbbell', 'Umbrella', 'UtensilsCrossed', 'Wine', 'Baby', 'ConciergeBell', 'Car'];

export default function AmenitiesAdmin() {
  const { amenities, upsertAmenity, deleteAmenity, rooms } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [isNew, setIsNew] = useState(false);
  const usage = (id: string) => rooms.filter((r) => r.amenities.includes(id)).length;

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast('Nama fasilitas wajib diisi', 'error'); return; }
    const id = isNew ? editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uid('').slice(3, 6) : editing.id;
    upsertAmenity({ ...editing, id });
    toast(isNew ? 'Fasilitas ditambahkan' : 'Fasilitas diperbarui');
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div><h1 className="font-display text-3xl font-bold text-jungle-950">Amenitas</h1><p className="text-stone-500 text-sm">CRUD fasilitas kamar — otomatis tampil di filter kamar & detail</p></div>
        <button onClick={() => { setEditing({ id: '', name: '', icon: 'ConciergeBell' }); setIsNew(true); }} className="ml-auto font-bold text-sm bg-jungle-700 hover:bg-jungle-800 text-white px-5 py-2.5 rounded-full flex items-center gap-1.5"><Plus size={16} /> Tambah</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
        {amenities.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-stone-200/70 p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-jungle-700/10 text-jungle-700 grid place-items-center shrink-0"><AmenIcon icon={a.icon} size={20} /></span>
            <div className="min-w-0 flex-1"><b className="text-sm text-jungle-950 block truncate">{a.name}</b><span className="text-xs text-stone-400">Dipakai {usage(a.id)} kamar • {a.icon}</span></div>
            <button onClick={() => { setEditing({ ...a }); setIsNew(false); }} className="p-2 rounded-full hover:bg-stone-100 text-jungle-700"><Pencil size={15} /></button>
            <button onClick={() => { if (usage(a.id) > 0) { toast(`Masih dipakai ${usage(a.id)} kamar — lepas dulu dari kamar`, 'error'); return; } if (confirm(`Hapus ${a.name}?`)) { deleteAmenity(a.id); toast('Fasilitas dihapus'); } }} className="p-2 rounded-full hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[90] bg-jungle-950/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display font-bold text-xl">{isNew ? 'Tambah Fasilitas' : 'Edit Fasilitas'}</h2><button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-stone-100"><X size={18} /></button></div>
            <label className="block mt-4"><span className="lbl">Nama fasilitas *</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="inp" placeholder="cth. Antar-Jemput Bandara" /></label>
            <span className="lbl block mt-4">Ikon</span>
            <div className="grid grid-cols-7 gap-1.5 mt-2">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setEditing({ ...editing, icon: ic })} className={`aspect-square rounded-xl grid place-items-center border-2 ${editing.icon === ic ? 'border-jungle-600 bg-jungle-700/10 text-jungle-700' : 'border-stone-200 text-stone-400'}`} title={ic}><AmenIcon icon={ic} size={18} /></button>
              ))}
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
