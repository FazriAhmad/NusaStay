import Image from "next/image";
import SearchBar from "@/components/search-bar";

const Hero = () => {
  return (
    <section className="relative h-[640px] text-on-primary overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero.jpeg"
          alt="hero image"
          fill
          priority
          className="object-cover object-center w-full h-full"
        />
        {/* Subtle dark overlay ensure text contrast — "menyambut" exclusive feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-transparent" />
      </div>
      <div className="relative max-w-container mx-auto h-full flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop text-center pt-16">
        <p className="text-secondary-container text-xs font-semibold uppercase tracking-[0.25em] mb-md">
          Harmoni Stay · Premium Hospitality
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-md text-on-primary">
          Find Your Perfect Stay
        </h1>
        <p className="text-lg md:text-xl text-on-primary/90 max-w-[42rem] mb-10 leading-relaxed">
          Experience affordable luxury and exclusive offers for an unforgettable getaway.
        </p>
        <div className="w-full max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default Hero;
