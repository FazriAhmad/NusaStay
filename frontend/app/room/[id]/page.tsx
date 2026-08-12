import RoomDetailView from "@/components/room-detail-view";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export const dynamic = "force-dynamic";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

async function fetchRoom(id: number) {
  const res = await fetch(`${API_URL}/rooms/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function fetchRelated() {
  const res = await fetch(`${API_URL}/rooms`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data;
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const roomId = parseInt(id);
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const startDate = typeof sp.start === "string" ? sp.start : today;
  const endDate = typeof sp.end === "string" ? sp.end : tomorrow;
  const guests = typeof sp.guests === "string" ? parseInt(sp.guests) : 2;

  const [room, allRooms] = await Promise.all([fetchRoom(roomId), fetchRelated()]);
  const related = allRooms.filter((r: { id: number }) => r.id !== roomId).slice(0, 3);

  return (
    <RoomDetailView
      room={room}
      related={related}
      initialStart={startDate}
      initialEnd={endDate}
      initialGuests={guests}
    />
  );
}
