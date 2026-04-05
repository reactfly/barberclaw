import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Navigation,
  MapPin,
  Locate,
  RefreshCw,
  Car,
  Footprints,
  Bike,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Phone,
  AlertCircle,
  Loader2,
  Route,
} from 'lucide-react';
import {
  getRoute,
  formatDistance,
  formatDuration,
  getTravelModeLabel,
  openGoogleMaps,
  openWaze,
  getMapboxToken,
  getBoundsForPoints,
  haversineDistance,
  MAP_STYLES,
} from '../../lib/mapbox';
import type { RouteInfo, TravelMode, BarbershopLocation } from '../../lib/mapbox';
import { useGeolocation } from '../../hooks/useGeolocation';

// ── Props ──────────────────────────────────────────────────────────────

interface MapboxNavigatorProps {
  barbershop: BarbershopLocation;
  className?: string;
}

// ── Status types ───────────────────────────────────────────────────────

type RouteStatus = 'idle' | 'loading' | 'success' | 'error';

// ── Component ──────────────────────────────────────────────────────────

export const MapboxNavigator: React.FC<MapboxNavigatorProps> = ({ barbershop, className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const shopMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeError, setRouteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExternalNav, setShowExternalNav] = useState(false);
  const [straightLineDistance, setStraightLineDistance] = useState<number | null>(null);

  const { location: userLocation, status: geoStatus, error: geoError, requestLocation } = useGeolocation();

  const token = getMapboxToken();

  // ── Initialize Map ─────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.dark,
      center: [barbershop.coordinates.lng, barbershop.coordinates.lat],
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    // Add barbershop marker
    const shopEl = document.createElement('div');
    shopEl.innerHTML = `
      <div class="mapbox-shop-marker">
        <div class="marker-pulse"></div>
        <div class="marker-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="3"/><path d="M6 3v18"/><circle cx="18" cy="6" r="3"/><path d="M18 3v7a5 5 0 0 1-5 5H6"/>
          </svg>
        </div>
        <div class="marker-label">${barbershop.name}</div>
      </div>
    `;

    const shopMarker = new mapboxgl.Marker({ element: shopEl, anchor: 'bottom' })
      .setLngLat([barbershop.coordinates.lng, barbershop.coordinates.lat])
      .addTo(map);

    shopMarkerRef.current = shopMarker;

    map.on('load', () => {
      setMapLoaded(true);

      // Add route source (empty initially)
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Route glow layer
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#a3e635',
          'line-width': 10,
          'line-opacity': 0.2,
          'line-blur': 8,
        },
      });

      // Route line layer
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#a3e635',
          'line-width': 4,
          'line-opacity': 0.9,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, barbershop]);

  // ── Update user marker ─────────────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || !userLocation || !mapLoaded) return;

    // Calculate straight-line distance
    const dist = haversineDistance(userLocation, barbershop.coordinates);
    setStraightLineDistance(dist);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div class="mapbox-user-marker">
          <div class="user-pulse"></div>
          <div class="user-dot"></div>
        </div>
      `;

      userMarkerRef.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }

    // Fit bounds to show both markers
    const bounds = getBoundsForPoints([userLocation, barbershop.coordinates]);
    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 60, right: 60 },
      duration: 1000,
    });
  }, [userLocation, mapLoaded, barbershop.coordinates]);

  // ── Calculate Route ────────────────────────────────────────────────

  const calculateRoute = useCallback(async () => {
    if (!userLocation || !mapRef.current || !mapLoaded) return;

    setRouteStatus('loading');
    setRouteError(null);

    try {
      const route = await getRoute(userLocation, barbershop.coordinates, travelMode);
      setRouteInfo(route);
      setRouteStatus('success');

      // Draw route on map
      const source = mapRef.current.getSource('route') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        });
      }

      // Fit map to route
      const allCoords = route.geometry.coordinates.map((c: number[]) => ({ lng: c[0], lat: c[1] }));
      const bounds = getBoundsForPoints(allCoords);
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 },
        duration: 1200,
      });
    } catch (err) {
      setRouteStatus('error');
      setRouteError(err instanceof Error ? err.message : 'Erro ao calcular rota.');
    }
  }, [userLocation, barbershop.coordinates, travelMode, mapLoaded]);

  // ── Recalculate on travel mode change ──────────────────────────────

  useEffect(() => {
    if (routeStatus === 'success' && userLocation) {
      calculateRoute();
    }
  }, [travelMode]);

  // ── Action Handlers ────────────────────────────────────────────────

  const handleGetDirections = async () => {
    if (!userLocation) {
      requestLocation();
      // Auto-calculate when location arrives
      return;
    }
    await calculateRoute();
  };

  // Auto-calculate when user location first arrives and user has triggered directions
  useEffect(() => {
    if (userLocation && routeStatus === 'idle' && geoStatus === 'success') {
      // Only auto-calculate if user explicitly requested
    }
  }, [userLocation, routeStatus, geoStatus]);

  const centerOnUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, duration: 800 });
  };

  const centerOnShop = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [barbershop.coordinates.lng, barbershop.coordinates.lat],
      zoom: 16,
      duration: 800,
    });
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(barbershop.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = barbershop.address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── No token fallback ──────────────────────────────────────────────

  if (!token) {
    return (
      <div className={`bg-zinc-900/80 border border-white/10 rounded-3xl p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-lime-400/50 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Mapa Indisponível</h3>
        <p className="text-slate-400 text-sm">
          Defina <code className="bg-black/50 px-2 py-0.5 rounded text-lime-400">VITE_MAPBOX_TOKEN</code> com token
          público <code className="bg-black/50 px-2 py-0.5 rounded text-lime-400">pk.</code> no `.env` local ou na Netlify.
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className={`relative ${className}`} id="location-section">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center">
            <Navigation className="w-5 h-5 text-lime-400" />
          </div>
          Localização & Rotas
        </h2>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Encontre a melhor rota até a barbearia usando Mapbox
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Map Container ─────────────────────────────────────── */}
        <div className="lg:col-span-2 relative">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 relative" style={{ minHeight: '450px' }}>
            {/* Map */}
            <div ref={mapContainerRef} className="w-full h-[450px] md:h-[500px]" />

            {/* Loading overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-lime-400 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Carregando mapa...</p>
                </div>
              </div>
            )}

            {/* Map Controls Overlay */}
            {mapLoaded && (
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <button
                  onClick={centerOnShop}
                  title="Centralizar na barbearia"
                  className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-lime-400 hover:bg-zinc-800 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                {userLocation && (
                  <button
                    onClick={centerOnUser}
                    title="Centralizar em você"
                    className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-blue-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Locate className="w-4 h-4" />
                  </button>
                )}
                {routeInfo && (
                  <button
                    onClick={calculateRoute}
                    title="Recalcular rota"
                    className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Route Info Badge on Map */}
            {routeInfo && routeStatus === 'success' && (
              <div className="absolute top-4 right-[60px] bg-zinc-900/95 backdrop-blur-sm border border-lime-400/30 rounded-xl px-4 py-3 z-10">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-lime-400 font-bold text-lg leading-tight">{formatDistance(routeInfo.distance)}</div>
                    <div className="text-slate-400 text-xs">{formatDuration(routeInfo.duration)}</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-lg">{travelMode === 'driving' ? '🚗' : travelMode === 'walking' ? '🚶' : '🚴'}</div>
                </div>
              </div>
            )}

            {/* Route loading overlay */}
            {routeStatus === 'loading' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
                <div className="bg-zinc-900/95 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                  <span className="text-white text-sm font-medium">Traçando rota...</span>
                </div>
              </div>
            )}
          </div>

          {/* Travel mode selector + action buttons below map */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Travel mode pills */}
            <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 gap-1">
              {(['driving', 'walking', 'cycling'] as TravelMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTravelMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    travelMode === mode
                      ? 'bg-lime-400 text-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode === 'driving' && <Car className="w-3.5 h-3.5" />}
                  {mode === 'walking' && <Footprints className="w-3.5 h-3.5" />}
                  {mode === 'cycling' && <Bike className="w-3.5 h-3.5" />}
                  {getTravelModeLabel(mode)}
                </button>
              ))}
            </div>

            {/* Main action button */}
            <button
              onClick={handleGetDirections}
              disabled={geoStatus === 'loading' || routeStatus === 'loading'}
              className="flex-1 sm:flex-none bg-lime-400 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-lime-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {geoStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Obtendo localização...
                </>
              ) : routeStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculando rota...
                </>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  {routeInfo ? 'Recalcular Rota' : 'Como Chegar'}
                </>
              )}
            </button>

            {/* External Navigation */}
            <div className="relative">
              <button
                onClick={() => setShowExternalNav(!showExternalNav)}
                className="w-full sm:w-auto bg-zinc-800 border border-white/10 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no App
              </button>
              {showExternalNav && (
                <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30 min-w-[200px]">
                  <button
                    onClick={() => { openGoogleMaps(barbershop.coordinates); setShowExternalNav(false); }}
                    className="w-full px-4 py-3 text-sm text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">📍</span> Google Maps
                  </button>
                  <button
                    onClick={() => { openWaze(barbershop.coordinates); setShowExternalNav(false); }}
                    className="w-full px-4 py-3 text-sm text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <span className="text-lg">🗺️</span> Waze
                  </button>
                  <button
                    onClick={() => setShowExternalNav(false)}
                    className="w-full px-4 py-2 text-xs text-center text-slate-500 hover:text-white transition-colors border-t border-white/5"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error messages */}
          {geoStatus === 'error' && geoError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">{geoError}</p>
                <button onClick={requestLocation} className="text-red-400 text-xs underline mt-1 hover:text-red-300">
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {routeStatus === 'error' && routeError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{routeError}</p>
            </div>
          )}
        </div>

        {/* ── Info Sidebar ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Barbershop Info Card */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-lime-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-lg leading-tight">{barbershop.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{barbershop.address}</p>
              </div>
            </div>

            <button
              onClick={copyAddress}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-lime-400" />
                  <span className="text-lime-400">Endereço copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar endereço
                </>
              )}
            </button>
          </div>

          {/* Distance Info */}
          {straightLineDistance !== null && (
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Route className="w-4 h-4 text-lime-400" />
                <span className="text-sm font-medium text-slate-300">Distância</span>
              </div>
              {routeInfo ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400 text-sm">Rota ({getTravelModeLabel(travelMode)})</span>
                    <span className="text-lime-400 font-bold text-xl">{formatDistance(routeInfo.distance)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400 text-sm">Tempo estimado</span>
                    <span className="text-white font-bold text-xl">{formatDuration(routeInfo.duration)}</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <p className="text-xs text-slate-500">
                    Você está a {formatDistance(straightLineDistance)} em linha reta da barbearia
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-bold text-xl">{formatDistance(straightLineDistance)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Distância em linha reta. Clique em "Como Chegar" para ver a rota real.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Operating Hours */}
          {barbershop.hours && (
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-lime-400" />
                <span className="text-sm font-medium text-slate-300">Horário de Funcionamento</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">{barbershop.hours.days}</span>
                  <span className="text-white text-sm font-medium">{barbershop.hours.open} - {barbershop.hours.close}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Domingo</span>
                  <span className="text-red-400 text-sm font-medium">Fechado</span>
                </div>
              </div>
              {/* Open/Closed status */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <StatusBadge hours={barbershop.hours} />
              </div>
            </div>
          )}

          {/* Contact */}
          {barbershop.phone && (
            <a
              href={`tel:${barbershop.phone}`}
              className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex items-center gap-3 hover:bg-zinc-800/80 hover:border-white/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center group-hover:bg-lime-400/20 transition-colors">
                <Phone className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Ligar para a barbearia</p>
                <p className="text-slate-400 text-xs">{barbershop.phone}</p>
              </div>
            </a>
          )}

          {/* Quick nav button for mobile */}
          <button
            onClick={handleGetDirections}
            disabled={geoStatus === 'loading' || routeStatus === 'loading'}
            className="lg:hidden w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-lime-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {geoStatus === 'loading' || routeStatus === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            Ir para a Barbearia
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helper Sub-Components ────────────────────────────────────────────

const StatusBadge: React.FC<{ hours: { open: string; close: string } }> = ({ hours }) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = now.getDay() !== 0 && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${isOpen ? 'text-lime-400' : 'text-red-400'}`}>
      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-lime-400 animate-pulse' : 'bg-red-400'}`} />
      {isOpen ? 'Aberto agora' : 'Fechado agora'}
    </div>
  );
};

export default MapboxNavigator;
