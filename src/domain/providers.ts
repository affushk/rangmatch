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
