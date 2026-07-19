export type Space = {
  id: string;
  name: string;
  tagline: string;
  size: string;
  image: string;
  features: string[];
};

export type Property = {
  slug: string;
  title: string;
  location: string;
  city: string;
  price: string;
  priceNote: string;
  type: "Villa" | "Apartment" | "Duplex" | "Penthouse";
  status: "For Sale" | "For Rent";
  beds: number;
  baths: number;
  area: number;
  yearBuilt: number;
  parking: number;
  floors: string;
  facing: string;
  description: string;
  cover: string;
  gallery: string[];
  spaces: Space[];
  amenities: string[];
  agent: { name: string; phone: string; email: string };
};

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const properties: Property[] = [
  {
    slug: "gulshan-lake-villa",
    title: "The Lakeview Villa",
    location: "Road 62, Gulshan 2",
    city: "Gulshan",
    price: "৳ 12.5 Cr",
    priceNote: "৳ 24,500 / sqft",
    type: "Villa",
    status: "For Sale",
    beds: 5,
    baths: 6,
    area: 5100,
    yearBuilt: 2023,
    parking: 3,
    floors: "G + 2",
    facing: "South, lake-facing",
    description:
      "A rare lake-facing villa in the quietest pocket of Gulshan 2. Double-height living, a shaded infinity pool, and five suites arranged around a central courtyard that pulls light into every room. Finished in Bangladeshi teak, Italian stone, and full-height glazing toward the water.",
    cover: img("1613490493576-7fde63acd811"),
    gallery: [
      img("1613490493576-7fde63acd811"),
      img("1600607687939-ce8a6c25118c"),
      img("1512917774080-9991f1c4c750"),
    ],
    spaces: [
      {
        id: "living",
        name: "Living Lounge",
        tagline: "Double-height, framed by the lake",
        size: "26 × 20 ft",
        image: img("1600210492486-724fe5c67fb0"),
        features: ["Double-height ceiling", "Floor-to-ceiling glazing", "Teak panelling", "Concealed AC"],
      },
      {
        id: "dining",
        name: "Dining Hall",
        tagline: "Seats twelve under a skylight",
        size: "20 × 16 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["12-seat formal dining", "Skylight above table", "Butler pantry access", "Courtyard view"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "Show kitchen + wet kitchen behind",
        size: "18 × 14 ft",
        image: img("1556911220-bff31c812dba"),
        features: ["Quartz island", "Wet kitchen separate", "Built-in oven & hob", "Walk-in store"],
      },
      {
        id: "bedroom",
        name: "Master Suite",
        tagline: "A private floor of its own",
        size: "22 × 18 ft",
        image: img("1540518614846-7eded433c457"),
        features: ["Lake-facing balcony", "Walk-in wardrobe", "Sitting corner", "Blackout automation"],
      },
      {
        id: "washroom",
        name: "Master Bath",
        tagline: "Stone, rain shower, soaking tub",
        size: "14 × 10 ft",
        image: img("1584622650111-993a426fbf0a"),
        features: ["Freestanding tub", "Rain shower", "Double vanity", "Heated towel rail"],
      },
      {
        id: "balcony",
        name: "Balcony & Terrace",
        tagline: "Sunset side, breeze off the lake",
        size: "640 sqft total",
        image: img("1600566753190-17f0baa2a6c3"),
        features: ["Wraparound terrace", "Outdoor seating deck", "Planter beds", "Evening lighting"],
      },
      {
        id: "pool",
        name: "Infinity Pool",
        tagline: "32 ft, edge to the lake line",
        size: "32 × 12 ft",
        image: img("1512917774080-9991f1c4c750"),
        features: ["Temperature control", "Shallow kids' ledge", "Poolside shower", "Night lighting"],
      },
    ],
    amenities: [
      "Infinity pool", "Home theatre", "Servant quarters", "Generator backup",
      "Solar water heating", "Smart-home controls", "CCTV & guard post", "Rooftop garden",
    ],
    agent: { name: "Farhan Rahman", phone: "+880 1711-000001", email: "farhan@nivaas.homes" },
  },
  {
    slug: "banani-sky-penthouse",
    title: "Banani Sky Penthouse",
    location: "Road 11, Banani",
    city: "Banani",
    price: "৳ 8.2 Cr",
    priceNote: "৳ 21,000 / sqft",
    type: "Penthouse",
    status: "For Sale",
    beds: 4,
    baths: 5,
    area: 3900,
    yearBuilt: 2024,
    parking: 2,
    floors: "12th–13th, duplex",
    facing: "North-east corner",
    description:
      "A duplex penthouse crowning a boutique twelve-storey building on Road 11. The lower level holds an open living–dining–kitchen sweep behind a corner of glass; upstairs, four suites open to a private roof terrace with a plunge pool overlooking the Banani skyline.",
    cover: img("1600607687939-ce8a6c25118c"),
    gallery: [
      img("1600607687939-ce8a6c25118c"),
      img("1560448204-e02f11c3d0e2"),
      img("1566073771259-6a8506099945"),
    ],
    spaces: [
      {
        id: "living",
        name: "Corner Living",
        tagline: "Two walls of sky",
        size: "24 × 19 ft",
        image: img("1493809842364-78817add7ffb"),
        features: ["Corner glazing", "5.4 m ceiling at void", "Feature stone wall", "Hidden bar"],
      },
      {
        id: "dining",
        name: "Dining",
        tagline: "Ten seats against the skyline",
        size: "18 × 14 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["10-seat dining", "Skyline backdrop", "Crockery wall", "Pendant lighting"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "Island kitchen, breakfast counter",
        size: "16 × 13 ft",
        image: img("1556909114-f6e7ad7d3136"),
        features: ["Breakfast counter", "Imported appliances", "Soft-close cabinetry", "Utility balcony"],
      },
      {
        id: "bedroom",
        name: "Primary Suite",
        tagline: "Wakes up to the north-east light",
        size: "20 × 16 ft",
        image: img("1522708323590-d24dbb6b0267"),
        features: ["Terrace access", "Dressing room", "Study nook", "Motorised blinds"],
      },
      {
        id: "washroom",
        name: "Washrooms",
        tagline: "Five baths, all naturally lit",
        size: "5 attached",
        image: img("1552321554-5fefe8c9ef14"),
        features: ["All-attached baths", "Rain showers", "Imported fittings", "Exhaust automation"],
      },
      {
        id: "pool",
        name: "Roof Plunge Pool",
        tagline: "Your own water line at 140 ft",
        size: "18 × 9 ft",
        image: img("1566073771259-6a8506099945"),
        features: ["Private roof terrace", "Plunge pool", "BBQ deck", "Outdoor shower"],
      },
    ],
    amenities: [
      "Private roof terrace", "Plunge pool", "2 lifts + service lift", "Full generator backup",
      "Gym on 3rd floor", "Community lounge", "Fire safety certified", "EV charging",
    ],
    agent: { name: "Nusrat Jahan", phone: "+880 1711-000002", email: "nusrat@nivaas.homes" },
  },
  {
    slug: "dhanmondi-heritage-duplex",
    title: "Dhanmondi Heritage Duplex",
    location: "Road 8/A, Dhanmondi",
    city: "Dhanmondi",
    price: "৳ 5.6 Cr",
    priceNote: "৳ 18,500 / sqft",
    type: "Duplex",
    status: "For Sale",
    beds: 4,
    baths: 4,
    area: 3050,
    yearBuilt: 2021,
    parking: 2,
    floors: "3rd–4th, duplex",
    facing: "South",
    description:
      "A warm, book-lined duplex two streets from Dhanmondi Lake. Downstairs is made for long dinners — a dining hall that opens onto a deep south veranda. Upstairs, four bedrooms share a family lounge and a reading balcony shaded by an old raintree.",
    cover: img("1600585154340-be6161a56a0c"),
    gallery: [
      img("1600585154340-be6161a56a0c"),
      img("1493809842364-78817add7ffb"),
      img("1540518614846-7eded433c457"),
    ],
    spaces: [
      {
        id: "living",
        name: "Family Living",
        tagline: "Built around a library wall",
        size: "22 × 16 ft",
        image: img("1493809842364-78817add7ffb"),
        features: ["Full-wall bookshelf", "Bay window seat", "Warm oak flooring", "South light all day"],
      },
      {
        id: "dining",
        name: "Dining Hall",
        tagline: "Opens to the veranda",
        size: "17 × 14 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["8-seat dining", "Veranda access", "Display cabinets", "Ceiling fan + AC"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "A proper Bangladeshi kitchen, twice over",
        size: "15 × 12 ft",
        image: img("1556911220-bff31c812dba"),
        features: ["Dry + wet kitchen", "Granite counters", "Chimney hood", "Store room"],
      },
      {
        id: "bedroom",
        name: "Bedrooms",
        tagline: "Four rooms, one family lounge",
        size: "4 bedrooms",
        image: img("1540518614846-7eded433c457"),
        features: ["All south or east facing", "Built-in wardrobes", "Family lounge upstairs", "Kids' twin room"],
      },
      {
        id: "washroom",
        name: "Washrooms",
        tagline: "Four baths, fully tiled",
        size: "4 attached",
        image: img("1552321554-5fefe8c9ef14"),
        features: ["Attached to all beds", "Hot water lines", "Anti-slip tiles", "Ventilated"],
      },
      {
        id: "balcony",
        name: "Veranda & Balcony",
        tagline: "Under the raintree",
        size: "380 sqft total",
        image: img("1600566753190-17f0baa2a6c3"),
        features: ["Deep south veranda", "Reading balcony", "Grill protected", "Plant rail"],
      },
    ],
    amenities: [
      "Lift + standby generator", "Rooftop community space", "Gas connection", "Intercom security",
      "2 car parks", "Guest washroom", "Near Dhanmondi Lake", "School zone",
    ],
    agent: { name: "Tanvir Ahmed", phone: "+880 1711-000003", email: "tanvir@nivaas.homes" },
  },
  {
    slug: "baridhara-garden-residence",
    title: "Baridhara Garden Residence",
    location: "Park Road, Baridhara Diplomatic Zone",
    city: "Baridhara",
    price: "৳ 3.2 Lakh / mo",
    priceNote: "Minimum 2-year lease",
    type: "Apartment",
    status: "For Rent",
    beds: 3,
    baths: 4,
    area: 2650,
    yearBuilt: 2022,
    parking: 2,
    floors: "5th floor",
    facing: "East, park-facing",
    description:
      "A serviced three-suite apartment in the diplomatic zone, facing the park's green line. Full white-glove building services, a resident-only pool and gym, and an east-facing balcony that catches the morning over the treetops.",
    cover: img("1560448204-e02f11c3d0e2"),
    gallery: [
      img("1560448204-e02f11c3d0e2"),
      img("1484154218962-a197022b5858"),
      img("1566073771259-6a8506099945"),
    ],
    spaces: [
      {
        id: "living",
        name: "Living Room",
        tagline: "Calm, park-facing, serviced",
        size: "21 × 15 ft",
        image: img("1560448204-e02f11c3d0e2"),
        features: ["Park view", "Furnished option", "Central AC", "Housekeeping"],
      },
      {
        id: "dining",
        name: "Dining",
        tagline: "Eight seats by the east glass",
        size: "15 × 12 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["8-seat dining", "Morning light", "Serving counter", "Guest powder room near"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "Fitted and ready on day one",
        size: "13 × 11 ft",
        image: img("1484154218962-a197022b5858"),
        features: ["Fully fitted", "Fridge + oven included", "Water filter line", "Maid's entry"],
      },
      {
        id: "bedroom",
        name: "Suites",
        tagline: "Three suites, all attached",
        size: "3 bedrooms",
        image: img("1522708323590-d24dbb6b0267"),
        features: ["All en-suite", "Wardrobes fitted", "Blackout curtains", "Work desk in each"],
      },
      {
        id: "washroom",
        name: "Washrooms",
        tagline: "Four, hotel-standard",
        size: "4 total",
        image: img("1584622650111-993a426fbf0a"),
        features: ["Hotel-grade fittings", "Glass shower cubicles", "Guest powder room", "24/7 hot water"],
      },
      {
        id: "pool",
        name: "Residents' Pool",
        tagline: "Rooftop, residents only",
        size: "40 × 15 ft",
        image: img("1566073771259-6a8506099945"),
        features: ["Rooftop pool", "Gym beside it", "Changing rooms", "Lifeguard hours"],
      },
    ],
    amenities: [
      "Serviced building", "Rooftop pool & gym", "Diplomatic-zone security", "2 covered parks",
      "Backup power 100%", "Concierge desk", "Pet friendly", "Furnished option",
    ],
    agent: { name: "Sadia Islam", phone: "+880 1711-000004", email: "sadia@nivaas.homes" },
  },
  {
    slug: "uttara-courtyard-house",
    title: "Uttara Courtyard House",
    location: "Sector 4, Uttara",
    city: "Uttara",
    price: "৳ 4.1 Cr",
    priceNote: "৳ 14,200 / sqft",
    type: "Villa",
    status: "For Sale",
    beds: 4,
    baths: 4,
    area: 2900,
    yearBuilt: 2020,
    parking: 2,
    floors: "G + 1",
    facing: "Inward courtyard plan",
    description:
      "A modern courtyard house on a quiet Sector 4 lane — every room looks into a planted inner court, so the house stays private, breezy, and full of green light. A brick-and-concrete palette outside, warm timber within.",
    cover: img("1600596542815-ffad4c1539a9"),
    gallery: [
      img("1600596542815-ffad4c1539a9"),
      img("1600210492486-724fe5c67fb0"),
      img("1600566753190-17f0baa2a6c3"),
    ],
    spaces: [
      {
        id: "living",
        name: "Court Living",
        tagline: "Green light on three sides",
        size: "20 × 16 ft",
        image: img("1600210492486-724fe5c67fb0"),
        features: ["Courtyard on 2 sides", "Cross ventilation", "Exposed brick wall", "Sliding glass walls"],
      },
      {
        id: "dining",
        name: "Dining",
        tagline: "At the edge of the court",
        size: "14 × 12 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["Court-side seating", "6–8 seats", "Buffet counter", "Fan-first cooling"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "Bright, with a garden window",
        size: "14 × 11 ft",
        image: img("1556909114-f6e7ad7d3136"),
        features: ["Garden window", "L-shaped counters", "Chimney + hob", "Utility yard behind"],
      },
      {
        id: "bedroom",
        name: "Bedrooms",
        tagline: "Four rooms around the court",
        size: "4 bedrooms",
        image: img("1540518614846-7eded433c457"),
        features: ["Court-facing", "Timber floors upstairs", "Master with dressing", "Study/4th bed flex"],
      },
      {
        id: "washroom",
        name: "Washrooms",
        tagline: "Four, skylit where possible",
        size: "4 total",
        image: img("1584622650111-993a426fbf0a"),
        features: ["Skylit master bath", "Anti-slip stone", "Solar hot water", "Ventilated shafts"],
      },
      {
        id: "balcony",
        name: "Court & Roof",
        tagline: "The house's green heart",
        size: "Court 16 × 16 ft",
        image: img("1600566753190-17f0baa2a6c3"),
        features: ["Planted courtyard", "Roof garden", "Rain harvesting", "Evening deck"],
      },
    ],
    amenities: [
      "Planted courtyard", "Roof garden", "Solar hot water", "Rain harvesting",
      "2 car parks", "Store + servant room", "Quiet residential lane", "Near Metro line",
    ],
    agent: { name: "Farhan Rahman", phone: "+880 1711-000001", email: "farhan@nivaas.homes" },
  },
  {
    slug: "bashundhara-family-apartment",
    title: "Bashundhara Family Apartment",
    location: "Block C, Bashundhara R/A",
    city: "Bashundhara",
    price: "৳ 95,000 / mo",
    priceNote: "Service charge included",
    type: "Apartment",
    status: "For Rent",
    beds: 3,
    baths: 3,
    area: 1850,
    yearBuilt: 2023,
    parking: 1,
    floors: "7th floor",
    facing: "South-east",
    description:
      "A crisp, efficient three-bedroom in a new Block C tower — the kind of plan where nothing is wasted. Open kitchen–dining, a proper south-east balcony for the afternoon breeze, and a community rooftop the kids will live on.",
    cover: img("1502672260266-1c1ef2d93688"),
    gallery: [
      img("1502672260266-1c1ef2d93688"),
      img("1484154218962-a197022b5858"),
      img("1522708323590-d24dbb6b0267"),
    ],
    spaces: [
      {
        id: "living",
        name: "Living",
        tagline: "Open, bright, easy to keep",
        size: "17 × 13 ft",
        image: img("1502672260266-1c1ef2d93688"),
        features: ["Open plan", "South-east light", "Tile flooring", "TV feature wall"],
      },
      {
        id: "dining",
        name: "Dining",
        tagline: "Flows straight from the kitchen",
        size: "12 × 10 ft",
        image: img("1600121848594-d8644e57abab"),
        features: ["6-seat dining", "Open to kitchen", "Balcony beside", "Ceiling fan + AC point"],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        tagline: "Open counter, closed when you want",
        size: "11 × 9 ft",
        image: img("1484154218962-a197022b5858"),
        features: ["Breakfast counter", "Chimney provision", "Overhead cabinets", "Gas + cylinder ready"],
      },
      {
        id: "bedroom",
        name: "Bedrooms",
        tagline: "Three rooms, smart sizes",
        size: "3 bedrooms",
        image: img("1522708323590-d24dbb6b0267"),
        features: ["Master en-suite", "Kids' room with study wall", "Fitted wardrobes", "AC points in all"],
      },
      {
        id: "washroom",
        name: "Washrooms",
        tagline: "Three, low-maintenance",
        size: "3 total",
        image: img("1552321554-5fefe8c9ef14"),
        features: ["Master attached", "Common bath", "Guest toilet", "Geyser lines"],
      },
      {
        id: "balcony",
        name: "Balcony",
        tagline: "The afternoon-breeze seat",
        size: "9 × 5 ft",
        image: img("1600566753190-17f0baa2a6c3"),
        features: ["South-east facing", "Safety grill", "Laundry line rail", "Plant shelf"],
      },
    ],
    amenities: [
      "Community rooftop", "Lift + generator", "24/7 security", "1 covered park",
      "Kids' play corner", "Near IUB & NSU", "Mosque in block", "Shops downstairs",
    ],
    agent: { name: "Sadia Islam", phone: "+880 1711-000004", email: "sadia@nivaas.homes" },
  },
];

export const cities = Array.from(new Set(properties.map((p) => p.city)));
export const types = Array.from(new Set(properties.map((p) => p.type)));

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export const spaceIcons: Record<string, string> = {
  living: "◧",
  dining: "◫",
  kitchen: "◨",
  bedroom: "◪",
  washroom: "◩",
  balcony: "◰",
  pool: "◵",
};
