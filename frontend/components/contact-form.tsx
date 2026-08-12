"use client";

import { useState, type FormEvent } from "react";
import { contactApi } from "@/lib/api";

const Contactform = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setErrorMsg(null);
    try {
      await contactApi.send(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus("success");
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setStatus("error");
      setErrorMsg(e.message);
      if (e.errors) setErrors(e.errors);
    }
  };

  const inputClass =
    "w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm focus:border-secondary focus:bg-surface-container-lowest transition";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-2xl shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className={inputClass}
            placeholder="Nama*"
            required
          />
          {errors.name?.[0] && (
            <p className="text-sm text-error mt-1">{errors.name[0]}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            className={inputClass}
            placeholder="email@contoh.com*"
            required
          />
          {errors.email?.[0] && (
            <p className="text-sm text-error mt-1">{errors.email[0]}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            value={form.subject}
            onChange={handleChange("subject")}
            className={inputClass}
            placeholder="Subjek*"
            required
          />
          {errors.subject?.[0] && (
            <p className="text-sm text-error mt-1">{errors.subject[0]}</p>
          )}
        </div>
        <div>
          <textarea
            value={form.message}
            onChange={handleChange("message")}
            rows={5}
            className={inputClass}
            placeholder="Pesan kamu*"
            required
          />
          {errors.message?.[0] && (
            <p className="text-sm text-error mt-1">{errors.message[0]}</p>
          )}
        </div>

        {status === "success" && (
          <p className="text-sm text-success bg-success/10 p-3 rounded-lg">
            ✓ Pesan terkirim. Terima kasih!
          </p>
        )}
        {status === "error" && errorMsg && (
          <p className="text-sm text-error bg-error-container p-3 rounded-lg">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {status === "sending" ? "Mengirim..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default Contactform;
