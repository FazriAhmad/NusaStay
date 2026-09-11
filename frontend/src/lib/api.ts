import type { Amenity, Promo, Review, Room } from './data';

const BASE = '/api';
const TOKEN_KEY = 'nusastay_token';

let token: string | null = null;
try { token = localStorage.getItem(TOKEN_KEY); } catch { /* noop */ }

export function setToken(next: string | null) {
  token = next;
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* noop */ }
}

export function hasToken() {
  return Boolean(token);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: string; body?: unknown; form?: FormData };

async function request<T>(path: string, { method = 'GET', body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const errors = payload?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors)[0]?.[0] : undefined;
    throw new ApiError(first ?? payload?.message ?? `Request gagal (${res.status})`, res.status);
  }

  return payload as T;
}

/* ------------------------------------------------------------------ *
 * Backend row shapes
 * ------------------------------------------------------------------ */

type ApiAmenity = { id: number; name: string; icon: string | null };

type ApiRoom = {
  id: number; name: string; hotel: string | null; description: string;
  image: string; images: string[] | null; price: number; original_price: number | null;
  capacity: number; bed: string | null; size: number | null; total_rooms: number;
  status: string; featured: boolean; province: string | null; city: string | null;
  address: string | null; avg_rating: number; review_count: number;
  amenities?: ApiAmenity[];
};

type ApiPayment = { id: number; method: string | null; amount: number; status: string };

type ApiReservation = {
  id: number; code: string | null; user_id: number; room_id: number;
  start_date: string; end_date: string; guests: number; rooms_count: number;
  special_request: string | null; subtotal: number; tax_amount: number;
  service_fee: number; discount_amount: number; price: number;
  refund_status: string; cancelled_by: string | null; cancellation_reason: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string; phone: string | null };
  room?: { id: number; name: string; image: string };
  payment?: ApiPayment | null;
  promo_code?: { id: number; code: string } | null;
};

type ApiPromo = {
  id: number; code: string; discount_type: 'percent' | 'fixed'; discount_value: number;
  max_discount: number | null; min_transaction: number; quota: number | null;
  used_count: number; valid_from: string | null; valid_until: string | null;
  active: boolean; description: string | null;
};

type ApiReview = {
  id: number; room_id: number; user_id: number; rating: number;
  comment: string | null; photos: string[] | null; created_at: string;
  user?: { id: number; name: string };
};

type ApiUser = {
  id: number; name: string; email: string; phone: string | null;
  role: string; image?: string | null; created_at: string;
};

type ApiContact = {
  id: number; name: string; email: string; subject: string;
  message: string; read: boolean; created_at: string;
};

export type Occupancy = {
  room_id: number;
  total_rooms: number;
  booked: Record<string, number>;
  blocked: string[];
};

export type AdminStats = {
  total_rooms: number; total_users: number; total_reservations: number;
  total_revenue: number; unpaid_count: number; today_checkins: number;
  pending_payments: number; monthly_revenue: number;
};

/* ------------------------------------------------------------------ *
 * Mappers: backend row -> reference app shape
 * ------------------------------------------------------------------ */

const day = (iso: string) => iso.slice(0, 10);

export function mapAmenity(a: ApiAmenity): Amenity {
  return { id: String(a.id), name: a.name, icon: a.icon ?? 'Sparkles' };
}

export function mapRoom(r: ApiRoom): Room {
  const images = r.images && r.images.length > 0 ? r.images : [r.image];
  return {
    id: String(r.id),
    name: r.name,
    hotel: r.hotel ?? '',
    province: r.province ?? '',
    city: r.city ?? '',
    address: r.address ?? '',
    pricePerNight: r.price,
    originalPrice: r.original_price ?? undefined,
    rating: Number(r.avg_rating) || 0,
    reviewCount: r.review_count,
    images,
    amenities: (r.amenities ?? []).map((a) => String(a.id)),
    capacity: r.capacity,
    bed: r.bed ?? '',
    size: r.size ?? 0,
    totalRooms: r.total_rooms,
    status: r.status === 'inactive' ? 'inactive' : 'active',
    description: r.description,
    featured: r.featured,
  };
}

export type Booking = {
  id: string; code: string; roomId: string; userId: string;
  guestName: string; email: string; phone: string;
  checkIn: string; checkOut: string; guests: number; roomsCount: number;
  subtotal: number; discount: number; promoCode: string; total: number;
  payStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
  bookStatus: 'upcoming' | 'completed' | 'cancelled';
  refundStatus: 'none' | 'requested' | 'approved' | 'rejected';
  paymentMethod: string; createdAt: string; specialRequest: string;
};

