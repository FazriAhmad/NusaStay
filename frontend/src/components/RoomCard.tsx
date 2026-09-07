import { Link } from 'react-router-dom';
import { MapPin, Users, Maximize, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Room } from '../lib/data';
import { formatIDR } from '../lib/utils';
import { Stars } from './Layout';
import { useStore } from '../store/AppStore';
import { useToast } from './Toast';

export function RoomCard({ room, index = 0 }: { room: Room; index?: number }) {
  const { isSaved, toggleSaved, user } = useStore();
  const toast = useToast();
  const saved = isSaved(room.id);
  const disc = room.originalPrice ? Math.round((1 - room.pricePerNight / room.originalPrice) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.07 }}
      className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 card-shadow hover:-translate-y-1 hover:shadow-xl transition group">
      <Link to={`/room/${room.id}`} className="block relative h-52 overflow-hidden">
        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        <div className="absolute top-3 left-3 flex gap-2">
          {disc > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{disc}%</span>}
          {room.featured && <span className="gold-grad text-jungle-950 text-xs font-bold px-2.5 py-1 rounded-full">Unggulan</span>}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!user) { toast('Masuk dulu untuk menyimpan favorit', 'info'); return; }
            toggleSaved(room.id);
            toast(saved ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center shadow ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-600 hover:text-red-500'}`}>
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="absolute bottom-3 left-3 bg-jungle-950/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin size={12} /> {room.city}, {room.province}
        </span>
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">{room.hotel}</p>
        <Link to={`/room/${room.id}`} className="font-display font-bold text-lg text-jungle-950 hover:text-jungle-700 leading-snug block mt-0.5">{room.name}</Link>
        <div className="flex items-center gap-2 mt-1.5">
          <Stars v={room.rating} />
          <span className="text-xs font-bold text-jungle-800">{room.rating.toFixed(1)}</span>
          <span className="text-xs text-stone-400">({room.reviewCount} ulasan)</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
          <span className="flex items-center gap-1"><Users size={13} /> {room.capacity} tamu</span>
          <span className="flex items-center gap-1"><Maximize size={13} /> {room.size} m²</span>
          <span className="truncate">{room.bed}</span>
        </div>
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-dashed border-stone-200">
          <div>
            {room.originalPrice && <p className="text-xs text-stone-400 line-through">{formatIDR(room.originalPrice)}</p>}
            <p className="font-extrabold text-lg text-jungle-800">{formatIDR(room.pricePerNight)}<span className="text-xs font-medium text-stone-400">/malam</span></p>
          </div>
          <Link to={`/room/${room.id}`} className="text-sm font-bold bg-jungle-700 hover:bg-jungle-800 text-white px-4 py-2 rounded-full">Lihat</Link>
        </div>
      </div>
    </motion.div>
  );
}
