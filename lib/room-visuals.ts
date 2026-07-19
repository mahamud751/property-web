/** Shared room photo feeds for tour / CC / advanced tools */
export const roomVisuals: Record<string, string> = {
  living: "/tour/living.png",
  dining: "/tour/dining.png",
  kitchen: "/tour/kitchen.png",
  bedroom: "/tour/bedroom.png",
  washroom: "/tour/washroom.png",
  balcony: "/tour/balcony.png",
  pool: "/tour/pool.png",
};

export function roomImage(id: string, fallback?: string) {
  return roomVisuals[id] ?? fallback ?? roomVisuals.living;
}
