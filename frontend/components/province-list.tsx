"use client";

import Link from "next/link";
import { useState } from "react";

type ProvinceData = { province?: string; name?: string; count?: number; rooms_count?: number };
type Props = {
  provinces: ProvinceData[];
  active: string;
};

const ALL_PROVINCES = [
  "DKI Jakarta", "Bali", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "DI Yogyakarta", "Banten", "Sumatera Utara", "Sumatera Selatan", "Lampung",
  "Riau", "Kalimantan Timur", "Sulawesi Selatan", "Nusa Tenggara Barat",
  "Papua",
];

export default function ProvinceList({ provinces, active }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Merge seed list with actual API provinces
  const dataMap = new Map<string, number>();
  provinces.forEach((p) => {
    const name = p.province ?? p.name ?? "";
    const count = p.rooms_count ?? p.count ?? 0;
    if (name) dataMap.set(name, count);
  });
  ALL_PROVINCES.forEach((p) => {
    if (!dataMap.has(p)) dataMap.set(p, 0);
  });

  const list = Array.from(dataMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const visible = showAll ? list : list.slice(0, 10);

  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex items-end justify-between mb-md">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Jelajahi Indonesia
          </h2>
          <p className="text-on-surface-variant mt-1">
            Rekomendasi hotel di seluruh provinsi Indonesia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-md">
        {visible.map((p) => {
          const isActive = active === p.name;
          return (
            <Link
              key={p.name}
              href={isActive ? "/" : `/?province=${encodeURIComponent(p.name)}`}
              className={`group relative rounded-xl overflow-hidden border p-md transition h-28 flex flex-col justify-end ${
                isActive
                  ? "border-secondary bg-secondary-container"
                  : "border-outline-variant bg-surface-container-lowest hover:border-secondary hover:shadow-md"
              }`}
            >
              <span
                className={`material-symbols-outlined absolute top-3 right-3 text-2xl ${
                  isActive ? "text-on-secondary-container" : "text-secondary"
                }`}
              >
                location_on
              </span>
              <p
                className={`font-semibold ${isActive ? "text-on-secondary-container" : "text-on-surface"}`}
              >
                {p.name}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  isActive ? "text-on-secondary-container/80" : "text-on-surface-variant"
                }`}
              >
                {p.count} {p.count === 1 ? "property" : "properties"}
              </p>
              {isActive && (
                <span className="absolute bottom-3 right-3 material-symbols-outlined text-on-secondary-container text-lg">
                  close
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {list.length > 10 && (
        <div className="text-center mt-md">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-secondary text-sm font-medium hover:underline"
          >
            {showAll ? "Tampilkan lebih sedikit" : `Lihat semua ${list.length} provinsi →`}
          </button>
        </div>
      )}
    </section>
  );
}
