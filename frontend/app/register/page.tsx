"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
      router.push("/");
      router.refresh();
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setError(e.message);
      if (e.errors) setErrors(e.errors);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (id: keyof typeof form, label: string, type = "text", required = true) => (
    <div>
      <label
        className="block text-sm font-semibold mb-2 text-on-surface"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={handleChange(id)}
        required={required}
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm focus:border-secondary focus:bg-surface-container-lowest transition"
      />
      {errors[id]?.[0] && (
        <p className="text-error text-xs mt-1">{errors[id][0]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-margin-mobile py-3xl pt-28">
      <div className="w-full max-w-[28rem]">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-on-surface mb-2">
              Create account
            </h1>
            <p className="text-on-surface-variant">Mulai perjalanan menginap Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {field("name", "Nama")}
            {field("email", "Email", "email")}
            {field("phone", "No. HP (opsional)", "tel", false)}
            {field("password", "Password", "password")}
            {field("password_confirmation", "Konfirmasi Password", "password")}

            {error && (
              <p className="text-error text-sm bg-error-container p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? "Mendaftarkan..." : "Buat Akun"}
            </button>
          </form>

          <p className="text-sm text-on-surface-variant mt-6 text-center">
            Sudah punya akun?{" "}
            <Link href="/signin" className="text-secondary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
