import type { Property, Space } from "@/lib/data";

export type BuyerPrefs = {
  budget: "any" | "rent" | "sale-mid" | "sale-premium";
  beds: number; // min
  city: string; // "" = any
  priorities: Array<"light" | "kitchen" | "pool" | "parking" | "quiet" | "family">;
};

export type PropertyScore = {
  property: Property;
  score: number;
  reasons: string[];
  watchouts: string[];
};

export type RoomTip = {
  spaceId: string;
  title: string;
  tip: string;
  tone: "good" | "neutral" | "watch";
};

/** Heuristic “AI-like” scoring — no external API */
export function scoreProperties(
  properties: Property[],
  prefs: BuyerPrefs
): PropertyScore[] {
  return properties
    .map((p) => {
      let score = 50;
      const reasons: string[] = [];
      const watchouts: string[] = [];

      // Status / budget band
      if (prefs.budget === "rent" && p.status === "For Rent") {
        score += 18;
        reasons.push("Matches rent search");
      } else if (prefs.budget === "rent" && p.status === "For Sale") {
        score -= 12;
        watchouts.push("Listed for sale, not rent");
      } else if (prefs.budget === "sale-premium" && p.status === "For Sale") {
        if (p.area >= 2500 || p.type === "Villa" || p.type === "Penthouse") {
          score += 16;
          reasons.push("Premium footprint / type");
        }
      } else if (prefs.budget === "sale-mid" && p.status === "For Sale") {
        if (p.area < 2800 && p.type !== "Villa") {
          score += 12;
          reasons.push("Mid-range sale profile");
        }
      }

      if (prefs.city && p.city === prefs.city) {
        score += 15;
        reasons.push(`In preferred area: ${p.city}`);
      } else if (prefs.city) {
        score -= 6;
      }

      if (p.beds >= prefs.beds) {
        score += 10;
        reasons.push(`${p.beds} beds meets your minimum`);
      } else {
        score -= 14;
        watchouts.push(`Only ${p.beds} beds (you want ${prefs.beds}+)`);
      }

      const spaceIds = new Set(p.spaces.map((s) => s.id));
      const amen = p.amenities.join(" ").toLowerCase();

      for (const pr of prefs.priorities) {
        if (pr === "pool" && (spaceIds.has("pool") || amen.includes("pool"))) {
          score += 12;
          reasons.push("Has pool / pool access");
        }
        if (pr === "kitchen" && spaceIds.has("kitchen")) {
          score += 8;
          reasons.push("Full kitchen documented");
        }
        if (pr === "light" && /south|lake|facing|skylight/i.test(p.facing + p.description)) {
          score += 10;
          reasons.push("Strong natural light cues");
        }
        if (pr === "parking" && p.parking >= 1) {
          score += 8;
          reasons.push(`${p.parking} parking`);
        }
        if (pr === "quiet" && /quiet|courtyard|lake/i.test(p.description)) {
          score += 8;
          reasons.push("Described as calmer setting");
        }
        if (pr === "family" && p.beds >= 3) {
          score += 8;
          reasons.push("Family-sized layout");
        }
      }

      if (p.spaces.length >= 6) {
        score += 6;
        reasons.push("Deep room-by-room walkthrough");
      }

      if (!spaceIds.has("washroom")) {
        watchouts.push("Washroom chapter missing in data");
        score -= 4;
      }

      score = Math.max(0, Math.min(99, Math.round(score)));
      if (reasons.length === 0) reasons.push("Baseline match on inventory");

      return { property: p, score, reasons: reasons.slice(0, 4), watchouts: watchouts.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score);
}

/** Per-room tips from space features / tags */
export function roomTips(spaces: Space[]): RoomTip[] {
  const tips: RoomTip[] = [];

  for (const s of spaces) {
    const blob = `${s.name} ${s.tagline} ${s.features.join(" ")}`.toLowerCase();

    if (s.id === "kitchen") {
      tips.push({
        spaceId: s.id,
        title: "Kitchen work triangle",
        tip: blob.includes("island")
          ? "Island layout usually means better prep space — check clearance for stools."
          : "Confirm wet vs dry kitchen split if you cook heavy meals daily.",
        tone: "good",
      });
    }
    if (s.id === "washroom") {
      tips.push({
        spaceId: s.id,
        title: "Wet zone check",
        tip: blob.includes("rain") || blob.includes("tub")
          ? "Premium wet zone present — inspect sealant and ventilation on visit."
          : "Map shower drain slope and exhaust fan noise during your visit.",
        tone: "neutral",
      });
    }
    if (s.id === "bedroom") {
      tips.push({
        spaceId: s.id,
        title: "Sleep quality",
        tip: blob.includes("blackout") || blob.includes("wardrobe")
          ? "Storage + light control look strong for primary suite use."
          : "Check afternoon heat on the main bed wall — common in Dhaka west-facing rooms.",
        tone: blob.includes("lake") ? "good" : "watch",
      });
    }
    if (s.id === "living") {
      tips.push({
        spaceId: s.id,
        title: "Living volume",
        tip: blob.includes("double") || blob.includes("glazing")
          ? "High volume / glazing — great for hosting, verify AC tonnage."
          : "Measure sofa wall before buying large sectionals.",
        tone: "good",
      });
    }
    if (s.id === "pool") {
      tips.push({
        spaceId: s.id,
        title: "Pool ops",
        tip: "Ask about maintenance fees, child safety rail, and evening lighting.",
        tone: "neutral",
      });
    }
    if (s.id === "balcony") {
      tips.push({
        spaceId: s.id,
        title: "Outdoor edge",
        tip: "Check railing height, drainage, and neighbour overlook for privacy.",
        tone: "watch",
      });
    }
  }

  if (tips.length === 0) {
    tips.push({
      spaceId: spaces[0]?.id ?? "living",
      title: "General",
      tip: "Walk the full CC camera checklist, then pin anything that needs a site visit.",
      tone: "neutral",
    });
  }

  return tips.slice(0, 6);
}

export function compareInsight(a: Property, b: Property): string[] {
  const lines: string[] = [];
  if (a.area !== b.area) {
    const bigger = a.area >= b.area ? a : b;
    const smaller = a.area >= b.area ? b : a;
    lines.push(
      `${bigger.title} is larger by ${(bigger.area - smaller.area).toLocaleString()} sqft.`
    );
  }
  if (a.beds !== b.beds) {
    lines.push(
      `Bedrooms: ${a.title} has ${a.beds}, ${b.title} has ${b.beds}.`
    );
  }
  if (a.city !== b.city) {
    lines.push(`Different neighbourhoods — ${a.city} vs ${b.city}.`);
  }
  if (a.spaces.length !== b.spaces.length) {
    lines.push(
      `Walkthrough depth: ${a.spaces.length} vs ${b.spaces.length} documented spaces.`
    );
  }
  const aPool = a.spaces.some((s) => s.id === "pool");
  const bPool = b.spaces.some((s) => s.id === "pool");
  if (aPool !== bPool) {
    lines.push(
      aPool
        ? `${a.title} includes a pool chapter; ${b.title} does not.`
        : `${b.title} includes a pool chapter; ${a.title} does not.`
    );
  }
  if (lines.length === 0) {
    lines.push("Specs are close — compare room finishes and lighting next.");
  }
  return lines;
}

export function furnitureCatalog() {
  return [
    { id: "sofa", label: "3-seat sofa", w: 2.2, d: 0.9, color: "#b9a88a" },
    { id: "bed", label: "King bed", w: 2.0, d: 2.1, color: "#d7c9b0" },
    { id: "dining", label: "6-seat table", w: 1.8, d: 0.9, color: "#7a5538" },
    { id: "desk", label: "Work desk", w: 1.4, d: 0.7, color: "#5a4638" },
    { id: "wardrobe", label: "Wardrobe", w: 1.8, d: 0.6, color: "#4a3c30" },
    { id: "rug", label: "Area rug", w: 2.4, d: 1.6, color: "#6a7a68" },
  ] as const;
}

/** Parse "26 × 20 ft" style sizes → meters-ish feet numbers */
export function parseRoomFeet(size: string): { w: number; d: number } | null {
  const m = size.match(/([\d.]+)\s*[×x]\s*([\d.]+)/i);
  if (!m) return null;
  return { w: parseFloat(m[1]), d: parseFloat(m[2]) };
}
