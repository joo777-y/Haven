import { NominatimGeocoder } from "./nominatim";
import type { GeocoderService } from "./types";

let defaultGeocoder: GeocoderService | null = null;

export function getGeocoder(): GeocoderService {
  if (!defaultGeocoder) {
    defaultGeocoder = new NominatimGeocoder();
  }
  return defaultGeocoder;
}

export * from "./types";
export * from "./nominatim";
