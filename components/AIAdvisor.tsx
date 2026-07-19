"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Property } from "@/lib/data";
import { cities } from "@/lib/data";
import {
  scoreProperties,
  type BuyerPrefs,
} from "@/lib/ai-suggestions";

const priorityOpts: {
  id: BuyerPrefs["priorities"][number];
  label: string;
}[] = [
  { id: "light", label: "Natural light" },
  { id: "kitchen", label: "Serious kitchen" },
  { id: "pool", label: "Pool" },
  { id: "parking", label: "Parking" },
  { id: "quiet", label: "Quieter pocket" },
  { id: "family", label: "Family layout" },
];

export default function AIAdvisor({ properties }: { properties: Property[] }) {
  const [budget, setBudget] = useState<BuyerPrefs["budget"]>("any");
  const [beds, setBeds] = useState(3);
  const [city, setCity] = useState("");
  const [priorities, setPriorities] = useState<BuyerPrefs["priorities"]>([
    "light",
    "family",
  ]);
  const [ran, setRan] = useState(false);

  const prefs: BuyerPrefs = { budget, beds, city, priorities };

  const ranked = useMemo(
    () => (ran ? scoreProperties(properties, prefs) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ran, budget, beds, city, priorities, properties]
  );

  const toggle = (id: BuyerPrefs["priorities"][number]) => {
    setPriorities((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(0, 4)
    );
    setRan(false);
  };

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-brass/10 to-transparent p-6 sm:p-8">
        <p className="eyebrow mb-2">AI-style matchmaker</p>
        <h2 className="h-display text-3xl sm:text-4xl">
          Tell us how you live. We rank the walkthroughs.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-fog">
          Heuristic scoring on beds, area, amenities, and your priorities — not
          a black-box model. Transparent reasons on every pick.
        </p>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="ai-budget">
              Budget band
            </label>
            <select
              id="ai-budget"
              className="field"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value as BuyerPrefs["budget"]);
                setRan(false);
              }}
            >
              <option value="any">Any</option>
              <option value="rent">Renting</option>
              <option value="sale-mid">Buying · mid range</option>
              <option value="sale-premium">Buying · premium</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ai-beds">
                Min bedrooms
              </label>
              <select
                id="ai-beds"
                className="field"
                value={beds}
                onChange={(e) => {
                  setBeds(Number(e.target.value));
                  setRan(false);
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ai-city">
                Preferred area
              </label>
              <select
                id="ai-city"
                className="field"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setRan(false);
                }}
              >
                <option value="">Anywhere</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className="label">Priorities (pick up to 4)</p>
            <div className="flex flex-wrap gap-2">
              {priorityOpts.map((o) => {
                const on = priorities.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggle(o.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      on
                        ? "border-brass bg-brass/15 text-brass"
                        : "border-white/10 text-fog hover:text-ivory"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="btn-brass"
            onClick={() => setRan(true)}
          >
            Generate shortlist
          </button>
        </div>

        <div className="space-y-3">
          {!ran && (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-fog">
              Set preferences and run the matcher to see ranked homes with
              reasons.
            </div>
          )}
          {ran &&
            ranked.slice(0, 4).map((r, i) => (
              <div
                key={r.property.slug}
                className="rounded-2xl border border-white/10 bg-pine/50 p-4 transition hover:border-brass/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
                      #{i + 1} · match {r.score}%
                    </p>
                    <p className="font-display text-xl text-ivory">
                      {r.property.title}
                    </p>
                    <p className="text-xs text-fog">
                      {r.property.city} · {r.property.beds} bed ·{" "}
                      {r.property.price}
                    </p>
                  </div>
                  <Link
                    href={`/properties/${r.property.slug}#advanced-inspect`}
                    className="btn-ghost !px-3 !py-2 text-xs"
                  >
                    Inspect
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-brass/20 bg-brass/10 px-2.5 py-1 text-[10px] text-brass"
                    >
                      {reason}
                    </span>
                  ))}
                  {r.watchouts.map((w) => (
                    <span
                      key={w}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-fog"
                    >
                      ⚠ {w}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/properties/${r.property.slug}`}
                    className="text-xs text-brass hover:underline"
                  >
                    Open listing
                  </Link>
                  <Link
                    href={`/compare?a=${r.property.slug}${
                      ranked[1] ? `&b=${ranked[1].property.slug}` : ""
                    }`}
                    className="text-xs text-fog hover:text-brass"
                  >
                    Compare top picks
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
