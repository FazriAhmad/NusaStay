"use client";

import Link from "next/link";
import { type Room } from "@/lib/api";
import Card from "./card";

type Props = {
  rooms: Room[];
  provinceFilter: string;
};

const Main = ({ rooms, provinceFilter }: Props) => {
  const visibleRooms = provinceFilter
    ? rooms.filter((r) => r.province === provinceFilter)
    : rooms;

  return (
    <div className="bg-surface">
      {/* Handpicked for You */}
      <section
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop"
        style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
      >
        {/* Section header with action button (matches Popular Destinations style) */}
        <div
          className="flex items-end justify-between flex-wrap"
          style={{ marginBottom: "3rem" }}
        >
          <div>
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-on-surface"
              style={{ marginBottom: "0.75rem" }}
            >
              Handpicked for You
            </h2>
            <p className="text-on-surface-variant max-w-[36rem]">
              Curated stays offering exceptional comfort and service.
            </p>
          </div>
          <Link
            href={provinceFilter ? "/" : "#"}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-secondary text-sm font-semibold hover:bg-secondary-container rounded-md transition whitespace-nowrap"
          >
            {provinceFilter ? (
              <>
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Lihat semua destinasi
              </>
            ) : (
              <>
                View all
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </Link>
        </div>

        {provinceFilter && (
          <div
            className="text-sm text-on-surface-variant"
            style={{ marginBottom: "3rem" }}
          >
            Menampilkan {visibleRooms.length} kamar di{" "}
            <strong className="text-on-surface">{provinceFilter}</strong>.
          </div>
        )}

        {visibleRooms.length === 0 ? (
          <p className="text-center text-on-surface-variant py-3xl">
            {provinceFilter
              ? `Tidak ada kamar di ${provinceFilter}. Coba provinsi lain.`
              : "Belum ada kamar tersedia."}
          </p>
        ) : (
          <div
            className="grid md:grid-cols-3"
            style={{ gap: "3rem" }}
          >
            {visibleRooms.slice(0, 6).map((room) => (
              <Card key={room.id} room={room} />
            ))}
          </div>
        )}

        {visibleRooms.length > 6 && !provinceFilter && (
          <div
            className="flex justify-center"
            style={{ marginTop: "4rem" }}
          >
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 border border-on-surface text-on-surface rounded-md text-sm font-medium hover:bg-on-surface hover:text-surface-container-lowest transition"
            >
              Load More Hotels
              <span className="material-symbols-outlined text-base">expand_more</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Main;
