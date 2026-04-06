/**
 * Mapbox Service - Core utilities for maps, routing, and geolocation
 */
import { getCachedPublicRuntimeConfig, getPublicRuntimeConfig } from './runtimeConfig';

const normalizeEnvValue = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const isLikelyPublicMapboxToken = (token: string): boolean => token.startsWith('pk.');

const normalizeMapboxToken = (tokenValue: unknown) => {
  const token = normalizeEnvValue(tokenValue);

  if (!token) return '';

  if (!isLikelyPublicMapboxToken(token)) {
    console.warn(
      'Mapbox token invalido: configure o token publico do Mapbox no endpoint /api/public-runtime-config.'
    );
    return '';
  }

  return token;
};

// ── Types ──────────────────────────────────────────────────────────────

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  geometry: GeoJSON.LineString;
}

export interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: GeoJSON.LineString;
  }>;
}

export type TravelMode = 'driving' | 'walking' | 'cycling';

export interface BarbershopLocation {
  name: string;
  address: string;
  coordinates: Coordinates;
  phone?: string;
  hours?: { open: string; close: string; days: string };
}

// ── Constants ──────────────────────────────────────────────────────────

export const DEFAULT_BARBERSHOP: BarbershopLocation = {
  name: 'BarberFlow Premium',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  coordinates: { lng: -46.6559, lat: -23.5614 },
  phone: '(11) 99999-9999',
  hours: { open: '09:00', close: '20:00', days: 'Seg - Sáb' },
};

export const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

// ── Geolocation ────────────────────────────────────────────────────────

export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permissão de localização negada. Ative a localização nas configurações do navegador.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Localização indisponível. Verifique seu GPS.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Tempo limite excedido ao obter localização.'));
            break;
          default:
            reject(new Error('Erro desconhecido ao obter localização.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

// ── Directions API ─────────────────────────────────────────────────────

export async function getRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode = 'driving'
): Promise<RouteInfo> {
  const token = await loadMapboxToken();
  if (!token) throw new Error('Token Mapbox não configurado.');

  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao calcular rota: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('Nenhuma rota encontrada entre os pontos.');
  }

  const route = data.routes[0];
  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
  };
}

// ── Formatting Helpers ─────────────────────────────────────────────────

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

export function getTravelModeLabel(mode: TravelMode): string {
  switch (mode) {
    case 'driving': return 'Carro';
    case 'walking': return 'A pé';
    case 'cycling': return 'Bicicleta';
  }
}

export function getTravelModeIcon(mode: TravelMode): string {
  switch (mode) {
    case 'driving': return '🚗';
    case 'walking': return '🚶';
    case 'cycling': return '🚴';
  }
}

// ── External Navigation ────────────────────────────────────────────────

export function openGoogleMaps(destination: Coordinates): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  window.open(url, '_blank');
}

export function openWaze(destination: Coordinates): void {
  const url = `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
  window.open(url, '_blank');
}

export function openAppleMaps(destination: Coordinates): void {
  const url = `https://maps.apple.com/?daddr=${destination.lat},${destination.lng}`;
  window.open(url, '_blank');
}

// ── Map Bounds ─────────────────────────────────────────────────────────

export function getBoundsForPoints(points: Coordinates[]): [[number, number], [number, number]] {
  const lngs = points.map(p => p.lng);
  const lats = points.map(p => p.lat);

  return [
    [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
    [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
  ];
}

// ── Haversine Distance (straight line) ────────────────────────────────

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}

export function getMapboxToken(): string {
  const cachedConfig = getCachedPublicRuntimeConfig();
  return normalizeMapboxToken(cachedConfig?.mapboxToken);
}

export async function loadMapboxToken(): Promise<string> {
  const config = await getPublicRuntimeConfig();
  return normalizeMapboxToken(config.mapboxToken);
}
