import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/data";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group card card-hover block h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.cover}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-evergreen via-evergreen/20 to-transparent opacity-90" />

        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
          <span className="badge-soft">{property.status}</span>
          <span className="badge-brass">{property.type}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-display text-xl leading-snug tracking-tight text-ivory sm:text-[1.35rem]">
            {property.title}
          </p>
          <p className="mt-1 text-xs text-fog/95">{property.location}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="font-display text-lg text-brass">{property.price}</p>
        <div className="flex shrink-0 gap-3 font-mono text-[10px] uppercase tracking-widest text-fog">
          <span>{property.beds} bd</span>
          <span>{property.baths} ba</span>
          <span>{property.area.toLocaleString()} sqft</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3.5 text-xs text-fog transition-colors duration-300 group-hover:text-brass">
        <span>Walk through {property.spaces.length} spaces</span>
        <span className="translate-x-0 transition-transform duration-300 ease-smooth group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
