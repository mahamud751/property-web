"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Property } from "@/lib/data";
import { cities } from "@/lib/data";
import { openNivaasVoice } from "@/components/VoiceSiriAssistant";

const AUTO_MS = 5500;

type Slide = {
  image: string;
  title: string;
  location: string;
  price: string;
  status: string;
  type: string;
  slug: string;
  eyebrow: string;
};

function buildSlides(properties: Property[]): Slide[] {
  return properties.slice(0, 5).map((p, i) => ({
    image: i === 0 ? "/tour/living.png" : p.gallery[0] || p.cover,
    title: p.title,
    location: `${p.location}, ${p.city}`,
    price: p.price,
    status: p.status,
    type: p.type,
    slug: p.slug,
    eyebrow:
      i === 0
        ? "Featured this week"
        : i === 1
          ? "Just documented"
          : i === 2
            ? "Room-by-room tour"
            : i === 3
              ? "Prime neighbourhood"
              : "Ready to walk through",
  }));
}

export default function HeroSlider({ properties }: { properties: Property[] }) {
  const slides = buildSlides(properties);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const go = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
      setProgressKey((k) => k + 1);
    },
    [slides.length]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = window.setTimeout(next, AUTO_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, next, slides.length]);

  const slide = slides[index];

  return (
    <section
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured homes"
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-transform duration-[7000ms] ease-out ${
              i === index ? "scale-105" : "scale-100"
            }`}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-evergreen via-evergreen/35 to-black/35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-evergreen/90 via-evergreen/35 to-black/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-evergreen to-transparent" />

      {/* Content */}
      <div className="container-page relative z-10 w-full pb-10 pt-32 sm:pb-14 sm:pt-40">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-14">
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">Dhaka · Curated homes · Room by room</p>
            <h1 className="h-display max-w-3xl text-[2.75rem] sm:text-6xl lg:text-[4.45rem]">
              Walk through the whole home,{" "}
              <em className="not-italic font-normal text-brass">
                before you visit.
              </em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-[1.05rem]">
              Every Nivaas listing is documented space by space — living,
              dining, kitchen, bedrooms, washrooms, balcony, pool — so your
              first visit already feels like your second.
            </p>

            <div className="mt-7 hidden max-w-3xl flex-wrap items-center gap-x-5 gap-y-3 text-xs text-ivory/80 sm:flex">
              {[
                ["360°", "Immersive tours"],
                ["✓", "Verified listings"],
                ["⌂", "Curated spaces"],
                ["♡", "Save & compare"],
              ].map(([icon, label]) => (
                <span key={label} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brass/35 bg-evergreen/45 font-mono text-[10px] text-brass backdrop-blur">
                    {icon}
                  </span>
                  {label}
                </span>
              ))}
            </div>

            {/* Search */}
            <form
              action="/properties"
              className="glass mt-7 grid max-w-4xl gap-3 rounded-2xl border-brass/20 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <div>
                <label className="label" htmlFor="hero-city">
                  Area
                </label>
                <select id="hero-city" name="city" className="field">
                  <option value="">Anywhere in Dhaka</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="hero-status">
                  Looking to
                </label>
                <select id="hero-status" name="status" className="field">
                  <option value="">Buy or rent</option>
                  <option value="For Sale">Buy</option>
                  <option value="For Rent">Rent</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="hero-type">
                  Property type
                </label>
                <select id="hero-type" name="type" className="field">
                  <option value="">All types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-brass w-full sm:min-w-[9.5rem]"
                >
                  Search homes
                </button>
              </div>
            </form>

            {/* Voice search CTA */}
            <div className="mt-4 flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => openNivaasVoice(true)}
                className="hero-voice-btn group"
              >
                <span className="hero-voice-orb" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
                      fill="currentColor"
                    />
                    <path
                      d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ivory">
                    Ask Nivaas Voice
                  </span>
                  <span className="block text-xs text-fog">
                    “Find a 3 bed in Gulshan for sale”
                  </span>
                </span>
                <span className="ml-auto rounded-full bg-brass/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-brass">
                  Siri-style
                </span>
              </button>
              <p className="hidden text-xs text-fog/80 sm:block sm:max-w-[12rem]">
                Tap and speak — we match homes and read the results aloud.
              </p>
            </div>
          </div>

          {/* Featured slide card */}
          <div className="hidden w-full lg:block">
            <div
              key={slide.slug}
              className="glass animate-fade-in rounded-[1.6rem] border-brass/25 p-3 shadow-lift"
            >
              <div className="px-2 pb-3 pt-2">
                <p className="eyebrow mb-3">{slide.eyebrow}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="badge-soft">{slide.status}</span>
                  <span className="badge-brass">{slide.type}</span>
                </div>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10">
                <Image src={slide.image} alt={slide.title} fill sizes="360px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-evergreen/60 to-transparent" />
                <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-evergreen/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-ivory backdrop-blur">
                  ◉ Full tour
                </span>
              </div>
              <div className="px-2 pb-2 pt-4">
                <p className="font-display text-2xl tracking-tight text-ivory">{slide.title}</p>
                <p className="mt-1.5 text-xs leading-5 text-fog">⌖ {slide.location}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="font-display text-xl text-brass">{slide.price}</p>
                  <Link href={`/properties/${slide.slug}`} className="btn-ghost !px-4 !py-2 text-xs">Walk through →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="btn-icon"
              aria-label="Previous slide"
            >
              <span className="text-sm" aria-hidden>
                ←
              </span>
            </button>
            <button
              type="button"
              onClick={next}
              className="btn-icon"
              aria-label="Next slide"
            >
              <span className="text-sm" aria-hidden>
                →
              </span>
            </button>

            <div className="ml-2 flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${s.title}`}
                  aria-current={i === index}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                    i === index
                      ? "w-10 bg-white/20"
                      : "w-1.5 bg-white/25 hover:bg-white/45"
                  }`}
                >
                  {i === index && (
                    <span
                      key={progressKey}
                      className={`absolute inset-y-0 left-0 rounded-full bg-brass ${
                        paused ? "w-[30%]" : "animate-hero-progress"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile featured strip */}
          <Link
            href={`/properties/${slide.slug}`}
            className="glass flex max-w-full items-center gap-3 rounded-full py-2 pl-2 pr-4 lg:hidden"
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ivory">
                {slide.title}
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-brass">
                {slide.price}
              </span>
            </span>
          </Link>

          <p className="hidden font-mono text-[10px] uppercase tracking-widest2 text-fog sm:block">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </p>
        </div>
      </div>

    </section>
  );
}
