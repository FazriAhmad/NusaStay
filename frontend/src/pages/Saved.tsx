import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { RoomCard } from '../components/RoomCard';
import { PageHead } from '../components/Layout';

export default function Saved() {
  const { user, saved, rooms } = useStore();
  const ids = user ? saved[user.id] ?? [] : [];
  const list = rooms.filter((r) => ids.includes(r.id));
  return (
    <div className="pb-12">
      <PageHead title="Hotel Tersimpan" sub={`${list.length} favorit di wishlist Anda`} />
      <div className="max-w-7xl mx-auto px-4 mt-4">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
            <HeartOff size={40} className="mx-auto text-stone-300" />
            <p className="font-bold text-jungle-950 mt-3">Wishlist masih kosong</p>
            <p className="text-sm text-stone-500">Ketuk ikon hati pada kamar favorit untuk menyimpannya di sini.</p>
            <Link to="/rooms" className="inline-block mt-4 text-sm font-bold bg-jungle-700 text-white px-6 py-2.5 rounded-full">Jelajahi Kamar →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{list.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}</div>
        )}
      </div>
    </div>
  );
}
