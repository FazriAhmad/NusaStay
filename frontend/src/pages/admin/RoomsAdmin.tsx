import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { PROVINCES, type Room } from '../../lib/data';
import { formatIDR, fileToDataURL, uid } from '../../lib/utils';
import { useToast } from '../../components/Toast';

const EMPTY: Room = { id: '', name: '', hotel: '', province: 'Bali', city: '', address: '', pricePerNight: 500000, rating: 0, reviewCount: 0, images: [], amenities: [], capacity: 2, bed: '1 King Bed', size: 30, totalRooms: 10, status: 'active', description: '' };

export default function RoomsAdmin() {
  const { rooms, upsertRoom, deleteRoom, amenities, uploadRoomImage } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Room | null>(null);
  const [q, setQ] = useState('');

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.hotel.trim() || !editing.city.trim()) { toast('Nama, hotel & kota wajib diisi', 'error'); return; }
    if (editing.images.length === 0) { toast('Upload minimal 1 foto kamar', 'error'); return; }
    await upsertRoom(editing);
    toast(editing.id ? 'Kamar diperbarui' : 'Kamar baru ditambahkan');
    setEditing(null);
  };

  const onImg = async (files: FileList | null) => {
    if (!files || !editing) return;
    try {
      const urls = await Promise.all([...files].slice(0, 6 - editing.images.length).map(uploadRoomImage));
      setEditing((prev) => (prev ? { ...prev, images: [...prev.images, ...urls].slice(0, 6) } : prev));
    } catch {
      toast('Gagal mengunggah foto', 'error');
    }
  };

  const list = rooms.filter((r) => (r.name + r.hotel + r.city).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="font-display text-3xl font-bold text-jungle-950">Manajemen Kamar</h1><p className="text-stone-500 text-sm">{rooms.length} kamar terdaftar</p></div>
        <div className="ml-auto flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kamar…" className="border border-stone-200 bg-white rounded-full px-4 py-2.5 text-sm outline-none focus:border-jungle-600 w-48" />
          <button onClick={() => setEditing({ ...EMPTY })} className="font-bold text-sm bg-jungle-700 hover:bg-jungle-800 text-white px-5 py-2.5 rounded-full flex items-center gap-1.5"><Plus size={16} /> Tambah</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {list.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-stone-200/70 card-shadow p-4 flex gap-4">
            <img src={r.images[0]} alt="" className="w-28 h-24 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600">{r.hotel} • {r.city}</p>
              <p className="font-bold text-jungle-950 truncate">{r.name}</p>
              <p className="text-sm font-extrabold text-jungle-700">{formatIDR(r.pricePerNight)}<span className="text-xs font-medium text-stone-400">/mlm • {r.totalRooms} unit</span></p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>{r.status === 'active' ? 'AKTIF' : 'NONAKTIF'}</span>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditing({ ...r })} className="text-xs font-bold bg-jungle-700/10 text-jungle-700 px-3 py-1.5 rounded-full flex items-center gap-1"><Pencil size={12} /> Edit</button>
                <button onClick={() => { if (confirm(`Hapus ${r.name}?`)) { deleteRoom(r.id); toast('Kamar dihapus'); } }} className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-full flex items-center gap-1"><Trash2 size={12} /> Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-jungle-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display font-bold text-2xl text-jungle-950">{editing.id ? 'Edit Kamar' : 'Tambah Kamar'}</h2><button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-stone-100"><X size={18} /></button></div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <label className="block sm:col-span-2"><span className="lbl">Nama kamar *</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="inp" placeholder="cth. Ocean Cliff Deluxe" /></label>
              <label className="block"><span className="lbl">Hotel / Properti *</span><input value={editing.hotel} onChange={(e) => setEditing({ ...editing, hotel: e.target.value })} className="inp" /></label>
              <label className="block"><span className="lbl">Kota *</span><input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="inp" /></label>
              <label className="block"><span className="lbl">Provinsi</span><select value={editing.province} onChange={(e) => setEditing({ ...editing, province: e.target.value })} className="inp bg-white">{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></label>
              <label className="block"><span className="lbl">Alamat</span><input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="inp" /></label>
              <label className="block"><span className="lbl">Harga/malam (Rp)</span><input type="number" min={50000} step={10000} value={editing.pricePerNight} onChange={(e) => setEditing({ ...editing, pricePerNight: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Harga coret (opsional)</span><input type="number" value={editing.originalPrice ?? ''} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : undefined })} className="inp" placeholder="kosongkan jika tidak promo" /></label>
              <label className="block"><span className="lbl">Kapasitas tamu</span><input type="number" min={1} max={10} value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Total unit kamar</span><input type="number" min={1} value={editing.totalRooms} onChange={(e) => setEditing({ ...editing, totalRooms: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Tempat tidur</span><input value={editing.bed} onChange={(e) => setEditing({ ...editing, bed: e.target.value })} className="inp" /></label>
              <label className="block"><span className="lbl">Luas (m²)</span><input type="number" min={1} value={editing.size} onChange={(e) => setEditing({ ...editing, size: Number(e.target.value) })} className="inp" /></label>
              <label className="block"><span className="lbl">Status</span><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'active' | 'inactive' })} className="inp bg-white"><option value="active">Aktif (bisa dipesan)</option><option value="inactive">Nonaktif</option></select></label>
              <label className="block sm:col-span-2"><span className="lbl">Deskripsi</span><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="inp resize-none" /></label>
              <div className="sm:col-span-2">
                <span className="lbl">Fasilitas</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {amenities.map((a) => (
                    <button key={a.id} type="button" onClick={() => setEditing({ ...editing, amenities: editing.amenities.includes(a.id) ? editing.amenities.filter((x) => x !== a.id) : [...editing.amenities, a.id] })}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${editing.amenities.includes(a.id) ? 'bg-jungle-700 text-white border-jungle-700' : 'bg-white border-stone-200 text-stone-500'}`}>{a.name}</button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="lbl">Foto kamar ({editing.images.length}/6) *</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {editing.images.map((src, i) => (
                    <span key={i} className="relative"><img src={src} alt="" className="w-20 h-16 rounded-xl object-cover" /><button type="button" onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button></span>
                  ))}
                  {editing.images.length < 6 && (
                    <label className="w-20 h-16 rounded-xl border-2 border-dashed border-stone-300 grid place-items-center cursor-pointer text-stone-400 hover:border-jungle-600 hover:text-jungle-600"><Upload size={18} /><input type="file" accept="image/*" multiple hidden onChange={(e) => onImg(e.target.files)} /></label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 font-bold border-2 border-stone-200 py-3 rounded-full">Batal</button>
              <button onClick={save} className="flex-1 font-bold bg-jungle-700 text-white py-3 rounded-full">Simpan Kamar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#a8a29e}.inp{margin-top:6px;width:100%;border:1px solid #e7e5e4;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;outline:none}.inp:focus{border-color:#166b41}`}</style>
    </div>
  );
}
