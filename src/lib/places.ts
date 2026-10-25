import { googlePlacesApiKey } from "./env";

export type ShopResult = {
  placeId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type LatLng = { latitude: number; longitude: number };

// query null means "boba near me". A query searches by name, biased toward the location when known.
export type ShopSearch = { query: string | null; location: LatLng | null };

// Only these fields, so each call bills at the Text Search Pro rate. Ratings or photos cost more.
const FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location";
const NEARBY_QUERY = "boba bubble tea";
const NEARBY_RADIUS_METERS = 5000;

export function parseShopSearch(params: URLSearchParams): ShopSearch | null {
  const query = params.get("q")?.trim() || null;
  let location: LatLng | null = null;
  if (params.has("lat") || params.has("lng")) {
    const latitude = Number(params.get("lat") || NaN);
    const longitude = Number(params.get("lng") || NaN);
    if (!(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) {
      return null;
    }
    location = { latitude, longitude };
  }
  if (!query && !location) {
    return null;
  }
  return { query, location };
}

export function buildSearchBody({ query, location }: ShopSearch) {
  return {
    textQuery: query ?? NEARBY_QUERY,
    pageSize: 20,
    ...(location && { locationBias: { circle: { center: location, radius: NEARBY_RADIUS_METERS } } }),
    ...(query === null && { rankPreference: "DISTANCE" }),
  };
}

type RawPlace = {
  id?: unknown;
  displayName?: { text?: unknown };
  formattedAddress?: unknown;
  location?: { latitude?: unknown; longitude?: unknown };
} | null;

const numberOrNull = (value: unknown) => (typeof value === "number" ? value : null);

export function parsePlacesResponse(json: unknown): ShopResult[] {
  const places = (json as { places?: unknown } | null)?.places;
  if (!Array.isArray(places)) {
    return [];
  }
  return (places as RawPlace[]).flatMap((place) => {
    const placeId = place?.id;
    const name = place?.displayName?.text;
    if (typeof placeId !== "string" || typeof name !== "string") {
      return [];
    }
    return [
      {
        placeId,
        name,
        address: typeof place?.formattedAddress === "string" ? place.formattedAddress : null,
        latitude: numberOrNull(place?.location?.latitude),
        longitude: numberOrNull(place?.location?.longitude),
      },
    ];
  });
}

export async function searchShops(search: ShopSearch): Promise<ShopResult[]> {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googlePlacesApiKey(),
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(buildSearchBody(search)),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google Places returned ${response.status}: ${await response.text()}`);
  }
  return parsePlacesResponse(await response.json());
}
