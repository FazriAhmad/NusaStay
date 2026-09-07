import { Wifi, Waves, Sparkles, Coffee, Snowflake, Tv, Dumbbell, Umbrella, UtensilsCrossed, Wine, Baby, ConciergeBell, Car } from 'lucide-react';

const MAP: Record<string, any> = {
  Wifi, Waves, Sparkles, Coffee, Snowflake, Tv, Dumbbell, Umbrella, UtensilsCrossed, Wine, Baby, ConciergeBell,
  SquareParking: Car, Parking: Car,
};

export function AmenIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const C = MAP[icon] ?? ConciergeBell;
  return <C size={size} />;
}
