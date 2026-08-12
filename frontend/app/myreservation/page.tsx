"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { reservationsApi, type Reservation } from "@/lib/api";
import { formatDate, formatIDR, nights } from "@/lib/format";

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    reservationsApi
      .list()
      .then(({ data }) => setItems(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <p className="text-center py-32 text-on-surface-variant">Memuat...</p>;
  }
  if (error) return <p className="text-center py-32 text-error">Error: {error}</p>;

  const active = items.filter(
    (r) => new Date(r.end_date) >= new Date() && r.payment?.status !== "cancelled"
  );
  const past = items.filter(
    (r) => new Date(r.end_date) < new Date() || r.payment?.status === "cancelled"
  );

  return (
    <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-xl pt-24">
      <h1 className="font-display text-4xl font-bold text-on-surface mb-2">My Bookings</h1>
      <p className="text-on-surface-variant mb-md">
        Hi {user?.name}, you have {active.length} active and {past.length} past bookings.
      </p>

      {items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-3 block">
            calendar_month
          </span>
          <p className="text-on-surface-variant mb-4">Belum ada booking.</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-secondary text-on-secondary rounded-lg font-medium"
          >
            Cari Kamar
          </Link>
        </div>
      ) : (
        <div className="space-y-lg">
          {active.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold mb-md">Active Bookings</h2>
              <div className="space-y-md">
                {active.map((r) => (
                  <BookingCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold mb-md">Past Stays</h2>
              <div className="space-y-md">
                {past.map((r) => (
                  <BookingCard key={r.id} reservation={r} dim />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const BookingCard = ({ reservation, dim }: { reservation: Reservation; dim?: boolean }) => {
  const imageSrc =
    reservation.room?.image?.startsWith("/") || reservation.room?.image?.startsWith("http")
      ? reservation.room.image
      : "/hero.jpg";
  const status = reservation.payment?.status ?? "unpaid";

  return (
    <Link
      href={`/booking/${reservation.id}`}
      className={`flex items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition ${
        dim ? "opacity-70" : ""
      }`}
    >
      <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={imageSrc} alt={reservation.room?.name ?? "Room"} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-on-surface truncate">{reservation.room?.name}</h3>
        <p className="text-sm text-on-surface-variant">
          {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)} ·{" "}
          {nights(reservation.start_date, reservation.end_date)} malam
        </p>
        <p className="text-sm text-on-surface-variant">
          Tamu: {reservation.user?.name}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${
            status === "paid"
              ? "bg-success/10 text-success"
              : status === "cancelled"
              ? "bg-error/10 text-error"
              : "bg-warning/10 text-warning"
          }`}
        >
          {status}
        </span>
        <p className="font-semibold text-on-surface">{formatIDR(reservation.price)}</p>
      </div>
    </Link>
  );
};
