"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Sidebar from "@/components/admin/sidebar";
import { useAuth } from "@/lib/auth-context";

const STORAGE_KEY = "admin_sidebar_collapsed";
const SIDEBAR_WIDTH = 256;
const SIDEBAR_GAP = 16;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant bg-surface">
        Memeriksa akses...
      </div>
    );
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <div
        className={clsx(
          "hidden md:block admin-sidebar-wrapper fixed left-0 top-0 h-screen z-40 transition-[transform,opacity] duration-300 ease-out",
          collapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        )}
        aria-hidden={collapsed ? true : undefined}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Desktop: floating toggle (open + closed state) */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        className="admin-sidebar-toggle hidden md:flex fixed top-5 z-50 w-11 h-11 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm hover:bg-surface-container text-on-surface transition-all"
        style={{ "--admin-toggle-left": collapsed ? "16px" : "280px" } as React.CSSProperties}
      >
        <span className="material-symbols-outlined text-[20px]">
          {collapsed ? "menu_open" : "menu"}
        </span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-primary/40 backdrop-blur-sm"
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={clsx(
          "md:hidden fixed left-0 top-0 h-screen w-64 z-40 transition-transform duration-300 ease-out p-4",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Mobile: floating menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka sidebar"
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm text-on-surface"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      <main
        className={clsx(
          "px-margin-mobile md:px-margin-desktop max-w-container mx-auto w-full pb-3xl transition-[padding] duration-300",
          "pt-16 md:pt-md",
          collapsed ? "md:pl-margin-desktop" : "md:pl-[280px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
