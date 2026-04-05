import React, { useState } from 'react';
import { Search, MapPin, Star, Scissors, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MOCK_BARBERSHOPS = [
  {
    id: '1',
    slug: 'barber-flow-premium',
    name: 'BarberFlow Premium',
    address: 'Av. Paulista, 1000 - Bela Vista',
    distance: '1.2 km',
    rating: 4.9,
    reviews: 128,
    imageUrl: 'https://picsum.photos/seed/barber1/400/300',
    isOpen: true,
    tags: ['Corte', 'Barba', 'Visagismo'],
    lat: -23.5614,
    lng: -46.6559
  },
  {
    id: '2',
    slug: 'navalha-de-ouro',
    name: 'Navalha de Ouro',
    address: 'Rua Augusta, 500 - Consolação',
    distance: '2.5 km',
    rating: 4.7,
    reviews: 85,
    imageUrl: 'https://picsum.photos/seed/barber2/400/300',
    isOpen: true,
    tags: ['Corte', 'Barba', 'Cerveja Artesanal'],
    lat: -23.5534,
    lng: -46.6529
  },
  {
    id: '3',
    slug: 'vintage-club',
    name: 'Vintage Club Barbearia',
    address: 'Rua Oscar Freire, 200 - Jardins',
    distance: '3.8 km',
    rating: 4.8,
    reviews: 210,
    imageUrl: 'https://picsum.photos/seed/barber3/400/300',
    isOpen: false,
    tags: ['Estilo Clássico', 'Toalha Quente'],
    lat: -23.5654,
    lng: -46.6689
  }
];

export const Marketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState({
    longitude: -46.6559,
    latitude: -23.5614,
    zoom: 13
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-lime-400" />
            <h1 className="text-xl font-bold tracking-tight">
              Barber<span className="text-lime-400 font-normal">Flow</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/onboarding" className="hover:text-white transition-colors">Para Barbearias</Link>
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/register" className="bg-lime-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-lime-500 transition-colors">
              Criar Conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Search & List */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-hide">
          <div>
            <h2 className="text-3xl font-bold mb-2">Encontre a barbearia ideal</h2>
            <p className="text-slate-400">Agende seu horário nas melhores barbearias da região.</p>
          </div>

          {/* Search Bar */}
          <div className="relative shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, serviço ou bairro..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
            {['Perto de mim', 'Aberto agora', 'Melhor avaliados', 'Visagismo', 'Estacionamento'].map((filter) => (
              <button key={filter} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                {filter}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex flex-col gap-4 mt-2 pb-8">
            {MOCK_BARBERSHOPS.map((shop) => (
              <Link 
                to={`/b/${shop.slug}`} 
                key={shop.id}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-lime-400/30 hover:bg-white/10 transition-all cursor-pointer"
              >
                <img 
                  src={shop.imageUrl} 
                  alt={shop.name} 
                  className="w-full sm:w-32 h-32 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold group-hover:text-lime-400 transition-colors">{shop.name}</h3>
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold">{shop.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{shop.address} • {shop.distance}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shop.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold bg-white/10 text-slate-300 px-2 py-1 rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      <span className={shop.isOpen ? 'text-lime-400' : 'text-red-400'}>
                        {shop.isOpen ? 'Aberto agora' : 'Fechado'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-lime-400">
                      Ver perfil <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Mapbox */}
        <div className="hidden lg:block w-1/2 sticky top-28 h-[calc(100vh-9rem)] rounded-3xl overflow-hidden border border-white/10 bg-[#111]">
          {MAPBOX_TOKEN ? (
            <Map
              {...viewState}
              onMove={(evt: any) => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="bottom-right" />
              {MOCK_BARBERSHOPS.map(shop => (
                <Marker 
                  key={shop.id} 
                  longitude={shop.lng} 
                  latitude={shop.lat} 
                  anchor="bottom"
                >
                  <Link to={`/b/${shop.slug}`}>
                    <div className="group relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                      <div className="bg-lime-400 text-black px-2 py-1 rounded-md text-xs font-bold shadow-lg mb-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full">
                        {shop.name}
                      </div>
                      <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.5)]">
                        <Scissors className="w-4 h-4 text-black" />
                      </div>
                      <div className="w-2 h-2 bg-lime-400 rotate-45 -mt-1"></div>
                    </div>
                  </Link>
                </Marker>
              ))}
            </Map>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 relative p-8 text-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <MapPin className="w-16 h-16 mb-4 text-lime-400/50" />
              <h3 className="text-xl font-bold text-white mb-2">Mapa Interativo (Mapbox)</h3>
              <p className="text-sm max-w-md mb-6">Para visualizar o mapa real, adicione seu token do Mapbox no arquivo <code className="bg-black/50 px-2 py-1 rounded text-lime-400">.env</code> como <code className="bg-black/50 px-2 py-1 rounded text-lime-400">VITE_MAPBOX_TOKEN</code>.</p>
              
              {/* Mock Pins for visual effect when token is missing */}
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.4)] cursor-pointer hover:scale-110 transition-transform">
                <Scissors className="w-4 h-4 text-black" />
              </div>
              <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Scissors className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