export function mapReservation(r: ApiReservation): Booking {
  const paymentStatus = r.payment?.status ?? 'unpaid';
  const cancelled = paymentStatus === 'cancelled';

  let payStatus: Booking['payStatus'] = 'unpaid';
  if (r.refund_status === 'approved' || r.refund_status === 'requested') payStatus = 'refunded';
  else if (paymentStatus === 'paid') payStatus = 'paid';

  let bookStatus: Booking['bookStatus'] = 'upcoming';
  if (cancelled) bookStatus = 'cancelled';
  else if (day(r.end_date) < new Date().toISOString().slice(0, 10)) bookStatus = 'completed';

  return {
    id: String(r.id),
    code: r.code ?? `NS-${r.id}`,
    roomId: String(r.room_id),
    userId: String(r.user_id),
    guestName: r.user?.name ?? '',
    email: r.user?.email ?? '',
    phone: r.user?.phone ?? '',
    checkIn: day(r.start_date),
    checkOut: day(r.end_date),
    guests: r.guests,
    roomsCount: r.rooms_count,
    subtotal: r.subtotal,
    discount: r.discount_amount,
    promoCode: r.promo_code?.code ?? '',
    total: r.price,
    payStatus,
    bookStatus,
    refundStatus: (r.refund_status ?? 'none') as Booking['refundStatus'],
    paymentMethod: r.payment?.method ?? '',
    createdAt: r.created_at,
    specialRequest: r.special_request ?? '',
  };
}

export function mapPromo(p: ApiPromo): Promo {
  return {
    code: p.code,
    type: p.discount_type === 'fixed' ? 'flat' : 'percent',
    value: p.discount_value,
    maxDiscount: p.max_discount ?? p.discount_value,
    minSpend: p.min_transaction,
    validUntil: p.valid_until ? day(p.valid_until) : '2099-12-31',
    quota: p.quota ?? 999999,
    used: p.used_count,
    active: p.active,
    description: p.description ?? '',
  };
}

export function mapReview(r: ApiReview): Review {
  return {
    id: String(r.id),
    roomId: String(r.room_id),
    userName: r.user?.name ?? 'Tamu',
    rating: r.rating,
    text: r.comment ?? '',
    date: day(r.created_at),
    photos: r.photos ?? [],
  };
}

export type User = {
  id: string; name: string; email: string; password: string;
  phone: string; role: 'guest' | 'admin'; createdAt: string; avatar?: string;
};

export function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    password: '',
    phone: u.phone ?? '',
    role: u.role === 'admin' ? 'admin' : 'guest',
    createdAt: u.created_at,
    avatar: u.image ?? undefined,
  };
}

export type ContactMsg = {
  id: string; name: string; email: string; subject: string;
  message: string; date: string; read: boolean;
};

export function mapContact(c: ApiContact): ContactMsg {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email,
    subject: c.subject,
    message: c.message,
    date: c.created_at,
    read: c.read,
  };
}

export type Settings = {
  siteName: string; tagline: string; supportEmail: string; supportPhone: string;
  address: string; taxPercent: number; serviceFee: number; checkInTime: string;
  checkOutTime: string; maintenance: boolean; announcement: string;
};

type SettingRow = { key: string; value: string | number | boolean };

export function mapSettings(rows: Record<string, SettingRow>): Settings {
  const get = (key: string) => rows[key]?.value;
  return {
    siteName: String(get('site_name') ?? 'NusaStay'),
    tagline: String(get('site_tagline') ?? ''),
    supportEmail: String(get('contact_email') ?? ''),
    supportPhone: String(get('contact_phone') ?? ''),
    address: String(get('address') ?? ''),
    taxPercent: Number(get('tax_percent') ?? 0),
    serviceFee: Number(get('service_fee') ?? 0),
    checkInTime: String(get('check_in_time') ?? '14:00'),
    checkOutTime: String(get('check_out_time') ?? '12:00'),
    maintenance: Boolean(get('maintenance')),
    announcement: String(get('announcement') ?? ''),
  };
}

/** Reference-shaped settings -> backend setting keys. */
export function unmapSettings(s: Partial<Settings>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (s.siteName !== undefined) out.site_name = s.siteName;
  if (s.tagline !== undefined) out.site_tagline = s.tagline;
  if (s.supportEmail !== undefined) out.contact_email = s.supportEmail;
  if (s.supportPhone !== undefined) out.contact_phone = s.supportPhone;
  if (s.address !== undefined) out.address = s.address;
  if (s.taxPercent !== undefined) out.tax_percent = s.taxPercent;
  if (s.serviceFee !== undefined) out.service_fee = s.serviceFee;
  if (s.checkInTime !== undefined) out.check_in_time = s.checkInTime;
  if (s.checkOutTime !== undefined) out.check_out_time = s.checkOutTime;
  if (s.maintenance !== undefined) out.maintenance = s.maintenance ? 1 : 0;
  if (s.announcement !== undefined) out.announcement = s.announcement;
  return out;
}

