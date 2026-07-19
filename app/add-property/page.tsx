"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { spaceIcons } from "@/lib/data";

/* ---------------------------------- types ---------------------------------- */

type DraftSpace = {
  kind: string;
  name: string;
  size: string;
  note: string;
};

type Draft = {
  title: string;
  type: string;
  status: string;
  price: string;
  beds: string;
  baths: string;
  area: string;
  city: string;
  address: string;
  facing: string;
  floors: string;
  description: string;
  spaces: DraftSpace[];
  amenities: string[];
  coverUrl: string;
};

const SPACE_KINDS = [
  { kind: "living", label: "Living room" },
  { kind: "dining", label: "Dining" },
  { kind: "kitchen", label: "Kitchen" },
  { kind: "bedroom", label: "Bedroom" },
  { kind: "washroom", label: "Washroom" },
  { kind: "balcony", label: "Balcony" },
  { kind: "pool", label: "Swimming pool" },
];

const AMENITY_OPTIONS = [
  "Lift", "Generator backup", "Covered parking", "Rooftop access",
  "Swimming pool", "Gym", "24/7 security", "Gas connection",
  "Servant quarters", "Solar hot water", "Smart-home wiring", "Kids' play area",
];

const STEPS = ["Basics", "Location", "Spaces", "Amenities", "Review"];

const empty: Draft = {
  title: "",
  type: "Apartment",
  status: "For Sale",
  price: "",
  beds: "",
  baths: "",
  area: "",
  city: "",
  address: "",
  facing: "",
  floors: "",
  description: "",
  spaces: [],
  amenities: [],
  coverUrl: "",
};

/* ---------------------------------- page ---------------------------------- */

