export type Amenity = { id: string; name: string; icon: string };

export type Room = {
  id: string;
  name: string;
  hotel: string;
  province: string;
  city: string;
  address: string;
  pricePerNight: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  capacity: number;
  bed: string;
  size: number;
  totalRooms: number;
  status: 'active' | 'inactive';
  description: string;
  featured?: boolean;
};

export type Promo = {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  maxDiscount: number;
  minSpend: number;
  validUntil: string;
  quota: number;
  used: number;
  active: boolean;
  description: string;
};

export type Review = {
  id: string;
  roomId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  photos: string[];
};

export const PROVINCES = [
  'Bali',
  'DKI Jakarta',
  'DI Yogyakarta',
  'Nusa Tenggara Barat',
  'Jawa Barat',
  'Jawa Timur',
];
