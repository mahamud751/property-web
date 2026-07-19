import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty, properties } from "@/lib/data";
import SpacesRunthrough3D from "@/components/SpacesRunthrough3D";
import CCCameraInspect from "@/components/CCCameraInspect";
import AdvancedInspectSuite from "@/components/advanced/AdvancedInspectSuite";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProperty(slug);
  return { title: p ? p.title : "Property" };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();

  const similar = properties
    .filter((x) => x.slug !== p.slug && (x.city === p.city || x.type === p.type))
    .slice(0, 3);

  return (
    <div className="pt-24 sm:pt-28">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-sm text-fog">
            <Link
              href="/properties"
              className="transition-colors hover:text-brass"
            >
              Properties
            </Link>
            <span className="text-fern">/</span>
            <span>{p.city}</span>
            <span className="ml-auto flex flex-wrap gap-2">
              <span className="badge-soft">{p.status}</span>
              <span className="badge-brass">{p.type}</span>
            </span>
          </div>
          <h1 className="h-display mt-5 text-4xl sm:text-6xl">{p.title}</h1>
          <p className="mt-2 text-fog">
            {p.location}, Dhaka
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="img-frame aspect-[16/10] shadow-soft">
              <Image
                src={p.gallery[0]}
                alt={p.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
              {p.gallery.slice(1, 3).map((g, i) => (
                <div
                  key={i}
                  className="img-frame aspect-[16/10] shadow-soft lg:aspect-auto lg:min-h-0"
                >
                  <Image
                    src={g}
                    alt={`${p.title} — view ${i + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="glass mt-6 grid gap-6 rounded-2xl p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div>
              <p className="font-display text-3xl tracking-tight text-brass">
                {p.price}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest2 text-fog">
                {p.priceNote}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-fog lg:justify-center">
              <span>
                <b className="text-ivory">{p.beds}</b> Beds
              </span>
              <span>
                <b className="text-ivory">{p.baths}</b> Baths
              </span>
              <span>
                <b className="text-ivory">{p.area.toLocaleString()}</b> sqft
              </span>
              <span>
                <b className="text-ivory">{p.parking}</b> Parking
              </span>
              <span>
                <b className="text-ivory">{p.yearBuilt}</b> Built
              </span>
            </div>
            <a href="#agent" className="btn-brass w-full lg:w-auto">
              Book a visit
            </a>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-12">
          <Reveal>
            <div>
              <p className="eyebrow mb-3">About this home</p>
              <p className="max-w-2xl text-lg leading-relaxed text-ivory/90">
                {p.description}
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <dl className="card divide-y divide-white/[0.06] p-6 text-sm">
              {[
                ["Floors", p.floors],
                ["Facing", p.facing],
                ["Neighbourhood", p.city],
                ["Year built", String(p.yearBuilt)],
                ["Listing type", p.status],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <dt className="text-fog">{k}</dt>
                  <dd className="text-right text-ivory">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <div className="mt-16 border-y border-white/[0.06] bg-pine/30 sm:mt-20">
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-3">Immersive property experience</p>
                <h2 className="h-display max-w-2xl text-3xl sm:text-5xl">
                  Enter every room. Notice every detail.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-fog">
                Join Maya for a complete guided viewing, or take control and
                inspect each space in your own order.
              </p>
            </div>
          </Reveal>
          <SpacesRunthrough3D spaces={p.spaces} />
        </div>
      </div>

      {/* -------- CC CAMERA INSPECTION -------- */}
      <div className="container-page py-16 sm:py-20">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Advanced inspection · CC cameras</p>
              <h2 className="h-display max-w-2xl text-3xl sm:text-5xl">
                Check every corner like a security feed.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-fog">
              Switch cameras, pan and zoom, mark rooms as inspected — a full
              checklist so nothing is missed before you visit.
            </p>
          </div>
        </Reveal>
        <CCCameraInspect spaces={p.spaces} propertyTitle={p.title} />
      </div>

      {/* -------- ADVANCED VIEWING SUITE -------- */}
      <div className="border-y border-white/[0.06] bg-pine/20">
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-3">Pro inspection toolkit</p>
                <h2 className="h-display max-w-2xl text-3xl sm:text-5xl">
                  360, measure, lighting, AR, pins &amp; AI tips.
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/compare?a=${p.slug}`}
                  className="btn-ghost text-xs"
                >
                  Compare this home
                </Link>
                <a href="#advanced-inspect" className="btn-brass text-xs">
                  Open tools
                </a>
              </div>
            </div>
          </Reveal>
          <AdvancedInspectSuite property={p} />
        </div>
      </div>

      <div className="container-page py-16 sm:py-20">
        <Reveal>
          <p className="eyebrow mb-3">Beyond the rooms</p>
          <h2 className="h-display mb-8 text-3xl sm:text-4xl">Amenities</h2>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {p.amenities.map((a, i) => (
            <Reveal key={a} delay={(i % 4) * 50}>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-pine/50 px-4 py-3.5 text-sm transition-colors duration-300 hover:border-brass/25 hover:bg-pine/80">
                <span className="text-brass">✦</span>
                <span>{a}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div id="agent" className="container-page scroll-mt-28">
        <Reveal>
          <div className="card grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow mb-2">Your Nivaas advisor</p>
              <p className="font-display text-3xl tracking-tight">
                {p.agent.name}
              </p>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-fog">
                Knows every corner of this home — and of {p.city}. First visits
                usually happen within 48 hours.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-brass">
                <a
                  href={`tel:${p.agent.phone.replace(/\s|-/g, "")}`}
                  className="transition-colors hover:text-ivory"
                >
                  {p.agent.phone}
                </a>
                <a
                  href={`mailto:${p.agent.email}`}
                  className="transition-colors hover:text-ivory"
                >
                  {p.agent.email}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={`tel:${p.agent.phone.replace(/\s|-/g, "")}`}
                className="btn-brass"
              >
                Call now
              </a>
              <Link href="/contact" className="btn-ghost">
                Request a visit
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {similar.length > 0 && (
        <div className="container-page pt-20 sm:pt-24">
          <Reveal>
            <p className="eyebrow mb-3">Keep walking</p>
            <h2 className="h-display mb-10 text-3xl sm:text-4xl">
              Similar homes
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <PropertyCard property={s} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
