"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ReservationDetailModal from "@/components/reservation-detail-modal";
import Topbar from "@/components/admin/topbar";
import Pagination from "@/components/admin/pagination";
import { reservationsApi, type Reservation, type PaginationMeta } from "@/lib/api";
import { formatIDR, formatDate, nights } from "@/lib/format";

type Filter = "all" | "paid" | "unpaid" | "cancelled";

const filters: { value: Filter; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "view_list" },
  { value: "paid", label: "Paid", icon: "check_circle" },
  { value: "unpaid", label: "Unpaid", icon: "pending" },
  { value: "cancelled", label: "Cancelled", icon: "cancel" },
];

const PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Reservation | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    reservationsApi
      .list({ page, per_page: perPage })
      .then(({ data, meta }) => {
        setItems(data);
        setMeta(meta);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when filter changes (avoid empty page)
  useEffect(() => {
    setPage(1);
  }, [filter, search, perPage]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (filter !== "all" && (r.payment?.status ?? "unpaid") !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.user?.name?.toLowerCase().includes(q) &&
          !r.user?.email?.toLowerCase().includes(q) &&
          !r.room?.name?.toLowerCase().includes(q)
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
    if (!confirm(`Hapus booking ${r.user?.name} - ${r.room?.name}?`)) return;
    setActingId(r.id);
    try {
      await reservationsApi.remove(r.id);
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActingId(null);
    }
  };

  if (loading && items.length === 0) {
    return <p className="text-center py-20 text-on-surface-variant">Memuat booking...</p>;
  }
  if (error) return <p className="text-center py-20 text-error">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <Topbar
        title="Bookings"
        subtitle={`${meta.total} total booking · Halaman ${meta.current_page} dari ${meta.last_page}`}
        action={
          <select
            value={perPage}
            onChange={(e) => setPerPage(parseInt(e.target.value))}
            className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-md text-sm"
            aria-label="Items per page"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        }
      />

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user / kamar..."
            className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-md text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-2 text-sm rounded-md flex items-center gap-1.5 font-medium transition ${
                filter === f.value
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-on-surface-variant">Tidak ada booking yang sesuai filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left">
                <tr className="text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Kamar</th>
                  <th className="px-6 py-4 font-semibold">Check-in</th>
                  <th className="px-6 py-4 font-semibold">Check-out</th>
                  <th className="px-6 py-4 font-semibold text-center">Malam</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-outline-variant/50 hover:bg-surface-container-low/60 align-top transition-colors"
                  >
                    <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">#{r.id}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="font-medium text-left text-secondary hover:underline"
                      >
                        {r.user?.name ?? "-"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <div className="text-xs">{r.user?.email}</div>
                      <div className="text-xs mt-0.5">{r.user?.phone ?? "-"}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(r.start_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(r.end_date)}</td>
                    <td className="px-6 py-4 text-center">{nights(r.start_date, r.end_date)}</td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-right">
                      {formatIDR(r.price)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={r.payment?.status ?? "unpaid"}
                        onChange={(e) => handleStatusChange(r, e.target.value)}
                        disabled={actingId === r.id}
                        className="text-xs border border-outline-variant rounded-md px-2.5 py-1 bg-surface-container-lowest disabled:opacity-50"
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-outline-variant px-6 py-4">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ReservationDetailModal reservation={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
