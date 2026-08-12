"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { useAuth } from "@/lib/auth-context";
import { savedHotelsApi } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import type { Room } from "@/lib/api";

const Card = ({ room }: { room: Room }) => {
  const imageSrc =
    room.image?.startsWith("http") || room.image?.startsWith("/")
      ? room.image
      : (room.images?.[0] ?? "/hero.jpg");
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    savedHotelsApi
      .list()
      .then(({ data }) => setSaved(data.includes(room.id)))
      .catch(() => undefined);
  }, [user, room.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/signin";
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await savedHotelsApi.remove(room.id);
        setSaved(false);
      } else {
        await savedHotelsApi.add(room.id);
        setSaved(true);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Pick 2 amenities to display as chips
  const topAmenities = room.amenities?.slice(0, 2) ?? [];

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageSrc}
          width={384}
          height={208}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Rating badge top-right (on image) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest rounded-md shadow-sm">
          <span className="material-symbols-outlined text-secondary text-[16px] fill">
            star
          </span>
          <span className="text-sm font-semibold text-on-surface">4.9</span>
        </div>

        {/* Save button top-left */}
        <button
          type="button"
          onClick={toggleSave}
          disabled={busy}
          aria-label={saved ? "Unsave" : "Save"}
          className="absolute top-3 left-3 p-2 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest shadow-sm disabled:opacity-50 transition z-10"
        >
          <span
            className={`material-symbols-outlined text-secondary text-[18px] ${
              saved ? "fill" : ""
            }`}
          >
            favorite
          </span>
        </button>
      </div>

      <div
        className="flex flex-col"
        style={{ padding: "2rem", gap: "1.25rem" }}
      >
        {/* Title row with rating (matching screenshot layout) */}
        <h3 className="font-display text-xl font-semibold text-on-surface leading-snug">
          {room.name}
        </h3>

        {/* Location with pin icon */}
        {room.province && (
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <IoLocationOutline className="text-base flex-shrink-0" />
            <span>
              {room.city ? `${room.city}, ` : ""}
              {room.province}
            </span>
          </div>
        )}

        {/* Amenity chips */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topAmenities.map((a) => (
              <span
                key={a.id}
                className="px-3 py-1.5 text-xs font-medium bg-on-surface text-surface-container-lowest rounded-md"
              >
                {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Spacer + Divider + Price block */}
        <div className="border-t border-outline-variant pt-6 mt-auto">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-on-surface-variant mb-1.5">Starting from</p>
              <p className="font-display text-3xl font-bold text-on-surface">
                {formatIDR(room.price)}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">/night</p>
            </div>
            <Link
              href={`/room/${room.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-secondary text-secondary rounded-md text-sm font-medium hover:bg-secondary hover:text-on-secondary transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
