"use client";

import { useEffect, useState, use, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoCheckmarkCircle } from "react-icons/io5";
import { reservationsApi, roomsApi, type Room } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatIDR, nights } from "@/lib/format";

type PaymentMethod = "credit_card" | "bank_transfer" | "e_wallet";

const methodOptions: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "credit_card", label: "Credit / Debit Card", icon: "credit_card" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "account_balance" },
  { value: "e_wallet", label: "Digital Wallet (PayPal, Apple Pay)", icon: "account_balance_wallet" },
];

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startDate = searchParams.get("start") ?? new Date().toISOString().split("T")[0];
  const endDate = searchParams.get("end") ??
    new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const guests = parseInt(searchParams.get("guests") ?? "2");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    setFirstName(user.name?.split(" ")[0] ?? "");
    setLastName(user.name?.split(" ").slice(1).join(" ") ?? "");
    setEmail(user.email);
    setPhone(user.phone ?? "");

    roomsApi
      .get(parseInt(id))
      .then(({ data }) => setRoom(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return <p className="text-center py-32 text-on-surface-variant">Memuat...</p>;
  }
  if (error) return <p className="text-center py-32 text-error">Error: {error}</p>;
  if (!room) return null;

  const totalNights = nights(startDate, endDate);
  const subtotal = room.price * totalNights;
  const taxes = Math.round(subtotal * 0.12);
  const resortFee = 45000;
  const total = subtotal + taxes + resortFee;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await reservationsApi.create({
        room_id: room.id,
        start_date: startDate,
        end_date: endDate,
      });
      // Update payment method & status
      await reservationsApi.updateStatus(data.id, {
        payment_status: "paid",
        payment_method:
          method === "credit_card" ? "credit_card" : method === "bank_transfer" ? "bank_transfer" : "e_wallet",
      });
      router.push(`/booking/success/${data.id}`);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-xl pt-24">
        <h1 className="font-display text-4xl font-bold text-on-surface mb-2">
          Complete Your Booking
        </h1>
        <p className="text-on-surface-variant mb-md">
          Review your details and finalize your stay at our premium property.
        </p>

        <div className="grid lg:grid-cols-3 gap-md">
          {/* Left: Forms */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-md">
            {/* Guest Details */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person</span>
                Guest Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  We&apos;ll send your booking confirmation here.
                </p>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">Phone Number</label>
                <div className="flex">
                  <select className="bg-surface-container-low border border-outline-variant rounded-l-md px-3 text-sm">
                    <option>+1</option>
                    <option>+62</option>
                    <option>+44</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 555-0123"
                    className="flex-1 bg-surface-container-low border border-l-0 border-outline-variant rounded-r-md p-3 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Let us know if you have any special requirements..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md p-3 text-sm"
                />
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">credit_card</span>
                Payment Method
              </h2>
              <div className="space-y-2">
                {methodOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                      method === opt.value
                        ? "border-secondary bg-secondary-container/10"
                        : "border-outline-variant hover:border-outline"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={method === opt.value}
                      onChange={() => setMethod(opt.value)}
                      className="accent-secondary"
                    />
                    <span className="material-symbols-outlined text-secondary">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              {method === "credit_card" && (
                <div className="mt-4 space-y-3 p-3 bg-surface-container-low rounded-lg">
                  <div>
                    <label className="block text-xs font-medium mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-md p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-md p-3 pr-10 text-sm"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        lock
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-md p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-md p-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </form>

          {/* Right: Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md sticky top-24">
              <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                <img
                  src={room.image?.startsWith("/") || room.image?.startsWith("http") ? room.image : "/hero.jpg"}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  4.8 (238 reviews)
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">LUXE SUITE</p>
              <h3 className="font-semibold text-lg text-on-surface">{room.name}</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                The Grand Azure, Coastal District
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-xs rounded-full">
                  King Bed
                </span>
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-xs rounded-full">
                  Ocean View
                </span>
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-xs rounded-full">
                  Breakfast Included
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div>
                  <p className="text-xs text-on-surface-variant">CHECK-IN</p>
                  <p className="font-semibold">{formatDate(startDate)}</p>
                  <p className="text-xs text-on-surface-variant">From 3:00 PM</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">CHECK-OUT</p>
                  <p className="font-semibold">{formatDate(endDate)}</p>
                  <p className="text-xs text-on-surface-variant">Until 11:00 AM</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">group</span>
                {totalNights} Nights · {guests} Guests
              </p>

              <div className="mt-4 pt-4 border-t border-outline-variant space-y-2 text-sm">
                <p className="font-semibold">Price Breakdown</p>
                <div className="flex justify-between">
                  <span>
                    {formatIDR(room.price)} × {totalNights} nights
                  </span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Taxes & Fees (12%)</span>
                  <span>{formatIDR(taxes)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Resort Fee</span>
                  <span>{formatIDR(resortFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-outline-variant">
                  <span>Total</span>
                  <span className="text-secondary">{formatIDR(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4 py-3 bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">verified</span>
                {submitting ? "Memproses..." : "Confirm Booking"}
              </button>
              <p className="text-xs text-on-surface-variant text-center mt-2">
                You won&apos;t be charged until the next step
              </p>

              <div className="mt-4 space-y-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                  <span>Your data is protected with 256-bit encryption.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">event_repeat</span>
                  <span>Free cancellation up to 48 hours before check-in.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
