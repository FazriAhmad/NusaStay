"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { reservationsApi, type Reservation } from "@/lib/api";
import { formatDate, formatIDR, nights } from "@/lib/format";

export default function BookingSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationsApi
      .get(parseInt(id))
      .then(({ data }) => setReservation(data))
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p className="text-center py-32 text-on-surface-variant">Memuat...</p>;
  if (!reservation) return null;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile py-xl pt-24">
      <div className="max-w-[28rem] w-full text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-success fill text-5xl">check_circle</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-on-surface-variant mb-6">
          Reservasi #{reservation.id} untuk {reservation.room?.name} sudah dikonfirmasi.
        </p>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-left mb-6">
          <h2 className="font-semibold text-on-surface mb-3">Rincian Pemesanan</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Kamar</span>
              <span className="font-medium">{reservation.room?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Check-in</span>
              <span className="font-medium">{formatDate(reservation.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Check-out</span>
              <span className="font-medium">{formatDate(reservation.end_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Total malam</span>
              <span className="font-medium">{nights(reservation.start_date, reservation.end_date)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant">
              <span className="font-semibold">Total bayar</span>
              <span className="font-bold text-secondary">{formatIDR(reservation.price)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant mb-6">
          Konfirmasi telah dikirim ke email Anda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/myreservation"
            className="px-6 py-3 bg-secondary text-on-secondary rounded-lg font-medium hover:opacity-90"
          >
            Lihat Reservasi Saya
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-surface-container-low text-on-surface rounded-lg font-medium hover:bg-surface-container"
          >
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
