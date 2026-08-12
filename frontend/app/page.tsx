import Hero from "@/components/hero";
import PopularDestinations from "@/components/popular-destinations";
import SignatureExperiences from "@/components/signature-experiences";
import Main from "@/components/main";
import type { Room, ProvinceInfo } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

async function fetchRooms(): Promise<Room[]> {
  try {
    const res = await fetch(`${API_URL}/rooms`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Room[] };
    return json.data;
  } catch {
    return [];
  }
}

async function fetchProvinces(): Promise<ProvinceInfo[]> {
  try {
    const res = await fetch(`${API_URL}/rooms/provinces`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ProvinceInfo[] };
    return json.data;
  } catch {
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const provinceFilter = typeof sp.province === "string" ? sp.province : "";

  const [rooms, provinces] = await Promise.all([fetchRooms(), fetchProvinces()]);

  return (
    <div>
      <Hero />
      <PopularDestinations provinces={provinces} />
      <Main rooms={rooms} provinceFilter={provinceFilter} />
      <SignatureExperiences />
    </div>
  );
}
