"use client";

import { useState } from "react";
import type { ShopResult } from "@/lib/places";

type Coords = { lat: number; lng: number };

const GEO_MESSAGES: Record<number, string> = {
  1: "Location is blocked for this site. Search by name instead, or allow location in your browser settings.",
  2: "Your location isn't available right now. Search by name instead.",
  3: "Finding your location took too long. Try again, or search by name.",
};

function getPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("This browser can't share its location. Search by name instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(new Error(GEO_MESSAGES[e.code] ?? GEO_MESSAGES[2])),
      { timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

async function fetchShops(params: URLSearchParams): Promise<ShopResult[]> {
  const response = await fetch(`/api/places?${params}`);
  if (!response.ok) {
    throw new Error(response.status === 401 ? "Your session ended. Sign in again." : "Shop search failed. Try again.");
  }
  return ((await response.json()) as { shops: ShopResult[] }).shops;
}

/** Nearby and name search against /api/places. Searches only run on an explicit call, never per keystroke. */
export function useShopSearch() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [results, setResults] = useState<ShopResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(task: () => Promise<ShopResult[]>) {
    setBusy(true);
    setMessage(null);
    try {
      setResults(await task());
    } catch (error) {
      setResults(null);
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const nearby = () =>
    run(async () => {
      const here = await getPosition();
      setCoords(here);
      return fetchShops(new URLSearchParams({ lat: String(here.lat), lng: String(here.lng) }));
    });

  const search = (query: string) =>
    run(() => {
      const params = new URLSearchParams({ q: query });
      if (coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
      }
      return fetchShops(params);
    });

  return { results, busy, message, nearby, search };
}
