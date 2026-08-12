"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { contactApi, type Contact, type PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/format";
import Topbar from "@/components/admin/topbar";
import Pagination from "@/components/admin/pagination";

const PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    contactApi
      .list({ page, per_page: perPage })
      .then(({ data, meta }) => {
        setItems(data);
        setMeta(meta);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading && items.length === 0) {
    return <p className="text-center py-20 text-on-surface-variant">Memuat pesan...</p>;
  }
  if (error) return <p className="text-center py-20 text-error">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <Topbar
        title="Contact Messages"
        subtitle={`${meta.total} total pesan · Halaman ${meta.current_page} dari ${meta.last_page}`}
        action={
          <select
            value={perPage}
            onChange={(e) => setPerPage(parseInt(e.target.value))}
            className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-md text-sm"
            aria-label="Items per page"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        }
      />

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / email / subjek / isi pesan..."
            className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-md text-sm"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-on-surface-variant">Tidak ada pesan.</p>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className="w-full text-left p-5 hover:bg-surface-container-low/60 transition flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold uppercase flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-on-surface">{c.name}</span>
                    <span className="text-on-surface-variant text-xs">·</span>
                    <span className="text-sm text-on-surface-variant">{c.email}</span>
                  </div>
                  <p className="font-medium text-on-surface mt-1.5 truncate">{c.subject}</p>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{c.message}</p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap pt-1">
                  {formatDate(c.created_at)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-outline-variant px-6 py-4">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={setPage}
          />
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-lg w-full max-w-[42rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-outline-variant flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">{selected.subject}</h2>
                <p className="text-sm text-on-surface-variant mt-2">
                  Dari <span className="font-medium">{selected.name}</span> ({selected.email}) ·{" "}
                  {formatDate(selected.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-on-surface-variant hover:text-on-surface text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-on-surface whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>
            <div className="p-5 border-t border-outline-variant flex justify-end gap-2">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="px-4 py-2.5 bg-secondary text-on-secondary rounded-md hover:opacity-90 text-sm font-medium"
              >
                Reply via Email
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 bg-surface-container-low text-on-surface rounded-md hover:bg-surface-container-high text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
