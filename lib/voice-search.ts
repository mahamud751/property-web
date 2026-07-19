import type { Property } from "@/lib/data";
import { cities } from "@/lib/data";

export type VoiceIntent =
  | { type: "search"; filters: VoiceFilters; reply: string }
  | { type: "help"; reply: string }
  | { type: "greeting"; reply: string }
  | { type: "open"; slug: string | null; reply: string }
  | { type: "compare"; reply: string }
  | { type: "unknown"; reply: string };

export type VoiceFilters = {
  city?: string;
  status?: "For Sale" | "For Rent";
  type?: Property["type"];
  beds?: number;
  hasPool?: boolean;
  hasBalcony?: boolean;
  query?: string;
};

export function parseVoiceCommand(raw: string): VoiceIntent {
  const text = raw.toLowerCase().trim().replace(/[.,!?]/g, " ");
  if (!text) {
    return {
      type: "help",
      reply:
        "I'm Nivaas Voice. Try saying: find a 3 bedroom apartment in Gulshan for sale.",
    };
  }

  if (/^(hi|hello|hey|salaam|assalam|good morning|good evening)\b/.test(text)) {
    return {
      type: "greeting",
      reply:
        "Hello. I can find homes by voice. Say something like: show villas in Banani, or find 3 bed for rent in Dhanmondi.",
    };
  }

  if (/help|what can you|how do|commands?/.test(text)) {
    return {
      type: "help",
      reply:
        "You can say: find apartments for sale, 4 bedroom in Gulshan, homes with a pool, rent in Bashundhara, or open the first result.",
    };
  }

  if (/\bcompare\b/.test(text)) {
    return {
      type: "compare",
      reply: "Opening the compare page so you can put two homes side by side.",
    };
  }

  if (/\b(open|show me|go to)\b.*\b(first|top|1st|number one)\b/.test(text)) {
    return {
      type: "open",
      slug: null,
      reply: "Opening the top match for you.",
    };
  }

  // Build search filters
  const filters: VoiceFilters = {};

  // City
  for (const c of cities) {
    if (text.includes(c.toLowerCase())) {
      filters.city = c;
      break;
    }
  }
  // aliases
  if (!filters.city) {
    if (/\bgulshan\b/.test(text)) filters.city = "Gulshan";
    if (/\bbanani\b/.test(text)) filters.city = "Banani";
    if (/\bdhanmondi\b/.test(text)) filters.city = "Dhanmondi";
    if (/\bbashundhara\b/.test(text)) filters.city = "Bashundhara";
    if (/\buttara\b/.test(text)) filters.city = "Uttara";
    if (/\bbaridhara\b/.test(text)) filters.city = "Baridhara";
    if (/\bmohakhali\b/.test(text)) filters.city = "Mohakhali";
  }

  // Status
  if (/\b(rent|rental|to rent|for rent|renting)\b/.test(text)) {
    filters.status = "For Rent";
  } else if (/\b(buy|sale|for sale|purchase|buying)\b/.test(text)) {
    filters.status = "For Sale";
  }

  // Type
  if (/\bvilla\b/.test(text)) filters.type = "Villa";
  else if (/\bpenthouse\b/.test(text)) filters.type = "Penthouse";
  else if (/\bduplex\b/.test(text)) filters.type = "Duplex";
  else if (/\bapartment\b|\bflat\b/.test(text)) filters.type = "Apartment";

  // Beds
  const bedMatch =
    text.match(/(\d+)\s*(?:bed|beds|bedroom|bedrooms|br)\b/) ||
    text.match(/\b(one|two|three|four|five)\s*(?:bed|bedroom)/);
  if (bedMatch) {
    const map: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
    };
    const n = bedMatch[1];
    filters.beds = map[n] ?? parseInt(n, 10);
  }

  // Features
  if (/\bpool\b|swimming/.test(text)) filters.hasPool = true;
  if (/\bbalcony\b/.test(text)) filters.hasBalcony = true;

  const isSearch =
    /\b(find|search|show|looking|want|need|homes?|properties|house|apartment|villa|flat|list)\b/.test(
      text
    ) ||
    Object.keys(filters).length > 0;

  if (!isSearch) {
    return {
      type: "unknown",
      reply:
        "I didn't catch a search. Try: find a 3 bedroom in Gulshan for sale, or homes with a pool.",
    };
  }

  filters.query = text;

  const parts: string[] = ["Searching for"];
  if (filters.beds) parts.push(`${filters.beds} bedroom`);
  if (filters.type) parts.push(filters.type.toLowerCase());
  else parts.push("homes");
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.status === "For Rent") parts.push("for rent");
  if (filters.status === "For Sale") parts.push("for sale");
  if (filters.hasPool) parts.push("with a pool");
  if (filters.hasBalcony) parts.push("with a balcony");

  return {
    type: "search",
    filters,
    reply: parts.join(" ") + ".",
  };
}

export function matchProperties(
  all: Property[],
  filters: VoiceFilters
): Property[] {
  return all
    .filter((p) => {
      if (filters.city && p.city !== filters.city) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.beds && p.beds < filters.beds) return false;
      if (filters.hasPool && !p.spaces.some((s) => s.id === "pool")) return false;
      if (filters.hasBalcony && !p.spaces.some((s) => s.id === "balcony"))
        return false;
      return true;
    })
    .sort((a, b) => {
      // Prefer more beds match exactness, then more spaces documented
      const bedScore = (p: Property) =>
        filters.beds ? -Math.abs(p.beds - filters.beds) : 0;
      return bedScore(b) - bedScore(a) || b.spaces.length - a.spaces.length;
    });
}

export function speakResults(matches: Property[], filters: VoiceFilters): string {
  if (matches.length === 0) {
    const where = filters.city ? ` in ${filters.city}` : "";
    return `I couldn't find a match${where}. Try another area, or say help for examples.`;
  }
  const top = matches[0];
  const more =
    matches.length > 1
      ? ` I also found ${matches.length - 1} more. Tap a card or say open first result.`
      : " Say open first result to walk through it.";
  return `I found ${matches.length} ${
    matches.length === 1 ? "home" : "homes"
  }. Top match is ${top.title} in ${top.city}, ${top.beds} beds, ${top.price}.${more}`;
}
