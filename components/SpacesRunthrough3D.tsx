"use client";

import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Space } from "@/lib/data";

const ROOM_GAP = 9.2;
const ROOM_DEPTH = 7.2;
const ROOM_WIDTH = 7.6;

const REAL_VIEW_BASE_SCALE = 1.05;
const REAL_VIEW_HOVER_SCALE = 1.55;
const REAL_VIEW_PIN_SCALE = 1.95;

const roomVisuals: Record<string, string> = {
  living: "/tour/living.png",
  dining: "/tour/dining.png",
  kitchen: "/tour/kitchen.png",
  bedroom: "/tour/bedroom.png",
  washroom: "/tour/washroom.png",
  balcony: "/tour/balcony.png",
  pool: "/tour/pool.png",
};

const realHotspots = [
  { left: "22%", top: "45%" },
  { left: "51%", top: "65%" },
  { left: "76%", top: "48%" },
  { left: "86%", top: "70%" },
];

type Inspectable = { name: string; detail: string; room: number };
type TourState = "idle" | "running" | "arrived";

const objectDetails: Record<string, Array<[string, string]>> = {
  living: [
    ["Lounge sofa", "Deep three-seat arrangement with clear circulation on both sides."],
    ["Coffee table", "Low central table positioned within comfortable reach of every seat."],
    ["Media wall", "Full-width feature wall with concealed wiring and storage."],
    ["Reading chair", "Window-side accent chair placed for natural afternoon light."],
  ],
  dining: [
    ["Dining table", "Formal eight-seat table with generous chair clearance."],
    ["Pendant light", "Warm statement lighting centered precisely above the table."],
    ["Sideboard", "Serving and crockery storage along the service wall."],
    ["Dining chairs", "Eight upholstered chairs arranged with a comfortable guest route."],
  ],
  kitchen: [
    ["Kitchen island", "Large preparation island with breakfast seating and an undermount sink."],
    ["Cooking wall", "Integrated hob, chimney hood and oven organized into one working zone."],
    ["Tall storage", "Full-height pantry and fridge cabinetry along the service wall."],
    ["Wash counter", "Dedicated sink run with worktop space on both sides."],
  ],
  bedroom: [
    ["King bed", "King-size sleeping zone with balanced side-table clearance."],
    ["Wardrobe", "Full-height fitted wardrobe with separate hanging and shelf zones."],
    ["Bedside tables", "Paired tables with reading lights and charging points."],
    ["Dressing bench", "Upholstered bench positioned at the foot of the bed."],
  ],
  washroom: [
    ["Double vanity", "Wide vanity with two basins, drawers and a full mirror wall."],
    ["Rain shower", "Glass-enclosed wet zone with overhead rain head and hand shower."],
    ["Soaking tub", "Freestanding oval bath with side access and towel storage."],
    ["WC zone", "Wall-hung toilet with concealed cistern and dry-floor circulation."],
  ],
  balcony: [
    ["Outdoor lounge", "Weather-resistant seating positioned toward the main view."],
    ["Planter edge", "Continuous planting strip adds privacy without blocking daylight."],
    ["Coffee setting", "Compact table arrangement for morning or evening use."],
    ["Safety rail", "Full-width protective railing with an uninterrupted view line."],
  ],
  pool: [
    ["Pool basin", "Long swimming lane with shallow entry steps and clear water depth."],
    ["Sun loungers", "Paired deck loungers with side tables facing the water."],
    ["Pool edge lights", "Underwater and edge lighting for safe evening swimming."],
    ["Deck shower", "Outdoor rinse station with chrome head beside the deep end."],
  ],
};

/* ------------------------------------------------------------------ */
/*  Shared interactive primitive                                       */
/* ------------------------------------------------------------------ */

function useHoverInspect(
  onInspect: (item: Inspectable | null) => void,
  item: Inspectable
) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);

  const setHovered = (hovered: boolean) => {
    if (group.current) {
      gsap.to(group.current.scale, {
        x: hovered ? 1.04 : 1,
        y: hovered ? 1.04 : 1,
        z: hovered ? 1.04 : 1,
        duration: 0.32,
        ease: "power3.out",
      });
    }
    mats.current.forEach((mat) => {
      if (!mat) return;
      gsap.to(mat, {
        emissiveIntensity: hovered ? 0.35 : 0,
        duration: 0.28,
        ease: "power2.out",
      });
    });
  };

  const bind = {
    onPointerEnter: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      document.body.style.cursor = "pointer";
      setHovered(true);
      onInspect(item);
    },
    onPointerLeave: () => {
      document.body.style.cursor = "auto";
      setHovered(false);
    },
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onInspect(item);
    },
  };

  return { group, bind };
}

function InspectGroup({
  item,
  onInspect,
  position = [0, 0, 0],
  children,
}: {
  item: Inspectable;
  onInspect: (item: Inspectable | null) => void;
  position?: [number, number, number];
  children: React.ReactNode;
}) {
  const { group, bind } = useHoverInspect(onInspect, item);
  return (
    <group ref={group} position={position} {...bind}>
      {children}
    </group>
  );
}

function Mat({
  color,
  roughness = 0.55,
  metalness = 0.08,
  transparent = false,
  opacity = 1,
  emissive = "#d8b45a",
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  emissive?: string;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      transparent={transparent}
      opacity={opacity}
      emissive={emissive}
      emissiveIntensity={0}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Room-specific furniture                                            */
/* ------------------------------------------------------------------ */

function LivingFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <group position={[x, 0, 0]}>
      {/* Sofa */}
      <InspectGroup item={item(0)} onInspect={onInspect} position={[-0.6, 0, 1.6]}>
        <RoundedBox args={[3.2, 0.45, 1.05]} position={[0, 0.35, 0]} radius={0.08} castShadow>
          <Mat color="#b9a88a" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[3.2, 0.7, 0.28]} position={[0, 0.75, -0.4]} radius={0.06} castShadow>
          <Mat color="#a89678" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.55, 1.0]} position={[-1.45, 0.65, 0]} radius={0.05} castShadow>
          <Mat color="#a89678" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.55, 1.0]} position={[1.45, 0.65, 0]} radius={0.05} castShadow>
          <Mat color="#a89678" roughness={0.75} />
        </RoundedBox>
        {[-0.85, 0, 0.85].map((cx) => (
          <RoundedBox key={cx} args={[0.85, 0.18, 0.7]} position={[cx, 0.62, 0.05]} radius={0.05} castShadow>
            <Mat color="#c4b296" roughness={0.8} />
          </RoundedBox>
        ))}
      </InspectGroup>

      {/* Coffee table */}
      <InspectGroup item={item(1)} onInspect={onInspect} position={[-0.6, 0, 0.05]}>
        <RoundedBox args={[1.5, 0.08, 0.85]} position={[0, 0.38, 0]} radius={0.04} castShadow>
          <Mat color="#6a4530" roughness={0.45} metalness={0.1} />
        </RoundedBox>
        {[
          [-0.55, -0.3],
          [0.55, -0.3],
          [-0.55, 0.3],
          [0.55, 0.3],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.18, lz]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.36, 10]} />
            <Mat color="#4a3224" roughness={0.5} metalness={0.15} />
          </mesh>
        ))}
      </InspectGroup>

      {/* Media wall */}
      <InspectGroup item={item(2)} onInspect={onInspect} position={[-0.4, 0, -3.2]}>
        <RoundedBox args={[4.2, 2.4, 0.2]} position={[0, 1.3, 0]} radius={0.04} castShadow>
          <Mat color="#243d34" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[2.4, 1.35, 0.08]} position={[0, 1.55, 0.12]} radius={0.02} castShadow>
          <Mat color="#0d1210" roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[3.8, 0.45, 0.35]} position={[0, 0.35, 0.2]} radius={0.04} castShadow>
          <Mat color="#1a2f28" roughness={0.65} />
        </RoundedBox>
      </InspectGroup>

      {/* Reading chair */}
      <InspectGroup item={item(3)} onInspect={onInspect} position={[2.4, 0, 0.2]}>
        <RoundedBox args={[0.95, 0.35, 0.95]} position={[0, 0.4, 0]} radius={0.08} castShadow>
          <Mat color="#b47b54" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.95, 0.85, 0.22]} position={[0, 0.85, -0.35]} radius={0.06} castShadow>
          <Mat color="#a36c48" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 1.15, 0.1]} castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <Mat color="#c48a5e" roughness={0.75} />
        </mesh>
      </InspectGroup>
    </group>
  );
}

function DiningFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  const chairZs = [-1.0, -0.35, 0.35, 1.0];
  return (
    <group position={[x, 0, 0]}>
      <InspectGroup item={item(0)} onInspect={onInspect}>
        <RoundedBox args={[3.0, 0.1, 1.4]} position={[0, 0.78, 0]} radius={0.04} castShadow>
          <Mat color="#7a5538" roughness={0.4} metalness={0.08} />
        </RoundedBox>
        {[
          [-1.2, -0.5],
          [1.2, -0.5],
          [-1.2, 0.5],
          [1.2, 0.5],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.38, lz]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.76, 10]} />
            <Mat color="#5a3e2a" roughness={0.5} />
          </mesh>
        ))}
      </InspectGroup>

      <InspectGroup item={item(1)} onInspect={onInspect} position={[0, 2.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <Mat color="#8a7a5a" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.7, 0.12, 24]} />
          <Mat color="#d8b45a" roughness={0.25} metalness={0.55} emissive="#d8b45a" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={0.6} color="#ffd89a" distance={5} />
      </InspectGroup>

      <InspectGroup item={item(2)} onInspect={onInspect} position={[3.0, 0, -1.6]}>
        <RoundedBox args={[0.5, 1.1, 2.4]} position={[0, 0.6, 0]} radius={0.04} castShadow>
          <Mat color="#3a5246" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.52, 0.06, 2.42]} position={[0, 1.18, 0]} radius={0.02} castShadow>
          <Mat color="#d8b45a" roughness={0.3} metalness={0.4} />
        </RoundedBox>
      </InspectGroup>

      <InspectGroup item={item(3)} onInspect={onInspect}>
        {chairZs.map((z, i) => (
          <group key={`L${i}`} position={[-1.85, 0, z]}>
            <RoundedBox args={[0.5, 0.12, 0.5]} position={[0, 0.48, 0]} radius={0.04} castShadow>
              <Mat color="#c4b08c" roughness={0.7} />
            </RoundedBox>
            <RoundedBox args={[0.5, 0.7, 0.1]} position={[0, 0.85, -0.2]} radius={0.03} castShadow>
              <Mat color="#b8a480" roughness={0.7} />
            </RoundedBox>
            <mesh position={[0, 0.24, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.48, 8]} />
              <Mat color="#5a4634" />
            </mesh>
          </group>
        ))}
        {chairZs.map((z, i) => (
          <group key={`R${i}`} position={[1.85, 0, z]}>
            <RoundedBox args={[0.5, 0.12, 0.5]} position={[0, 0.48, 0]} radius={0.04} castShadow>
              <Mat color="#c4b08c" roughness={0.7} />
            </RoundedBox>
            <RoundedBox args={[0.5, 0.7, 0.1]} position={[0, 0.85, -0.2]} radius={0.03} castShadow>
              <Mat color="#b8a480" roughness={0.7} />
            </RoundedBox>
            <mesh position={[0, 0.24, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.48, 8]} />
              <Mat color="#5a4634" />
            </mesh>
          </group>
        ))}
      </InspectGroup>
    </group>
  );
}

function KitchenFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <group position={[x, 0, 0]}>
      {/* Island with sink + bar stools */}
      <InspectGroup item={item(0)} onInspect={onInspect} position={[0.15, 0, 0.55]}>
        {/* base cabinets */}
        <RoundedBox args={[2.9, 0.95, 1.35]} position={[0, 0.48, 0]} radius={0.04} castShadow>
          <Mat color="#ebe4d6" roughness={0.55} />
        </RoundedBox>
        {/* countertop */}
        <RoundedBox args={[3.05, 0.1, 1.48]} position={[0, 1.0, 0]} radius={0.03} castShadow>
          <Mat color="#2c3330" roughness={0.35} metalness={0.25} />
        </RoundedBox>
        {/* undermount sink */}
        <mesh position={[-0.55, 1.02, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 24]} />
          <Mat color="#8a9490" roughness={0.2} metalness={0.75} />
        </mesh>
        <mesh position={[-0.55, 0.88, 0.1]}>
          <cylinderGeometry args={[0.2, 0.18, 0.22, 20]} />
          <Mat color="#6a7470" roughness={0.25} metalness={0.7} />
        </mesh>
        {/* faucet */}
        <mesh position={[-0.55, 1.22, -0.15]}>
          <cylinderGeometry args={[0.025, 0.03, 0.35, 10]} />
          <Mat color="#c0c8c4" roughness={0.2} metalness={0.85} />
        </mesh>
        <mesh position={[-0.55, 1.38, -0.02]} rotation={[Math.PI / 2.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
          <Mat color="#c0c8c4" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* cooktop burners on island */}
        {[
          [0.55, 0.2],
          [0.95, 0.2],
          [0.55, -0.2],
          [0.95, -0.2],
        ].map(([cx, cz], i) => (
          <mesh key={i} position={[cx, 1.06, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.16, 20]} />
            <Mat color="#1a1c1b" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        {/* bar stools */}
        {[-0.7, 0.7].map((sz, i) => (
          <group key={i} position={[1.0, 0, 0.95 + sz * 0.05]}>
            <mesh position={[0, 0.55, 0.55]} castShadow>
              <cylinderGeometry args={[0.18, 0.2, 0.08, 16]} />
              <Mat color="#5a4638" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.28, 0.55]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.55, 8]} />
              <Mat color="#8a8a82" roughness={0.3} metalness={0.6} />
            </mesh>
          </group>
        ))}
      </InspectGroup>

      {/* Cooking wall: cabinets + oven + hood */}
      <InspectGroup item={item(1)} onInspect={onInspect} position={[-2.7, 0, -2.9]}>
        {/* lower cabinets */}
        <RoundedBox args={[2.0, 0.95, 0.55]} position={[0, 0.48, 0]} radius={0.03} castShadow>
          <Mat color="#3a4842" roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[2.1, 0.08, 0.6]} position={[0, 1.0, 0]} radius={0.02} castShadow>
          <Mat color="#2a322e" roughness={0.3} metalness={0.3} />
        </RoundedBox>
        {/* oven face */}
        <RoundedBox args={[0.7, 0.75, 0.08]} position={[0.45, 0.5, 0.28]} radius={0.02} castShadow>
          <Mat color="#1a1e1c" roughness={0.35} metalness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.55, 0.45, 0.04]} position={[0.45, 0.52, 0.33]} radius={0.01}>
          <Mat color="#0a0c0b" roughness={0.2} metalness={0.3} />
        </RoundedBox>
        {/* range hood */}
        <mesh position={[0, 2.15, 0.1]} castShadow>
          <boxGeometry args={[1.3, 0.12, 0.55]} />
          <Mat color="#c8cec8" roughness={0.25} metalness={0.7} />
        </mesh>
        <mesh position={[0, 2.55, 0]} castShadow>
          <boxGeometry args={[0.45, 0.7, 0.35]} />
          <Mat color="#a8aea8" roughness={0.3} metalness={0.65} />
        </mesh>
        {/* upper cabinets */}
        <RoundedBox args={[2.0, 0.85, 0.4]} position={[0, 2.35, -0.05]} radius={0.03} castShadow>
          <Mat color="#3a4842" roughness={0.55} />
        </RoundedBox>
        {/* backsplash */}
        <mesh position={[0, 1.45, -0.22]}>
          <boxGeometry args={[2.0, 0.85, 0.04]} />
          <Mat color="#d8cfc0" roughness={0.4} metalness={0.15} />
        </mesh>
      </InspectGroup>

      {/* Tall storage + fridge */}
      <InspectGroup item={item(2)} onInspect={onInspect} position={[2.85, 0, -2.7]}>
        {/* fridge */}
        <RoundedBox args={[1.0, 2.4, 0.7]} position={[-0.55, 1.25, 0]} radius={0.04} castShadow>
          <Mat color="#d0d4d0" roughness={0.3} metalness={0.45} />
        </RoundedBox>
        <mesh position={[-0.1, 1.4, 0.36]}>
          <boxGeometry args={[0.04, 0.5, 0.04]} />
          <Mat color="#8a8e8a" roughness={0.25} metalness={0.7} />
        </mesh>
        {/* pantry */}
        <RoundedBox args={[0.95, 2.5, 0.6]} position={[0.55, 1.3, 0]} radius={0.04} castShadow>
          <Mat color="#6a5844" roughness={0.55} />
        </RoundedBox>
        {/* door lines */}
        <mesh position={[0.55, 1.3, 0.32]}>
          <boxGeometry args={[0.02, 2.3, 0.01]} />
          <Mat color="#4a3c30" />
        </mesh>
      </InspectGroup>

      {/* Wash counter along back wall */}
      <InspectGroup item={item(3)} onInspect={onInspect} position={[0.2, 0, -2.85]}>
        <RoundedBox args={[2.6, 0.95, 0.55]} position={[0, 0.48, 0]} radius={0.03} castShadow>
          <Mat color="#e8e0d2" roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[2.75, 0.08, 0.62]} position={[0, 1.0, 0]} radius={0.02} castShadow>
          <Mat color="#c8c0b2" roughness={0.4} metalness={0.15} />
        </RoundedBox>
        {/* double sink */}
        {[-0.4, 0.4].map((sx, i) => (
          <mesh key={i} position={[sx, 1.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.55, 0.35]} />
            <Mat color="#7a8280" roughness={0.2} metalness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 1.25, -0.15]}>
          <cylinderGeometry args={[0.03, 0.035, 0.4, 10]} />
          <Mat color="#b8c0bc" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* upper cabinets */}
        <RoundedBox args={[2.6, 0.75, 0.38]} position={[0, 2.25, -0.05]} radius={0.03} castShadow>
          <Mat color="#e0d8ca" roughness={0.55} />
        </RoundedBox>
      </InspectGroup>
    </group>
  );
}

function BedroomFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <group position={[x, 0, 0]}>
      <InspectGroup item={item(0)} onInspect={onInspect} position={[0, 0, 0.2]}>
        {/* mattress + base */}
        <RoundedBox args={[2.4, 0.35, 3.4]} position={[0, 0.4, 0]} radius={0.08} castShadow>
          <Mat color="#e8dfd0" roughness={0.85} />
        </RoundedBox>
        <RoundedBox args={[2.5, 0.3, 3.5]} position={[0, 0.18, 0]} radius={0.04} castShadow>
          <Mat color="#6a5544" roughness={0.6} />
        </RoundedBox>
        {/* pillows */}
        {[-0.55, 0.55].map((px, i) => (
          <RoundedBox key={i} args={[0.85, 0.22, 0.5]} position={[px, 0.7, -1.3]} radius={0.08} castShadow>
            <Mat color="#f2ebe0" roughness={0.9} />
          </RoundedBox>
        ))}
        {/* headboard */}
        <RoundedBox args={[2.6, 1.1, 0.12]} position={[0, 1.0, -1.7]} radius={0.04} castShadow>
          <Mat color="#5a4638" roughness={0.55} />
        </RoundedBox>
        {/* duvet fold */}
        <RoundedBox args={[2.2, 0.12, 1.8]} position={[0, 0.62, 0.5]} radius={0.05} castShadow>
          <Mat color="#d4c4a8" roughness={0.85} />
        </RoundedBox>
      </InspectGroup>

      <InspectGroup item={item(1)} onInspect={onInspect} position={[2.9, 0, -2.4]}>
        <RoundedBox args={[1.3, 2.5, 0.55]} position={[0, 1.3, 0]} radius={0.04} castShadow>
          <Mat color="#5a4638" roughness={0.55} />
        </RoundedBox>
        {[-0.3, 0.3].map((dx, i) => (
          <mesh key={i} position={[dx, 1.3, 0.29]}>
            <boxGeometry args={[0.02, 2.3, 0.01]} />
            <Mat color="#3a3028" />
          </mesh>
        ))}
        <mesh position={[-0.55, 1.5, 0.29]}>
          <boxGeometry args={[0.04, 0.35, 0.04]} />
          <Mat color="#d8b45a" roughness={0.3} metalness={0.5} />
        </mesh>
      </InspectGroup>

      <InspectGroup item={item(2)} onInspect={onInspect}>
        {[-1.55, 1.55].map((sx, i) => (
          <group key={i} position={[sx, 0, -1.1]}>
            <RoundedBox args={[0.55, 0.55, 0.5]} position={[0, 0.35, 0]} radius={0.04} castShadow>
              <Mat color="#6a5040" roughness={0.5} />
            </RoundedBox>
            <mesh position={[0, 0.85, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.35, 10]} />
              <Mat color="#d8b45a" roughness={0.3} metalness={0.55} />
            </mesh>
            <mesh position={[0, 1.05, 0]} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
              <Mat color="#f5e6c0" roughness={0.4} emissive="#d8b45a" />
            </mesh>
            <pointLight position={[0, 1.1, 0]} intensity={0.25} color="#ffd89a" distance={2.5} />
          </group>
        ))}
      </InspectGroup>

      <InspectGroup item={item(3)} onInspect={onInspect} position={[0, 0, 2.3]}>
        <RoundedBox args={[1.8, 0.45, 0.55]} position={[0, 0.4, 0]} radius={0.08} castShadow>
          <Mat color="#a77c59" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[1.8, 0.12, 0.55]} position={[0, 0.65, 0]} radius={0.04} castShadow>
          <Mat color="#b88a68" roughness={0.75} />
        </RoundedBox>
      </InspectGroup>
    </group>
  );
}

function WashroomFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <group position={[x, 0, 0]}>
      {/* Double vanity + mirror */}
      <InspectGroup item={item(0)} onInspect={onInspect} position={[-2.0, 0, -2.85]}>
        {/* cabinet */}
        <RoundedBox args={[2.5, 0.75, 0.55]} position={[0, 0.45, 0]} radius={0.04} castShadow>
          <Mat color="#e8e2d6" roughness={0.5} />
        </RoundedBox>
        {/* counter */}
        <RoundedBox args={[2.6, 0.08, 0.6]} position={[0, 0.86, 0]} radius={0.02} castShadow>
          <Mat color="#f0ebe4" roughness={0.35} metalness={0.1} />
        </RoundedBox>
        {/* two basins */}
        {[-0.6, 0.6].map((bx, i) => (
          <group key={i} position={[bx, 0.9, 0.05]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.16, 0.24, 28]} />
              <Mat color="#f5f2ec" roughness={0.25} metalness={0.15} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.18, 0.14, 0.14, 24]} />
              <Mat color="#e0dcd4" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* faucet */}
            <mesh position={[0, 0.18, -0.18]}>
              <cylinderGeometry args={[0.02, 0.025, 0.28, 10]} />
              <Mat color="#c0c8c8" roughness={0.15} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.3, -0.08]} rotation={[Math.PI / 2.6, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
              <Mat color="#c0c8c8" roughness={0.15} metalness={0.9} />
            </mesh>
          </group>
        ))}
        {/* mirror */}
        <RoundedBox args={[2.3, 1.2, 0.05]} position={[0, 1.85, -0.22]} radius={0.03} castShadow>
          <Mat color="#a8c0c8" roughness={0.1} metalness={0.85} />
        </RoundedBox>
        <mesh position={[0, 1.85, -0.18]}>
          <planeGeometry args={[2.1, 1.05]} />
          <meshStandardMaterial color="#d8e8f0" metalness={0.9} roughness={0.08} />
        </mesh>
        {/* mirror light bar */}
        <mesh position={[0, 2.5, -0.15]}>
          <boxGeometry args={[2.0, 0.06, 0.08]} />
          <Mat color="#f5ecd0" roughness={0.3} emissive="#d8b45a" />
        </mesh>
        <pointLight position={[0, 2.3, 0.3]} intensity={0.4} color="#fff5e0" distance={4} />
      </InspectGroup>

      {/* Glass rain shower */}
      <InspectGroup item={item(1)} onInspect={onInspect} position={[2.35, 0, -2.0]}>
        {/* shower base tray */}
        <RoundedBox args={[1.9, 0.12, 1.7]} position={[0, 0.06, 0]} radius={0.04} receiveShadow>
          <Mat color="#d8d4cc" roughness={0.45} />
        </RoundedBox>
        {/* glass walls (transparent) */}
        <mesh position={[-0.9, 1.2, 0]}>
          <boxGeometry args={[0.04, 2.2, 1.65]} />
          <meshPhysicalMaterial
            color="#c8e0e8"
            transparent
            opacity={0.22}
            roughness={0.05}
            metalness={0.1}
            transmission={0.6}
            thickness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.2, 0.82]}>
          <boxGeometry args={[1.8, 2.2, 0.04]} />
          <meshPhysicalMaterial
            color="#c8e0e8"
            transparent
            opacity={0.2}
            roughness={0.05}
            metalness={0.1}
            transmission={0.6}
            thickness={0.2}
          />
        </mesh>
        {/* metal frame */}
        {[
          [-0.9, 0, -0.82],
          [-0.9, 0, 0.82],
          [0.9, 0, -0.82],
          [0.9, 0, 0.82],
        ].map(([fx, , fz], i) => (
          <mesh key={i} position={[fx, 1.15, fz]}>
            <cylinderGeometry args={[0.025, 0.025, 2.2, 8]} />
            <Mat color="#b0b8b8" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}
        {/* rain head */}
        <mesh position={[0.2, 2.35, -0.2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <Mat color="#a8b0b0" roughness={0.2} metalness={0.85} />
        </mesh>
        <mesh position={[0.2, 2.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
          <Mat color="#a0a8a8" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* water droplet suggestion */}
        <mesh position={[0.2, 1.4, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.2, 6]} />
          <meshStandardMaterial color="#9ed4e8" transparent opacity={0.25} />
        </mesh>
        {/* wall tiles behind */}
        <mesh position={[0, 1.2, -0.85]}>
          <boxGeometry args={[1.85, 2.2, 0.06]} />
          <Mat color="#8a9e9a" roughness={0.4} metalness={0.15} />
        </mesh>
      </InspectGroup>

      {/* Freestanding soaking tub */}
      <InspectGroup item={item(2)} onInspect={onInspect} position={[0.5, 0, 1.7]}>
        {/* oval tub body */}
        <mesh position={[0, 0.42, 0]} scale={[1.55, 0.7, 0.85]} castShadow>
          <sphereGeometry args={[0.75, 28, 18]} />
          <Mat color="#f0ebe4" roughness={0.28} metalness={0.06} />
        </mesh>
        {/* inner basin cut-look */}
        <mesh position={[0, 0.58, 0]} scale={[1.25, 0.25, 0.65]} castShadow>
          <sphereGeometry args={[0.7, 24, 14]} />
          <Mat color="#e4e0d8" roughness={0.35} />
        </mesh>
        {/* water */}
        <mesh position={[0, 0.55, 0]} scale={[1.15, 0.08, 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 28]} />
          <meshPhysicalMaterial
            color="#6eb0c4"
            transparent
            opacity={0.55}
            roughness={0.08}
            metalness={0.1}
            transmission={0.35}
          />
        </mesh>
        {/* floor faucet */}
        <mesh position={[-1.2, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.2, 10]} />
          <Mat color="#b8c0c0" roughness={0.15} metalness={0.9} />
        </mesh>
        <mesh position={[-1.0, 1.2, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
          <Mat color="#b8c0c0" roughness={0.15} metalness={0.9} />
        </mesh>
        {/* towel rail */}
        <mesh position={[1.45, 1.1, 0.85]} castShadow>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <Mat color="#c0c8c8" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[1.45, 1.35, 0.65]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.35, 0.5, 0.08]} />
          <Mat color="#e8e0d4" roughness={0.85} />
        </mesh>
      </InspectGroup>

      {/* WC / fixture zone */}
      <InspectGroup item={item(3)} onInspect={onInspect} position={[-2.7, 0, 1.6]}>
        {/* toilet base */}
        <mesh position={[0, 0.22, 0.15]} castShadow>
          <boxGeometry args={[0.45, 0.35, 0.55]} />
          <Mat color="#f2f0ea" roughness={0.3} />
        </mesh>
        {/* bowl */}
        <mesh position={[0, 0.42, 0.05]} castShadow>
          <cylinderGeometry args={[0.22, 0.2, 0.2, 20]} />
          <Mat color="#f5f3ee" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.5, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 20]} />
          <Mat color="#2a3538" roughness={0.4} />
        </mesh>
        {/* seat ring */}
        <mesh position={[0, 0.54, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.22, 24]} />
          <Mat color="#e8e4dc" roughness={0.4} />
        </mesh>
        {/* cistern / wall unit */}
        <RoundedBox args={[0.55, 0.7, 0.2]} position={[0, 0.95, -0.3]} radius={0.03} castShadow>
          <Mat color="#e8e4dc" roughness={0.4} />
        </RoundedBox>
        {/* flush plate */}
        <mesh position={[0, 1.0, -0.18]}>
          <boxGeometry args={[0.25, 0.15, 0.02]} />
          <Mat color="#c0c8c8" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* toilet paper holder */}
        <mesh position={[0.4, 0.7, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <Mat color="#b0b8b8" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.4, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 12]} />
          <Mat color="#f0ebe4" roughness={0.8} />
        </mesh>
      </InspectGroup>
    </group>
  );
}

function BalconyFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <group position={[x, 0, 0]}>
      <InspectGroup item={item(0)} onInspect={onInspect} position={[-1.2, 0, 0.2]}>
        <RoundedBox args={[2.3, 0.4, 1.0]} position={[0, 0.35, 0]} radius={0.08} castShadow>
          <Mat color="#c1aa83" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[2.3, 0.55, 0.22]} position={[0, 0.7, -0.4]} radius={0.05} castShadow>
          <Mat color="#b09a74" roughness={0.7} />
        </RoundedBox>
      </InspectGroup>

      <InspectGroup item={item(1)} onInspect={onInspect} position={[2.8, 0, -1.5]}>
        <RoundedBox args={[0.7, 0.55, 2.4]} position={[0, 0.3, 0]} radius={0.04} castShadow>
          <Mat color="#3d5c48" roughness={0.75} />
        </RoundedBox>
        {[0.6, 0, -0.6, -1.2].map((pz, i) => (
          <mesh key={i} position={[0, 0.85, pz]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <Mat color="#2d6b42" roughness={0.8} />
          </mesh>
        ))}
      </InspectGroup>

      <InspectGroup item={item(2)} onInspect={onInspect} position={[0.6, 0, 1.1]}>
        <RoundedBox args={[0.85, 0.08, 0.85]} position={[0, 0.45, 0]} radius={0.04} castShadow>
          <Mat color="#785d45" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.44, 10]} />
          <Mat color="#5a4634" />
        </mesh>
      </InspectGroup>

      <InspectGroup item={item(3)} onInspect={onInspect} position={[0, 0, 3.25]}>
        {/* glass rail */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[6.2, 1.0, 0.04]} />
          <meshPhysicalMaterial color="#c8dce8" transparent opacity={0.25} roughness={0.05} metalness={0.1} transmission={0.5} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[6.3, 0.06, 0.08]} />
          <Mat color="#d8b45a" roughness={0.3} metalness={0.6} />
        </mesh>
        {[-3, -1.5, 0, 1.5, 3].map((px) => (
          <mesh key={px} position={[px, 0.65, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <Mat color="#d8b45a" roughness={0.3} metalness={0.55} />
          </mesh>
        ))}
      </InspectGroup>
    </group>
  );
}

