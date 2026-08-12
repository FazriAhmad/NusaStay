import type { Amenity } from "@/lib/api";

const ICON_MAP: Record<string, string> = {
  "Wi-Fi": "wifi",
  AC: "ac_unit",
  TV: "tv",
  Breakfast: "restaurant",
  "Mini Bar": "local_bar",
  Bathtub: "bathtub",
  "Sea View": "beach_access",
  "Pool Access": "pool",
  Gym: "fitness_center",
  Spa: "spa",
  Parking: "local_parking",
};

const getIcon = (name: string) =>
  ICON_MAP[name] ?? "check_circle";

type Props = {
  amenities: Amenity[];
};

const AmenitiesGrid = ({ amenities }: Props) => {
  if (amenities.length === 0) return null;

  const half = Math.ceil(amenities.length / 2);
  const col1 = amenities.slice(0, half);
  const col2 = amenities.slice(half);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {[col1, col2].map((col, ci) => (
        <div key={ci} className="space-y-3">
          {col.map((a) => (
            <div key={a.id} className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-secondary">
                {getIcon(a.name)}
              </span>
              <span className="text-sm">{a.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AmenitiesGrid;
