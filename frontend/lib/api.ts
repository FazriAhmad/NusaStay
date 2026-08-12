export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  phone: string | null;
  image: string | null;
};

export type Room = {
  id: number;
  name: string;
  description: string;
  image: string;
  images?: string[] | null;
  price: number;
  capacity: number;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  amenities?: Amenity[];
};

export type RoomAvailability = {
  id: number;
  name: string;
  province: string | null;
  city: string | null;
  image: string;
  price: number;
  capacity: number;
  total_bookings: number;
  status: "available" | "medium" | "high";
};

export type ProvinceInfo = {
  province: string;
  rooms_count: number;
};

export type Amenity = {
  id: number;
  name: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: number;
  reservation_id: number;
  method: string | null;
  amount: number;
  status: "unpaid" | "paid" | "cancelled";
};

export type Reservation = {
  id: number;
  user_id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  price: number;
  created_at: string;
  updated_at: string;
  user?: Pick<User, "id" | "name" | "email" | "phone">;
  room?: Pick<Room, "id" | "name" | "price" | "image">;
  payment?: Payment;
};

export type AdminStats = {
  total_rooms: number;
  total_users: number;
  total_reservations: number;
  total_revenue: number;
  unpaid_count: number;
  today_checkins: number;
  pending_payments: number;
  monthly_revenue: number;
  recent_reservations: Reservation[];
  province_breakdown: { province: string; count: number }[];
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

const resolveApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
};

const TOKEN_KEY = "hotel_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

type ApiOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${resolveApiUrl()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    const error = new Error(message) as Error & { status?: number; errors?: Record<string, string[]> };
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data as T;
}

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) =>
    api<{ user: User; token: string }>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    api<{ user: User; token: string }>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => api<{ user: User }>("/me", { auth: true }),

  logout: () => api<{ message: string }>("/logout", { method: "POST", auth: true }),
};

export const roomsApi = {
  list: (params?: { province?: string; city?: string }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return api<{ data: Room[] }>("/rooms" + qs);
  },
  get: (id: number) => api<{ data: Room }>(`/rooms/${id}`),
  provinces: () => api<{ data: ProvinceInfo[] }>("/rooms/provinces"),
  availability: () => api<{ data: RoomAvailability[] }>("/rooms/availability"),
  uploadImage: async (file: File): Promise<{ url: string; path: string }> => {
    const fd = new FormData();
    fd.append("image", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("hotel_token") : null;
    const res = await fetch(`${resolveApiUrl()}/rooms/upload-image`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Upload failed");
    }
    const json = (await res.json()) as { data: { url: string; path: string } };
    return json.data;
  },
  create: (payload: {
    name: string;
    description: string;
    image: string;
    images?: string[];
    price: number;
    capacity: number;
    province?: string;
    city?: string;
    address?: string;
    amenity_ids?: number[];
  }) =>
    api<{ data: Room }>("/rooms", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  update: (
    id: number,
    payload: {
      name?: string;
      description?: string;
      image?: string;
      images?: string[];
      price?: number;
      capacity?: number;
      province?: string;
      city?: string;
      address?: string;
      amenity_ids?: number[];
    }
  ) =>
    api<{ data: Room }>(`/rooms/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    api<{ message: string }>(`/rooms/${id}`, { method: "DELETE", auth: true }),
};

export const amenitiesApi = {
  list: () => api<{ data: Amenity[] }>("/amenities", { auth: true }),
};

export const contactApi = {
  send: (payload: { name: string; email: string; subject: string; message: string }) =>
    api<{ data: unknown; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: (params?: { page?: number; per_page?: number }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api<PaginatedResponse<Contact>>("/contacts" + qs, { auth: true });
  },
};

export const reservationsApi = {
  list: (params?: { page?: number; per_page?: number }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api<PaginatedResponse<Reservation>>("/reservations" + qs, { auth: true });
  },
  get: (id: number) => api<{ data: Reservation }>(`/reservations/${id}`, { auth: true }),
  create: (payload: { room_id: number; start_date: string; end_date: string }) =>
    api<{ data: Reservation }>("/reservations", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  updateStatus: (id: number, payload: { payment_status?: string; payment_method?: string }) =>
    api<{ data: Reservation }>(`/reservations/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    api<{ message: string }>(`/reservations/${id}`, { method: "DELETE", auth: true }),
};

export const adminApi = {
  stats: () => api<{ data: AdminStats }>("/admin/stats", { auth: true }),
};

export type AdminNotification = {
  id: string;
  type: "reservation" | "contact";
  title: string;
  body: string;
  created_at: string;
  reservation_id?: number;
  contact_id?: number;
};

export type NotificationFeed = {
  data: AdminNotification[];
  unread_count: number;
  latest: { reservation_id: number; contact_id: number };
};

export const notificationsApi = {
  feed: (params?: { last_seen_reservation_id?: number; last_seen_contact_id?: number }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => typeof v === "number" && v > 0)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api<NotificationFeed>("/notifications" + qs, { auth: true });
  },
};

export type SettingItem = {
  key: string;
  value: string | number | boolean;
  type: "string" | "integer" | "boolean" | "json";
  group: string;
};

export const settingsApi = {
  list: () => api<{ data: SettingItem[] }>("/settings", { auth: true }),
  update: (settings: Record<string, string | number | boolean>) =>
    api<{ data: SettingItem[] }>("/settings", {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ settings }),
    }),
};

export const profileApi = {
  update: async (payload: {
    name: string;
    email: string;
    phone?: string;
    image?: File;
  }): Promise<{ user: User }> => {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("email", payload.email);
    if (payload.phone) fd.append("phone", payload.phone);
    if (payload.image) fd.append("image", payload.image);
    fd.append("_method", "PATCH");
    const token = typeof window !== "undefined" ? getToken() : null;
    const res = await fetch(`${resolveApiUrl()}/profile`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Gagal memperbarui profil.");
    }
    return res.json();
  },
  changePassword: (payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) =>
    api<{ message: string }>("/profile/change-password", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
};

export const savedHotelsApi = {
  list: () => api<{ data: number[] }>("/saved-hotels", { auth: true }),
  add: (roomId: number) =>
    api<{ data: unknown }>("/saved-hotels", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ room_id: roomId }),
    }),
  remove: (roomId: number) =>
    api<{ message: string }>(`/saved-hotels/${roomId}`, {
      method: "DELETE",
      auth: true,
    }),
};
