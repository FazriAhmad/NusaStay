"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Topbar from "@/components/admin/topbar";
import ReservationDetailModal from "@/components/reservation-detail-modal";
import { reservationsApi, type Reservation } from "@/lib/api";
import { formatDate, formatIDR, nights } from "@/lib/format";

type StatusFilter = "all" | "paid" | "unpaid" | "cancelled" | "today" | "upcoming" | "past";

const filters: { value: StatusFilter; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "view_list" },
  { value: "today", label: "Today", icon: "today" },
  { value: "upcoming", label: "Upcoming", icon: "event_upcoming" },
  { value: "past", label: "Past", icon: "history" },
  { value: "paid", label: "Paid", icon: "check_circle" },
  { value: "unpaid", label: "Unpaid", icon: "pending" },
  { value: "cancelled", label: "Cancelled", icon: "cancel" },
];

export default function AdminOrdersPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const { data } = await reservationsApi.list();
      setItems(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 15 seconds for real-time monitoring
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => load(), 15000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return items.filter((r) => {
      const status = r.payment?.status ?? "unpaid";
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);

      if (filter === "today" && (start < today || start >= tomorrow)) return false;
      if (filter === "upcoming" && start < today) return false;
      if (filter === "past" && end >= today) return false;
      if (["paid", "unpaid", "cancelled"].includes(filter) && status !== filter) return false;

      if (search) {
        const q = search.toLowerCase();
        if (
          !r.user?.name?.toLowerCase().includes(q) &&
          !r.user?.email?.toLowerCase().includes(q) &&
          !r.room?.name?.toLowerCase().includes(q) &&
          !(r.id + "").includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, filter, search]);

  const handleStatusChange = async (r: Reservation, status: string) => {
    setActingId(r.id);
    try {
      await reservationsApi.updateStatus(r.id, { payment_status: status });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (r: Reservation) => {
    if (!confirm(`Hapus booking #${r.id} - ${r.user?.name}?`)) return;
    setActingId(r.id);
    try {
      await reservationsApi.remove(r.id);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActingId(null);
    }
  };

  // Counts for filter chips
  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      all: items.length,
      today: items.filter((r) => {
        const start = new Date(r.start_date);
        return start >= today && start < tomorrow;
      }).length,
      upcoming: items.filter((r) => new Date(r.start_date) >= today).length,
      past: items.filter((r) => new Date(r.end_date) < today).length,
      paid: items.filter((r) => r.payment?.status === "paid").length,
      unpaid: items.filter((r) => (r.payment?.status ?? "unpaid") === "unpaid").length,
      cancelled: items.filter((r) => r.payment?.status === "cancelled").length,
    };
  }, [items]);

  if (loading) return <p className="text-center py-20 text-on-surface-variant">Memuat pesanan...</p>;
  if (error) return <p className="text-center py-20 text-error">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <Topbar
        title="Monitor Pesanan"
        subtitle={`Real-time booking activity. Last updated ${lastUpdated.toLocaleTimeString("id-ID")}`}
        action={
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-xs rounded-md flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-success/10 text-success"
                : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {autoRefresh ? "online_prediction" : "pause"}
            </span>
            {autoRefresh ? "Auto-refresh ON" : "Paused"}
          </button>
        }
      />

      {/* Filter chips + search — single row */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => {
            const count = counts[f.value];
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`px-3.5 py-2 text-sm rounded-md flex items-center gap-1.5 font-medium transition ${
                  active
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
                {f.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    active
                      ? "bg-secondary text-on-secondary"
                      : "bg-on-surface-variant/20 text-on-surface"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari by ID / user / kamar..."
            className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-md text-sm"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3 text-outline-variant">
              inbox
            </span>
            Tidak ada pesanan untuk filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left">
                <tr className="text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Tamu</th>
                  <th className="px-6 py-4 font-semibold">Kamar</th>
                  <th className="px-6 py-4 font-semibold">Check-in / Out</th>
                  <th className="px-6 py-4 font-semibold text-center">Malam</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const status = r.payment?.status ?? "unpaid";
                  const isLive =
                    new Date(r.start_date) <= new Date() &&
                    new Date(r.end_date) >= new Date();
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-outline-variant/50 hover:bg-surface-container-low/60 align-top transition-colors"
                    >
                      <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">
                        #{r.id}
                        {isLive && status === "paid" && (
                          <span className="ml-2 inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="font-medium text-left text-secondary hover:underline"
                        >
                          {r.user?.name ?? "-"}
                        </button>
                        <div className="text-xs text-on-surface-variant mt-0.5">{r.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="text-left text-secondary hover:underline"
                        >
                          {r.room?.name ?? "-"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <div>{formatDate(r.start_date)}</div>
                        <div className="text-on-surface-variant mt-0.5">→ {formatDate(r.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">{nights(r.start_date, r.end_date)}</td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap text-right">
                        {formatIDR(r.price)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(r, e.target.value)}
                          disabled={actingId === r.id}
                          className={`text-xs border rounded-md px-2.5 py-1 font-medium disabled:opacity-50 ${
                            status === "paid"
                              ? "border-success text-success bg-success/5"
                              : status === "cancelled"
                              ? "border-error text-error bg-error/5"
                              : "border-warning text-warning bg-warning/5"
                          }`}
                        >
                          <option value="unpaid">unpaid</option>
                          <option value="paid">paid</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(r)}
                          disabled={actingId === r.id}
                          className="px-3 py-1.5 text-xs bg-error text-on-error rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReservationDetailModal reservation={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
