"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProvinceInfo } from "@/lib/api";

type ProvinceData = { province?: string; name?: string; count?: number; rooms_count?: number };

const FALLBACK = [
  { name: "Bali, Indonesia", image: "/about-image.jpg", count: 0, region: "INDONESIA" },
  { name: "Jakarta, Indonesia", image: "/hero.jpg", count: 0, region: "INDONESIA" },
  { name: "Yogyakarta, Indonesia", image: "/beijing.png", count: 0, region: "INDONESIA" },
  { name: "Bandung, Indonesia", image: "/hero.jpeg", count: 0, region: "INDONESIA" },
  { name: "Surabaya, Indonesia", image: "/about-image.jpg", count: 0, region: "INDONESIA" },
];

const REGION_MAP: Record<string, string> = {
  "DKI Jakarta": "INDONESIA",
  "Jawa Barat": "INDONESIA",
  "Jawa Timur": "INDONESIA",
  "DI Yogyakarta": "INDONESIA",
  "Bali": "INDONESIA",
  "Nusa Tenggara Barat": "INDONESIA",
};

export default function PopularDestinations({ provinces }: { provinces: ProvinceInfo[] }) {
  const [showAll, setShowAll] = useState(false);

  const dataMap = new Map<string, { name: string; image: string; count: number; region: string }>();

  for (const p of provinces) {
    const rooms = p.rooms_count ?? 0;
    const image = p.province === "Bali"
      ? "/about-image.jpg"
      : p.province === "DKI Jakarta"
      ? "/hero.jpg"
      : p.province === "Jawa Barat"
      ? "/hero.jpeg"
      : p.province === "DI Yogyakarta"
      ? "/beijing.png"
      : p.province === "Jawa Timur"
      ? "/about-image.jpg"
      : p.province === "Jawa Tengah"
      ? "/beijing.png"
      : "/beijing.png";
    dataMap.set(p.province, {
      name: p.province,
      image,
      count: rooms,
      region: REGION_MAP[p.province] ?? "INDONESIA",
    });
  }

  const list = dataMap.size > 0 ? Array.from(dataMap.values()) : FALLBACK;
  const heroDest = list[0] ?? FALLBACK[0];
  const otherDests = list.slice(1, 5);

  return (
    <section
      className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop"
      style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
    >
      {/* Section header */}
      <div
        className="flex items-end justify-between flex-wrap"
        style={{ marginBottom: "3rem" }}
      >
        <div>
          <p
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ marginBottom: "1rem" }}
          >
            DISCOVER
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-on-surface"
            style={{ marginBottom: "0.75rem" }}
          >
            Popular destinations
          </h2>
          <p className="text-on-surface-variant max-w-[36rem]">
            Explore top-rated locations for your next getaway
          </p>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-secondary text-sm font-semibold hover:bg-secondary-container rounded-md transition whitespace-nowrap"
        >
          View all
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>

      {/* Mosaic: 1 large (2x2) + 4 small with bigger gap */}
      <div
        className="grid grid-cols-1 md:grid-cols-4"
        style={{ gap: "2rem" }}
      >
        {/* Hero tile: 2 cols × 2 rows, taller */}
        <Link
          href={`/?province=${encodeURIComponent(heroDest.name)}`}
          className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group"
          style={{ height: "580px" }}
        >
          <Image
            src={heroDest.image}
            alt={heroDest.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
          <div
            className="absolute left-0 right-0 text-on-primary"
            style={{ bottom: "2rem", paddingLeft: "2rem", paddingRight: "2rem" }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.2em] opacity-90 font-semibold"
              style={{ marginBottom: "0.5rem" }}
            >
              {heroDest.region}
            </p>
            <h3
              className="font-display text-3xl md:text-4xl font-bold"
              style={{ marginBottom: "0.5rem" }}
            >
              {heroDest.name}
            </h3>
            <p
              className="text-sm opacity-90"
              style={{ marginBottom: "1.25rem" }}
            >
              {heroDest.count}+ properties
            </p>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-on-secondary rounded-md text-sm font-medium">
              <span className="material-symbols-outlined text-base">explore</span>
              Explore
            </span>
          </div>
        </Link>

        {/* Small tiles: 1 col each, shorter */}
        {otherDests.map((dest) => (
          <Link
            key={dest.name}
            href={`/?province=${encodeURIComponent(dest.name)}`}
            className="relative rounded-2xl overflow-hidden group"
            style={{ height: "280px" }}
          >
            <Image
              src={dest.image}
              alt={dest.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
            <div
              className="absolute left-0 right-0 text-on-primary"
              style={{ bottom: "1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.2em] opacity-90 font-semibold"
                style={{ marginBottom: "0.25rem" }}
              >
                {dest.region}
              </p>
              <h3 className="font-display text-lg font-semibold">{dest.name}</h3>
              <p
                className="text-xs opacity-80"
                style={{ marginTop: "0.25rem" }}
              >
                {dest.count}+ properties
              </p>
            </div>
          </Link>
        ))}
      </div>

      {list.length > 5 && showAll && (
        <div className="text-center" style={{ marginTop: "3rem" }}>
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-on-surface-variant text-sm font-medium hover:text-secondary transition"
          >
            Tampilkan lebih sedikit
          </button>
        </div>
      )}
    </section>
  );
}
