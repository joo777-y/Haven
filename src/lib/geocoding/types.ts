export interface GeocodeRequest {
  country?: string;
  city: string;
  neighborhood?: string;
  address?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface GeocoderService {
  geocode(req: GeocodeRequest): Promise<GeocodeResult | null>;
}
