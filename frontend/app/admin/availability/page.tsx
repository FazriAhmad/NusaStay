"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/admin/topbar";
import { roomsApi, type RoomAvailability } from "@/lib/api";
import { formatIDR } from "@/lib/format";

const INDONESIA_PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Bengkulu", "Sumatera Selatan", "Bangka Belitung", "Lampung",
  "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat",
];

const statusMap: Record<RoomAvailability["status"], { label: string; color: string; icon: string }> = {
  available: { label: "Tersedia", color: "bg-success/10 text-success", icon: "check_circle" },
  medium: { label: "Sedang", color: "bg-warning/10 text-warning", icon: "pending" },
  high: { label: "Penuh", color: "bg-error/10 text-error", icon: "trending_up" },
};

export default function AdminAvailabilityPage() {
  const [items, setItems] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RoomAvailability["status"]>("all");
  const [provinceFilter, setProvinceFilter] = useState<string>("");

  useEffect(() => {
    roomsApi
      .availability()
      .then(({ data }) => setItems(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const provinces = useMemo(() => {
    const set = new Set<string>();
    items.forEach((r) => r.province && set.add(r.province));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (provinceFilter && r.province !== provinceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !(r.province ?? "").toLowerCase().includes(q) &&
          !(r.city ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, statusFilter, provinceFilter, search]);

  const summary = useMemo(() => {
    return {
      available: items.filter((r) => r.status === "available").length,
      medium: items.filter((r) => r.status === "medium").length,
      high: items.filter((r) => r.status === "high").length,
      provinces: provinces.length,
    };
  }, [items, provinces]);

  if (loading) return <p className="text-center py-20 text-on-surface-variant">Memuat...</p>;
  if (error) return <p className="text-center py-20 text-error">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <Topbar
        title="Kamar Tersedia"
        subtitle="Monitor occupancy dan status setiap kamar di seluruh Indonesia"
      />

      {/* Summary cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-success/10 border border-success/30 rounded-2xl p-6">
          <span className="material-symbols-outlined text-success text-3xl mb-3 block">
            check_circle
          </span>
          <p className="text-2xl md:text-3xl font-bold text-on-surface">{summary.available}</p>
          <p className="text-on-surface-variant text-sm mt-1.5">Tersedia</p>
        </div>
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6">
          <span className="material-symbols-outlined text-warning text-3xl mb-3 block">pending</span>
          <p className="text-2xl md:text-3xl font-bold text-on-surface">{summary.medium}</p>
          <p className="text-on-surface-variant text-sm mt-1.5">Sedang Terisi</p>
        </div>
        <div className="bg-error/10 border border-error/30 rounded-2xl p-6">
          <span className="material-symbols-outlined text-error text-3xl mb-3 block">trending_up</span>
          <p className="text-2xl md:text-3xl font-bold text-on-surface">{summary.high}</p>
          <p className="text-on-surface-variant text-sm mt-1.5">Penuh</p>
        </div>
        <div className="bg-secondary-container border border-secondary/30 rounded-2xl p-6">
          <span className="material-symbols-outlined text-on-secondary-container text-3xl mb-3 block">
            public
          </span>
          <p className="text-2xl md:text-3xl font-bold text-on-surface">{summary.provinces}</p>
          <p className="text-on-surface-variant text-sm mt-1.5">Provinsi Aktif</p>
        </div>
      </section>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / kota..."
            className="w-full pl-10 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-md text-sm"
          />
        </div>
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm"
        >
          <option value="">Semua Provinsi</option>
          {INDONESIA_PROVINCES.filter((p) => provinces.includes(p)).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          {(["all", "available", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-md font-medium capitalize ${
                statusFilter === s
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {s === "all" ? "All" : statusMap[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Room grid */}
      {filtered.length === 0 ? (
        <p className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
          Tidak ada kamar yang sesuai filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((room) => {
            const s = statusMap[room.status];
            const imageSrc = room.image?.startsWith("/") || room.image?.startsWith("http") ? room.image : "/hero.jpg";
            return (
              <div
                key={room.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-44">
                  <Image
                    src={imageSrc}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm ${s.color}`}
                  >
                    <span className="material-symbols-outlined text-[12px] fill">{s.icon}</span>
                    {s.label}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-on-surface truncate">{room.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-1">
                    {room.city ?? "—"}, {room.province ?? ""}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant/50">
                    <span className="text-sm text-secondary font-semibold">
                      {formatIDR(room.price)}
                      <span className="text-on-surface-variant text-xs font-normal"> /night</span>
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {room.total_bookings} booking
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-on-surface-variant text-sm mt-8">
        💡 Tip: gunakan filter provinsi untuk fokus ke region tertentu.{" "}
        <Link href="/admin/room" className="text-secondary hover:underline">
          Manage Rooms →
        </Link>
      </p>
    </div>
  );
}
