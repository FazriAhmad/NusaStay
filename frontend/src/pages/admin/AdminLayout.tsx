import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BedDouble, LayoutDashboard, BedSingle, CalendarRange, BookOpenCheck, ReceiptText, BadgePercent, BarChart3, Inbox, Settings as SettingsIcon, User, LogOut, ConciergeBell, Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store/AppStore';
import { fmtDateTime } from '../../lib/utils';

const MENU = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/room', 'Kamar', BedSingle, false],
  ['/admin/amenities', 'Amenitas', ConciergeBell, false],
  ['/admin/availability', 'Ketersediaan', CalendarRange, false],
  ['/admin/bookings', 'Bookings', BookOpenCheck, false],
  ['/admin/orders', 'Orders', ReceiptText, false],
  ['/admin/promo', 'Promo', BadgePercent, false],
  ['/admin/reports', 'Reports', BarChart3, false],
  ['/admin/contacts', 'Contacts', Inbox, false],
  ['/admin/settings', 'Settings', SettingsIcon, false],
  ['/admin/profile', 'Profil', User, false],
] as const;

export default function AdminLayout() {
  const { user, logout, bookings, contacts, settings } = useStore();
  const nav = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [tick, setTick] = useState(0);

  // polling notifikasi tiap 15 detik (simulasi realtime)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, []);
  void tick;

  const notifs = useMemo(() => {
    const n: { id: string; text: string; time: string; hot?: boolean }[] = [];
    bookings.filter((b) => b.payStatus === 'unpaid' && b.bookStatus === 'upcoming').slice(0, 4).forEach((b) =>
      n.push({ id: 'u' + b.id, text: `Menunggu bayar ${b.code} — ${b.guestName}`, time: b.createdAt, hot: true }));
    bookings.slice(0, 3).forEach((b) => n.push({ id: 'b' + b.id, text: `Booking baru ${b.code} (${b.paymentMethod})`, time: b.createdAt }));
    contacts.filter((c) => !c.read).slice(0, 3).forEach((c) => n.push({ id: 'c' + c.id, text: `Pesan baru: ${c.subject}`, time: c.date }));
    return n.sort((a, b) => +new Date(b.time) - +new Date(a.time)).slice(0, 8);
  }, [bookings, contacts]);

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex">
      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 bg-jungle-950 text-sand-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <span className="w-9 h-9 rounded-xl gold-grad grid place-items-center text-jungle-950"><BedDouble size={20} /></span>
          <span className="leading-none"><span className="font-display font-bold text-lg block">{settings.siteName}</span><span className="text-[10px] tracking-[.22em] uppercase text-gold-400 font-bold">Admin Panel</span></span>
        </Link>
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-0.5">
          {MENU.map(([to, label, Icon, exact]) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-white/10 text-white' : 'text-sand-100/60 hover:text-white hover:bg-white/5'}`}>
              <Icon size={17} /> {label}
              {label === 'Contacts' && contacts.filter((c) => !c.read).length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{contacts.filter((c) => !c.read).length}</span>}
              {label === 'Bookings' && bookings.filter((b) => b.payStatus === 'unpaid' && b.bookStatus === 'upcoming').length > 0 && <span className="ml-auto bg-amber-400 text-jungle-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{bookings.filter((b) => b.payStatus === 'unpaid' && b.bookStatus === 'upcoming').length}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="w-9 h-9 rounded-full gold-grad text-jungle-950 grid place-items-center font-bold">{user?.name.charAt(0)}</span>
            <div className="min-w-0"><p className="text-sm font-bold truncate">{user?.name}</p><p className="text-[11px] text-sand-100/50 truncate">{user?.email}</p></div>
          </div>
          <div className="flex gap-2 mt-1">
            <Link to="/" className="flex-1 text-center text-xs font-bold bg-white/10 hover:bg-white/15 rounded-lg py-2">Lihat Situs</Link>
            <button onClick={() => { logout(); nav('/login'); }} className="flex-1 text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg py-2 flex items-center justify-center gap-1"><LogOut size={13} /> Keluar</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        {/* mobile topbar */}
        <div className="lg:hidden sticky top-0 z-40 bg-jungle-950 text-white px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-display font-bold mr-1 shrink-0">{settings.siteName} • Admin</span>
          {MENU.map(([to, label]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${isActive ? 'bg-gold-400 text-jungle-950' : 'bg-white/10'}`}>{label}</NavLink>)}
          <button onClick={() => { logout(); nav('/login'); }} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/30">Keluar</button>
        </div>
        {/* desktop header */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-[#f3f1ea]/85 backdrop-blur border-b border-jungle-900/10 px-8 py-3.5 items-center gap-3">
          <p className="text-sm text-stone-500">Halo kembali, <b className="text-jungle-900">{user?.name}</b> • <span className="text-emerald-600 font-bold">● Live polling 15 dtk</span></p>
          <div className="ml-auto relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2.5 rounded-full bg-white border border-stone-200 hover:border-jungle-600">
              <Bell size={18} className="text-jungle-800" />
              {notifs.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{notifs.length}</span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-96 max-w-[90vw] bg-white rounded-2xl card-shadow border border-stone-200 p-2 z-50">
                <p className="font-bold text-sm px-3 py-2">Notifikasi terbaru</p>
                {notifs.length === 0 && <p className="text-sm text-stone-400 px-3 pb-3">Tidak ada notifikasi. Semua beres! 🎉</p>}
                {notifs.map((n) => (
                  <div key={n.id} className={`px-3 py-2.5 rounded-xl text-sm ${n.hot ? 'bg-amber-50' : 'hover:bg-stone-50'}`}>
                    <p className="font-semibold text-jungle-950 text-[13px]">{n.text}</p>
                    <p className="text-[11px] text-stone-400">{fmtDateTime(n.time)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-6xl"><Outlet /></main>
      </div>
    </div>
  );
}
