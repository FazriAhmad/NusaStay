"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const experiences = [
  {
    title: "Azure Wellness Spa",
    description: "Rejuvenating treatments inspired by ancient coastal traditions and modern science.",
    cta: "View Menu",
    icon: "spa",
    image: "/about-image.jpg",
  },
  {
    title: "Oceanic Fine Dining",
    description: "Fresh local ingredients meet world-class culinary artistry at our signature terrace restaurant.",
    cta: "Book a Table",
    icon: "restaurant",
    image: "/beijing.png",
  },
];

export default function SignatureExperiences() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="bg-surface-container-low">
      <div
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop"
        style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
      >
        {/* Section header */}
        <div
          className="text-center max-w-[42rem] mx-auto"
          style={{ marginBottom: "4rem" }}
        >
          <p
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ marginBottom: "1rem" }}
          >
            Experiences
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-on-surface"
            style={{ marginBottom: "1rem" }}
          >
            Signature Experiences
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Enhance your stay with our curated selection of exclusive services and adventures.
          </p>
        </div>

        {/* Cards grid (2-col) with bigger gap */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "3rem" }}
        >
          {experiences.map((exp, i) => (
            <div
              key={exp.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group bg-surface-container-lowest border rounded-2xl overflow-hidden flex items-stretch transition-all duration-300 ${
                hovered === i
                  ? "border-secondary shadow-lg -translate-y-1"
                  : "border-outline-variant shadow-sm"
              }`}
            >
              {/* Image section */}
              <div className="relative flex-shrink-0" style={{ width: "40%" }}>
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <div
                  className="absolute top-3 left-3 w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">{exp.icon}</span>
                </div>
              </div>

              {/* Content section */}
              <div
                className="flex-1 flex flex-col"
                style={{ padding: "2rem" }}
              >
                <h3
                  className="font-display text-xl font-semibold text-on-surface"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {exp.title}
                </h3>
                <p
                  className="text-sm text-on-surface-variant leading-relaxed"
                  style={{ marginBottom: "1.5rem" }}
                >
                  {exp.description}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-secondary text-sm font-semibold hover:underline mt-auto"
                >
                  {exp.cta}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered CTA in its own band */}
      <div className="border-t border-outline-variant">
        <div
          className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex justify-center"
          style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            View All Services
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
