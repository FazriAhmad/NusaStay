"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/admin/topbar";
import { adminApi, type AdminStats, type Reservation } from "@/lib/api";
import { formatIDR, formatDate, formatDateTime, nights } from "@/lib/format";

type StatTrend = {
  label: string;
  value: number | string;
  icon: string;
  accent: "primary" | "secondary" | "success" | "warning";
  helper?: string;
  helperTone?: "success" | "warning" | "danger" | "neutral";
};

const ACCENT_BG: Record<StatTrend["accent"], string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const HELPER_TONE: Record<NonNullable<StatTrend["helperTone"]>, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-error",
  neutral: "text-on-surface-variant",
};

function StatCard({ stat }: { stat: StatTrend }) {
  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${ACCENT_BG[stat.accent]}`}
        >
          <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
        </div>
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
          {stat.accent}
        </span>
      </div>
      <p className="text-2xl md:text-[28px] font-bold text-on-surface leading-none">
        {stat.value}
      </p>
      <p className="text-sm font-medium text-on-surface-variant mt-2.5">{stat.label}</p>
      {stat.helper && (
        <p
          className={`text-xs mt-3 flex items-center gap-1 ${HELPER_TONE[stat.helperTone ?? "neutral"]}`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {stat.helperTone === "danger" || stat.helperTone === "warning"
              ? "priority_high"
              : "trending_up"}
          </span>
          {stat.helper}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    paid: {
      bg: "bg-success/10",
      text: "text-success",
      icon: "check_circle",
      label: "Paid",
    },
    unpaid: {
      bg: "bg-warning/15",
      text: "text-warning",
      icon: "schedule",
      label: "Pending",
    },
    cancelled: {
      bg: "bg-error/10",
      text: "text-error",
      icon: "cancel",
      label: "Cancelled",
    },
  };
  const s = styles[status] ?? {
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    icon: "help",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className="material-symbols-outlined text-[14px] fill">{s.icon}</span>
      {s.label}
    </span>
  );
}

function ProvinceBar({
  rows,
}: {
  rows: { province: string; count: number }[];
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  const palette = [
    "from-primary to-secondary",
    "from-secondary to-secondary-fixed-dim",
    "from-secondary to-primary",
    "from-primary-container to-secondary",
    "from-secondary-fixed-dim to-primary",
  ];

  return (
    <div className="space-y-5">
      {rows.map((row, idx) => {
        const pct = Math.round((row.count / total) * 100);
        return (
          <div key={row.province} className="group">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium text-on-surface">{row.province}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-on-surface tabular-nums">
                  {row.count}
                </span>
                <span className="text-xs text-on-surface-variant tabular-nums">{pct}%</span>
              </div>
            </div>
            <div className="relative h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                  palette[idx % palette.length]
                } rounded-full transition-all duration-700 ease-out group-hover:brightness-110 dashboard-province-bar`}
                style={{ "--bar-width": `${pct}%` } as React.CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingsTable({ rows }: { rows: Reservation[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant">
        Belum ada booking terbaru.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Guest</th>
              <th className="px-6 py-4 font-semibold">Property</th>
              <th className="px-6 py-4 font-semibold">Check-in / Out</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-outline-variant/50 hover:bg-surface-container-low/60 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0">
                      {r.user?.name?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-on-surface truncate">
                        {r.user?.name ?? "Tamu"}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {r.user?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-on-surface">{r.room?.name ?? "—"}</p>
                  <p className="text-xs text-on-surface-variant">
                    {nights(r.start_date, r.end_date)} malam
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-on-surface whitespace-nowrap">{formatDate(r.start_date)}</p>
                  <p className="text-xs text-on-surface-variant whitespace-nowrap">
                    s/d {formatDate(r.end_date)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.payment?.status ?? "unpaid"} />
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-on-surface whitespace-nowrap">
                    {formatIDR(r.price)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const cards: StatTrend[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Total Kamar",
        value: stats.total_rooms,
        icon: "hotel",
        accent: "primary",
        helper: "+2.4% vs last week",
        helperTone: "success",
      },
      {
        label: "Total Booking",
        value: stats.total_reservations,
        icon: "event_available",
        accent: "secondary",
        helper: "+12.8% vs last month",
        helperTone: "success",
      },
      {
        label: "Check-in Hari Ini",
        value: stats.today_checkins,
        icon: "login",
        accent: "success",
        helper: "12 tamu remaining",
        helperTone: "neutral",
      },
      {
        label: "Pending Payment",
        value: stats.pending_payments,
        icon: "pending_actions",
        accent: "warning",
        helper: "Action required",
        helperTone: "danger",
      },
    ];
  }, [stats]);

  if (loading) {
    return <p className="text-center py-20 text-on-surface-variant">Memuat statistik...</p>;
  }
  if (error) {
    return <p className="text-center py-20 text-error">Error: {error}</p>;
  }
  if (!stats) return null;

  return (
    <div className="space-y-10">
      <Topbar
        title="Dashboard"
        subtitle={`Snapshot of today's operations · updated ${formatDateTime(new Date().toISOString())}`}
      />

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <StatCard key={c.label} stat={c} />
        ))}
      </section>

      {/* Revenue highlight */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="relative overflow-hidden bg-primary text-on-primary rounded-2xl p-7 shadow-sm">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-secondary/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px]">
                payments
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Total Revenue
              </p>
            </div>
            <p className="text-3xl md:text-4xl font-display font-bold leading-none">
              {formatIDR(stats.total_revenue)}
            </p>
            <p className="text-xs opacity-70 mt-3">All time · cumulative</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-success text-[18px] fill">
              trending_up
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Pendapatan Bulan Ini
            </p>
          </div>
          <p className="text-3xl md:text-4xl font-display font-bold text-on-surface leading-none">
            {formatIDR(stats.monthly_revenue)}
          </p>
          <div className="mt-4 h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-secondary rounded-full dashboard-revenue-bar"
              style={
                {
                  "--bar-width": `${
                    stats.total_revenue > 0
                      ? Math.min(100, (stats.monthly_revenue / stats.total_revenue) * 100)
                      : 0
                  }%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Province breakdown */}
        {stats.province_breakdown && stats.province_breakdown.length > 0 && (
          <section className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-on-surface">
                  Distribusi Kamar
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  Sebaran inventory per provinsi
                </p>
              </div>
              <Link
                href="/admin/room"
                className="text-xs font-medium text-secondary hover:underline whitespace-nowrap"
              >
                Manage →
              </Link>
            </div>
            <ProvinceBar rows={stats.province_breakdown.slice(0, 5)} />
          </section>
        )}

        {/* Recent Bookings table */}
        <section className="lg:col-span-3">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-on-surface">
                Recent Bookings
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                {stats.recent_reservations.length} aktivitas terbaru
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-secondary hover:underline whitespace-nowrap"
            >
              View all →
            </Link>
          </div>
          <BookingsTable rows={stats.recent_reservations.slice(0, 5)} />
        </section>
      </div>
    </div>
  );
}
