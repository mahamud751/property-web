"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Space } from "@/lib/data";

const roomCameras: Record<string, string> = {
  living: "/tour/living.png",
  dining: "/tour/dining.png",
  kitchen: "/tour/kitchen.png",
  bedroom: "/tour/bedroom.png",
  washroom: "/tour/washroom.png",
  balcony: "/tour/balcony.png",
  pool: "/tour/pool.png",
};

type Layout = "grid" | "focus" | "quad";
type Filter = "color" | "mono" | "night";

type CamMeta = {
  space: Space;
  camId: string;
  feed: string;
  angle: string;
};

function buildCams(spaces: Space[]): CamMeta[] {
  return spaces.map((space, i) => ({
    space,
    camId: `CAM-${String(i + 1).padStart(2, "0")}`,
    feed: roomCameras[space.id] ?? space.image,
    angle:
      space.id === "pool"
        ? "Deck · SW"
        : space.id === "balcony"
          ? "Rail · E"
          : space.id === "kitchen"
            ? "Ceiling · N"
            : space.id === "washroom"
              ? "Corner · NE"
              : "Ceiling · SE",
  }));
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function LiveStamp({ camId, label }: { camId: string; label?: string }) {
  const now = useClock();
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="text-red-400">REC</span>
        <span className="text-white/80">{camId}</span>
      </span>
      <span className="text-white/80">{stamp}</span>
      {label ? <span className="text-brass">{label}</span> : null}
    </div>
  );
}

function filterClass(filter: Filter) {
  if (filter === "mono") return "grayscale contrast-110";
  if (filter === "night")
    return "hue-rotate-[70deg] saturate-[0.45] brightness-90 contrast-125";
  return "";
}