function PoolFurniture({
  x,
  item,
  onInspect,
}: {
  x: number;
  item: (n: number) => Inspectable;
  onInspect: (item: Inspectable | null) => void;
}) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.28 + Math.sin(clock.elapsedTime * 1.2) * 0.015;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* Pool basin — real sunken water body */}
      <InspectGroup item={item(0)} onInspect={onInspect} position={[0, 0, -0.15]}>
        {/* outer deck rim / coping */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[5.4, 0.12, 3.9]} />
          <Mat color="#d8d0c0" roughness={0.55} />
        </mesh>
        {/* pool shell walls (below deck) */}
        {/* long sides */}
        <mesh position={[0, -0.35, -1.75]}>
          <boxGeometry args={[5.0, 0.9, 0.12]} />
          <Mat color="#3a8a9a" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.35, 1.75]}>
          <boxGeometry args={[5.0, 0.9, 0.12]} />
          <Mat color="#3a8a9a" roughness={0.4} />
        </mesh>
        {/* short sides */}
        <mesh position={[-2.45, -0.35, 0]}>
          <boxGeometry args={[0.12, 0.9, 3.5]} />
          <Mat color="#3a8a9a" roughness={0.4} />
        </mesh>
        <mesh position={[2.45, -0.35, 0]}>
          <boxGeometry args={[0.12, 0.9, 3.5]} />
          <Mat color="#3a8a9a" roughness={0.4} />
        </mesh>
        {/* floor of pool */}
        <mesh position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.9, 3.4]} />
          <Mat color="#2a6a7a" roughness={0.5} />
        </mesh>
        {/* water surface */}
        <mesh ref={waterRef} position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.85, 3.35]} />
          <meshPhysicalMaterial
            color="#2a9eb8"
            transparent
            opacity={0.72}
            roughness={0.08}
            metalness={0.15}
            transmission={0.35}
            thickness={0.8}
            ior={1.33}
          />
        </mesh>
        {/* shallow steps */}
        {[0, 1, 2].map((s) => (
          <mesh key={s} position={[-2.0 + s * 0.35, -0.55 + s * 0.18, 1.2]} receiveShadow>
            <boxGeometry args={[0.55, 0.12, 0.9]} />
            <Mat color="#4a9aaa" roughness={0.45} />
          </mesh>
        ))}
        {/* lane marker lines */}
        {[-0.8, 0, 0.8].map((lz) => (
          <mesh key={lz} position={[0, -0.76, lz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 0.06]} />
            <meshBasicMaterial color="#e8f0f4" transparent opacity={0.5} />
          </mesh>
        ))}
      </InspectGroup>

      {/* Sun loungers */}
      <InspectGroup item={item(1)} onInspect={onInspect} position={[-1.9, 0, 2.55]}>
        {[0, 1.5].map((ox, i) => (
          <group key={i} position={[ox, 0, 0]}>
            {/* frame */}
            <RoundedBox args={[0.75, 0.08, 1.9]} position={[0, 0.28, 0]} radius={0.03} castShadow>
              <Mat color="#e8dcc4" roughness={0.65} />
            </RoundedBox>
            {/* backrest tilted */}
            <group position={[0, 0.55, -0.7]} rotation={[-0.55, 0, 0]}>
              <RoundedBox args={[0.75, 0.08, 0.85]} radius={0.03} castShadow>
                <Mat color="#e0d4b8" roughness={0.65} />
              </RoundedBox>
            </group>
            {/* legs */}
            {[
              [-0.28, 0.7],
              [0.28, 0.7],
              [-0.28, -0.7],
              [0.28, -0.7],
            ].map(([lx, lz], li) => (
              <mesh key={li} position={[lx, 0.14, lz]} castShadow>
                <cylinderGeometry args={[0.025, 0.03, 0.28, 8]} />
                <Mat color="#8a8a82" roughness={0.3} metalness={0.5} />
              </mesh>
            ))}
            {/* side table between loungers is only on first */}
            {i === 0 && (
              <mesh position={[0.75, 0.32, 0.3]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
                <Mat color="#c8b898" roughness={0.5} />
              </mesh>
            )}
          </group>
        ))}
      </InspectGroup>

      {/* Underwater / edge lights */}
      <InspectGroup item={item(2)} onInspect={onInspect} position={[0, 0, 0]}>
        {[
          [-2.0, -1.5],
          [0, -1.5],
          [2.0, -1.5],
          [-2.0, 1.5],
          [2.0, 1.5],
        ].map(([lx, lz], i) => (
          <group key={i} position={[lx, 0.12, lz]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.1, 16]} />
              <Mat color="#d8b45a" roughness={0.25} metalness={0.6} emissive="#d8b45a" />
            </mesh>
            <pointLight position={[0, 0.1, 0]} intensity={0.35} color="#7ec8e0" distance={3} />
          </group>
        ))}
      </InspectGroup>

      {/* Deck outdoor shower */}
      <InspectGroup item={item(3)} onInspect={onInspect} position={[2.95, 0, -2.55]}>
        {/* pole */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 2.3, 12]} />
          <Mat color="#c0c8c8" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* curved arm */}
        <mesh position={[0, 2.2, 0.25]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
          <Mat color="#c0c8c8" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* shower head */}
        <mesh position={[0, 2.05, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.04, 20]} />
          <Mat color="#a8b0b0" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* base plate */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <Mat color="#b0b8b8" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* handle */}
        <mesh position={[0.12, 1.0, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.04]} />
          <Mat color="#a0a8a8" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* water spray hint */}
        <mesh position={[0, 1.4, 0.45]}>
          <coneGeometry args={[0.12, 0.9, 10, 1, true]} />
          <meshStandardMaterial color="#9ed4e8" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      </InspectGroup>

      {/* Pool ladder */}
      <group position={[2.3, 0, 1.4]}>
        {[0.35, 0.7, 1.05].map((hy, i) => (
          <mesh key={i} position={[0, hy, 0]} castShadow>
            <boxGeometry args={[0.55, 0.04, 0.04]} />
            <Mat color="#c0c8c8" roughness={0.2} metalness={0.8} />
          </mesh>
        ))}
        {[-0.25, 0.25].map((hx) => (
          <mesh key={hx} position={[hx, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.4, 8]} />
            <Mat color="#c0c8c8" roughness={0.2} metalness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Room shell (indoor vs outdoor pool)                                */
/* ------------------------------------------------------------------ */

function RoomShell({ room, index, active }: { room: Space; index: number; active: boolean }) {
  const x = index * ROOM_GAP;
  const isPool = room.id === "pool";
  const isBalcony = room.id === "balcony";
  const isWash = room.id === "washroom";
  const isKitchen = room.id === "kitchen";

  const floorColor = useMemo(() => {
    if (isPool) return "#c8bfa8";
    if (isWash) return "#e8e4dc";
    if (isKitchen) return "#c4bba8";
    if (isBalcony) return "#b0a898";
    return "#9e998d";
  }, [isPool, isWash, isKitchen, isBalcony]);

  const activeFloor = useMemo(() => {
    if (isPool) return "#d8cfb8";
    if (isWash) return "#f2efe8";
    if (isKitchen) return "#d4cbb8";
    return "#d8cfbd";
  }, [isPool, isWash, isKitchen]);

  const floorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const activeCol = useRef(new THREE.Color(activeFloor)).current;
  const idleCol = useRef(new THREE.Color(floorColor)).current;

  useEffect(() => {
    activeCol.set(activeFloor);
    idleCol.set(floorColor);
  }, [activeFloor, floorColor, activeCol, idleCol]);

  useEffect(() => {
    if (!floorMatRef.current) return;
    const target = active ? activeCol : idleCol;
    gsap.to(floorMatRef.current.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [active, activeCol, idleCol]);

  if (isPool) {
    return (
      <group position={[x, 0, 0]}>
        {/* outdoor deck ground — larger open area */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[ROOM_WIDTH + 0.8, ROOM_DEPTH + 0.6]} />
          <meshStandardMaterial ref={floorMatRef} color={floorColor} roughness={0.85} />
        </mesh>
        {/* stone paver grid suggestion */}
        {[-2, 0, 2].map((gx) =>
          [-2.5, 0, 2.5].map((gz) => (
            <mesh key={`${gx}-${gz}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx, 0.01, gz]}>
              <planeGeometry args={[1.8, 2.2]} />
              <meshStandardMaterial color="#b8ae98" roughness={0.9} transparent opacity={0.35} />
            </mesh>
          ))
        )}
        {/* back garden wall (low) */}
        <mesh position={[0, 0.6, -ROOM_DEPTH / 2]} receiveShadow>
          <boxGeometry args={[ROOM_WIDTH + 0.5, 1.2, 0.2]} />
          <meshStandardMaterial color="#6a7a68" roughness={0.85} />
        </mesh>
        {/* greenery behind wall */}
        {[-2.5, -1, 0.5, 2, 3].map((px, i) => (
          <mesh key={i} position={[px * 0.9, 1.4, -ROOM_DEPTH / 2 - 0.3]} castShadow>
            <sphereGeometry args={[0.45 + (i % 2) * 0.15, 12, 12]} />
            <meshStandardMaterial color={i % 2 ? "#2d6b42" : "#3a7a4e"} roughness={0.9} />
          </mesh>
        ))}
        <Text position={[0, 2.2, -3.5]} fontSize={0.28} color="#d8b45a" anchorX="center">
          {room.name.toUpperCase()}
        </Text>
        {/* entrance path marker */}
        <mesh position={[0, 0.02, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 0.35]} />
          <meshBasicMaterial color="#d8b45a" />
        </mesh>
      </group>
    );
  }

  const wallColor = isWash ? "#e8f0ee" : isKitchen ? "#f0ebe2" : "#e9e2d4";
  const sideWall = isWash ? "#dce8e4" : "#ded5c4";

  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          ref={floorMatRef}
          color={floorColor}
          roughness={isWash ? 0.35 : 0.9}
          metalness={isWash ? 0.15 : 0}
        />
      </mesh>

      {/* washroom tile grid hint */}
      {isWash &&
        [-2.5, -1.25, 0, 1.25, 2.5].map((tx) =>
          [-2.5, -1.25, 0, 1.25, 2.5].map((tz) => (
            <mesh key={`${tx}-${tz}`} rotation={[-Math.PI / 2, 0, 0]} position={[tx, 0.005, tz]}>
              <planeGeometry args={[1.15, 1.15]} />
              <meshStandardMaterial color="#ddd8d0" roughness={0.4} metalness={0.1} transparent opacity={0.4} />
            </mesh>
          ))
        )}

      <mesh position={[0, 1.5, -ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH, 3, 0.12]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, ROOM_DEPTH]} />
        <meshStandardMaterial color={sideWall} roughness={0.95} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, ROOM_DEPTH]} />
        <meshStandardMaterial color={sideWall} roughness={0.95} />
      </mesh>

      {/* kitchen backsplash strip */}
      {isKitchen && (
        <mesh position={[0, 1.35, -ROOM_DEPTH / 2 + 0.08]}>
          <boxGeometry args={[ROOM_WIDTH - 0.4, 0.7, 0.04]} />
          <meshStandardMaterial color="#c8bfb0" roughness={0.4} metalness={0.2} />
        </mesh>
      )}

      {/* balcony open front suggestion */}
      {isBalcony ? (
        <mesh position={[0, 2.6, ROOM_DEPTH / 2 - 0.1]}>
          <boxGeometry args={[ROOM_WIDTH, 0.15, 0.15]} />
          <meshStandardMaterial color="#d8b45a" roughness={0.4} metalness={0.4} />
        </mesh>
      ) : null}

      <Text position={[0, 2.55, -3.45]} fontSize={0.26} color="#284b3e" anchorX="center">
        {room.name.toUpperCase()}
      </Text>
      <mesh position={[0, 0.015, 3.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 0.38]} />
        <meshBasicMaterial color="#d8b45a" />
      </mesh>
    </group>
  );
}

function RoomFurniture({
  room,
  index,
  onInspect,
}: {
  room: Space;
  index: number;
  onInspect: (item: Inspectable | null) => void;
}) {
  const x = index * ROOM_GAP;
  const entries =
    objectDetails[room.id] ??
    room.features.map((feature) => [feature, "Verified property feature."] as [string, string]);
  const item = (number: number): Inspectable => ({
    name: entries[number]?.[0] ?? room.features[number] ?? "Room feature",
    detail: entries[number]?.[1] ?? room.features[number] ?? "Inspected detail",
    room: index,
  });

  if (room.id === "living") return <LivingFurniture x={x} item={item} onInspect={onInspect} />;
  if (room.id === "dining") return <DiningFurniture x={x} item={item} onInspect={onInspect} />;
  if (room.id === "kitchen") return <KitchenFurniture x={x} item={item} onInspect={onInspect} />;
  if (room.id === "bedroom") return <BedroomFurniture x={x} item={item} onInspect={onInspect} />;
  if (room.id === "washroom") return <WashroomFurniture x={x} item={item} onInspect={onInspect} />;
  if (room.id === "pool") return <PoolFurniture x={x} item={item} onInspect={onInspect} />;
  return <BalconyFurniture x={x} item={item} onInspect={onInspect} />;
}

/* ------------------------------------------------------------------ */
/*  Maya + camera                                                      */
/* ------------------------------------------------------------------ */

function Maya({
  targetX,
  onArrive,
  state,
}: {
  targetX: number;
  onArrive: () => void;
  state: TourState;
}) {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const runningRef = useRef(false);
  const intensity = useRef(0);

  useEffect(() => {
    if (state !== "running" || !group.current) return;
    const distance = Math.abs(targetX - group.current.position.x);
    runningRef.current = true;
    const tween = gsap.to(group.current.position, {
      x: targetX,
      duration: THREE.MathUtils.clamp(distance / 3.1, 0.5, 3.2),
      ease: "power2.inOut",
      onComplete: () => {
        runningRef.current = false;
        onArrive();
      },
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX, state]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const target = runningRef.current ? 1 : 0;
    intensity.current = THREE.MathUtils.damp(intensity.current, target, 7, delta);
    const swing = Math.sin(clock.elapsedTime * 12) * intensity.current;
    group.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.055 * intensity.current;
    if (leftArm.current) leftArm.current.rotation.x = swing * 0.7;
    if (rightArm.current) rightArm.current.rotation.x = -swing * 0.7;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing * 0.55;
    if (rightLeg.current) rightLeg.current.rotation.x = swing * 0.55;
  });

  return (
    <group ref={group} position={[0, 0, 2.2]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#9b624b" />
      </mesh>
      <mesh position={[0, 1.87, -0.04]} scale={[1.08, 0.65, 1]} castShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#211913" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <coneGeometry args={[0.4, 1.2, 24]} />
        <meshStandardMaterial color="#17372d" />
      </mesh>
      <group ref={leftArm} position={[-0.3, 1.42, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.06, 0.55, 6, 10]} />
          <meshStandardMaterial color="#9b624b" />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.3, 1.42, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.06, 0.55, 6, 10]} />
          <meshStandardMaterial color="#9b624b" />
        </mesh>
      </group>
      <group ref={leftLeg} position={[-0.13, 0.55, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <capsuleGeometry args={[0.07, 0.58, 6, 10]} />
          <meshStandardMaterial color="#202522" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.13, 0.55, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <capsuleGeometry args={[0.07, 0.58, 6, 10]} />
          <meshStandardMaterial color="#202522" />
        </mesh>
      </group>
      <Html position={[0, 2.25, 0]} center distanceFactor={9}>
        <span className="rounded-full border border-brass/40 bg-evergreen/85 px-3 py-1 text-[10px] text-brass backdrop-blur">
          Maya
        </span>
      </Html>
    </group>
  );
}

function CameraDirector({ targetX, state }: { targetX: number; state: TourState }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!controls.current || state !== "running") return;
    controls.current.target.x = THREE.MathUtils.damp(controls.current.target.x, targetX, 1.8, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX + 4.8, 1.6, delta);
    controls.current.update();
  });
  return (
    <OrbitControls
      ref={controls}
      target={[targetX, 1, 0]}
      enablePan
      minDistance={3.2}
      maxDistance={14}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}

function PropertyWorld({
  spaces,
  activeRoom,
  targetRoom,
  state,
  onArrive,
  onInspect,
}: {
  spaces: Space[];
  activeRoom: number;
  targetRoom: number;
  state: TourState;
  onArrive: () => void;
  onInspect: (item: Inspectable | null) => void;
}) {
  return (
    <>
      <color attach="background" args={["#10231d"]} />
      <fog attach="fog" args={["#10231d", 20, 78]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[8, 14, 8]} intensity={2.1} color="#fff0cf" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 6, 4]} intensity={0.75} color="#6aa08d" />
      <hemisphereLight args={["#c8e0d8", "#3a4a40", 0.45]} />
      {spaces.map((room, index) => (
        <RoomShell key={`shell-${room.id}-${index}`} room={room} index={index} active={activeRoom === index} />
      ))}
      {spaces.map((room, index) => (
        <RoomFurniture key={`furniture-${room.id}-${index}`} room={room} index={index} onInspect={onInspect} />
      ))}
      <Maya targetX={targetRoom * ROOM_GAP} state={state} onArrive={onArrive} />
      <CameraDirector targetX={targetRoom * ROOM_GAP} state={state} />
      <Environment preset="apartment" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main UI                                                            */
/* ------------------------------------------------------------------ */

export default function SpacesRunthrough3D({ spaces }: { spaces: Space[] }) {
  const [activeRoom, setActiveRoom] = useState(0);
  const [targetRoom, setTargetRoom] = useState(0);
  const [state, setState] = useState<TourState>("idle");
  const [inspected, setInspected] = useState<Inspectable | null>(null);
  const [auto, setAuto] = useState(false);
  const [mode, setMode] = useState<"real" | "plan">("real");
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [realZoom, setRealZoom] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const active = spaces[activeRoom];

  const realViewScale = realZoom
    ? REAL_VIEW_PIN_SCALE
    : hovering
      ? REAL_VIEW_HOVER_SCALE
      : REAL_VIEW_BASE_SCALE;

  const travel = (index: number) => {
    if (index < 0 || index >= spaces.length || index === activeRoom || state === "running") return;
    setInspected(null);
    setViewOffset({ x: 0, y: 0 });
    setRealZoom(false);
    setHovering(false);
    setTargetRoom(index);
    setState("running");
  };

  const hoverTravel = (index: number) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => travel(index), 420);
  };

  const arrive = () => {
    setActiveRoom(targetRoom);
    setState("arrived");
  };

  useEffect(() => {
    if (!auto || state === "running") return;
    const timer = window.setTimeout(() => {
      if (activeRoom < spaces.length - 1) travel(activeRoom + 1);
      else setAuto(false);
    }, 7500);
    return () => window.clearTimeout(timer);
  }, [activeRoom, auto, spaces.length, state]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const inspectRealView = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const fx = (event.clientX - bounds.left) / bounds.width;
    const fy = (event.clientY - bounds.top) / bounds.height;
    const maxX = ((realViewScale - 1) * bounds.width) / 2;
    const maxY = ((realViewScale - 1) * bounds.height) / 2;
    setViewOffset({
      x: maxX * (1 - 2 * fx),
      y: maxY * (1 - 2 * fy),
    });
  };

  return (
    <section
      className="overflow-hidden rounded-[28px] border border-brass/25 bg-evergreen shadow-2xl shadow-black/40"
      aria-label="Game-style 3D property walkthrough"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
        <div>
          <p className="eyebrow">Playable 3D property</p>
          <p className="mt-1 text-xs text-fog">
            {mode === "real"
              ? "Hover the photo to zoom in close — move anywhere to inspect every corner."
              : "Mouse: rotate · Wheel: zoom · Right-drag: move · Hover furniture to inspect"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
            <button
              onClick={() => setMode("real")}
              className={`tour-view-btn ${mode === "real" ? "is-active" : ""}`}
            >
              Real view
            </button>
            <button
              onClick={() => setMode("plan")}
              className={`tour-view-btn ${mode === "plan" ? "is-active" : ""}`}
            >
              3D plan
            </button>
          </div>
          <button
            onClick={() => {
              setAuto((value) => !value);
              setState("arrived");
            }}
            className="tour-icon-btn"
          >
            {auto ? "Pause guided run" : "Start guided run"}
          </button>
        </div>
      </div>

      <div className="relative h-[720px] sm:h-[780px]">
        {mode === "real" && state !== "running" ? (
          <div
            className={`absolute inset-0 overflow-hidden bg-black transition-shadow duration-500 ${
              hovering || realZoom
                ? "shadow-[inset_0_0_0_2px_rgba(216,180,90,0.55)]"
                : "shadow-[inset_0_0_0_2px_rgba(216,180,90,0)]"
            }`}
            style={{ cursor: realZoom ? "zoom-out" : "zoom-in" }}
            onPointerEnter={(event) => {
              setHovering(true);
              inspectRealView(event);
            }}
            onPointerMove={inspectRealView}
            onPointerLeave={() => {
              setHovering(false);
              setViewOffset({ x: 0, y: 0 });
            }}
          >
            <Image
              src={roomVisuals[active.id] ?? active.image}
              alt={`Photorealistic ${active.name}`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="tour-room-image object-cover"
              style={{
                transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${realViewScale})`,
                transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-evergreen/55 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-evergreen/80 via-transparent to-evergreen/20" />
            {(
              objectDetails[active.id] ??
              active.features.map((feature) => [feature, feature] as [string, string])
            ).map(([name, detail], index) => (
              <button
                key={name}
                className="tour-hotspot absolute z-10 !flex"
                style={realHotspots[index % realHotspots.length]}
                onPointerEnter={() => setInspected({ name, detail, room: activeRoom })}
                onFocus={() => setInspected({ name, detail, room: activeRoom })}
                onClick={() => {
                  setInspected({ name, detail, room: activeRoom });
                  setRealZoom(true);
                }}
              >
                <span>{index + 1}</span>
                <strong>{name}</strong>
              </button>
            ))}
            <div className="absolute right-5 top-20 z-10 flex gap-2">
              <button
                onClick={() => setRealZoom((value) => !value)}
                className="tour-icon-btn bg-evergreen/80 backdrop-blur"
              >
                {realZoom ? "Wide room" : "Inspect closer"}
              </button>
            </div>
          </div>
        ) : (
          <Canvas
            shadows
            camera={{ position: [6.2, 5.2, 8.5], fov: 46 }}
            dpr={[1, 1.7]}
            onPointerMissed={() => setInspected(null)}
          >
            <Suspense fallback={null}>
              <PropertyWorld
                spaces={spaces}
                activeRoom={activeRoom}
                targetRoom={targetRoom}
                state={state}
                onArrive={arrive}
                onInspect={setInspected}
              />
            </Suspense>
          </Canvas>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center bg-gradient-to-b from-evergreen/85 to-transparent px-5 pb-16 pt-5">
          <div className="rounded-full border border-white/15 bg-evergreen/75 px-4 py-2 text-center backdrop-blur">
            <p className="font-mono text-[9px] uppercase tracking-widest2 text-brass">
              {state === "running"
                ? "Maya is running to"
                : mode === "real"
                  ? "Photoreal room inspection"
                  : "Interactive 3D plan"}
            </p>
            <p className="font-display text-lg">
              {state === "running" ? spaces[targetRoom].name : active.name}
            </p>
          </div>
        </div>

        <aside className="pointer-events-none absolute bottom-24 left-4 w-[calc(100%-2rem)] max-w-sm sm:bottom-28 sm:left-7">
          <div className="pointer-events-auto rounded-2xl border border-white/15 bg-evergreen/90 p-5 shadow-2xl backdrop-blur-xl">
            {inspected ? (
              <>
                <p className="eyebrow">Furniture inspection</p>
                <h3 className="mt-2 font-display text-2xl text-ivory">{inspected.name}</h3>
                <p className="mt-3 text-sm leading-6 text-fog">{inspected.detail}</p>
                <p className="mt-4 border-t border-white/10 pt-3 text-xs text-brass">
                  Hover another object to continue inspecting.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">
                  {active.name} · {active.size}
                </p>
                <h3 className="mt-2 font-display text-2xl">Explore the complete room</h3>
                <p className="mt-3 text-sm leading-6 text-fog">
                  {active.tagline}. Switch to 3D plan to rotate and inspect furniture — kitchen,
                  washroom, and pool are modelled with real fixtures.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-ivory/80"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-evergreen/90 p-3 backdrop-blur-xl sm:p-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {spaces.map((room, index) => (
              <button
                key={room.id}
                onMouseEnter={() => hoverTravel(index)}
                onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                onFocus={() => hoverTravel(index)}
                onClick={() => travel(index)}
                className={`shrink-0 rounded-full border px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_8px_20px_-8px_rgba(216,180,90,0.55)] ${
                  activeRoom === index
                    ? "border-brass bg-brass text-evergreen"
                    : targetRoom === index && state === "running"
                      ? "border-brass text-brass"
                      : "border-white/15 bg-white/5 text-ivory hover:border-brass hover:text-brass"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {room.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
