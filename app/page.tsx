import Image from "next/image";
import Link from "next/link";
import { properties, cities, spaceIcons } from "@/lib/data";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import HeroSlider from "@/components/HeroSlider";
import AIAdvisor from "@/components/AIAdvisor";

export default function HomePage() {
  const featured = properties.slice(0, 3);
  const walkthrough = properties[0];

  return (
    <>
      {/* ---------------- HERO SLIDER ---------------- */}
      <HeroSlider properties={properties} />

      {/* ---------------- STATS STRIP ---------------- */}
      <section className="border-y border-white/[0.06] bg-pine/40">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 text-center md:grid-cols-4 md:py-12">
          {[
            ["120+", "Homes documented"],
            ["7", "Spaces per walkthrough"],
            ["6", "Neighbourhoods covered"],
            ["48 hrs", "Average time to first visit"],
          ].map(([n, l], i) => (
            <div
              key={l}
              className={`px-4 ${i > 0 ? "md:border-l md:border-white/[0.06]" : ""}`}
            >
              <p className="font-display text-3xl tracking-tight text-brass sm:text-4xl">
                {n}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest2 text-fog">
                {l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="container-page section-y">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow mb-3">Featured this week</p>
              <h2 className="h-display text-3xl sm:text-5xl">
                Homes worth the traffic.
              </h2>
            </div>
            <Link href="/properties" className="btn-ghost">
              View all properties
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <PropertyCard property={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- WALKTHROUGH FEATURE ---------------- */}
      <section className="relative overflow-hidden border-y border-white/[0.06] bg-pine/30">
        <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brass/[0.04] blur-3xl" />
        <div className="container-page grid items-center gap-14 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <Reveal>
            <div>
              <p className="eyebrow mb-3">The Nivaas walkthrough</p>
              <h2 className="h-display text-3xl sm:text-5xl">
                Every room, on the record.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-fog">
                Open any listing and move space by space — the dining hall, the
                kitchen behind it, each bedroom, every washroom, the balcony,
                the pool. Sizes, features and photographs for all of it. No
                surprises on visit day.
              </p>
              <ul className="mt-8 space-y-1">
                {walkthrough.spaces.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-4 border-b border-white/[0.05] py-3.5 text-sm last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brass/10 text-brass">
                      {spaceIcons[s.id] ?? "◧"}
                    </span>
                    <span className="w-32 shrink-0 font-medium text-ivory sm:w-36">
                      {s.name}
                    </span>
                    <span className="hidden truncate text-fog sm:block">
                      {s.tagline}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-brass/80">
                      {s.size}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/properties/${walkthrough.slug}`}
                className="btn-brass mt-9"
              >
                Walk through {walkthrough.title}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { space: walkthrough.spaces[0], offset: true },
                { space: walkthrough.spaces[2], offset: false },
                { space: walkthrough.spaces[4], offset: true },
                { space: walkthrough.spaces[6], offset: false },
              ].map(({ space, offset }) => (
                <div
                  key={space.id}
                  className={`img-frame aspect-[3/4] shadow-soft ${
                    offset ? "translate-y-5 sm:translate-y-6" : ""
                  }`}
                >
                  <Image
                    src={space.image}
                    alt={space.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-evergreen/80 to-transparent p-3 pt-10">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
                      {space.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- NEIGHBOURHOODS ---------------- */}
      <section className="container-page section-y">
        <Reveal>
          <p className="eyebrow mb-3">Where we work</p>
          <h2 className="h-display mb-12 max-w-xl text-3xl sm:text-5xl">
            Six neighbourhoods, deeply known.
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c, i) => {
            const count = properties.filter((p) => p.city === c).length;
            const sample = properties.find((p) => p.city === c)!;
            return (
              <Reveal key={c} delay={i * 70}>
                <Link
                  href={`/properties?city=${encodeURIComponent(c)}`}
                  className="group img-frame card-hover block aspect-[16/10] shadow-soft"
                >
                  <Image
                    src={sample.cover}
                    alt={c}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-evergreen via-evergreen/30 to-transparent transition-opacity duration-500 group-hover:from-evergreen/95" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
                    <p className="font-display text-2xl tracking-tight">{c}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
                      {count} {count === 1 ? "home" : "homes"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- AI MATCHER ---------------- */}
      <section className="container-page section-y">
        <Reveal>
          <AIAdvisor properties={properties} />
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/compare" className="btn-ghost">
              Open side-by-side compare
            </Link>
            <Link href="/properties" className="btn-brass">
              Browse all homes
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-page pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-card">
            <Image
              src={properties[4].cover}
              alt="List your property"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-evergreen/82" />
            <div className="absolute inset-0 bg-gradient-to-r from-evergreen via-evergreen/70 to-transparent" />
            <div className="relative flex flex-col items-start gap-5 p-8 sm:p-12 lg:p-16">
              <p className="eyebrow">For owners</p>
              <h2 className="h-display max-w-xl text-3xl sm:text-5xl">
                Your home deserves a proper walkthrough too.
              </h2>
              <p className="max-w-lg text-fog">
                List with Nivaas and our step-by-step builder documents your
                home space by space — you watch the listing take shape as you
                type.
              </p>
              <Link href="/add-property" className="btn-brass mt-2">
                Start listing — it takes 5 steps
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
