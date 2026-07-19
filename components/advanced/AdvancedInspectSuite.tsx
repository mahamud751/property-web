"use client";

import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Property, Space } from "@/lib/data";
import { roomImage } from "@/lib/room-visuals";
import {
  defectColors,
  defectLabels,
  loadReport,
  saveReport,
  type DefectKind,
  type DefectPin,
} from "@/lib/inspection-storage";
import {
  furnitureCatalog,
  parseRoomFeet,
  roomTips,
  type RoomTip,
} from "@/lib/ai-suggestions";

type Tool =
  | "panorama"
  | "measure"
  | "lighting"
  | "ar"
  | "defects"
  | "ai";

type LightMode = "day" | "golden" | "night" | "rain";

const tools: { id: Tool; label: string; hint: string }[] = [
  { id: "panorama", label: "360° View", hint: "Sphere look-around" },
  { id: "measure", label: "Measure", hint: "Tap two points" },
  { id: "lighting", label: "Lighting", hint: "Day · night · rain" },
  { id: "ar", label: "AR furniture", hint: "Camera + scale" },
  { id: "defects", label: "Defect pins", hint: "Notes & report" },
  { id: "ai", label: "AI tips", hint: "Smart suggestions" },
];

/* ------------------------------------------------------------------ */
/*  360° sphere                                                        */
/* ------------------------------------------------------------------ */

function PanoramaSphere({ url }: { url: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [map, setMap] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (!alive) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      setMap(tex);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  useFrame((_, dt) => {
    if (mesh.current && !map) mesh.current.rotation.y += dt * 0.05;
  });

  if (!map) {
    return (
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial color="#1a2f28" side={THREE.BackSide} />
      </mesh>
    );
  }

  return (
    <mesh ref={mesh} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 40]} />
      <meshBasicMaterial map={map} side={THREE.BackSide} />
    </mesh>
  );
}

