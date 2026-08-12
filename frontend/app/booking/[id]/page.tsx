"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { reservationsApi, type Reservation } from "@/lib/api";
import { formatDate, formatDateTime, formatIDR, nights } from "@/lib/format";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    reservationsApi
      .get(parseInt(id))
      .then(({ data }) => setReservation(data))
      .catch(() => router.replace("/myreservation"))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return <p className="text-center py-32 text-on-surface-variant">Memuat...</p>;
  }
  if (!reservation) return null;

  const imageSrc =
    reservation.room?.image?.startsWith("/") || reservation.room?.image?.startsWith("http")
      ? reservation.room.image
      : "/hero.jpg";
  const status = reservation.payment?.status ?? "unpaid";

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan reservasi ini?")) return;
    setCancelling(true);
    try {
      await reservationsApi.remove(reservation.id);
      router.push("/myreservation");
    } catch (err) {
      alert((err as Error).message);
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-xl pt-24">
      <Link
        href="/myreservation"
        className="inline-flex items-center gap-1 text-secondary text-sm font-medium mb-4 hover:underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Kembali ke My Bookings
      </Link>

      <div className="grid lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2 space-y-md">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="relative h-64">
              <Image
                src={imageSrc}
                alt={reservation.room?.name ?? "Room"}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-md">
              <p className="text-xs text-on-surface-variant uppercase">Luxe Stay</p>
              <h1 className="font-display text-3xl font-bold text-on-surface">
                {reservation.room?.name}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {reservation.room?.price ? formatIDR(reservation.room.price) : ""}/night
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === "paid"
                      ? "bg-success/10 text-success"
                      : status === "cancelled"
                      ? "bg-error/10 text-error"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
            <h2 className="text-lg font-semibold mb-3">Rincian Menginap</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-on-surface-variant uppercase">Check-in</p>
                <p className="font-semibold text-on-surface">{formatDate(reservation.start_date)}</p>
                <p className="text-xs text-on-surface-variant">From 3:00 PM</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase">Malam</p>
                <p className="font-semibold text-on-surface">
                  {nights(reservation.start_date, reservation.end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase">Check-out</p>
                <p className="font-semibold text-on-surface">{formatDate(reservation.end_date)}</p>
                <p className="text-xs text-on-surface-variant">Until 11:00 AM</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
            <h2 className="text-lg font-semibold mb-3">Tamu</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium">{reservation.user?.name}</p>
              <p className="text-on-surface-variant">{reservation.user?.email}</p>
              <p className="text-on-surface-variant">{reservation.user?.phone ?? "-"}</p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md sticky top-24">
            <h2 className="text-lg font-semibold mb-3">Ringkasan Pembayaran</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatIDR(reservation.price)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-outline-variant">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-secondary text-lg">
                  {formatIDR(reservation.price)}
                </span>
              </div>
              {reservation.payment?.method && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Metode</span>
                  <span>{reservation.payment.method}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              Dipesan {formatDateTime(reservation.created_at)}
            </p>
            {status !== "cancelled" && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-4 py-2.5 bg-error/10 text-error rounded-lg font-medium hover:bg-error/20 disabled:opacity-50"
              >
                {cancelling ? "Membatalkan..." : "Batalkan Reservasi"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
