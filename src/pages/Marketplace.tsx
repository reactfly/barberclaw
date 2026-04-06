import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  List,
  Loader2,
  Locate,
  Map as MapIcon,
  MapPin,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PublicHeader } from '../components/marketplace/PublicHeader';
import { MARKETPLACE_BARBERSHOPS, type MarketplaceBarbershop } from '../data/marketplace';
import { formatDistance, getBoundsForPoints, haversineDistance, loadMapboxToken } from '../lib/mapbox';
import { useGeolocation } from '../hooks/useGeolocation';

type MobileView = 'list' | 'map';
type SortOption = 'recommended' | 'distance' | 'rating' | 'price';
type FilterOption = 'all' | 'nearby' | 'open' | 'premium' | 'visagismo' | 'barba';

interface ShopWithDistance extends MarketplaceBarbershop {
  distance: number | null;
}

const FILTERS: Array<{ id: FilterOption; label: string }> = [
  { id: 'all', label: 'Tudo' },
  { id: 'nearby', label: 'Perto de mim' },
  { id: 'open', label: 'Aberto agora' },
  { id: 'premium', label: 'Premium' },
  { id: 'visagismo', label: 'Visagismo' },
  { id: 'barba', label: 'Com barba' },
];

const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: 'recommended', label: 'Recomendados' },
  { id: 'distance', label: 'Mais perto' },
  { id: 'rating', label: 'Melhor nota' },
  { id: 'price', label: 'Menor preco' },
];

const defaultSelectedShopId =
  MARKETPLACE_BARBERSHOPS.find((shop) => shop.featured)?.id ?? MARKETPLACE_BARBERSHOPS[0].id;

function matchesFilter(shop: ShopWithDistance, filter: FilterOption): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'nearby':
      return shop.distance !== null && shop.distance <= 3500;
    case 'open':
      return shop.isOpen;
    case 'premium':
      return shop.premium;
    case 'visagismo':
      return shop.tags.some((tag) => tag.toLowerCase().includes('visagismo'));
    case 'barba':
      return shop.tags.some((tag) => tag.toLowerCase().includes('barba'));
  }
}

function getRecommendedScore(shop: ShopWithDistance): number {
  const distanceBoost = shop.distance === null ? 0 : Math.max(0, 5000 - shop.distance) / 1000;
  const premiumBoost = shop.premium ? 2 : 0;
  const openBoost = shop.isOpen ? 1.5 : 0;
  return shop.rating * 4 + shop.reviews / 40 + premiumBoost + openBoost + distanceBoost;
}

