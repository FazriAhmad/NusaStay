import { useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../components/Toast';

export default function SettingsAdmin() {
  const { settings, updateSettings } = useStore();
  const toast = useToast();
  const [f, setF] = useState({ ...settings });
  const set = (k: keyof typeof f, v: any) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-jungle-950">Settings</h1>
      <p className="text-stone-500 text-sm mt-1 mb-4">Pengaturan umum situs & kebijakan booking.</p>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
          <h3 className="font-bold text-jungle-950 mb-4">Identitas Situs</h3>
          <div className="flex flex-col gap-3">
            <label className="block"><span className="lbl">Nama situs</span><input value={f.siteName} onChange={(e) => set('siteName', e.target.value)} className="inp" /></label>
            <label className="block"><span className="lbl">Tagline</span><input value={f.tagline} onChange={(e) => set('tagline', e.target.value)} className="inp" /></label>
            <label className="block"><span className="lbl">Pengumuman (tampil di hero)</span><textarea value={f.announcement} onChange={(e) => set('announcement', e.target.value)} rows={2} className="inp resize-none" /></label>
            <label className="block"><span className="lbl">Email support</span><input value={f.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} className="inp" /></label>
            <label className="block"><span className="lbl">Telepon support</span><input value={f.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} className="inp" /></label>
            <label className="block"><span className="lbl">Alamat</span><input value={f.address} onChange={(e) => set('address', e.target.value)} className="inp" /></label>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
            <h3 className="font-bold text-jungle-950 mb-4">Kebijakan & Biaya</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Pajak (%)</span><input type="number" min={0} max={30} value={f.taxPercent} onChange={(e) => set('taxPercent', Number(e.target.value))} className="inp" /></label>
              <label className="block"><span className="lbl">Biaya layanan (Rp)</span><input type="number" min={0} value={f.serviceFee} onChange={(e) => set('serviceFee', Number(e.target.value))} className="inp" /></label>
              <label className="block"><span className="lbl">Jam check-in</span><input type="time" value={f.checkInTime} onChange={(e) => set('checkInTime', e.target.value)} className="inp" /></label>
              <label className="block"><span className="lbl">Jam check-out</span><input type="time" value={f.checkOutTime} onChange={(e) => set('checkOutTime', e.target.value)} className="inp" /></label>
            </div>
            <label className="flex items-center gap-2.5 mt-4 text-sm font-bold bg-red-50 border border-red-200 rounded-xl p-3.5 cursor-pointer">
              <input type="checkbox" checked={f.maintenance} onChange={(e) => set('maintenance', e.target.checked)} className="w-4 h-4 accent-red-600" />
              Mode maintenance (tutup pemesanan sementara)
            </label>
          </div>
          <button onClick={() => { updateSettings(f); toast('Pengaturan disimpan & langsung tayang'); }} className="font-bold bg-jungle-700 hover:bg-jungle-800 text-white py-4 rounded-2xl flex items-center justify-center gap-2"><Save size={17} /> Simpan Pengaturan</button>
        </div>
      </div>
      <style>{`.lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#a8a29e}.inp{margin-top:6px;width:100%;border:1px solid #e7e5e4;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;outline:none}.inp:focus{border-color:#166b41}`}</style>
    </div>
  );
}
