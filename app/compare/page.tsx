"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { properties, type Property } from "@/lib/data";
import { roomImage } from "@/lib/room-visuals";
import { compareInsight } from "@/lib/ai-suggestions";
import Reveal from "@/components/Reveal";

function Pick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a home…</option>
        {properties.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.title} · {p.city}
          </option>
        ))}
      </select>
    </div>
  );
}

function Side({ property, roomId }: { property: Property; roomId: string }) {
  const space =
    property.spaces.find((s) => s.id === roomId) ?? property.spaces[0];
  const img = space ? roomImage(space.id, space.image) : property.cover;

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10]">
        <Image
          src={img}
          alt={property.title}
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-evergreen via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-display text-2xl text-ivory">{property.title}</p>
          <p className="text-xs text-fog">
            {property.location}, {property.city}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-xl text-brass">{property.price}</p>
          <div className="flex gap-2">
            <span className="badge-soft">{property.status}</span>
            <span className="badge-brass">{property.type}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Beds", String(property.beds)],
            ["Baths", String(property.baths)],
            ["Area", `${property.area.toLocaleString()} sqft`],
            ["Parking", String(property.parking)],
            ["Facing", property.facing],
            ["Spaces", String(property.spaces.length)],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl border border-white/5 bg-evergreen/40 px-3 py-2"
            >
              <dt className="font-mono text-[9px] uppercase tracking-widest text-fog">
                {k}
              </dt>
              <dd className="text-ivory">{v}</dd>
            </div>
          ))}
        </dl>
        {space && (
          <div className="rounded-xl border border-white/10 bg-pine/50 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-brass">
              Aligned room · {space.name}
            </p>
            <p className="mt-1 text-sm text-fog">{space.tagline}</p>
            <p className="mt-1 font-mono text-[11px] text-ivory/80">
              {space.size}
            </p>
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            href={`/properties/${property.slug}`}
            className="btn-brass !px-4 !py-2 text-xs"
          >
            Open listing
          </Link>
          <Link
            href={`/properties/${property.slug}#advanced-inspect`}
            className="btn-ghost !px-4 !py-2 text-xs"
          >
            Advanced inspect
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const sp = useSearchParams();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [roomId, setRoomId] = useState("living");

  useEffect(() => {
    const qa = sp.get("a") ?? "";
    const qb = sp.get("b") ?? "";
    if (qa) setA(qa);
    if (qb) setB(qb);
  }, [sp]);

  const pa = properties.find((p) => p.slug === a);
  const pb = properties.find((p) => p.slug === b);

  const roomOptions = useMemo(() => {
    const ids = new Set<string>();
    pa?.spaces.forEach((s) => ids.add(s.id));
    pb?.spaces.forEach((s) => ids.add(s.id));
    if (ids.size === 0) {
      return ["living", "kitchen", "bedroom", "washroom"];
    }
    return Array.from(ids);
  }, [pa, pb]);

  const insights = useMemo(
    () => (pa && pb ? compareInsight(pa, pb) : []),
    [pa, pb]
  );

  return (
    <div className="container-page pb-16 pt-28 sm:pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Side-by-side</p>
        <h1 className="h-display text-4xl sm:text-6xl">
          Compare two homes properly.
        </h1>
        <p className="mt-4 max-w-2xl text-fog">
          Align the same room type, scan specs, and read AI-style differences
          before you burn a weekend in traffic.
        </p>
      </Reveal>

      <div className="glass mt-10 grid gap-4 rounded-2xl p-4 sm:grid-cols-3 sm:p-5">
        <Pick label="Home A" value={a} onChange={setA} />
        <Pick label="Home B" value={b} onChange={setB} />
        <div>
          <label className="label" htmlFor="cmp-room">
            Align room
          </label>
          <select
            id="cmp-room"
            className="field"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            {roomOptions.map((id) => (
              <option key={id} value={id}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pa && pb ? (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Side property={pa} roomId={roomId} />
            <Side property={pb} roomId={roomId} />
          </div>

          <div className="card mt-8 p-6 sm:p-8">
            <p className="eyebrow mb-2">AI-style comparison</p>
            <h2 className="font-display text-2xl text-ivory">Key differences</h2>
            <ul className="mt-4 space-y-3">
              {insights.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 border-b border-white/[0.05] pb-3 text-sm text-fog last:border-0"
                >
                  <span className="text-brass">→</span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/properties/${pa.slug}#advanced-inspect`}
                className="btn-ghost text-xs"
              >
                Inspect {pa.title}
              </Link>
              <Link
                href={`/properties/${pb.slug}#advanced-inspect`}
                className="btn-ghost text-xs"
              >
                Inspect {pb.title}
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <p className="font-display text-2xl">Pick two homes to begin.</p>
          <p className="mt-2 text-sm text-fog">
            Or open a listing and use “Compare” from the AI shortlist.
          </p>
        </div>
      )}
    </div>
  );
}
