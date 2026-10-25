"use client";

import { useState } from "react";
import type { Shop } from "@/lib/drinks";
import { FieldError, inputClass, labelClass, pillButtonClass } from "./Field";
import { useShopSearch } from "./useShopSearch";

type Props = { value: Shop | null; onChange: (shop: Shop | null) => void; recentShops: Shop[]; error?: string };

const rowClass =
  "min-h-11 w-full px-4 py-2.5 text-left focus-visible:bg-accent focus-visible:text-on-accent focus-visible:outline-none";

export function ShopPicker({ value, onChange, recentShops, error }: Props) {
  const [query, setQuery] = useState("");
  const { results, busy, message, nearby, search } = useShopSearch();
  const typed = query.trim();

  if (value) {
    return (
      <div>
        <span className={labelClass}>Shop</span>
        <div className="glass flex items-center justify-between gap-3 rounded-glass p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{value.name}</p>
            {value.address && <p className="truncate text-sm text-ink-muted">{value.address}</p>}
          </div>
          <button type="button" className={`${pillButtonClass} shrink-0 text-accent-ink`} onClick={() => onChange(null)}>
            Change
          </button>
        </div>
      </div>
    );
  }

  const free: Shop = { name: typed, address: null, latitude: null, longitude: null, placeId: null };

  return (
    <div>
      <label htmlFor="shop-search" className={labelClass}>
        Shop
      </label>
      {recentShops.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Recent shops">
          {recentShops.map((shop) => (
            <button key={shop.placeId ?? shop.name} type="button" className={pillButtonClass} onClick={() => onChange(shop)}>
              {shop.name}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={pillButtonClass} disabled={busy} onClick={nearby}>
        Nearby
      </button>
      <div className="mt-3 flex gap-2">
        <input
          id="shop-search"
          type="search"
          enterKeyHint="search"
          placeholder="Search by name or place"
          className={inputClass}
          value={query}
          aria-describedby={error ? "shop-error" : undefined}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (typed) search(typed);
            }
          }}
        />
        <button type="button" className={pillButtonClass} disabled={busy || !typed} onClick={() => search(typed)}>
          Search
        </button>
      </div>
      <div aria-live="polite">
        {busy && <p className="mt-3 text-sm text-ink-muted">Searching...</p>}
        {message && <p className="mt-3 text-sm font-medium text-danger">{message}</p>}
        {results?.length === 0 && <p className="mt-3 text-sm text-ink-muted">No shops found. Try another name.</p>}
      </div>
      {results && results.length > 0 && (
        <ul className="glass mt-3 overflow-hidden rounded-glass">
          {results.map((shop) => (
            <li key={shop.placeId}>
              <button type="button" className={rowClass} onClick={() => onChange(shop)}>
                <span className="block font-semibold">{shop.name}</span>
                {shop.address && <span className="block text-sm opacity-80">{shop.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {typed && (
        <button type="button" className={`${pillButtonClass} mt-3 max-w-full truncate`} onClick={() => onChange(free)}>
          Use &ldquo;{typed}&rdquo;
        </button>
      )}
      <FieldError id="shop-error">{error}</FieldError>
    </div>
  );
}