export const Marketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState(defaultSelectedShopId);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapboxConfigResolved, setIsMapboxConfigResolved] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const { location: userLocation, status: geoStatus, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    let isMounted = true;

    loadMapboxToken()
      .then((token) => {
        if (isMounted) {
          setMapboxToken(token);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapboxToken('');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsMapboxConfigResolved(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const shopsWithDistance: ShopWithDistance[] = MARKETPLACE_BARBERSHOPS.map((shop) => ({
    ...shop,
    distance: userLocation ? haversineDistance(userLocation, shop.coordinates) : null,
  }));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredShops = shopsWithDistance
    .filter((shop) => {
      const searchableContent = [
        shop.name,
        shop.neighborhood,
        shop.address,
        shop.heroBlurb,
        ...shop.tags,
        ...shop.amenities,
        ...shop.services.map((service) => service.name),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);
      return matchesSearch && matchesFilter(shop, activeFilter);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating || b.reviews - a.reviews;
        case 'price':
          return a.priceFrom - b.priceFrom;
        case 'recommended':
        default:
          return getRecommendedScore(b) - getRecommendedScore(a);
      }
    });

  const selectedShop =
    filteredShops.find((shop) => shop.id === selectedShopId) ??
    shopsWithDistance.find((shop) => shop.id === selectedShopId) ??
    filteredShops[0] ??
    shopsWithDistance[0];

  const featuredShops = shopsWithDistance.filter((shop) => shop.featured).slice(0, 2);
  const openCount = shopsWithDistance.filter((shop) => shop.isOpen).length;
  const visagismoCount = shopsWithDistance.filter((shop) =>
    shop.tags.some((tag) => tag.toLowerCase().includes('visagismo'))
  ).length;

  useEffect(() => {
    if (!filteredShops.some((shop) => shop.id === selectedShopId) && filteredShops[0]) {
      setSelectedShopId(filteredShops[0].id);
    }
  }, [filteredShops, selectedShopId]);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [MARKETPLACE_BARBERSHOPS[0].coordinates.lng, MARKETPLACE_BARBERSHOPS[0].coordinates.lat],
      zoom: 12,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);

      MARKETPLACE_BARBERSHOPS.forEach((shop) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `marketplace-marker${shop.featured ? ' marker-featured' : ''}`;
        el.setAttribute('aria-label', shop.name);
        el.innerHTML = `
          <div class="mkt-marker-badge">${shop.rating.toFixed(1)} &#9733;</div>
          <div class="mkt-marker-inner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="6" cy="6" r="3"/><path d="M6 3v18"/><circle cx="18" cy="6" r="3"/><path d="M18 3v7a5 5 0 0 1-5 5H6"/>
            </svg>
          </div>
          <div class="mkt-marker-label">${shop.name}</div>
        `;

        el.addEventListener('mouseenter', () => setHoveredShopId(shop.id));
        el.addEventListener('mouseleave', () => setHoveredShopId((current) => (current === shop.id ? null : current)));
        el.addEventListener('click', () => {
          setSelectedShopId(shop.id);
          setMobileView('map');
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([shop.coordinates.lng, shop.coordinates.lat])
          .addTo(map);

        markersRef.current.set(shop.id, marker);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
      markersRef.current.clear();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    markersRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      const isVisible = filteredShops.some((shop) => shop.id === id);
      const isActive = id === selectedShopId || id === hoveredShopId;

      element.classList.toggle('marker-hidden', !isVisible);
      element.classList.toggle('marker-active', isActive);
    });
  }, [filteredShops, hoveredShopId, mapLoaded, selectedShopId]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || filteredShops.length === 0) return;

    const points = filteredShops.map((shop) => shop.coordinates);
    if (userLocation) {
      points.push(userLocation);
    }

    const bounds = getBoundsForPoints(points);
    mapRef.current.fitBounds(bounds, {
      padding: { top: 110, right: 80, bottom: 110, left: 80 },
      duration: 900,
    });
  }, [filteredShops, mapLoaded, userLocation]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedShop) return;

    mapRef.current.flyTo({
      center: [selectedShop.coordinates.lng, selectedShop.coordinates.lat],
      zoom: 14.5,
      duration: 700,
      essential: true,
    });
  }, [mapLoaded, selectedShop]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userLocation) return;

    if (!userMarkerRef.current) {
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
      return;
    }

    userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
  }, [mapLoaded, userLocation]);

  const centerOnUser = () => {
    if (!userLocation || !mapRef.current) {
      requestLocation();
      return;
    }

    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14.5,
      duration: 800,
      essential: true,
    });
  };

  return (
    <div className="marketplace-shell marketplace-safe-bottom min-h-screen bg-[#050505] text-slate-100 font-sans">
      <PublicHeader />

      <main className="px-4 pb-10 pt-20 sm:px-5 sm:pt-24 md:px-6 md:pt-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.2),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] md:rounded-[32px]">
            <div className="grid gap-6 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8 xl:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="marketplace-kicker mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Marketplace BarberFlow
                </div>
                <h1 className="marketplace-display marketplace-fluid-title max-w-3xl text-white">
                  Descubra barbearias que combinam com seu estilo e sua rotina.
                </h1>
                <p className="marketplace-copy mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Compare atendimento, agenda, especialidades e ambiente em uma experiencia pensada para converter visita em agendamento.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="marketplace-label text-xs text-slate-500">Disponiveis agora</p>
                    <p className="marketplace-fluid-stat mt-2 text-white">{openCount}</p>
                    <p className="mt-1 text-sm text-slate-400">barbearias abertas e prontas para atender.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="marketplace-label text-xs text-slate-500">Com visagismo</p>
                    <p className="marketplace-fluid-stat mt-2 text-white">{visagismoCount}</p>
                    <p className="mt-1 text-sm text-slate-400">opcoes com consultoria de imagem no fluxo.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="marketplace-label text-xs text-slate-500">Tempo de resposta</p>
                    <p className="marketplace-fluid-stat mt-2 text-white">5-15 min</p>
                    <p className="mt-1 text-sm text-slate-400">para confirmar horario e atendimento.</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={requestLocation}
                    disabled={geoStatus === 'loading'}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-black transition-all hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    {geoStatus === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Encontrando voce...
                      </>
                    ) : (
                      <>
                        <Locate className="h-4 w-4" />
                        Mostrar opcoes perto de mim
                      </>
                    )}
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                    Curadoria com foco em experiencia, agenda e reputacao.
                  </div>
                </div>

                {geoError && (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {geoError}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {featuredShops.map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => {
                      setSelectedShopId(shop.id);
                      setMobileView('list');
                    }}
                    className={`group rounded-3xl border p-4 text-left transition-all md:rounded-[28px] ${
                      selectedShopId === shop.id
                        ? 'border-lime-400/40 bg-lime-400/10 shadow-[0_24px_80px_rgba(132,204,22,0.12)]'
                        : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <img
                        src={shop.imageUrl}
                        alt={shop.name}
                        className="h-[72px] w-[72px] rounded-2xl object-cover sm:h-20 sm:w-20"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="marketplace-label text-xs text-lime-300">
                              {shop.premium ? 'Destaque premium' : 'Mais reservado'}
                            </p>
                            <h2 className="marketplace-fluid-card mt-1 truncate text-white">{shop.name}</h2>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {shop.rating}
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-300">{shop.heroBlurb}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                            {shop.neighborhood}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                            A partir de R$ {shop.priceFrom}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                            {shop.nextSlot}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[500px_minmax(0,1fr)]">
            <div className={`flex flex-col gap-4 ${mobileView === 'map' ? 'hidden xl:flex' : 'flex'}`}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:rounded-[28px] md:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="marketplace-fluid-section text-white">Explore o marketplace</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {filteredShops.length} resultados prontos para virar agendamento.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-slate-300">
                      Atualizado em tempo real
                    </div>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Busque por nome, bairro, servico ou ambiente..."
                      className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-lime-400/50 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                    />
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {FILTERS.map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setActiveFilter(filter.id)}
                          className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                            activeFilter === filter.id
                              ? 'border-lime-400/40 bg-lime-400 text-black'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200 focus:border-lime-400/50 focus:outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id} className="bg-zinc-950">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!userLocation && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={geoStatus === 'loading'}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-400/15 disabled:opacity-60"
                    >
                      {geoStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                      Ative sua localizacao para ordenar por distancia
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredShops.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center md:rounded-[28px]">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                      <Scissors className="h-6 w-6 text-lime-300" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">Nenhuma barbearia encontrada</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Tente remover um filtro ou buscar por outro bairro, servico ou estilo.
                    </p>
                  </div>
                )}

                {filteredShops.map((shop) => {
                  const isSelected = shop.id === selectedShopId;

                  return (
                    <article
                      key={shop.id}
                      onMouseEnter={() => {
                        setHoveredShopId(shop.id);
                        setSelectedShopId(shop.id);
                      }}
                      onMouseLeave={() => setHoveredShopId((current) => (current === shop.id ? null : current))}
                      className={`group overflow-hidden rounded-3xl border transition-all md:rounded-[28px] ${
                        isSelected
                          ? 'border-lime-400/40 bg-lime-400/5 shadow-[0_18px_60px_rgba(132,204,22,0.08)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={shop.imageUrl}
                          alt={shop.name}
                          className="h-48 w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          {shop.featured && (
                          <span className="marketplace-label rounded-full border border-lime-300/20 bg-lime-300/15 px-3 py-1 text-[11px] font-semibold text-lime-200">
                              Destaque
                            </span>
                          )}
                          <span
                            className={`marketplace-label rounded-full px-3 py-1 text-[11px] font-semibold ${
                              shop.isOpen ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'
                            }`}
                          >
                            {shop.isOpen ? `Aberto ate ${shop.closesAt}` : 'Fechado agora'}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="marketplace-label text-xs text-white/70">{shop.neighborhood}</p>
                            <h3 className="marketplace-fluid-card truncate text-white">{shop.name}</h3>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-right backdrop-blur-sm">
                            <p className="marketplace-label text-[11px] text-slate-400">A partir de</p>
                            <p className="text-base font-bold text-white sm:text-lg">R$ {shop.priceFrom}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {shop.rating} ({shop.reviews} avaliacoes)
                          </span>
                          {shop.distance !== null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5">
                              <MapPin className="h-4 w-4 text-lime-300" />
                              {formatDistance(shop.distance)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5">
                            <CalendarClock className="h-4 w-4 text-sky-300" />
                            {shop.nextSlot}
                          </span>
                        </div>

                        <p className="marketplace-copy mt-4 text-sm text-slate-300">{shop.heroBlurb}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {shop.tags.map((tag) => (
                            <span
                              key={tag}
                              className="marketplace-label rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="marketplace-label text-xs text-slate-500">Atendimento</p>
                            <p className="mt-2 text-sm font-semibold text-white">{shop.responseTime}</p>
                            <p className="mt-1 text-sm text-slate-400">{shop.waitTime}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="marketplace-label text-xs text-slate-500">Diferenciais</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {shop.amenities.slice(0, 2).map((amenity) => (
                                <span key={amenity} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-slate-400">
                            Servico destaque:{' '}
                            <span className="font-semibold text-white">{shop.services[0]?.name}</span>
                          </div>
                          <Link
                            to={`/b/${shop.slug}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-4 py-3 text-sm font-bold text-black transition-all hover:bg-lime-300"
                          >
                            Ver perfil
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className={`relative min-h-[58vh] overflow-hidden rounded-3xl border border-white/10 bg-black/30 md:min-h-[520px] md:rounded-[32px] ${mobileView === 'list' ? 'hidden xl:block' : 'block'}`}>
              {mapboxToken ? (
                <>
                  <div ref={mapContainerRef} className="h-full min-h-[58vh] w-full md:min-h-[520px]" />

                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-lime-300" />
                        <p className="mt-3 text-sm text-slate-400">Carregando mapa inteligente...</p>
                      </div>
                    </div>
                  )}

                  {mapLoaded && selectedShop && (
                    <>
                      <div className="absolute left-3 right-3 top-3 z-10 flex flex-col gap-3 sm:left-4 sm:right-4 sm:top-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-sm rounded-2xl border border-white/10 bg-black/50 p-3 backdrop-blur-md">
                          <p className="marketplace-label text-xs text-slate-500">Visao rapida</p>
                          <p className="marketplace-copy mt-1 text-sm text-slate-200">
                            Clique nos pins ou passe o mouse nos cards para navegar entre as opcoes.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={centerOnUser}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-sky-300 backdrop-blur-md transition-colors hover:bg-black/70"
                          title="Minha localizacao"
                        >
                          {geoStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-4 sm:bottom-4">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl md:rounded-[28px]">
                          <div className="grid gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)] md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
                            <img
                              src={selectedShop.imageUrl}
                              alt={selectedShop.name}
                              className="h-24 w-full rounded-2xl object-cover sm:h-full sm:w-24 md:h-24 md:w-[120px]"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="marketplace-label rounded-full bg-lime-400/15 px-2.5 py-1 text-[11px] font-semibold text-lime-200">
                                  {selectedShop.neighborhood}
                                </span>
                                <span className="marketplace-label rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                  {selectedShop.nextSlot}
                                </span>
                              </div>
                              <h3 className="marketplace-fluid-card mt-2 text-white">{selectedShop.name}</h3>
                              <p className="marketplace-copy mt-1 line-clamp-2 text-sm text-slate-300">{selectedShop.heroBlurb}</p>
                              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300 sm:gap-3">
                                <span className="inline-flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {selectedShop.rating}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="h-4 w-4 text-sky-300" />
                                  {selectedShop.responseTime}
                                </span>
                                {selectedShop.distance !== null && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-lime-300" />
                                    {formatDistance(selectedShop.distance)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                              <Link
                                to={`/b/${selectedShop.slug}`}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-lime-300"
                              >
                                Agendar agora
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setMobileView('list')}
                                className="xl:hidden rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
                              >
                                Ver lista
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : isMapboxConfigResolved ? (
                <div className="flex h-full min-h-[520px] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400/10">
                    <MapPin className="h-8 w-8 text-lime-300" />
                  </div>
                  <h3 className="marketplace-fluid-section mt-5 text-white">Ative o mapa interativo</h3>
                  <p className="marketplace-copy mt-3 max-w-md text-sm text-slate-400">
                    Configure o token publico do Mapbox no endpoint <code className="rounded bg-black/40 px-2 py-1 text-lime-300">/api/public-runtime-config</code>
                    para exibir rotas, pins e distancias em tempo real.
                  </p>
                </div>
              ) : (
                <div className="flex h-full min-h-[520px] flex-col items-center justify-center px-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
                  <p className="marketplace-copy mt-3 text-sm text-slate-400">Carregando configuracao do mapa...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed left-1/2 z-50 -translate-x-1/2 xl:hidden" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/90 p-1 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              mobileView === 'list' ? 'bg-lime-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              mobileView === 'map' ? 'bg-lime-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
