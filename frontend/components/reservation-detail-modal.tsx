"use client";

import type { Reservation } from "@/lib/api";
import { formatIDR, formatDate, formatDateTime, nights } from "@/lib/format";

type Props = {
  reservation: Reservation | null;
  onClose: () => void;
};

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded text-xs font-medium ${map[status ?? "unpaid"] ?? "bg-gray-100"}`}>
      {status ?? "unpaid"}
    </span>
  );
}

export default function ReservationDetailModal({ reservation, onClose }: Props) {
  if (!reservation) return null;

  const total = reservation.price;
  const subtotal = reservation.room?.price
    ? reservation.room.price * nights(reservation.start_date, reservation.end_date)
    : total;

  return (
    <div
      className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm shadow-lg w-full max-w-[42rem] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Detail Reservasi #{reservation.id}</h2>
            <p className="text-sm text-gray-500 mt-1">Dibuat {formatDateTime(reservation.created_at)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Guest info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tamu</h3>
            <div className="bg-gray-50 p-4 rounded-sm">
              <p className="font-medium">{reservation.user?.name}</p>
              <p className="text-sm text-gray-600">{reservation.user?.email}</p>
              <p className="text-sm text-gray-600">{reservation.user?.phone ?? "-"}</p>
            </div>
          </section>

          {/* Room info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Kamar</h3>
            <div className="bg-gray-50 p-4 rounded-sm">
              <p className="font-medium">{reservation.room?.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatIDR(reservation.room?.price ?? 0)}/malam
              </p>
            </div>
          </section>

          {/* Schedule */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Jadwal</h3>
            <div className="bg-gray-50 p-4 rounded-sm grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="font-semibold">{formatDate(reservation.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Malam</p>
                <p className="font-semibold">{nights(reservation.start_date, reservation.end_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p className="font-semibold">{formatDate(reservation.end_date)}</p>
              </div>
            </div>
          </section>

          {/* Price breakdown */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pembayaran</h3>
            <div className="bg-gray-50 p-4 rounded-sm space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span>Status</span>
                <StatusBadge status={reservation.payment?.status} />
              </div>
              {reservation.payment?.method && (
                <div className="flex justify-between">
                  <span>Metode</span>
                  <span className="font-medium">{reservation.payment.method}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
