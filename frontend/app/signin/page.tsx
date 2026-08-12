"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(redirectTo || (user.role === "admin" ? "/admin/dashboard" : "/"));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="p-6">
        <Logo />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[24rem]">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-on-surface mb-1.5">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-on-surface-variant">
              Masuk untuk melanjutkan pemesanan Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-surface-container-low border border-outline-variant rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs text-primary font-medium hover:underline">
                  Lupa password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-error text-xs bg-error-container px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-2.5 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? "Memproses..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-on-surface-variant mt-6 text-center">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