/** Reference-shaped room -> backend payload. */
export function unmapRoom(r: Room) {
  return {
    name: r.name,
    hotel: r.hotel || null,
    description: r.description,
    image: r.images[0] ?? '/images/hero.jpg',
    images: r.images,
    price: r.pricePerNight,
    original_price: r.originalPrice ?? null,
    capacity: r.capacity,
    bed: r.bed || null,
    size: r.size || null,
    total_rooms: r.totalRooms,
    status: r.status,
    featured: r.featured ?? false,
    province: r.province || null,
    city: r.city || null,
    address: r.address || null,
    amenity_ids: r.amenities.map(Number).filter((n) => !Number.isNaN(n)),
  };
}

/** Reference-shaped promo -> backend payload. */
export function unmapPromo(p: Promo) {
  return {
    code: p.code,
    discount_type: p.type === 'flat' ? 'fixed' : 'percent',
    discount_value: p.value,
    max_discount: p.maxDiscount,
    min_transaction: p.minSpend,
    quota: p.quota,
    valid_until: p.validUntil,
    active: p.active,
    description: p.description,
  };
}

/* ------------------------------------------------------------------ *
 * Endpoints
 * ------------------------------------------------------------------ */

export const api = {
  rooms: {
    list: () => request<{ data: ApiRoom[] }>('/rooms').then((r) => r.data.map(mapRoom)),
    occupancy: () => request<{ data: Occupancy[] }>('/rooms/occupancy').then((r) => r.data),
    create: (room: Room) => request<{ data: ApiRoom }>('/rooms', { method: 'POST', body: unmapRoom(room) }).then((r) => mapRoom(r.data)),
    update: (id: string, room: Room) => request<{ data: ApiRoom }>(`/rooms/${id}`, { method: 'PUT', body: unmapRoom(room) }).then((r) => mapRoom(r.data)),
    remove: (id: string) => request<void>(`/rooms/${id}`, { method: 'DELETE' }),
    uploadImage: (file: File) => {
      const form = new FormData();
      form.append('image', file);
      return request<{ data: { url: string } }>('/rooms/upload-image', { method: 'POST', form }).then((r) => r.data.url);
    },
  },

  amenities: {
    list: () => request<{ data: ApiAmenity[] }>('/amenities').then((r) => r.data.map(mapAmenity)),
    create: (a: Amenity) => request<{ data: ApiAmenity }>('/amenities', { method: 'POST', body: { name: a.name, icon: a.icon } }).then((r) => mapAmenity(r.data)),
    update: (a: Amenity) => request<{ data: ApiAmenity }>(`/amenities/${a.id}`, { method: 'PUT', body: { name: a.name, icon: a.icon } }).then((r) => mapAmenity(r.data)),
    remove: (id: string) => request<void>(`/amenities/${id}`, { method: 'DELETE' }),
  },

  promos: {
    listPublic: () => request<{ data: ApiPromo[] }>('/promos').then((r) => r.data.map(mapPromo)),
    listAll: () => request<{ data: ApiPromo[] }>('/promo-codes').then((r) => r.data.map(mapPromo)),
    create: (p: Promo) => request<{ data: ApiPromo }>('/promo-codes', { method: 'POST', body: unmapPromo(p) }).then((r) => mapPromo(r.data)),
    update: (id: number, p: Promo) => request<{ data: ApiPromo }>(`/promo-codes/${id}`, { method: 'PUT', body: unmapPromo(p) }).then((r) => mapPromo(r.data)),
    remove: (id: number) => request<void>(`/promo-codes/${id}`, { method: 'DELETE' }),
    rawList: () => request<{ data: ApiPromo[] }>('/promo-codes').then((r) => r.data),
  },

  reviews: {
    list: () => request<{ data: ApiReview[] }>('/reviews').then((r) => r.data.map(mapReview)),
    create: (reservationId: string, body: { rating: number; comment: string; photos: string[] }) =>
      request<{ data: ApiReview }>(`/reservations/${reservationId}/review`, { method: 'POST', body }).then((r) => mapReview(r.data)),
  },

  reservations: {
    list: () => request<{ data: ApiReservation[] }>('/reservations?per_page=100').then((r) => r.data.map(mapReservation)),
    create: (body: Record<string, unknown>) =>
      request<{ data: ApiReservation }>('/reservations', { method: 'POST', body }).then((r) => mapReservation(r.data)),
    updatePayment: (id: string, body: { payment_status?: string; payment_method?: string }) =>
      request<{ data: ApiReservation }>(`/reservations/${id}`, { method: 'PATCH', body }).then((r) => mapReservation(r.data)),
    confirmPayment: (id: string, method?: string) =>
      request<{ data: ApiReservation }>(`/reservations/${id}/confirm-payment`, { method: 'POST', body: { method } }).then((r) => mapReservation(r.data)),
    cancel: (id: string, reason?: string) =>
      request<{ data: ApiReservation }>(`/reservations/${id}/cancel`, { method: 'POST', body: { reason } }).then((r) => mapReservation(r.data)),
    refund: (id: string, action: 'approve' | 'reject') =>
      request<{ data: ApiReservation }>(`/reservations/${id}/refund`, { method: 'PATCH', body: { action } }).then((r) => mapReservation(r.data)),
  },

  saved: {
    list: () => request<{ data: number[] }>('/saved-hotels').then((r) => r.data.map(String)),
    add: (roomId: string) => request<void>('/saved-hotels', { method: 'POST', body: { room_id: Number(roomId) } }),
    remove: (roomId: string) => request<void>(`/saved-hotels/${roomId}`, { method: 'DELETE' }),
  },

  contacts: {
    list: () => request<{ data: ApiContact[] }>('/contacts?per_page=100').then((r) => r.data.map(mapContact)),
    send: (body: { name: string; email: string; subject: string; message: string }) =>
      request<{ data: ApiContact }>('/contact', { method: 'POST', body }).then((r) => mapContact(r.data)),
    markRead: (id: string, read: boolean) => request<void>(`/contacts/${id}`, { method: 'PATCH', body: { read } }),
    remove: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
  },

  blockedDates: {
    toggle: (roomId: string, date: string) =>
      request<{ data: { blocked: boolean } }>('/blocked-dates/toggle', { method: 'POST', body: { room_id: Number(roomId), date } }),
  },

  settings: {
    get: () => request<{ data: Record<string, SettingRow> }>('/settings').then((r) => mapSettings(r.data)),
    update: (patch: Partial<Settings>) =>
      request<{ data: Record<string, SettingRow> }>('/settings', { method: 'PUT', body: { settings: unmapSettings(patch) } }).then((r) => mapSettings(r.data)),
  },

  auth: {
    me: () => request<{ user: ApiUser }>('/me').then((r) => mapUser(r.user)),
    login: (email: string, password: string) =>
      request<{ user: ApiUser; token: string }>('/login', { method: 'POST', body: { email, password } })
        .then((r) => ({ user: mapUser(r.user), token: r.token })),
    register: (name: string, email: string, password: string) =>
      request<{ user: ApiUser; token: string }>('/register', {
        method: 'POST',
        body: { name, email, password, password_confirmation: password },
      }).then((r) => ({ user: mapUser(r.user), token: r.token })),
    logout: () => request<void>('/logout', { method: 'POST' }),
    forgot: (email: string) =>
      request<{ message: string; token?: string; email?: string }>('/forgot-password', { method: 'POST', body: { email } }),
    reset: (email: string, token: string, password: string) =>
      request<{ message: string }>('/reset-password', {
        method: 'POST',
        body: { email, token, password, password_confirmation: password },
      }),
    updateProfile: (patch: { name: string; email: string; phone: string }) =>
      request<{ user: ApiUser }>('/profile', { method: 'PATCH', body: patch }).then((r) => mapUser(r.user)),
    // PHP only parses multipart bodies on POST, so the file goes up with _method=PATCH.
    uploadAvatar: (file: File, current: { name: string; email: string; phone: string }) => {
      const form = new FormData();
      form.append('_method', 'PATCH');
      form.append('name', current.name);
      form.append('email', current.email);
      form.append('phone', current.phone);
      form.append('image', file);
      return request<{ user: ApiUser }>('/profile', { method: 'POST', form }).then((r) => mapUser(r.user));
    },
    changePassword: (current_password: string, new_password: string) =>
      request<{ message: string }>('/profile/change-password', {
        method: 'POST',
        body: { current_password, new_password, new_password_confirmation: new_password },
      }),
  },

  admin: {
    stats: () => request<{ data: AdminStats }>('/admin/stats').then((r) => r.data),
  },
};
