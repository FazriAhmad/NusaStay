import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BedDouble, Heart, Menu, X, User, LogOut, LayoutDashboard, CalendarCheck, Info, Phone } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/AppStore';

export function Stars({ v, size = 14 }: { v: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(v) ? '#d9a441' : 'none'} stroke={i <= Math.round(v) ? '#d9a441' : '#c9c2b2'} strokeWidth={1.6}>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function Navbar() {
  const { user, logout, myBookings, saved } = useStore();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const savedCount = user ? (saved[user.id]?.length ?? 0) : 0;
  const link = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition ${isActive ? 'text-jungle-700' : 'text-stone-600 hover:text-jungle-700'}`;
  return (
    <header className="sticky top-0 z-50 glass border-b border-jungle-900/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-jungle-800 text-sand-100 grid place-items-center"><BedDouble size={20} /></span>
          <span className="leading-none">
            <span className="font-display font-bold text-xl text-jungle-900 block">NusaStay</span>
            <span className="text-[10px] tracking-[.22em] uppercase text-gold-600 font-bold">Nusantara Hotels</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/" className={link}>Beranda</NavLink>
          <NavLink to="/rooms" className={link}>Kamar</NavLink>
          <NavLink to="/about" className={link}>Tentang</NavLink>
          <NavLink to="/contact" className={link}>Kontak</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="text-sm font-bold text-gold-600 hover:text-gold-500 flex items-center gap-1.5 bg-gold-400/15 px-3 py-1.5 rounded-full">
              <LayoutDashboard size={15} /> Dashboard Admin
            </NavLink>
          )}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/saved" className="relative p-2.5 rounded-full hover:bg-jungle-50 text-jungle-800" title="Hotel tersimpan">
                <Heart size={19} />{savedCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{savedCount}</span>}
              </Link>
              <Link to="/my-reservations" className="relative p-2.5 rounded-full hover:bg-jungle-50 text-jungle-800" title="Reservasi saya">
                <CalendarCheck size={19} />{myBookings.filter((b) => b.bookStatus === 'upcoming').length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-jungle-600 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{myBookings.filter((b) => b.bookStatus === 'upcoming').length}</span>}
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-jungle-900/15 hover:border-jungle-700">
                  <span className="w-8 h-8 rounded-full bg-jungle-700 text-white grid place-items-center text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="text-sm font-bold text-jungle-900 max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl card-shadow border border-stone-100 p-2 hidden group-hover:block">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-sand-50"><User size={16} /> Profil Saya</Link>
                  <Link to="/my-reservations" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-sand-50"><CalendarCheck size={16} /> Reservasi Saya</Link>
                  <Link to="/saved" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-sand-50"><Heart size={16} /> Disimpan</Link>
                  <button onClick={() => { logout(); nav('/'); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={16} /> Keluar</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-jungle-800 px-4 py-2.5 rounded-full hover:bg-jungle-50">Masuk</Link>
              <Link to="/register" className="text-sm font-bold bg-jungle-700 hover:bg-jungle-800 text-white px-5 py-2.5 rounded-full transition">Daftar</Link>
            </>
          )}
        </div>
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 flex flex-col gap-1">
          {[
            ['/', 'Beranda'], ['/rooms', 'Kamar'], ['/about', 'Tentang'], ['/contact', 'Kontak'],
            ...(user ? [['/my-reservations', 'Reservasi Saya'], ['/saved', 'Disimpan'], ['/profile', 'Profil']] as string[][] : []),
            ...(user?.role === 'admin' ? [['/admin', 'Dashboard Admin']] as string[][] : []),
          ].map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-sand-50">{label}</Link>)}
          {!user ? (
            <div className="flex gap-2 mt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center font-bold text-sm border border-jungle-700 text-jungle-700 rounded-full py-2.5">Masuk</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center font-bold text-sm bg-jungle-700 text-white rounded-full py-2.5">Daftar</Link>
            </div>
          ) : (
            <button onClick={() => { logout(); setOpen(false); nav('/'); }} className="mt-2 text-left px-3 py-2.5 rounded-xl font-bold text-sm text-red-600 bg-red-50">Keluar ({user.name})</button>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="bg-jungle-950 text-sand-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-9 h-9 rounded-xl gold-grad grid place-items-center text-jungle-950"><BedDouble size={20} /></span>
            <span className="font-display font-bold text-xl">{settings.siteName}</span>
          </div>
          <p className="text-sm text-sand-100/70 leading-relaxed">{settings.tagline}. Dari Uluwatu hingga Tunjungan — pesan kamar terbaik Nusantara dalam hitungan menit.</p>
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase text-gold-400 mb-3">Jelajah</h4>
          <div className="flex flex-col gap-2 text-sm text-sand-100/80">
            <Link to="/rooms" className="hover:text-white">Semua Kamar</Link>
            <Link to="/saved" className="hover:text-white">Wishlist</Link>
            <Link to="/my-reservations" className="hover:text-white">Reservasi Saya</Link>
            <Link to="/about" className="hover:text-white flex items-center gap-1.5"><Info size={14} /> Tentang Kami</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase text-gold-400 mb-3">Bantuan</h4>
          <div className="flex flex-col gap-2 text-sm text-sand-100/80">
            <Link to="/contact" className="hover:text-white flex items-center gap-1.5"><Phone size={14} /> Hubungi Kami</Link>
            <Link to="/forgot-password" className="hover:text-white">Lupa Kata Sandi</Link>
            <Link to="/register" className="hover:text-white">Buat Akun</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase text-gold-400 mb-3">Kontak</h4>
          <p className="text-sm text-sand-100/80">{settings.address}</p>
          <p className="text-sm text-sand-100/80 mt-1">{settings.supportEmail}</p>
          <p className="text-sm text-sand-100/80">{settings.supportPhone}</p>
          <p className="text-xs text-sand-100/50 mt-3">Check-in {settings.checkInTime} • Check-out {settings.checkOutTime} WIB</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sand-100/50">© 2026 {settings.siteName} • Crafted in Indonesia • Demo booking engine (Laravel API + PostgreSQL)</div>
    </footer>
  );
}

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-2">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-jungle-950">{title}</h1>
      {sub && <p className="text-stone-500 mt-1.5">{sub}</p>}
    </div>
  );
}