export default function AddPropertyPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [submitted, setSubmitted] = useState(false);

  // current space being composed in step 3
  const [spaceForm, setSpaceForm] = useState<DraftSpace>({
    kind: "living",
    name: "Living room",
    size: "",
    note: "",
  });

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const completeness = useMemo(() => {
    let score = 0;
    if (draft.title) score += 15;
    if (draft.price) score += 10;
    if (draft.beds && draft.baths && draft.area) score += 15;
    if (draft.city && draft.address) score += 15;
    if (draft.spaces.length > 0) score += Math.min(draft.spaces.length * 5, 25);
    if (draft.amenities.length > 0) score += 10;
    if (draft.description) score += 10;
    return Math.min(score, 100);
  }, [draft]);

  const canNext = useMemo(() => {
    if (step === 0) return draft.title && draft.price && draft.beds && draft.baths && draft.area;
    if (step === 1) return draft.city && draft.address;
    if (step === 2) return draft.spaces.length >= 1;
    return true;
  }, [step, draft]);

  const addSpace = () => {
    if (!spaceForm.size && !spaceForm.note) return;
    setDraft((d) => ({ ...d, spaces: [...d.spaces, spaceForm] }));
    setSpaceForm({ kind: "living", name: "Living room", size: "", note: "" });
  };

  const removeSpace = (i: number) =>
    setDraft((d) => ({ ...d, spaces: d.spaces.filter((_, x) => x !== i) }));

  const toggleAmenity = (a: string) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a)
        ? d.amenities.filter((x) => x !== a)
        : [...d.amenities, a],
    }));

  /* -------- submitted state -------- */
  if (submitted) {
    return (
      <div className="container-page flex min-h-[80vh] max-w-2xl flex-col items-center justify-center pt-24 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
          ✓
        </div>
        <p className="eyebrow mb-4">Listing received</p>
        <h1 className="h-display text-4xl sm:text-5xl">
          {draft.title || "Your home"} is on its way.
        </h1>
        <p className="mt-5 max-w-md text-fog">
          A Nivaas advisor will call within one working day to schedule the
          professional room-by-room shoot — {draft.spaces.length} spaces
          recorded, {completeness}% complete on paper already.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="btn-brass">Browse homes</Link>
          <button
            className="btn-ghost"
            onClick={() => {
              setDraft(empty);
              setStep(0);
              setSubmitted(false);
            }}
          >
            List another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pt-28 sm:pt-32">
      <p className="eyebrow mb-3">List your property</p>
      <h1 className="h-display text-4xl sm:text-5xl">
        Five steps. Watch it take shape.
      </h1>
      <p className="mt-4 max-w-xl text-fog">
        Fill the left side; the right side is your listing, building itself as
        you go — exactly how buyers will see it.
      </p>

      {/* stepper */}
      <ol className="mt-10 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest2 transition-all duration-300 ease-smooth ${
                i === step
                  ? "border-brass bg-brass text-evergreen shadow-[0_8px_20px_-8px_rgba(212,176,106,0.5)]"
                  : i < step
                  ? "border-brass/40 bg-brass/10 text-brass hover:border-brass/70"
                  : "border-white/10 text-fog"
              }`}
            >
              <span>{String(i + 1).padStart(2, "0")}</span> {s}
              {i < step && <span aria-hidden>✓</span>}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px]">
        {/* ---------------- form column ---------------- */}
        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl">The basics</h2>
              <div>
                <label className="label" htmlFor="w-title">Listing title</label>
                <input
                  id="w-title"
                  className="field"
                  placeholder="e.g. Sunlit 3-bed with lake view"
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="w-type">Property type</label>
                  <select
                    id="w-type"
                    className="field"
                    value={draft.type}
                    onChange={(e) => set({ type: e.target.value })}
                  >
                    {["Apartment", "Villa", "Duplex", "Penthouse"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="w-status">Listing for</label>
                  <select
                    id="w-status"
                    className="field"
                    value={draft.status}
                    onChange={(e) => set({ status: e.target.value })}
                  >
                    <option>For Sale</option>
                    <option>For Rent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="w-price">
                  {draft.status === "For Rent" ? "Monthly rent" : "Asking price"}
                </label>
                <input
                  id="w-price"
                  className="field"
                  placeholder={draft.status === "For Rent" ? "e.g. ৳ 85,000 / mo" : "e.g. ৳ 2.4 Cr"}
                  value={draft.price}
                  onChange={(e) => set({ price: e.target.value })}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {(
                  [
                    ["beds", "Bedrooms", "3"],
                    ["baths", "Washrooms", "3"],
                    ["area", "Area (sqft)", "1850"],
                  ] as const
                ).map(([key, label, ph]) => (
                  <div key={key}>
                    <label className="label" htmlFor={`w-${key}`}>{label}</label>
                    <input
                      id={`w-${key}`}
                      className="field"
                      inputMode="numeric"
                      placeholder={ph}
                      value={draft[key]}
                      onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl">Where is it?</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="w-city">Neighbourhood</label>
                  <input
                    id="w-city"
                    className="field"
                    placeholder="e.g. Dhanmondi"
                    value={draft.city}
                    onChange={(e) => set({ city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="w-facing">Facing</label>
                  <input
                    id="w-facing"
                    className="field"
                    placeholder="e.g. South, lake-facing"
                    value={draft.facing}
                    onChange={(e) => set({ facing: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="w-address">Address / road</label>
                <input
                  id="w-address"
                  className="field"
                  placeholder="e.g. Road 8/A, House 23"
                  value={draft.address}
                  onChange={(e) => set({ address: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="w-floors">Floor / level</label>
                <input
                  id="w-floors"
                  className="field"
                  placeholder="e.g. 7th floor, or G+2"
                  value={draft.floors}
                  onChange={(e) => set({ floors: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl">Add each space</h2>
                <p className="mt-1 text-sm text-fog">
                  Dining, kitchen, bedrooms, washrooms, balcony, pool — add them
                  one by one. Each becomes a chapter in your walkthrough.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-evergreen/50 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="w-skind">Space type</label>
                    <select
                      id="w-skind"
                      className="field"
                      value={spaceForm.kind}
                      onChange={(e) => {
                        const k = SPACE_KINDS.find((s) => s.kind === e.target.value)!;
                        setSpaceForm((f) => ({ ...f, kind: k.kind, name: k.label }));
                      }}
                    >
                      {SPACE_KINDS.map((s) => (
                        <option key={s.kind} value={s.kind}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="w-ssize">Size</label>
                    <input
                      id="w-ssize"
                      className="field"
                      placeholder="e.g. 17 × 13 ft"
                      value={spaceForm.size}
                      onChange={(e) => setSpaceForm((f) => ({ ...f, size: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label" htmlFor="w-snote">One-line note</label>
                  <input
                    id="w-snote"
                    className="field"
                    placeholder="e.g. Opens to the south balcony, best light after 3pm"
                    value={spaceForm.note}
                    onChange={(e) => setSpaceForm((f) => ({ ...f, note: e.target.value }))}
                  />
                </div>
                <button onClick={addSpace} className="btn-brass mt-4 w-full sm:w-auto">
                  + Add {spaceForm.name.toLowerCase()}
                </button>
              </div>

              {draft.spaces.length > 0 && (
                <ul className="space-y-2">
                  {draft.spaces.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-pine/80 px-4 py-3 text-sm"
                    >
                      <span className="text-brass">{spaceIcons[s.kind] ?? "◧"}</span>
                      <span className="text-ivory">{s.name}</span>
                      {s.size && (
                        <span className="font-mono text-[11px] text-brass/80">{s.size}</span>
                      )}
                      <span className="hidden flex-1 truncate text-fog sm:block">{s.note}</span>
                      <button
                        onClick={() => removeSpace(i)}
                        className="ml-auto text-fog transition hover:text-brass"
                        aria-label={`Remove ${s.name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl">Amenities & photos</h2>
              <div>
                <p className="label">Select everything that applies</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {AMENITY_OPTIONS.map((a) => {
                    const on = draft.amenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-300 ease-smooth ${
                          on
                            ? "border-brass/60 bg-brass/10 text-ivory"
                            : "border-white/10 text-fog hover:border-white/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className={on ? "text-brass" : "text-fern"}>
                          {on ? "✓" : "+"}
                        </span>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="w-cover">Cover photo URL (optional)</label>
                <input
                  id="w-cover"
                  className="field"
                  placeholder="https://…  (our photographer will replace this)"
                  value={draft.coverUrl}
                  onChange={(e) => set({ coverUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="w-desc">Describe the home in your own words</label>
                <textarea
                  id="w-desc"
                  rows={4}
                  className="field resize-none"
                  placeholder="What do you love about living here?"
                  value={draft.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl">One last look</h2>
              <p className="text-sm text-fog">
                This is everything you&apos;ve told us. The preview on the right
                is what buyers will see once our photographer completes the
                walkthrough shoot.
              </p>
              <dl className="divide-y divide-white/[0.06] text-sm">
                {[
                  ["Title", draft.title],
                  ["Type", `${draft.type} · ${draft.status}`],
                  ["Price", draft.price],
                  ["Layout", `${draft.beds} bed · ${draft.baths} bath · ${draft.area} sqft`],
                  ["Location", `${draft.address}, ${draft.city}`],
                  ["Spaces recorded", `${draft.spaces.length}`],
                  ["Amenities", `${draft.amenities.length} selected`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="text-fog">{k}</dt>
                    <dd className="text-right text-ivory">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`btn-ghost ${step === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canNext && setStep((s) => s + 1)}
                disabled={!canNext}
                className="btn-brass"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="btn-brass"
              >
                Submit listing
              </button>
            )}
          </div>
        </div>

        {/* ---------------- live preview column ---------------- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Live preview</p>
            <p className="font-mono text-[11px] text-fog">
              {completeness}% complete
            </p>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brassdim to-brass transition-all duration-500 ease-smooth"
              style={{ width: `${completeness}%` }}
            />
          </div>

          <div className="card shadow-lift">
            {/* cover */}
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-moss/40">
              {draft.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.coverUrl}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <p className="font-display text-4xl text-fern">◨</p>
                  <p className="mt-2 px-8 font-mono text-[10px] uppercase tracking-widest2 text-fog">
                    Photographer shoots all {draft.spaces.length || "your"} spaces
                  </p>
                </div>
              )}
              <span className="badge-soft absolute left-4 top-4">
                {draft.status}
              </span>
              <span className="badge-brass absolute right-4 top-4">
                {draft.type}
              </span>
            </div>

            <div className="p-5">
              <p className="font-display text-xl tracking-tight">
                {draft.title || <span className="text-fern">Your listing title…</span>}
              </p>
              <p className="mt-1 text-xs text-fog">
                {draft.address || draft.city
                  ? `${draft.address}${draft.address && draft.city ? ", " : ""}${draft.city}`
                  : "Address appears here"}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-display text-lg text-brass">
                  {draft.price || "৳ —"}
                </p>
                <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest text-fog">
                  <span>{draft.beds || "–"} bd</span>
                  <span>{draft.baths || "–"} ba</span>
                  <span>{draft.area || "–"} sqft</span>
                </div>
              </div>
            </div>

            {/* growing walkthrough */}
            <div className="border-t border-white/[0.06] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-fog">
                Walkthrough — {draft.spaces.length}{" "}
                {draft.spaces.length === 1 ? "space" : "spaces"}
              </p>
              {draft.spaces.length === 0 ? (
                <p className="text-xs text-fern">
                  Spaces you add in step 3 stack up here, in walking order.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {draft.spaces.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-[10px] text-brass/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-brass">{spaceIcons[s.kind] ?? "◧"}</span>
                      <span className="text-ivory">{s.name}</span>
                      {s.size && (
                        <span className="ml-auto font-mono text-[10px] text-fog">
                          {s.size}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {draft.amenities.length > 0 && (
              <div className="border-t border-white/[0.06] p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-fog">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-ivory/80"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
