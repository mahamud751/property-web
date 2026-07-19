import { properties, cities, types } from "@/lib/data";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Properties",
};

type Search = {
  city?: string;
  type?: string;
  status?: string;
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { city = "", type = "", status = "" } = searchParams;

  const results = properties.filter(
    (p) =>
      (!city || p.city === city) &&
      (!type || p.type === type) &&
      (!status || p.status === status)
  );

  return (
    <div className="container-page pb-12 pt-28 sm:pt-32">
      <Reveal>
        <p className="eyebrow mb-3">The collection</p>
        <h1 className="h-display text-4xl sm:text-6xl">
          {results.length} {results.length === 1 ? "home" : "homes"}
          {city ? ` in ${city}` : " across Dhaka"}.
        </h1>
        <p className="mt-4 max-w-lg text-fog">
          Filter by area, type, or sale status — every listing includes a full
          room-by-room walkthrough.
        </p>
      </Reveal>

      <form
        method="GET"
        className="glass mt-10 grid gap-4 rounded-2xl p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
      >
        <div>
          <label className="label" htmlFor="f-city">
            Area
          </label>
          <select id="f-city" name="city" defaultValue={city} className="field">
            <option value="">All areas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-type">
            Type
          </label>
          <select id="f-type" name="type" defaultValue={type} className="field">
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-status">
            Status
          </label>
          <select
            id="f-status"
            name="status"
            defaultValue={status}
            className="field"
          >
            <option value="">Buy or rent</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-brass w-full">
            Apply
          </button>
        </div>
        <div className="flex items-end">
          <a href="/properties" className="btn-ghost w-full">
            Reset
          </a>
        </div>
      </form>

      {results.length > 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80}>
              <PropertyCard property={p} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-white/10 bg-pine/40 px-8 py-16 text-center">
          <p className="font-display text-2xl tracking-tight">
            No homes match those filters.
          </p>
          <p className="mt-2 text-sm text-fog">
            Try widening the area or clearing the type filter.
          </p>
          <a href="/properties" className="btn-brass mt-8">
            Show all homes
          </a>
        </div>
      )}
    </div>
  );
}
