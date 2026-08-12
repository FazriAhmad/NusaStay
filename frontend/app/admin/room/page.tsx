"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { amenitiesApi, roomsApi, type Amenity, type Room } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import Topbar from "@/components/admin/topbar";

const INDONESIA_PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Bengkulu", "Sumatera Selatan", "Bangka Belitung", "Lampung",
  "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

type DraftRoom = {
  id?: number;
  name: string;
  description: string;
  image: string;
  images: string[];
  price: number;
  capacity: number;
  province: string;
  city: string;
  address: string;
  amenity_ids: number[];
};

const emptyDraft: DraftRoom = {
  name: "",
  description: "",
  image: "/hero.jpg",
  images: [],
  price: 1000000,
  capacity: 2,
  province: "",
  city: "",
  address: "",
  amenity_ids: [],
};

export default function ManageRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [draft, setDraft] = useState<DraftRoom>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);
  const [newAmenity, setNewAmenity] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([roomsApi.list(), amenitiesApi.list()]);
      setRooms(r.data);
      setAmenities(a.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft(emptyDraft);
    setOpenForm(true);
  };

  const openEdit = (room: Room) => {
    setDraft({
      id: room.id,
      name: room.name,
      description: room.description,
      image: room.image,
      images: room.images ?? [],
      price: room.price,
      capacity: room.capacity,
      province: room.province ?? "",
      city: room.city ?? "",
      address: room.address ?? "",
      amenity_ids: room.amenities?.map((a) => a.id) ?? [],
    });
    setOpenForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...draft,
        images: draft.images,
        province: draft.province || undefined,
        city: draft.city || undefined,
        address: draft.address || undefined,
      };
      if (draft.id) {
        await roomsApi.update(draft.id, payload);
      } else {
        await roomsApi.create(payload);
      }
      setOpenForm(false);
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Hapus kamar "${room.name}"?`)) return;
    setActingId(room.id);
    try {
      await roomsApi.remove(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const toggleAmenity = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((x) => x !== id)
        : [...prev.amenity_ids, id],
    }));
  };

  const handleAddAmenity = async () => {
    if (!newAmenity.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/api/amenities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("hotel_token")}`,
        },
        body: JSON.stringify({ name: newAmenity.trim() }),
      });
      if (!res.ok) throw new Error("Gagal menambah amenity");
      const json = await res.json();
      setAmenities((prev) => [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewAmenity("");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of Array.from(files)) {
        const result = await roomsApi.uploadImage(file);
        newImages.push(result.url);
      }
      setDraft((prev) => {
        const updated = { ...prev, images: [...prev.images, ...newImages] };
        if (!prev.image || prev.image === "/hero.jpg") {
          updated.image = newImages[0];
        }
        return updated;
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const setCover = (url: string) => {
    setDraft((prev) => ({ ...prev, image: url }));
  };

  if (loading) return <p className="text-center py-20 text-on-surface-variant">Memuat kamar...</p>;
  if (error) return <p className="text-center py-20 text-error">Error: {error}</p>;

  return (
    <div>
      <Topbar
        title="Manage Rooms"
        subtitle={`Total ${rooms.length} kamar.`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-secondary text-on-secondary rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Kamar
          </button>
        }
      />

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-md flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium">Tambah Amenity:</span>
        <input
          type="text"
          value={newAmenity}
          onChange={(e) => setNewAmenity(e.target.value)}
          placeholder="contoh: Gym, Spa..."
          className="flex-1 max-w-[20rem] bg-surface-container-low border border-outline-variant rounded-md p-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddAmenity}
          className="px-3 py-2 text-sm bg-on-surface text-surface-container-lowest rounded-md hover:opacity-90"
        >
          Add
        </button>
        <span className="text-xs text-on-surface-variant">{amenities.length} amenities tersedia</span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Nama</th>
                <th className="p-3 font-medium">Lokasi</th>
                <th className="p-3 font-medium">Harga/Malam</th>
                <th className="p-3 font-medium">Capacity</th>
                <th className="p-3 font-medium">Photos</th>
                <th className="p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-t border-outline-variant hover:bg-surface-container-low align-top">
                  <td className="p-3 text-on-surface-variant">#{r.id}</td>
                  <td className="p-3 font-medium text-on-surface">{r.name}</td>
                  <td className="p-3 text-on-surface-variant">
                    <div className="flex flex-col">
                      <span>{r.city ?? "—"}</span>
                      <span className="text-xs">{r.province ?? ""}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatIDR(r.price)}</td>
                  <td className="p-3 text-center">{r.capacity}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-xs bg-secondary-container text-on-secondary-container rounded-md">
                      {(r.images?.length ?? 0) + 1} foto
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="px-3 py-1 text-xs bg-secondary text-on-secondary rounded-md hover:opacity-90"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        disabled={actingId === r.id}
                        className="px-3 py-1 text-xs bg-error text-on-error rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-on-surface">
                {draft.id ? "Edit Kamar" : "Tambah Kamar"}
              </h2>
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="text-on-surface-variant hover:text-on-surface text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">Nama Kamar</label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface">Provinsi</label>
                  <select
                    required
                    value={draft.province}
                    onChange={(e) => setDraft({ ...draft, province: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  >
                    <option value="">Pilih provinsi...</option>
                    {INDONESIA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface">Kota</label>
                  <input
                    type="text"
                    value={draft.city}
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                    placeholder="Jakarta, Bandung, ..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">Alamat Lengkap</label>
                <input
                  type="text"
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  placeholder="Jl. Sudirman No. 1, ..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface">Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={draft.capacity}
                    onChange={(e) => setDraft({ ...draft, capacity: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface">Harga (per malam, IDR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-on-surface">
                  Foto Kamar (upload beberapa, klik bintang untuk set cover)
                </label>
                <div className="border-2 border-dashed border-outline-variant rounded-lg p-4 text-center bg-surface-container-low">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="room-image-upload"
                  />
                  <label
                    htmlFor="room-image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-md text-sm hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    {uploading ? "Uploading..." : "Pilih Foto"}
                  </label>
                  <p className="text-xs text-on-surface-variant mt-2">
                    JPG/PNG/WEBP, max 5MB per file. Bisa pilih multiple.
                  </p>
                </div>
                {draft.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {draft.images.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                          draft.image === url ? "border-secondary" : "border-outline-variant"
                        }`}
                      >
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCover(url)}
                            className="p-1 bg-secondary-container text-on-secondary-container rounded"
                            aria-label="Set as cover"
                          >
                            <span className="material-symbols-outlined text-[16px] fill">star</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 bg-error text-on-error rounded"
                            aria-label="Remove"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        {draft.image === url && (
                          <span className="absolute top-1 left-1 bg-secondary text-on-secondary text-[10px] px-1.5 py-0.5 rounded font-medium">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-on-surface">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-surface-container-low rounded-md">
                  {amenities.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={draft.amenity_ids.includes(a.id)}
                        onChange={() => toggleAmenity(a.id)}
                        className="accent-secondary"
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-md hover:bg-surface-container-high"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-secondary text-on-secondary rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : draft.id ? "Update" : "Buat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
