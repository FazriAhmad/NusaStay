"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const POPULAR_LOCATIONS = [
  "DKI Jakarta", "Bali", "Jawa Barat", "DI Yogyakarta", "Jawa Timur", "Banten",
];

const SearchBar = () => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("province", location);
    params.set("from", checkIn);
    params.set("to", checkOut);
    params.set("guests", String(guests));
    router.push(`/?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest p-3 md:p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 md:gap-0 items-stretch md:items-center"
    >
      <label className="flex-1 flex items-center gap-3 px-3 md:border-r border-outline-variant">
        <span className="material-symbols-outlined text-secondary">location_on</span>
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant">Location</p>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where to?"
            list="popular-locations"
            className="w-full bg-transparent outline-none text-sm font-medium"
          />
          <datalist id="popular-locations">
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>
      </label>
      <label className="flex-1 flex items-center gap-3 px-3 md:border-r border-outline-variant">
        <span className="material-symbols-outlined text-secondary">calendar_month</span>
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant">Check-in</p>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium"
          />
        </div>
      </label>
      <label className="flex-1 flex items-center gap-3 px-3 md:border-r border-outline-variant">
        <span className="material-symbols-outlined text-secondary">event</span>
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant">Check-out</p>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium"
          />
        </div>
      </label>
      <label className="flex-1 flex items-center gap-3 px-3">
        <span className="material-symbols-outlined text-secondary">group</span>
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant">Guests</p>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full bg-transparent outline-none text-sm font-medium"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </label>
      <button
        type="submit"
        className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">search</span>
        <span className="md:inline">Book Now</span>
      </button>
    </form>
  );
};

export default SearchBar;
