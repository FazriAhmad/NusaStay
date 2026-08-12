"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { roomsApi, savedHotelsApi, type Room } from "@/lib/api";

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    (async () => {
      try {
        const { data: ids } = await savedHotelsApi.list();
        if (ids.length === 0) {
          setRooms([]);
          return;
        }
        const all = await Promise.all(ids.map((id) => roomsApi.get(id).then((r) => r.data).catch(() => null)));
        setRooms(all.filter((r): r is Room => r !== null));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <p className="text-center py-32 text-on-surface-variant">Memuat...</p>;
  }

  return (
    <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-xl pt-24">
      <h1 className="font-display text-4xl font-bold text-on-surface mb-2">Saved Hotels</h1>
      <p className="text-on-surface-variant mb-md">Hotel yang kamu simpan untuk dilihat nanti.</p>

      {rooms.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-3 block">
            favorite
          </span>
          <p className="text-on-surface-variant mb-4">Belum ada hotel yang disimpan.</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-secondary text-on-secondary rounded-lg font-medium"
          >
            Cari Hotel
          </Link>
        </div>
      ) : (
        <div className="grid gap-md md:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="h-48 relative">
                <img
                  src={
                    room.image?.startsWith("/") || room.image?.startsWith("http")
                      ? room.image
                      : "/hero.jpg"
                  }
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-md">
                <h3 className="font-semibold text-on-surface">{room.name}</h3>
                <p className="text-sm text-secondary mt-1">
                  Rp {room.price.toLocaleString("id-ID")}/night
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
