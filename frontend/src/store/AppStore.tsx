import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Amenity, Promo, Review, Room } from '../lib/data';
import {
  api, ApiError, hasToken, setToken,
  type Booking, type ContactMsg, type Occupancy, type Settings, type User,
} from '../lib/api';
import { dateRange } from '../lib/utils';
import { useToast } from '../components/Toast';

export type Role = 'guest' | 'admin';
export type { Booking, ContactMsg, Settings, User };

type Result = { ok: boolean; msg: string };

type Store = {
  loading: boolean;
  user: User | null;
  rooms: Room[]; bookings: Booking[]; promos: Promo[]; reviews: Review[];
  contacts: ContactMsg[]; amenities: Amenity[]; saved: Record<string, string[]>;
  blocked: Record<string, string[]>; settings: Settings; totalGuests: number;
  login: (email: string, pass: string) => Promise<Result>;
  register: (name: string, email: string, pass: string) => Promise<Result>;
  logout: () => void;
  forgot: (email: string) => Promise<Result & { token?: string }>;
  resetPassword: (token: string, pass: string) => Promise<Result>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  changePassword: (oldP: string, newP: string) => Promise<Result>;
  upsertRoom: (r: Room) => Promise<void>; deleteRoom: (id: string) => Promise<void>;
  upsertPromo: (p: Promo) => Promise<void>; deletePromo: (code: string) => Promise<void>;
  upsertAmenity: (a: Amenity) => Promise<void>; deleteAmenity: (id: string) => Promise<void>;
  createBooking: (b: Omit<Booking, 'id' | 'code' | 'createdAt' | 'refundStatus'>) => Promise<Booking | null>;
  updateBooking: (id: string, patch: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addReview: (bookingId: string, r: { rating: number; text: string; photos: string[] }) => Promise<void>;
  toggleSaved: (roomId: string) => Promise<void>;
  isSaved: (roomId: string) => boolean;
  addContact: (c: { name: string; email: string; subject: string; message: string }) => Promise<void>;
  markContact: (id: string, read: boolean) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleBlock: (roomId: string, date: string) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  uploadRoomImage: (file: File) => Promise<string>;
  roomById: (id: string) => Room | undefined;
  bookedCountOn: (roomId: string, date: string) => number;
  isAvailable: (roomId: string, ci: string, co: string, need?: number) => { ok: boolean; left: number; reason?: string };
  myBookings: Booking[];
};

const Ctx = createContext<Store | null>(null);

const DEFAULT_SETTINGS: Settings = {
  siteName: 'NusaStay', tagline: 'Menginap Terbaik di Nusantara', supportEmail: '', supportPhone: '',
  address: '', taxPercent: 10, serviceFee: 25000, checkInTime: '14:00', checkOutTime: '12:00',
  maintenance: false, announcement: '',
};

const RESET_KEY = 'nusastay_reset';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [occupancy, setOccupancy] = useState<Record<string, Occupancy>>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [totalGuests, setTotalGuests] = useState(0);

  const report = useCallback((err: unknown, fallback: string) => {
    toast(errorMessage(err, fallback), 'error');
  }, [toast]);

  const refreshOccupancy = useCallback(async () => {
    const list = await api.rooms.occupancy();
    setOccupancy(Object.fromEntries(list.map((o) => [String(o.room_id), o])));
  }, []);

  const refreshRooms = useCallback(async () => {
    setRooms(await api.rooms.list());
  }, []);

  const refreshBookings = useCallback(async () => {
    setBookings(await api.reservations.list());
  }, []);

  /** Data every visitor needs. */
  const loadPublic = useCallback(async () => {
    const [roomList, amenityList, reviewList, settingData] = await Promise.all([
      api.rooms.list(),
      api.amenities.list(),
      api.reviews.list(),
      api.settings.get(),
    ]);
    setRooms(roomList);
    setAmenities(amenityList);
    setReviews(reviewList);
    setSettings(settingData);
    await refreshOccupancy();
  }, [refreshOccupancy]);

  /** Data that depends on who is signed in. */
  const loadForUser = useCallback(async (current: User | null) => {
    if (!current) {
      setBookings([]);
      setSavedIds([]);
      setContacts([]);
      setPromos(await api.promos.listPublic());
      return;
    }

    const [bookingList, savedList, promoList] = await Promise.all([
      api.reservations.list(),
      api.saved.list(),
      current.role === 'admin' ? api.promos.listAll() : api.promos.listPublic(),
    ]);
    setBookings(bookingList);
    setSavedIds(savedList);
    setPromos(promoList);

    if (current.role === 'admin') {
      const [contactList, stats] = await Promise.all([api.contacts.list(), api.admin.stats()]);
      setContacts(contactList);
      setTotalGuests(stats.total_users);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadPublic();

        let current: User | null = null;
        if (hasToken()) {
          try {
            current = await api.auth.me();
          } catch {
            setToken(null);
          }
        }

        setUser(current);
        await loadForUser(current);
      } catch (err) {
        report(err, 'Gagal memuat data dari server. Pastikan backend berjalan.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadPublic, loadForUser, report]);

  // Another session (an admin cancelling or refunding, say) changes data this client already
  // holds, so re-sync while the tab is visible and whenever it regains focus.
  useEffect(() => {
    const resync = () => {
      void refreshOccupancy();
      void refreshRooms();
      if (hasToken()) void refreshBookings();
    };
    const resyncIfVisible = () => {
      if (document.visibilityState === 'visible') resync();
    };

    const timer = setInterval(resyncIfVisible, 30000);
    window.addEventListener('focus', resync);
    document.addEventListener('visibilitychange', resyncIfVisible);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', resync);
      document.removeEventListener('visibilitychange', resyncIfVisible);
    };
  }, [refreshOccupancy, refreshRooms, refreshBookings]);

  /* ---------------- availability (computed locally from occupancy) ---------------- */

  const blocked = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const [roomId, o] of Object.entries(occupancy)) out[roomId] = o.blocked;
    return out;
  }, [occupancy]);

  const bookedCountOn = useCallback(
    (roomId: string, date: string) => occupancy[roomId]?.booked[date] ?? 0,
    [occupancy],
  );

  const roomById = useCallback((id: string) => rooms.find((r) => r.id === id), [rooms]);

  const isAvailable = useCallback((roomId: string, ci: string, co: string, need = 1) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return { ok: false, left: 0, reason: 'Kamar tidak ditemukan' };
    if (room.status !== 'active') return { ok: false, left: 0, reason: 'Kamar sedang nonaktif' };
    if (!ci || !co || new Date(ci) >= new Date(co)) return { ok: false, left: 0, reason: 'Rentang tanggal tidak valid' };

    const days = dateRange(ci, co);
    const blockedDays = blocked[roomId] ?? [];
    const hitBlock = days.find((d) => blockedDays.includes(d));
    if (hitBlock) return { ok: false, left: 0, reason: `Tidak tersedia pada ${hitBlock} (diblokir properti)` };

    let minLeft = room.totalRooms;
    for (const d of days) minLeft = Math.min(minLeft, room.totalRooms - bookedCountOn(roomId, d));

    if (minLeft < need) {
      return { ok: false, left: Math.max(0, minLeft), reason: `Sisa ${Math.max(0, minLeft)} kamar untuk tanggal tersebut` };
    }
    return { ok: true, left: minLeft };
  }, [rooms, blocked, bookedCountOn]);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b) => b.userId === user.id);
  }, [bookings, user]);

  const saved = useMemo(() => (user ? { [user.id]: savedIds } : {}), [user, savedIds]);

  /* ---------------- auth ---------------- */

  const login = async (email: string, pass: string): Promise<Result> => {
    try {
      const { user: signedIn, token } = await api.auth.login(email, pass);
      setToken(token);
      setUser(signedIn);
      await loadForUser(signedIn);
      return { ok: true, msg: `Selamat datang kembali, ${signedIn.name.split(' ')[0]}!` };
    } catch (err) {
      return { ok: false, msg: errorMessage(err, 'Gagal masuk. Coba lagi.') };
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<Result> => {
    try {
      const { user: created, token } = await api.auth.register(name, email, pass);
      setToken(token);
      setUser(created);
      await loadForUser(created);
      return { ok: true, msg: 'Akun berhasil dibuat. Selamat bergabung!' };
    } catch (err) {
      return { ok: false, msg: errorMessage(err, 'Pendaftaran gagal. Coba lagi.') };
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => { /* token is dropped locally regardless */ });
    setToken(null);
    setUser(null);
    void loadForUser(null);
  };

  const forgot = async (email: string) => {
    try {
      const res = await api.auth.forgot(email);
      if (res.token && res.email) {
        sessionStorage.setItem(RESET_KEY, JSON.stringify({ email: res.email, token: res.token }));
        return { ok: true, msg: 'Kode reset dibuat (mode demo).', token: res.token.slice(0, 6).toUpperCase() };
      }
      return { ok: true, msg: res.message };
    } catch (err) {
      return { ok: false, msg: errorMessage(err, 'Gagal mengirim kode reset.') };
    }
  };

  const resetPassword = async (code: string, pass: string): Promise<Result> => {
    const raw = sessionStorage.getItem(RESET_KEY);
    if (!raw) return { ok: false, msg: 'Minta kode reset dulu di halaman "Lupa kata sandi".' };

    const { email, token } = JSON.parse(raw) as { email: string; token: string };
    if (code.trim().toUpperCase() !== token.slice(0, 6).toUpperCase()) {
      return { ok: false, msg: 'Kode reset tidak valid.' };
    }

    try {
      await api.auth.reset(email, token, pass);
      sessionStorage.removeItem(RESET_KEY);
      return { ok: true, msg: 'Kata sandi berhasil direset. Silakan masuk.' };
    } catch (err) {
      return { ok: false, msg: errorMessage(err, 'Gagal mereset kata sandi.') };
    }
  };

  const updateProfile = async (patch: Partial<User>) => {
    if (!user) return;
    try {
      setUser(await api.auth.updateProfile({
        name: patch.name ?? user.name,
        email: patch.email ?? user.email,
        phone: patch.phone ?? user.phone,
      }));
    } catch (err) {
      report(err, 'Gagal memperbarui profil.');
    }
  };

  const changePassword = async (oldP: string, newP: string): Promise<Result> => {
    try {
      await api.auth.changePassword(oldP, newP);
      return { ok: true, msg: 'Kata sandi berhasil diganti.' };
    } catch (err) {
      return { ok: false, msg: errorMessage(err, 'Gagal mengganti kata sandi.') };
    }
  };

  /* ---------------- catalogue (admin) ---------------- */

  const upsertRoom = async (r: Room) => {
    try {
      if (rooms.some((x) => x.id === r.id)) await api.rooms.update(r.id, r);
      else await api.rooms.create(r);
      await Promise.all([refreshRooms(), refreshOccupancy()]);
    } catch (err) {
      report(err, 'Gagal menyimpan kamar.');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await api.rooms.remove(id);
      await Promise.all([refreshRooms(), refreshOccupancy()]);
    } catch (err) {
      report(err, 'Gagal menghapus kamar.');
    }
  };

  const refreshPromos = useCallback(async () => {
    setPromos(user?.role === 'admin' ? await api.promos.listAll() : await api.promos.listPublic());
  }, [user]);

  const upsertPromo = async (p: Promo) => {
    try {
      const existing = await api.promos.rawList();
      const match = existing.find((x) => x.code === p.code);
      if (match) await api.promos.update(match.id, p);
      else await api.promos.create(p);
      await refreshPromos();
    } catch (err) {
      report(err, 'Gagal menyimpan promo.');
    }
  };

  const deletePromo = async (code: string) => {
    try {
      const existing = await api.promos.rawList();
      const match = existing.find((x) => x.code === code);
      if (match) await api.promos.remove(match.id);
      await refreshPromos();
    } catch (err) {
      report(err, 'Gagal menghapus promo.');
    }
  };

  const upsertAmenity = async (a: Amenity) => {
    try {
      if (amenities.some((x) => x.id === a.id)) await api.amenities.update(a);
      else await api.amenities.create(a);
      setAmenities(await api.amenities.list());
    } catch (err) {
      report(err, 'Gagal menyimpan fasilitas.');
    }
  };

  const deleteAmenity = async (id: string) => {
    try {
      await api.amenities.remove(id);
      setAmenities(await api.amenities.list());
    } catch (err) {
      report(err, 'Gagal menghapus fasilitas.');
    }
  };

  const uploadRoomImage = (file: File) => api.rooms.uploadImage(file);

  /* ---------------- bookings ---------------- */

  const createBooking = async (b: Omit<Booking, 'id' | 'code' | 'createdAt' | 'refundStatus'>) => {
    try {
      const created = await api.reservations.create({
        room_id: Number(b.roomId),
        start_date: b.checkIn,
        end_date: b.checkOut,
        guests: b.guests,
        rooms_count: b.roomsCount,
        special_request: b.specialRequest || null,
        promo_code: b.promoCode || null,
        payment_method: b.paymentMethod,
        payment_status: b.payStatus === 'paid' ? 'paid' : 'unpaid',
      });
      setBookings((prev) => [created, ...prev]);
      await Promise.all([refreshOccupancy(), refreshPromos()]);
      return created;
    } catch (err) {
      report(err, 'Gagal membuat reservasi.');
      return null;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const updated = await api.reservations.cancel(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      await refreshOccupancy();
    } catch (err) {
      report(err, 'Gagal membatalkan reservasi.');
    }
  };

  const updateBooking = async (id: string, patch: Partial<Booking>) => {
    try {
      if (patch.bookStatus === 'cancelled') {
        await cancelBooking(id);
        return;
      }

      const current = bookings.find((b) => b.id === id);
      let updated: Booking;

      if (patch.payStatus === 'refunded') {
        // A refund only exists on a cancelled booking: cancel first, then settle the pending request.
        if (current?.bookStatus !== 'cancelled') updated = await api.reservations.cancel(id);
        else updated = current;
        if (updated.refundStatus === 'requested') updated = await api.reservations.refund(id, 'approve');
      } else if (patch.payStatus === 'paid' && current?.userId === user?.id && user?.role !== 'admin') {
        updated = await api.reservations.confirmPayment(id, patch.paymentMethod);
      } else {
        const status = patch.bookStatus === 'upcoming' && current?.bookStatus === 'cancelled'
          ? 'unpaid' // restoring a cancelled booking
          : patch.payStatus;

        updated = await api.reservations.updatePayment(id, {
          payment_status: status === 'paid' || status === 'unpaid' ? status : undefined,
          payment_method: patch.paymentMethod,
        });
      }

      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      await refreshOccupancy();
    } catch (err) {
      report(err, 'Gagal memperbarui reservasi.');
    }
  };

  const addReview = async (bookingId: string, r: { rating: number; text: string; photos: string[] }) => {
    try {
      await api.reviews.create(bookingId, { rating: r.rating, comment: r.text, photos: r.photos });
      const [reviewList] = await Promise.all([api.reviews.list(), refreshRooms()]);
      setReviews(reviewList);
    } catch (err) {
      report(err, 'Gagal mengirim ulasan.');
    }
  };

  /* ---------------- saved / contacts / availability blocks ---------------- */

  const isSaved = useCallback((roomId: string) => savedIds.includes(roomId), [savedIds]);

  const toggleSaved = async (roomId: string) => {
    if (!user) return;
    const wasSaved = savedIds.includes(roomId);
    setSavedIds((prev) => (wasSaved ? prev.filter((x) => x !== roomId) : [...prev, roomId]));
    try {
      if (wasSaved) await api.saved.remove(roomId);
      else await api.saved.add(roomId);
    } catch (err) {
      setSavedIds((prev) => (wasSaved ? [...prev, roomId] : prev.filter((x) => x !== roomId)));
      report(err, 'Gagal menyimpan wishlist.');
    }
  };

  const addContact = async (c: { name: string; email: string; subject: string; message: string }) => {
    try {
      await api.contacts.send(c);
    } catch (err) {
      report(err, 'Gagal mengirim pesan.');
    }
  };

  const markContact = async (id: string, read: boolean) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, read } : c)));
    try {
      await api.contacts.markRead(id, read);
    } catch (err) {
      report(err, 'Gagal memperbarui pesan.');
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await api.contacts.remove(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      report(err, 'Gagal menghapus pesan.');
    }
  };

  const toggleBlock = async (roomId: string, date: string) => {
    try {
      await api.blockedDates.toggle(roomId, date);
      await refreshOccupancy();
    } catch (err) {
      report(err, 'Gagal mengubah ketersediaan.');
    }
  };

  const updateSettings = async (s: Partial<Settings>) => {
    try {
      setSettings(await api.settings.update(s));
    } catch (err) {
      report(err, 'Gagal menyimpan pengaturan.');
    }
  };

  const value: Store = {
    loading, user, rooms, bookings, promos, reviews, contacts, amenities, saved, blocked, settings, totalGuests,
    login, register, logout, forgot, resetPassword, updateProfile, changePassword,
    upsertRoom, deleteRoom, upsertPromo, deletePromo, upsertAmenity, deleteAmenity, uploadRoomImage,
    createBooking, updateBooking, cancelBooking, addReview, toggleSaved, isSaved,
    addContact, markContact, deleteContact, toggleBlock, updateSettings,
    roomById, bookedCountOn, isAvailable, myBookings,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}
