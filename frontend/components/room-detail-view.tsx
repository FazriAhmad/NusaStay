"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { type Room } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatIDR, nights } from "@/lib/format";

const FALLBACK_IMAGES = [
  "/hero.jpg",
  "/hero.jpeg",
  "/about-image.jpg",
  "/beijing.png",
];

function buildImages(room: { image: string; images?: string[] | null }): string[] {
  if (room.images && room.images.length > 0) return room.images;
  const main =
    room.image?.startsWith("/") || room.image?.startsWith("http")
      ? room.image
      : "/hero.jpg";
  return [main, ...FALLBACK_IMAGES].slice(0, 5);
}

type Props = {
  room: Room | null;
  related: Room[];
  initialStart: string;
  initialEnd: string;
  initialGuests: number;
};

export default function RoomDetailView({
  room,
  related,
  initialStart,
  initialEnd,
  initialGuests,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [guests, setGuests] = useState(initialGuests);

  if (!room) {
    return (
      <p className="text-center py-32 text-error pt-32">Error: Kamar tidak ditemukan.</p>
    );
  }

  const images = buildImages(room);
  const heroImage = images[0];
  const totalNights = nights(startDate, endDate);
  const subtotal = room.price * totalNights;
  const serviceFee = Math.round(subtotal * 0.04);
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee + taxes;
  const today = new Date().toISOString().split("T")[0];

  const handleBook = (e: FormEvent) => {
    e.preventDefault();
    if (new Date(endDate) <= new Date(startDate)) {
      alert("Check-out harus setelah check-in");
      return;
    }
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      guests: String(guests),
    });
    const checkoutUrl = `/checkout/${room.id}?${params.toString()}`;
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }
    router.push(checkoutUrl);
  };

  return (
    <div className="bg-surface-container-lowest">
      {/* HERO — full-bleed image with breadcrumb + actions floating on top */}
      <section className="relative bg-on-surface">
        <div className="relative h-[520px] w-full">
          <Image
            src={heroImage}
            alt={room.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-primary/40" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pb-6">
            <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
              <nav className="flex items-center gap-2 text-on-primary/90 text-sm">
                <Link href="/" className="hover:text-on-primary transition">
                  Hotels
                </Link>
                <span>›</span>
                {room.province && (
                  <>
                    <Link
                      href={`/?province=${encodeURIComponent(room.province)}`}
                      className="hover:text-on-primary transition"
                    >
                      {room.province}
                    </Link>
                    <span>›</span>
                  </>
                )}
                <span className="text-on-primary font-medium">{room.name}</span>
              </nav>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2.5 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface transition"
                  aria-label="Share"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface transition"
                  aria-label="Save"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TITLE + RATING strip below hero */}
      <div className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-3">
            {room.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-[18px] fill">star</span>
              <span className="font-semibold text-on-surface">4.9</span>
              <span>(128 reviews)</span>
            </div>
            <span className="text-outline">·</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>
                {room.city ? `${room.city}, ` : ""}
                {room.province ?? "Indonesia"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT — 2-col: about + booking card */}
      <section className="bg-surface-container-lowest">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 lg:py-16">
          <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Tentang */}
              <section>
                <h2 className="font-display text-2xl font-semibold text-on-surface mb-5">
                  Tentang Kamar Ini
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-10">
                  {room.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-7 border-y border-outline-variant">
                  <Stat icon="square_foot" label="120 m²" />
                  <Stat icon="bed" label="1 King Bed" />
                  <Stat icon="group" label={`${room.capacity} Tamu`} />
                  <Stat icon="pool" label="Private Pool" />
                </div>
              </section>

              {/* Fasilitas Unggulan */}
              {room.amenities && room.amenities.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-on-surface mb-5">
                    Fasilitas Unggulan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.amenities.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-lg"
                      >
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          {iconForAmenity(a.name)}
                        </span>
                        <span className="text-sm text-on-surface">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Booking card (sticky) */}
            <aside className="lg:col-span-1">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-28 space-y-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold text-on-surface">
                      {formatIDR(room.price)}
                    </span>
                    <span className="text-on-surface-variant text-sm">/malam</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="material-symbols-outlined text-secondary text-[16px] fill">
                      star
                    </span>
                    <span className="font-semibold text-on-surface">4.9</span>
                  </div>
                </div>

                <form onSubmit={handleBook} className="space-y-4">
                  <div className="grid grid-cols-2 border border-outline-variant rounded-lg overflow-hidden divide-x divide-outline-variant">
                    <label className="block p-3.5 cursor-pointer">
                      <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                        Check-in
                      </p>
                      <input
                        type="date"
                        required
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium mt-1"
                      />
                    </label>
                    <label className="block p-3.5 cursor-pointer">
                      <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                        Check-out
                      </p>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium mt-1"
                      />
                    </label>
                  </div>
                  <label className="block border border-outline-variant rounded-lg p-3.5 cursor-pointer">
                    <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                      Tamu
                    </p>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full bg-transparent outline-none text-sm font-medium mt-1"
                    >
                      <option value={1}>1 Dewasa</option>
                      <option value={2}>2 Dewasa, 1 Anak</option>
                      <option value={3}>3 Dewasa, 1 Anak</option>
                      <option value={4}>4 Dewasa, 2 Anak</option>
                    </select>
                  </label>

                  <div className="space-y-2.5 text-sm pt-2">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>
                        {formatIDR(room.price)} × {totalNights} malam
                      </span>
                      <span className="text-on-surface">{formatIDR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Biaya layanan</span>
                      <span className="text-on-surface">{formatIDR(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Pajak</span>
                      <span className="text-on-surface">{formatIDR(taxes)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 mt-1 border-t border-outline-variant">
                      <span className="text-on-surface">Total</span>
                      <span className="text-secondary">{formatIDR(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition mt-2"
                  >
                    {user ? "Reservasi Sekarang" : "Sign in untuk pesan"}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant pt-1">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    <span>Pembayaran Aman & Terenkripsi</span>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Pilihan Kamar Lainnya */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-3">
              Pilihan Kamar Lainnya
            </h2>
            <p className="text-on-surface-variant max-w-[42rem] mx-auto">
              Jelajahi koleksi kamar dan suite eksklusif kami lainnya untuk pengalaman yang tak
              terlupakan.
            </p>
          </div>

          {related.length === 0 ? (
            <p className="text-center text-on-surface-variant py-12">
              Belum ada kamar lain untuk ditampilkan.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => {
                const imageSrc =
                  r.image?.startsWith("/") || r.image?.startsWith("http")
                    ? r.image
                    : (r.images?.[0] ?? "/hero.jpg");
                return (
                  <Link
                    key={r.id}
                    href={`/room/${r.id}`}
                    className="group bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={r.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {i === 0 && (
                        <span className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase">
                          Terpopuler
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-on-surface">{r.name}</h3>
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <span className="material-symbols-outlined text-secondary text-[16px] fill">
                            star
                          </span>
                          <span className="text-on-surface font-semibold">4.9</span>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                        <div>
                          <span className="text-secondary font-semibold text-lg">
                            {formatIDR(r.price)}
                          </span>
                          <span className="text-on-surface-variant text-sm"> /night</span>
                        </div>
                        <span className="text-sm text-secondary font-medium">
                          Detail →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <span className="material-symbols-outlined text-secondary text-2xl">{icon}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
    </div>
  );
}

function iconForAmenity(name: string): string {
  const map: Record<string, string> = {
    "Wi-Fi": "wifi",
    AC: "ac_unit",
    TV: "tv",
    Breakfast: "restaurant",
    "Mini Bar": "local_bar",
    Bathtub: "bathtub",
    "Sea View": "beach_access",
    "Pool Access": "pool",
    Gym: "fitness_center",
    Spa: "spa",
    Parking: "local_parking",
  };
  return map[name] ?? "check_circle";
}
