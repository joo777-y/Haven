import type { GeocoderService, GeocodeRequest, GeocodeResult } from "./types";

interface NominatimItem {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
  importance?: number;
}

export class NominatimGeocoder implements GeocoderService {
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(
    baseUrl = "https://nominatim.openstreetmap.org/search",
    userAgent = "HAVEN-RealEstate-Platform/1.0 (contact@haven.realestate)"
  ) {
    this.baseUrl = baseUrl;
    this.userAgent = userAgent;
  }

  async geocode(req: GeocodeRequest): Promise<GeocodeResult | null> {
    const parts = [req.address, req.neighborhood, req.city, req.country]
      .map((p) => (p ? p.trim() : ""))
      .filter(Boolean);

    if (parts.length === 0) {
      return null;
    }

    // Try full precision query first
    const fullQuery = parts.join(", ");
    let result = await this.queryNominatim(fullQuery);

    // If no exact match and address/neighborhood was provided, fallback to broader city + country query
    if (!result && (req.address || req.neighborhood) && req.city) {
      const broadParts = [req.neighborhood, req.city, req.country]
        .map((p) => (p ? p.trim() : ""))
        .filter(Boolean);
      result = await this.queryNominatim(broadParts.join(", "));

      if (!result && req.city) {
        const cityParts = [req.city, req.country]
          .map((p) => (p ? p.trim() : ""))
          .filter(Boolean);
        result = await this.queryNominatim(cityParts.join(", "));
      }
    }

    return result;
  }

  private async queryNominatim(query: string): Promise<GeocodeResult | null> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json",
          "Accept-Language": "en",
        },
        next: { revalidate: 3600 }, // 1 hour fetch cache for deterministic address requests
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Nominatim rate limit encountered (HTTP 429).");
        }
        return null;
      }

      const data: NominatimItem[] = await response.json();
      if (!Array.isArray(data) || data.length === 0 || !data[0]) {
        return null;
      }

      const item = data[0];
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);

      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return null;
      }

      return {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        displayName: item.display_name,
      };
    } catch (error) {
      console.error("Nominatim geocoding error:", error);
      return null;
    }
  }
}
