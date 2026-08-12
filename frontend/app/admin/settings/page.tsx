"use client";

import { useEffect, useState, type FormEvent } from "react";
import Topbar from "@/components/admin/topbar";
import { settingsApi, type SettingItem } from "@/lib/api";

const GROUP_LABELS: Record<string, string> = {
  general: "Umum",
  pricing: "Harga & Pajak",
  booking: "Pemesanan",
};

const GROUP_ORDER = ["general", "pricing", "booking"];
const GROUP_DESCRIPTIONS: Record<string, string> = {
  general: "Identitas brand dan informasi kontak publik.",
  pricing: "Aturan perhitungan biaya layanan dan pajak.",
  booking: "Batasan minimum dan maksimum untuk pemesanan.",
};

export default function AdminSettingsPage() {
  const [items, setItems] = useState<SettingItem[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsApi.list();
        setItems(res.data);
        const next: Record<string, string> = {};
        for (const s of res.data) {
          next[s.key] = String(s.value);
        }
        setDraft(next);
      } catch (err) {
        setMessage({ kind: "err", text: (err as Error).message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const payload: Record<string, string | number | boolean> = {};
      for (const item of items) {
        const raw = draft[item.key] ?? "";
        if (item.type === "integer") {
          const n = parseInt(raw);
          if (Number.isNaN(n)) {
            throw new Error(`Nilai untuk ${item.key} harus berupa angka.`);
          }
          payload[item.key] = n;
        } else if (item.type === "boolean") {
          payload[item.key] = raw === "true";
        } else {
          payload[item.key] = raw;
        }
      }
      const res = await settingsApi.update(payload);
      const next: Record<string, string> = {};
      for (const s of res.data) next[s.key] = String(s.value);
      setDraft(next);
      setItems(res.data);
      setMessage({ kind: "ok", text: "Pengaturan berhasil disimpan." });
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center py-20 text-on-surface-variant">Memuat pengaturan...</p>;
  }

  return (
    <div>
      <Topbar
        title="Pengaturan Situs"
        subtitle="Konfigurasi identitas brand, pajak, dan aturan pemesanan."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-3xl"
      >
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="mb-8 last:mb-0">
              <h2 className="text-lg font-semibold text-on-surface mb-1">
                {GROUP_LABELS[group] ?? group}
              </h2>
              <p className="text-sm text-on-surface-variant mb-4">
                {GROUP_DESCRIPTIONS[group]}
              </p>
              <div className="space-y-4">
                {groupItems.map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium mb-1 text-on-surface">
                      {humanize(item.key)}
                    </label>
                    {item.type === "boolean" ? (
                      <select
                        value={draft[item.key] ?? "false"}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                      </select>
                    ) : (
                      <input
                        type={item.type === "integer" ? "number" : "text"}
                        value={draft[item.key] ?? ""}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                      />
                    )}
                    <p className="text-xs text-on-surface-variant mt-1">
                      Tipe: <code className="font-mono">{item.type}</code> · Key:{" "}
                      <code className="font-mono">{item.key}</code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {message && (
          <p
            className={
              message.kind === "ok" ? "text-success text-sm mb-4" : "text-error text-sm mb-4"
            }
          >
            {message.text}
          </p>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-secondary text-on-secondary rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
          <button
            type="button"
            onClick={() => {
              const next: Record<string, string> = {};
              for (const s of items) next[s.key] = String(s.value);
              setDraft(next);
              setMessage(null);
            }}
            className="px-4 py-2.5 bg-surface-container-low text-on-surface rounded-md text-sm font-medium hover:bg-surface-container"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

function humanize(key: string): string {
  return key
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
