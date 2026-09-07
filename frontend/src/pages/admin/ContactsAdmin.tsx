import { useState } from 'react';
import { MailOpen, Trash2, CheckCheck } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { fmtDateTime } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export default function ContactsAdmin() {
  const { contacts, markContact, deleteContact } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const unread = contacts.filter((c) => !c.read).length;
  return (
    <div>
      <div className="flex items-center gap-3">
        <div><h1 className="font-display text-3xl font-bold text-jungle-950">Contacts</h1><p className="text-stone-500 text-sm">{unread} belum dibaca dari {contacts.length} pesan</p></div>
        {unread > 0 && <button onClick={() => { contacts.filter((c) => !c.read).forEach((c) => markContact(c.id, true)); toast('Semua pesan ditandai dibaca'); }} className="ml-auto text-xs font-bold bg-jungle-700 text-white px-4 py-2 rounded-full flex items-center gap-1.5"><CheckCheck size={14} /> Tandai semua dibaca</button>}
      </div>
      <div className="flex flex-col gap-3 mt-5">
        {contacts.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border p-5 ${c.read ? 'border-stone-200/70' : 'border-gold-500/60 card-shadow'}`}>
            <div className="flex flex-wrap items-center gap-2 cursor-pointer" onClick={() => { setOpen(open === c.id ? null : c.id); if (!c.read) markContact(c.id, true); }}>
              <span className={`w-2.5 h-2.5 rounded-full ${c.read ? 'bg-stone-200' : 'bg-gold-400'}`} />
              <b className="text-jungle-950">{c.subject}</b>
              {!c.read && <span className="text-[10px] font-bold bg-gold-400 text-jungle-950 px-2 py-0.5 rounded-full">BARU</span>}
              <span className="ml-auto text-xs text-stone-400">{fmtDateTime(c.date)}</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">dari <b>{c.name}</b> • {c.email}</p>
            {open === c.id && (
              <div className="mt-3 bg-[#faf8f2] rounded-xl p-4 text-sm text-stone-600 leading-relaxed">
                {c.message}
                <div className="flex gap-2 mt-3">
                  <a href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`} className="text-xs font-bold bg-jungle-700 text-white px-4 py-2 rounded-full flex items-center gap-1.5"><MailOpen size={13} /> Balas via Email</a>
                  <button onClick={() => markContact(c.id, !c.read)} className="text-xs font-bold border border-stone-300 px-4 py-2 rounded-full">{c.read ? 'Tandai belum dibaca' : 'Tandai dibaca'}</button>
                  <button onClick={() => { if (confirm('Hapus pesan ini?')) { deleteContact(c.id); toast('Pesan dihapus'); } }} className="text-xs font-bold text-red-500 px-3 py-2 flex items-center gap-1"><Trash2 size={13} /> Hapus</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {contacts.length === 0 && <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-dashed">Kotak masuk kosong.</p>}
      </div>
    </div>
  );
}
