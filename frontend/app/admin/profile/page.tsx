"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import Topbar from "@/components/admin/topbar";
import { useAuth } from "@/lib/auth-context";
import { profileApi } from "@/lib/api";

export default function AdminProfilePage() {
  const { user, loading, login: refreshAuth } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.image ?? null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (loading || !user) {
    return <p className="text-center py-20 text-on-surface-variant">Memuat profil...</p>;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      const { user: updated } = await profileApi.update({
        name,
        email,
        phone: phone || undefined,
        image: imageFile ?? undefined,
      });
      // Re-auth: panggil login ulang agar token & user state fresh
      // (token tetap valid, hanya state user yang kita refresh manual)
      const stored = typeof window !== "undefined" ? localStorage.getItem("hotel_token") : null;
      if (stored) {
        try {
          const me = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/api/me`,
            { headers: { Authorization: `Bearer ${stored}`, Accept: "application/json" } }
          );
          if (me.ok) {
            const data = await me.json();
            // patch via context indirectly: trigger refresh
            // (auth-context tidak expose setter, jadi pakai window reload ringan)
          }
        } catch {
          // ignore
        }
      }
      setProfileMessage({ kind: "ok", text: "Profil berhasil diperbarui. Memuat ulang..." });
      // Sederhanakan: reload agar context me-fetch ulang dari /me
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.reload();
      }, 800);
      // suppress unused-var warning
      void updated;
      void refreshAuth;
    } catch (err) {
      setProfileMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPw.length < 8) {
      setPwMessage({ kind: "err", text: "Password baru minimal 8 karakter." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage({ kind: "err", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setSavingPw(true);
    try {
      await profileApi.changePassword({
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      setPwMessage({ kind: "ok", text: "Password berhasil diperbarui." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <Topbar title="Profil Saya" subtitle="Kelola informasi akun dan password Anda." />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h2 className="text-xl font-semibold text-on-surface mb-1">Informasi Akun</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Perbarui nama, email, dan foto profil Anda.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary text-on-primary flex items-center justify-center text-2xl font-semibold uppercase flex-shrink-0">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  user.name?.[0] ?? "A"
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 text-sm bg-secondary text-on-secondary rounded-md hover:opacity-90 w-fit"
                >
                  Ganti Foto
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-on-surface-variant">JPG/PNG/WEBP, max 5MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Nama</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                placeholder="+62..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Role</label>
              <input
                type="text"
                disabled
                value={user.role}
                className="w-full bg-surface-container border border-outline-variant rounded-md p-3 text-sm text-on-surface-variant capitalize cursor-not-allowed"
              />
            </div>

            {profileMessage && (
              <p
                className={
                  profileMessage.kind === "ok"
                    ? "text-success text-sm"
                    : "text-error text-sm"
                }
              >
                {profileMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2.5 bg-secondary text-on-secondary rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h2 className="text-xl font-semibold text-on-surface mb-1">Ubah Password</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Gunakan minimal 8 karakter. Disarankan kombinasi huruf, angka, dan simbol.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Password Lama</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Password Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
              />
            </div>

            {pwMessage && (
              <p
                className={
                  pwMessage.kind === "ok" ? "text-success text-sm" : "text-error text-sm"
                }
              >
                {pwMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPw}
              className="px-4 py-2.5 bg-primary text-on-primary rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {savingPw ? "Memperbarui..." : "Ubah Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
