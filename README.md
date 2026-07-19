# Nivaas — Property Website (Next.js)

Curated Dhaka property site where every listing has a full **room-by-room walkthrough**
(living, dining, kitchen, bedrooms, washrooms, balcony, swimming pool).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

| Route | What it is |
|---|---|
| `/` | Home — hero, search, featured homes, walkthrough feature, neighbourhoods, CTA |
| `/properties` | All properties with area / type / buy-rent filters |
| `/properties/[slug]` | Property detail — gallery, price bar, **spaces walkthrough** with sticky navigator, amenities, agent, similar homes |
| `/add-property` | 5-step listing wizard with a **live preview** that builds as you type |
| `/about` | About page |
| `/contact` | Contact form + office info |

## Where to edit things

- **All property data** (add/remove homes, rooms, prices, photos): `lib/data.ts`
- **Colors & fonts**: `tailwind.config.ts` + `app/globals.css`
- **Navbar / Footer / cards / walkthrough**: `components/`

Photos are loaded from Unsplash — swap the URLs in `lib/data.ts` with your own
property photos when you're ready.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · next/image
