export type Coordinate = { latitude: number; longitude: number };

export type Place = {
  id: string;
  name: string;
  coordinate: Coordinate;
  address?: string;
  category?: string;
};

export type RouteMode = 'driving' | 'walking' | 'cycling';

export type Route = {
  id: string;
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinate[];
};

export interface GeocoderProvider {
  search(query: string, signal?: AbortSignal): Promise<Place[]>;
}

export interface RoutingProvider {
  route(from: Coordinate, to: Coordinate, mode: RouteMode, signal?: AbortSignal): Promise<Route[]>;
}

export interface TrafficProvider {
  getTraffic(bounds: [Coordinate, Coordinate], signal?: AbortSignal): Promise<unknown>;
}

export interface OfflineMapProvider {
  downloadRegion(id: string, bounds: [Coordinate, Coordinate]): Promise<void>;
  removeRegion(id: string): Promise<void>;
}

const NOMINATIM_URL = import.meta.env.VITE_GEOCODER_BASE_URL || 'https://nominatim.openstreetmap.org/search';

export class NominatimGeocoder implements GeocoderProvider {
  async search(query: string, signal?: AbortSignal): Promise<Place[]> {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '8');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Search failed (${response.status})`);

    const data = (await response.json()) as Array<{
      place_id: number | string;
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
    }>;

    return data.map((item) => ({
      id: String(item.place_id),
      name: item.display_name.split(',')[0]?.trim() || item.display_name,
      address: item.display_name,
      category: item.type,
      coordinate: { latitude: Number(item.lat), longitude: Number(item.lon) },
    }));
  }
}

export const geocoder: GeocoderProvider = new NominatimGeocoder();
