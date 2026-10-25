import { describe, expect, test } from "vitest";
import { buildSearchBody, parsePlacesResponse, parseShopSearch } from "./places";

describe("parseShopSearch", () => {
  test("accepts a nearby search with only a location", () => {
    expect(parseShopSearch(new URLSearchParams("lat=37.77&lng=-122.42"))).toEqual({
      query: null,
      location: { latitude: 37.77, longitude: -122.42 },
    });
  });

  test("accepts a name search without a location", () => {
    expect(parseShopSearch(new URLSearchParams("q=%20Tiger%20Sugar%20"))).toEqual({
      query: "Tiger Sugar",
      location: null,
    });
  });

  test("rejects a search with neither a query nor a location", () => {
    expect(parseShopSearch(new URLSearchParams("q=%20%20"))).toBeNull();
  });

  test("rejects half a location or coordinates out of range", () => {
    expect(parseShopSearch(new URLSearchParams("q=boba&lat=37.77"))).toBeNull();
    expect(parseShopSearch(new URLSearchParams("lat=91&lng=0"))).toBeNull();
    expect(parseShopSearch(new URLSearchParams("lat=abc&lng=0"))).toBeNull();
  });
});

describe("buildSearchBody", () => {
  const here = { latitude: 37.77, longitude: -122.42 };

  test("nearby search ranks boba shops by distance", () => {
    const body = buildSearchBody({ query: null, location: here });
    expect(body.textQuery).toBe("boba bubble tea");
    expect(body).toMatchObject({ rankPreference: "DISTANCE", locationBias: { circle: { center: here } } });
  });

  test("name search keeps Google's relevance ranking", () => {
    const body = buildSearchBody({ query: "Tiger Sugar", location: here });
    expect(body.textQuery).toBe("Tiger Sugar");
    expect(body).not.toHaveProperty("rankPreference");
  });
});

describe("parsePlacesResponse", () => {
  test("maps places and fills missing fields with null", () => {
    const shops = parsePlacesResponse({
      places: [
        {
          id: "abc",
          displayName: { text: "Taro Town" },
          formattedAddress: "1 Main St",
          location: { latitude: 1, longitude: 2 },
        },
        { id: "def", displayName: { text: "No Address Tea" } },
      ],
    });
    expect(shops).toEqual([
      { placeId: "abc", name: "Taro Town", address: "1 Main St", latitude: 1, longitude: 2 },
      { placeId: "def", name: "No Address Tea", address: null, latitude: null, longitude: null },
    ]);
  });

  test("skips places without an id or name, and handles an empty response", () => {
    expect(parsePlacesResponse({ places: [{ id: "x" }, null, { displayName: { text: "y" } }] })).toEqual([]);
    expect(parsePlacesResponse({})).toEqual([]);
  });
});
