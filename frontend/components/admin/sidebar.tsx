"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "Monitor Pesanan", icon: "monitor_heart" },
  { href: "/admin/availability", label: "Kamar Tersedia", icon: "hotel_class" },
  { href: "/admin/room", label: "Manage Rooms", icon: "hotel" },
  { href: "/admin/bookings", label: "All Bookings", icon: "calendar_today" },
  { href: "/admin/contacts", label: "Contacts", icon: "forum" },
];

const accountItems = [
  { href: "/admin/profile", label: "Profile", icon: "account_circle" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

const Sidebar = ({ onNavigate }: { onNavigate?: () => void } = {}) => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant py-xl shadow-sm z-50">
      <div className="px-md pb-lg mb-lg border-b border-outline-variant">
        <Logo />
      </div>

      <div className="px-md mb-xl">
        <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-semibold uppercase">
            {user?.name?.[0] ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-on-surface-variant leading-tight">Welcome back,</p>
            <p className="text-sm font-semibold text-on-surface truncate">
              {user?.name ?? "Admin"}
            </p>
          </div>
        </div>
      </div>

      <ul className="flex-1 px-sm space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="relative">
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full"
                />
              )}
              <Link
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  "flex items-center gap-3 pl-5 pr-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:translate-x-0.5"
                )}
              >
                <span
                  className={clsx(
                    "material-symbols-outlined text-[20px]",
                    isActive && "fill"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}

        <li className="pt-5 pb-2 px-4 text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">
          Akun
        </li>
        {accountItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="relative">
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full"
                />
              )}
              <Link
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  "flex items-center gap-3 pl-5 pr-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:translate-x-0.5"
                )}
              >
                <span
                  className={clsx(
                    "material-symbols-outlined text-[20px]",
                    isActive && "fill"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-md mt-auto pt-6 border-t border-outline-variant">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          Browse Site
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
