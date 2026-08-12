"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/use-notifications";
import { formatDateTime } from "@/lib/format";

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

const Topbar = ({ title, subtitle, action }: Props) => {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Admin";
  const enabled = user?.role === "admin";
  const { items, unread, loading } = useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-2xl pt-md">
      <div>
        <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-md">
          Harmoni Stay · Admin
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
          Hello, {firstName}
        </h1>
        {subtitle && <p className="text-on-surface-variant mt-2 text-lg">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-sm">
        {action}

        {/* Notification bell */}
        <div className="relative" ref={wrapRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setOpen((v) => !v)}
            className="relative p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary transition"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-40 overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-semibold text-on-surface">Notifikasi</h3>
                <span className="text-xs text-on-surface-variant">
                  {loading ? "Memuat..." : `${items.length} terbaru`}
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="p-6 text-sm text-on-surface-variant text-center">
                    Belum ada aktivitas terbaru.
                  </p>
                ) : (
                  <ul className="divide-y divide-outline-variant">
                    {items.map((n) => {
                      const href =
                        n.type === "reservation"
                          ? `/admin/bookings${n.reservation_id ? `?focus=${n.reservation_id}` : ""}`
                          : `/admin/contacts${n.contact_id ? `?focus=${n.contact_id}` : ""}`;
                      return (
                        <li key={n.id}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="block p-3 hover:bg-surface-container-low transition"
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={
                                  "mt-0.5 material-symbols-outlined text-[18px] " +
                                  (n.type === "reservation" ? "text-secondary" : "text-primary")
                                }
                              >
                                {n.type === "reservation" ? "event_available" : "forum"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-on-surface">{n.title}</p>
                                <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                                  {n.body}
                                </p>
                                <p className="text-[10px] text-outline mt-1">
                                  {formatDateTime(n.created_at)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="p-2 border-t border-outline-variant text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setOpen(false)}
                  className="text-xs text-secondary font-medium hover:underline"
                >
                  Lihat semua pesanan →
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/admin/profile"
          aria-label="Profile"
          className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary transition"
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className="ml-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Topbar;