function PanoramaControls() {
  const { camera, gl } = useThree();
  const spherical = useRef({ theta: 0, phi: Math.PI / 2 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      spherical.current.theta -= dx * 0.005;
      spherical.current.phi = THREE.MathUtils.clamp(
        spherical.current.phi + dy * 0.005,
        0.2,
        Math.PI - 0.2
      );
    };
    const onUp = () => {
      dragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onUp);
    };
  }, [gl]);

  useFrame(() => {
    const { theta, phi } = spherical.current;
    const r = 0.1;
    camera.position.set(
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function PanoramaTool({ space }: { space: Space }) {
  const url = roomImage(space.id, space.image);
  return (
    <div className="relative h-[min(62vh,560px)] min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black">
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <PanoramaSphere url={url} />
          <PanoramaControls />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
          360° immersive · {space.name}
        </p>
        <p className="text-sm text-white/70">Drag to look around the space</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Measure                                                            */
/* ------------------------------------------------------------------ */

function MeasureTool({ space }: { space: Space }) {
  const url = roomImage(space.id, space.image);
  const dims = parseRoomFeet(space.size);
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  const [unit, setUnit] = useState<"ft" | "m">("ft");

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPts((p) => {
      if (p.length >= 2) return [{ x, y }];
      return [...p, { x, y }];
    });
  };

  const length = useMemo(() => {
    if (pts.length < 2 || !dims) return null;
    // Calibrate: image width ≈ room longer side (max of w,d)
    const ref = Math.max(dims.w, dims.d);
    const dx = ((pts[1].x - pts[0].x) / 100) * ref;
    const dy = ((pts[1].y - pts[0].y) / 100) * (Math.min(dims.w, dims.d) * 0.75);
    const ft = Math.sqrt(dx * dx + dy * dy);
    return ft;
  }, [pts, dims]);

  const display =
    length == null
      ? null
      : unit === "ft"
        ? `${length.toFixed(1)} ft`
        : `${(length * 0.3048).toFixed(2)} m`;

  const area =
    dims == null
      ? null
      : unit === "ft"
        ? `${(dims.w * dims.d).toFixed(0)} sqft`
        : `${(dims.w * dims.d * 0.0929).toFixed(1)} m²`;

  return (
    <div>
      <div
        className="relative aspect-[16/10] cursor-crosshair overflow-hidden rounded-2xl border border-white/10 bg-black"
        onClick={onClick}
      >
        <Image src={url} alt={space.name} fill className="object-cover" sizes="100vw" />
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {pts.length === 2 && (
            <line
              x1={`${pts[0].x}%`}
              y1={`${pts[0].y}%`}
              x2={`${pts[1].x}%`}
              y2={`${pts[1].y}%`}
              stroke="#d4b06a"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          )}
          {pts.map((p, i) => (
            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="6" fill="#d4b06a" />
          ))}
        </svg>
        {display && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/40 bg-evergreen/90 px-4 py-2 font-mono text-sm text-brass backdrop-blur">
            {display}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-fog">
          Room record: <span className="text-ivory">{space.size}</span>
          {area ? ` · floor ≈ ${area}` : ""}
        </p>
        <div className="ml-auto flex rounded-full border border-white/10 p-1">
          {(["ft", "m"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                unit === u ? "bg-brass text-evergreen" : "text-fog"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <button type="button" className="btn-ghost !px-4 !py-2 text-xs" onClick={() => setPts([])}>
          Clear
        </button>
      </div>
      <p className="mt-2 text-xs text-fog">
        Tap two points on walls or floor. Length is estimated from the listing size (
        {dims ? `${dims.w}×${dims.d} ft` : "size n/a"}). Use for furniture fit checks — verify
        on visit.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lighting                                                           */
/* ------------------------------------------------------------------ */

const lightModes: {
  id: LightMode;
  label: string;
  filter: string;
  overlay: string;
}[] = [
  {
    id: "day",
    label: "Day",
    filter: "brightness(1.05) contrast(1.02) saturate(1.05)",
    overlay: "transparent",
  },
  {
    id: "golden",
    label: "Golden hour",
    filter: "brightness(1.02) contrast(1.08) sepia(0.25) saturate(1.2)",
    overlay: "linear-gradient(135deg, rgba(255,160,60,0.18), transparent 55%)",
  },
  {
    id: "night",
    label: "Night",
    filter: "brightness(0.55) contrast(1.15) saturate(0.65) hue-rotate(-8deg)",
    overlay:
      "radial-gradient(ellipse at 30% 20%, rgba(255,210,120,0.2), transparent 40%), rgba(0,10,25,0.45)",
  },
  {
    id: "rain",
    label: "Rainy day",
    filter: "brightness(0.78) contrast(1.05) saturate(0.7) grayscale(0.15)",
    overlay:
      "linear-gradient(180deg, rgba(40,60,80,0.35), rgba(20,30,40,0.2)), repeating-linear-gradient(180deg, transparent, transparent 8px, rgba(180,200,220,0.04) 8px, rgba(180,200,220,0.04) 10px)",
  },
];

function LightingTool({ space }: { space: Space }) {
  const [mode, setMode] = useState<LightMode>("day");
  const url = roomImage(space.id, space.image);
  const cfg = lightModes.find((m) => m.id === mode)!;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black">
        <Image
          src={url}
          alt={space.name}
          fill
          sizes="100vw"
          className="object-cover transition-[filter] duration-700"
          style={{ filter: cfg.filter }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ background: cfg.overlay }}
        />
        {mode === "rain" && (
          <div className="pointer-events-none absolute inset-0 animate-pulse opacity-30">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(100deg, transparent, transparent 2px, rgba(200,220,255,0.06) 2px, rgba(200,220,255,0.06) 3px)",
              }}
            />
          </div>
        )}
        <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-brass backdrop-blur">
          {cfg.label} · {space.name}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {lightModes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
              mode === m.id
                ? "border-brass bg-brass text-evergreen"
                : "border-white/15 text-fog hover:border-brass/50 hover:text-brass"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-fog">
        Preview how {space.name.toLowerCase()} may feel at different times — useful before a
        evening or monsoon visit.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AR furniture                                                       */
/* ------------------------------------------------------------------ */

function ARFurnitureTool({ space }: { space: Space }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const [itemId, setItemId] = useState("sofa");
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 50, y: 62 });
  const [drag, setDrag] = useState(false);
  const catalog = furnitureCatalog();
  const item = catalog.find((c) => c.id === itemId)!;
  const url = roomImage(space.id, space.image);
  const dims = parseRoomFeet(space.size);

  const startCam = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setLive(true);
      }
    } catch {
      setError(
        "Camera blocked or unavailable. Using room photo mode instead — still scale furniture."
      );
      setLive(false);
    }
  };

  const stopCam = () => {
    const v = videoRef.current;
    const stream = v?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    setLive(false);
  };

  useEffect(() => () => stopCam(), []);

  const fitHint = useMemo(() => {
    if (!dims) return "Room size unknown — treat placement as visual only.";
    const roomW = dims.w;
    const pieceW = item.w * scale;
    if (pieceW > roomW * 0.95)
      return `Tight fit: piece ~${pieceW.toFixed(1)} ft vs room width ${roomW} ft.`;
    if (pieceW > roomW * 0.7)
      return `Close: ~${pieceW.toFixed(1)} ft furniture in a ${roomW} ft span.`;
    return `Comfortable: ~${pieceW.toFixed(1)} ft piece in ${roomW}×${dims.d} ft room.`;
  }, [dims, item, scale]);

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.max(5, Math.min(95, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(10, Math.min(90, ((e.clientY - r.top) / r.height) * 100)),
    });
  };

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black"
        onPointerMove={onMove}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      >
        {live ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />
        ) : (
          <>
            <video ref={videoRef} className="hidden" playsInline muted />
            <Image src={url} alt={space.name} fill className="object-cover" sizes="100vw" />
          </>
        )}
        {/* Furniture ghost */}
        <div
          className="absolute z-10 cursor-grab active:cursor-grabbing"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            width: 120,
            height: 70,
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(true);
          }}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-brass/80 shadow-lg"
            style={{ background: `${item.color}cc` }}
          >
            <span className="text-[10px] font-semibold text-evergreen">{item.label}</span>
            <span className="font-mono text-[9px] text-evergreen/80">
              {item.w}×{item.d} m
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-brass backdrop-blur">
          {live ? "Live AR camera" : "Photo AR mode"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {catalog.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setItemId(c.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              itemId === c.id
                ? "border-brass bg-brass/15 text-brass"
                : "border-white/10 text-fog hover:text-ivory"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!live ? (
          <button type="button" className="btn-brass !py-2.5 text-xs" onClick={startCam}>
            Open phone camera
          </button>
        ) : (
          <button type="button" className="btn-ghost !py-2.5 text-xs" onClick={stopCam}>
            Close camera
          </button>
        )}
        <label className="flex flex-1 items-center gap-3 text-xs text-fog min-w-[180px]">
          Scale
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-[#d4b06a]"
          />
          <span className="font-mono text-brass">{Math.round(scale * 100)}%</span>
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-brass/90">{error}</p>}
      <p className="mt-2 text-xs text-fog">{fitHint} Drag the piece to place it.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Defect pins                                                        */
/* ------------------------------------------------------------------ */

function DefectsTool({
  spaces,
  space,
  spaceId,
  setSpaceId,
  slug,
  title,
}: {
  spaces: Space[];
  space: Space;
  spaceId: string;
  setSpaceId: (id: string) => void;
  slug: string;
  title: string;
}) {
  const [pins, setPins] = useState<DefectPin[]>([]);
  const [kind, setKind] = useState<DefectKind>("crack");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const url = roomImage(space.id, space.image);

  useEffect(() => {
    const r = loadReport(slug);
    if (r) setPins(r.pins);
  }, [slug]);

  const persist = (next: DefectPin[]) => {
    setPins(next);
    saveReport({
      slug,
      title,
      pins: next,
      checkedSpaces: Array.from(new Set(next.map((p) => p.spaceId))),
      updatedAt: new Date().toISOString(),
    });
  };

  const onPlace = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-pin]")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const pin: DefectPin = {
      id: `pin-${Date.now()}`,
      spaceId,
      x,
      y,
      kind,
      note: note.trim() || defectLabels[kind],
      createdAt: new Date().toISOString(),
    };
    persist([...pins, pin]);
    setNote("");
    setSelected(pin.id);
  };

  const roomPins = pins.filter((p) => p.spaceId === spaceId);

  const exportText = () => {
    const lines = [
      `Nivaas inspection report — ${title}`,
      `Generated ${new Date().toLocaleString()}`,
      "",
      ...pins.map(
        (p, i) =>
          `${i + 1}. [${defectLabels[p.kind]}] ${spaces.find((s) => s.id === p.spaceId)?.name ?? p.spaceId} @ ${p.x.toFixed(0)}%,${p.y.toFixed(0)}% — ${p.note}`
      ),
      "",
      pins.length === 0 ? "No pins recorded." : `${pins.length} pin(s) total.`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nivaas-inspection-${slug}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div
          className="relative aspect-[16/10] cursor-crosshair overflow-hidden rounded-2xl border border-white/10 bg-black"
          onClick={onPlace}
        >
          <Image src={url} alt={space.name} fill className="object-cover" sizes="100vw" />
          {roomPins.map((p) => (
            <button
              key={p.id}
              type="button"
              data-pin
              className="absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-lg"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: defectColors[p.kind],
                outline: selected === p.id ? "2px solid #d4b06a" : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(p.id);
              }}
              title={p.note}
            >
              !
            </button>
          ))}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-white/80">
            Tap to drop pin · {roomPins.length} in this room
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="label">Pin type</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(defectLabels) as DefectKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
                  kind === k
                    ? "border-brass text-brass"
                    : "border-white/10 text-fog hover:text-ivory"
                }`}
              >
                {defectLabels[k]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="defect-note">
            Note
          </label>
          <input
            id="defect-note"
            className="field"
            placeholder="e.g. hairline crack near window"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div>
          <p className="label">Room</p>
          <select
            className="field"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
          {pins.length === 0 && (
            <li className="text-fog">No pins yet — tap the photo to add.</li>
          )}
          {pins.map((p) => (
            <li
              key={p.id}
              className={`flex items-start gap-2 rounded-lg border px-2 py-2 ${
                selected === p.id ? "border-brass/40 bg-brass/10" : "border-white/10"
              }`}
            >
              <span
                className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: defectColors[p.kind] }}
              />
              <span className="min-w-0 flex-1">
                <span className="text-ivory">{p.note}</span>
                <span className="mt-0.5 block text-fog">
                  {spaces.find((s) => s.id === p.spaceId)?.name} · {defectLabels[p.kind]}
                </span>
              </span>
              <button
                type="button"
                className="text-fog hover:text-brass"
                onClick={() => persist(pins.filter((x) => x.id !== p.id))}
                aria-label="Remove pin"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="btn-brass w-full !py-2.5 text-xs" onClick={exportText}>
          Download report (.txt)
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI tips                                                            */
/* ------------------------------------------------------------------ */

function AITipsTool({ spaces, property }: { spaces: Space[]; property: Property }) {
  const tips: RoomTip[] = useMemo(() => roomTips(spaces), [spaces]);

  const summary = useMemo(() => {
    const bits: string[] = [];
    bits.push(
      `${property.title} is a ${property.beds}-bed ${property.type.toLowerCase()} in ${property.city} (${property.area.toLocaleString()} sqft).`
    );
    if (property.spaces.length >= 6)
      bits.push("Documentation depth is strong — full multi-space walkthrough available.");
    if (property.parking >= 2) bits.push("Parking looks generous for Dhaka standards.");
    if (property.spaces.some((s) => s.id === "pool"))
      bits.push("Pool chapter present — confirm maintenance cost before offer.");
    bits.push("Suggested flow: 360 each key room → measure furniture walls → pin defects → book visit.");
    return bits;
  }, [property]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-6">
        <p className="eyebrow mb-2">AI-style briefing</p>
        <h3 className="font-display text-2xl text-ivory">What stands out</h3>
        <ul className="mt-4 space-y-3">
          {summary.map((line) => (
            <li key={line} className="flex gap-2 text-sm leading-relaxed text-fog">
              <span className="text-brass">✦</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        {tips.map((t) => (
          <div
            key={t.title + t.spaceId}
            className={`rounded-2xl border p-4 ${
              t.tone === "good"
                ? "border-brass/25 bg-brass/5"
                : t.tone === "watch"
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-white/10 bg-pine/40"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
              {spaces.find((s) => s.id === t.spaceId)?.name ?? t.spaceId}
            </p>
            <p className="mt-1 font-medium text-ivory">{t.title}</p>
            <p className="mt-1 text-sm text-fog">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suite shell                                                        */
/* ------------------------------------------------------------------ */

export default function AdvancedInspectSuite({ property }: { property: Property }) {
  const [tool, setTool] = useState<Tool>("panorama");
  const [spaceId, setSpaceId] = useState(property.spaces[0]?.id ?? "living");
  const space = property.spaces.find((s) => s.id === spaceId) ?? property.spaces[0];

  if (!space) return null;

  return (
    <section
      className="overflow-hidden rounded-[28px] border border-white/10 bg-[#070c0a] shadow-2xl shadow-black/40"
      id="advanced-inspect"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0c1411] px-4 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
            Advanced viewing suite
          </p>
          <p className="text-sm text-ivory/90">
            360 · measure · lighting · AR · defects · AI tips
          </p>
        </div>
        <select
          className="field !w-auto !py-2 text-sm"
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
          aria-label="Select room"
        >
          {property.spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 px-3 py-3 sm:px-5">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-left transition ${
              tool === t.id
                ? "border-brass bg-brass text-evergreen"
                : "border-white/10 text-fog hover:border-brass/40 hover:text-ivory"
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-widest">
              {t.label}
            </span>
            <span
              className={`block text-[10px] ${
                tool === t.id ? "text-evergreen/70" : "text-fog/70"
              }`}
            >
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {tool === "panorama" && <PanoramaTool space={space} />}
        {tool === "measure" && <MeasureTool space={space} />}
        {tool === "lighting" && <LightingTool space={space} />}
        {tool === "ar" && <ARFurnitureTool space={space} />}
        {tool === "defects" && (
          <DefectsTool
            spaces={property.spaces}
            space={space}
            spaceId={spaceId}
            setSpaceId={setSpaceId}
            slug={property.slug}
            title={property.title}
          />
        )}
        {tool === "ai" && <AITipsTool spaces={property.spaces} property={property} />}
      </div>
    </section>
  );
}
