import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { AppProvider, useStore } from './store/AppStore';
import { ToastProvider } from './components/Toast';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';
import BookingPage from './pages/booking/BookingPage';
import CheckoutPage from './pages/booking/CheckoutPage';
import SuccessPage from './pages/booking/SuccessPage';
import MyReservations from './pages/MyReservations';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import RoomsAdmin from './pages/admin/RoomsAdmin';
import Availability from './pages/admin/Availability';
import BookingsAdmin from './pages/admin/BookingsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import PromoAdmin from './pages/admin/PromoAdmin';
import Reports from './pages/admin/Reports';
import ContactsAdmin from './pages/admin/ContactsAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import AdminProfile from './pages/admin/AdminProfile';
import AmenitiesAdmin from './pages/admin/AmenitiesAdmin';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (!user) return <>{children}</>;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
}

function NeedLogin({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (user) return <>{children}</>;
  return <Navigate to="/login" replace />;
}

function NeedAdmin({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Booting() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#faf8f2]">
      <div className="flex flex-col items-center gap-3">
        <span className="w-10 h-10 border-[3px] border-jungle-700/20 border-t-jungle-700 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-stone-500">Memuat NusaStay…</p>
      </div>
    </div>
  );
}

function Shell() {
  const loc = useLocation();
  const { loading } = useStore();
  if (loading) return <Booting />;

  const isAdmin = loc.pathname.startsWith('/admin');
  const isAuth = ['/login', '/register', '/forgot-password', '/reset-password'].includes(loc.pathname);
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<NeedAdmin><AdminLayout /></NeedAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="room" element={<RoomsAdmin />} />
          <Route path="availability" element={<Availability />} />
          <Route path="bookings" element={<BookingsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="promo" element={<PromoAdmin />} />
          <Route path="reports" element={<Reports />} />
          <Route path="contacts" element={<ContactsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="amenities" element={<AmenitiesAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuth && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><Forgot /></GuestOnly>} />
          <Route path="/reset-password" element={<GuestOnly><Reset /></GuestOnly>} />
          <Route path="/booking/:id" element={<NeedLogin><BookingPage /></NeedLogin>} />
          <Route path="/checkout/:id" element={<NeedLogin><CheckoutPage /></NeedLogin>} />
          <Route path="/booking/success/:id" element={<NeedLogin><SuccessPage /></NeedLogin>} />
          <Route path="/my-reservations" element={<NeedLogin><MyReservations /></NeedLogin>} />
          <Route path="/saved" element={<NeedLogin><Saved /></NeedLogin>} />
          <Route path="/profile" element={<NeedLogin><Profile /></NeedLogin>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <ScrollTop />
          <Shell />
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