/** Compact tile used in grid / quad */
function CamTile({
  cam,
  active,
  filter,
  onSelect,
}: {
  cam: CamMeta;
  active: boolean;
  filter: Filter;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-video w-full overflow-hidden rounded-lg bg-black text-left transition ${
        active
          ? "ring-2 ring-brass"
          : "ring-1 ring-white/10 hover:ring-brass/50"
      }`}
    >
      <Image
        src={cam.feed}
        alt={`${cam.camId} ${cam.space.name}`}
        fill
        sizes="(max-width:768px) 50vw, 33vw"
        className={`object-cover ${filterClass(filter)}`}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
      <LiveStamp camId={cam.camId} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-2.5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brass">
          {cam.camId}
        </p>
        <p className="truncate text-xs font-medium text-ivory">{cam.space.name}</p>
      </div>
      <span className="pointer-events-none absolute left-2 top-2 z-10 h-3 w-3 border-l border-t border-white/40" />
      <span className="pointer-events-none absolute right-2 top-2 z-10 h-3 w-3 border-r border-t border-white/40" />
      <span className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-white/40" />
      <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-3 w-3 border-b border-r border-white/40" />
    </button>
  );
}

/** Full single-camera stage with working pan/zoom */
function SingleCameraStage({
  cam,
  filter,
  zoom,
  pan,
  dragging,
  stageRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  cam: CamMeta;
  filter: Filter;
  zoom: number;
  pan: { x: number; y: number };
  dragging: boolean;
  stageRef: React.RefObject<HTMLDivElement>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}) {
  return (
    <div
      ref={stageRef}
      className={`relative w-full select-none overflow-hidden bg-black ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ height: "min(68vh, 640px)", minHeight: 380 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Transform lives on a wrapper so Next/Image fill always has a real box */}
      <div
        className="absolute inset-0 origin-center will-change-transform"
        style={{
          transform: `translate3d(${pan.x}%, ${pan.y}%, 0) scale(${zoom})`,
          transition: dragging ? "none" : "transform 160ms ease-out",
        }}
      >
        <Image
          key={cam.feed}
          src={cam.feed}
          alt={`${cam.camId} ${cam.space.name}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className={`object-cover ${filterClass(filter)}`}
          draggable={false}
        />
      </div>

      {/* CCTV overlays — above the image */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-t from-black/70 via-transparent to-black/25" />

      <LiveStamp camId={cam.camId} label={cam.angle} />

      {/* Crosshair */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative h-14 w-14">
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brass/35" />
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-brass/35" />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/70" />
        </div>
      </div>

      {/* Bottom meta */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
            {cam.camId} · PTZ live
          </p>
          <p className="mt-0.5 font-display text-xl text-ivory sm:text-2xl">
            {cam.space.name}
          </p>
          <p className="mt-0.5 text-xs text-white/65 sm:text-sm">
            {cam.space.size} · {cam.space.tagline}
          </p>
        </div>
        <span className="mb-1 hidden rounded border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-white/75 sm:inline">
          Drag to pan
        </span>
      </div>

      {/* Corner brackets */}
      <span className="pointer-events-none absolute left-3 top-3 z-10 h-5 w-5 border-l-2 border-t-2 border-white/35" />
      <span className="pointer-events-none absolute right-3 top-3 z-10 h-5 w-5 border-r-2 border-t-2 border-white/35" />
      <span className="pointer-events-none absolute bottom-3 left-3 z-10 h-5 w-5 border-b-2 border-l-2 border-white/35" />
      <span className="pointer-events-none absolute bottom-3 right-3 z-10 h-5 w-5 border-b-2 border-r-2 border-white/35" />
    </div>
  );
}

export default function CCCameraInspect({
  spaces,
  propertyTitle,
}: {
  spaces: Space[];
  propertyTitle: string;
}) {
  const cams = useMemo(() => buildCams(spaces), [spaces]);
  const [layout, setLayout] = useState<Layout>("focus");
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<Filter>("color");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scanning, setScanning] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const cam = cams[active] ?? cams[0];
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === cams.length && cams.length > 0;

  const maxPan = useMemo(() => Math.max(0, (zoom - 1) * 40 + 8), [zoom]);

  const selectCam = useCallback((i: number) => {
    setActive(i);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const clampPan = useCallback(
    (x: number, y: number) => ({
      x: Math.max(-maxPan, Math.min(maxPan, x)),
      y: Math.max(-maxPan, Math.min(maxPan, y)),
    }),
    [maxPan]
  );

  const nudge = (dx: number, dy: number) => {
    setPan((p) => clampPan(p.x + dx, p.y + dy));
  };

  const markChecked = () => {
    if (!cam) return;
    setChecked((c) => ({ ...c, [cam.space.id]: true }));
  };

  useEffect(() => {
    if (!scanning || cams.length === 0) return;
    const t = window.setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % cams.length;
        setZoom(1);
        setPan({ x: 0, y: 0 });
        return next;
      });
    }, 4000);
    return () => window.clearInterval(t);
  }, [scanning, cams.length]);

  useEffect(() => {
    // Keep pan in bounds when zoom changes
    setPan((p) => clampPan(p.x, p.y));
  }, [zoom, clampPan]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudge(5, 0);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nudge(-5, 0);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        nudge(0, 5);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nudge(0, -5);
      }
      if (e.key === "+" || e.key === "=")
        setZoom((z) => Math.min(2.6, +(z + 0.1).toFixed(2)));
      if (e.key === "-" || e.key === "_")
        setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)));
      if (e.key === "[") selectCam((active - 1 + cams.length) % cams.length);
      if (e.key === "]") selectCam((active + 1) % cams.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, cams.length, selectCam, maxPan]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (layout !== "focus") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragRef.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((e.clientX - dragRef.current.x) / rect.width) * 70;
    const dy = ((e.clientY - dragRef.current.y) / rect.height) * 70;
    setPan(
      clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy)
    );
  };

  const onPointerUp = () => {
    setDragging(false);
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (layout !== "focus") return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.max(1, Math.min(2.6, +(z + delta).toFixed(2))));
  };

  const quadCams = useMemo(() => {
    const start = Math.floor(active / 4) * 4;
    return cams.slice(start, start + 4);
  }, [active, cams]);

  if (!cam) return null;

  return (
    <section
      className="overflow-hidden rounded-[28px] border border-white/10 bg-[#070c0a] shadow-2xl shadow-black/50"
      aria-label="CC camera property inspection"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0c1411] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass/30 bg-brass/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                stroke="#d4b06a"
                strokeWidth="1.5"
              />
              <path
                d="M16 10l4-2v6l-4-2v-2Z"
                stroke="#d4b06a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="11" r="1.5" fill="#d4b06a" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
              Nivaas CC Monitor
            </p>
            <p className="text-sm text-ivory/90">
              {propertyTitle} · {cams.length} cameras online
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            {(
              [
                ["focus", "Single"],
                ["quad", "Quad"],
                ["grid", "All cams"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setLayout(id);
                  if (id === "focus") {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }
                }}
                className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition ${
                  layout === id
                    ? "bg-brass text-evergreen"
                    : "text-fog hover:text-ivory"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            {(
              [
                ["color", "Color"],
                ["mono", "B&W"],
                ["night", "Night"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition ${
                  filter === id
                    ? "bg-white/15 text-ivory"
                    : "text-fog hover:text-ivory"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setScanning((s) => !s)}
            className={`rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition ${
              scanning
                ? "border-brass bg-brass/15 text-brass"
                : "border-white/15 text-fog hover:border-brass hover:text-brass"
            }`}
          >
            {scanning ? "Stop scan" : "Auto scan"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main stage */}
        <div
          className="min-w-0 border-b border-white/10 bg-black lg:border-b-0 lg:border-r lg:border-white/10"
          onWheel={layout === "focus" ? onWheel : undefined}
        >
          {layout === "grid" ? (
            <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-2.5 sm:p-3">
              {cams.map((c, i) => (
                <CamTile
                  key={c.camId}
                  cam={c}
                  active={i === active}
                  filter={filter}
                  onSelect={() => {
                    selectCam(i);
                    setLayout("focus");
                  }}
                />
              ))}
            </div>
          ) : layout === "quad" ? (
            <div className="grid grid-cols-2 gap-2 p-2 sm:gap-2.5 sm:p-3">
              {quadCams.map((c) => {
                const i = cams.findIndex((x) => x.camId === c.camId);
                return (
                  <CamTile
                    key={c.camId}
                    cam={c}
                    active={i === active}
                    filter={filter}
                    onSelect={() => {
                      selectCam(i);
                      setLayout("focus");
                    }}
                  />
                );
              })}
              {quadCams.length < 4 &&
                Array.from({ length: 4 - quadCams.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/60 font-mono text-[10px] uppercase tracking-widest text-fog"
                  >
                    No signal
                  </div>
                ))}
            </div>
          ) : (
            <SingleCameraStage
              cam={cam}
              filter={filter}
              zoom={zoom}
              pan={pan}
              dragging={dragging}
              stageRef={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          )}
        </div>

        {/* Side panel */}
        <aside className="flex flex-col bg-[#0a1210]">
          <div className="border-b border-white/10 p-4">
            <p className="eyebrow mb-2">Active camera</p>
            <p className="font-display text-xl text-ivory">{cam.space.name}</p>
            <p className="mt-1 font-mono text-[11px] text-brass">
              {cam.camId} · {cam.angle}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-fog">
              {cam.space.tagline}. Zoom and pan to inspect corners, then mark
              the room checked.
            </p>
          </div>

          <div className="border-b border-white/10 p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-fog">
              PTZ control
            </p>
            <div className="mx-auto grid w-[140px] grid-cols-3 gap-1.5">
              <span />
              <button
                type="button"
                className="ptz-btn"
                onClick={() => nudge(0, 6)}
                aria-label="Tilt up"
              >
                ▲
              </button>
              <span />
              <button
                type="button"
                className="ptz-btn"
                onClick={() => nudge(6, 0)}
                aria-label="Pan left"
              >
                ◀
              </button>
              <button
                type="button"
                className="ptz-btn !text-[10px]"
                onClick={() => {
                  setPan({ x: 0, y: 0 });
                  setZoom(1);
                }}
                aria-label="Reset view"
              >
                ●
              </button>
              <button
                type="button"
                className="ptz-btn"
                onClick={() => nudge(-6, 0)}
                aria-label="Pan right"
              >
                ▶
              </button>
              <span />
              <button
                type="button"
                className="ptz-btn"
                onClick={() => nudge(0, -6)}
                aria-label="Tilt down"
              >
                ▼
              </button>
              <span />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost !flex-1 !px-3 !py-2 text-xs"
                onClick={() =>
                  setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))
                }
              >
                − Zoom
              </button>
              <span className="min-w-[3rem] text-center font-mono text-[11px] text-brass">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="btn-ghost !flex-1 !px-3 !py-2 text-xs"
                onClick={() =>
                  setZoom((z) => Math.min(2.6, +(z + 0.15).toFixed(2)))
                }
              >
                + Zoom
              </button>
            </div>
            <input
              type="range"
              min={100}
              max={260}
              step={5}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="mt-3 w-full accent-[#d4b06a]"
              aria-label="Zoom level"
            />
            <p className="mt-2 text-center font-mono text-[9px] text-fog/70">
              Scroll on video to zoom · drag to pan
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-fog">
                Inspection checklist
              </p>
              <p className="font-mono text-[10px] text-brass">
                {checkedCount}/{cams.length}
              </p>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brass transition-all duration-500"
                style={{
                  width: `${cams.length ? (checkedCount / cams.length) * 100 : 0}%`,
                }}
              />
            </div>
            <ul className="space-y-1.5">
              {cams.map((c, i) => {
                const done = !!checked[c.space.id];
                return (
                  <li key={c.camId}>
                    <button
                      type="button"
                      onClick={() => {
                        selectCam(i);
                        setLayout("focus");
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                        i === active
                          ? "border-brass/50 bg-brass/10 text-ivory"
                          : "border-white/5 bg-white/[0.02] text-fog hover:border-white/15 hover:text-ivory"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          done
                            ? "border-brass bg-brass text-evergreen"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-mono text-[9px] text-brass/80">
                          {c.camId}
                        </span>{" "}
                        {c.space.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={markChecked}
              disabled={!!checked[cam.space.id]}
              className="btn-brass mt-4 w-full !py-2.5 text-xs disabled:opacity-40"
            >
              {checked[cam.space.id]
                ? "Room marked checked"
                : `Mark ${cam.space.name} checked`}
            </button>

            {allChecked && (
              <div className="mt-3 rounded-xl border border-brass/30 bg-brass/10 p-3 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
                  Inspection complete
                </p>
                <p className="mt-1 text-xs text-fog">
                  All {cams.length} cameras reviewed. You&apos;re ready for a
                  site visit.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-fog">
              Detected details
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cam.space.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-ivory/75"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Thumb strip */}
      <div className="border-t border-white/10 bg-[#0c1411] p-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {cams.map((c, i) => (
            <button
              key={c.camId}
              type="button"
              onClick={() => {
                selectCam(i);
                setLayout("focus");
              }}
              className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border transition sm:h-[4.5rem] sm:w-32 ${
                i === active
                  ? "border-brass"
                  : "border-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={c.feed}
                alt={c.space.name}
                fill
                sizes="128px"
                className={`object-cover ${filterClass(filter)}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute bottom-1 left-1.5 font-mono text-[8px] uppercase tracking-widest text-brass">
                {c.camId}
              </span>
              {checked[c.space.id] && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brass text-[9px] text-evergreen">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
