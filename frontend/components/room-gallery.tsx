"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

const RoomGallery = ({ images, alt }: Props) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainImage = images[activeIdx] ?? images[0];

  return (
    <div>
      <div className="relative h-[480px] rounded-xl overflow-hidden mb-3">
        <Image
          src={mainImage}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        <span className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-sm fill">photo_camera</span>
          {images.length} photos
        </span>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative h-24 rounded-lg overflow-hidden border-2 transition ${
                idx === activeIdx
                  ? "border-secondary"
                  : "border-transparent hover:border-outline"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomGallery;
