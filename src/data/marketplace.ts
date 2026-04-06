import type { BarbershopLocation } from '../lib/mapbox';

export interface MarketplaceService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  badge?: string;
}

export interface MarketplaceBarber {
  id: string;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
  experience: string;
}

export interface MarketplaceReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  service: string;
}

export interface MarketplaceBarbershop extends BarbershopLocation {
  id: string;
  source: 'demo' | 'supabase';
  slug: string;
  neighborhood: string;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  coverImageUrl: string;
  logoSeed: string;
  isOpen: boolean;
  closesAt: string;
  priceFrom: number;
  nextSlot: string;
  responseTime: string;
  waitTime: string;
  featured: boolean;
  premium: boolean;
  tags: string[];
  amenities: string[];
  heroBlurb: string;
  reviewHighlights: string[];
  services: MarketplaceService[];
  barbers: MarketplaceBarber[];
  reviewsList: MarketplaceReview[];
}

export const MARKETPLACE_BARBERSHOPS: MarketplaceBarbershop[] = [
  {
    id: '1',
    source: 'demo',
    slug: 'barber-flow-premium',
    name: 'BarberFlow Premium',
    neighborhood: 'Bela Vista',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Av. Paulista, 1000 - Bela Vista, Sao Paulo - SP',
    coordinates: { lat: -23.5614, lng: -46.6559 },
    phone: '(11) 99999-9999',
    hours: { open: '09:00', close: '21:00', days: 'Seg - Sab' },
    rating: 4.9,
    reviews: 128,
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
    logoSeed: 'BarberFlow Premium',
    isOpen: true,
    closesAt: '21:00',
    priceFrom: 45,
    nextSlot: 'Hoje, 18:30',
    responseTime: 'Responde em ate 5 min',
    waitTime: 'Sem fila neste momento',
    featured: true,
    premium: true,
    tags: ['Corte', 'Barba', 'Visagismo', 'Premium'],
    amenities: ['Estacionamento', 'Bebidas', 'Wi-Fi', 'Sala VIP'],
    heroBlurb: 'Experiencia premium para quem quer sair pronto para uma reuniao, date ou ensaio fotografico.',
    reviewHighlights: ['Atendimento impecavel', 'Cortes consistentes', 'Visagismo com IA'],
    services: [
      { id: 's1', name: 'Corte Signature', price: 55, duration: 45, description: 'Corte com consultoria de estilo e acabamento premium.', badge: 'Mais pedido' },
      { id: 's2', name: 'Barba Terapia', price: 40, duration: 35, description: 'Toalha quente, alinhamento, oleo e finalizacao.' },
      { id: 's3', name: 'Combo Executive', price: 85, duration: 70, description: 'Cabelo + barba + finalizacao para eventos.', badge: 'Economize' },
      { id: 's4', name: 'Visagismo IA', price: 95, duration: 50, description: 'Analise facial assistida por IA para novos estilos.' },
    ],
    barbers: [
      { id: 'b1', name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/160?u=carlos-silva', role: 'Master Barber', specialty: 'Fade e visagismo', experience: '12 anos' },
      { id: 'b2', name: 'Rafael Mendes', avatar: 'https://i.pravatar.cc/160?u=rafael-mendes', role: 'Especialista em barba', specialty: 'Barba e acabamento fino', experience: '9 anos' },
      { id: 'b3', name: 'Julio Rocha', avatar: 'https://i.pravatar.cc/160?u=julio-rocha', role: 'Stylist', specialty: 'Cortes para eventos', experience: '7 anos' },
    ],
    reviewsList: [
      { id: 'r1', name: 'Lucas P.', rating: 5, text: 'Melhor experiencia da regiao. O corte ficou exatamente como pedi.', date: '2 dias atras', service: 'Corte Signature' },
      { id: 'r2', name: 'Andre M.', rating: 5, text: 'Fiz visagismo e saí com um estilo muito mais alinhado com meu rosto.', date: '1 semana atras', service: 'Visagismo IA' },
      { id: 'r3', name: 'Felipe R.', rating: 4, text: 'Ambiente impecavel, pontualidade e atendimento acima da media.', date: '2 semanas atras', service: 'Combo Executive' },
    ],
  },
  {
    id: '2',
    source: 'demo',
    slug: 'navalha-de-ouro',
    name: 'Navalha de Ouro',
    neighborhood: 'Consolacao',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Rua Augusta, 500 - Consolacao, Sao Paulo - SP',
    coordinates: { lat: -23.5534, lng: -46.6529 },
    phone: '(11) 98888-8888',
    hours: { open: '08:00', close: '20:00', days: 'Seg - Sab' },
    rating: 4.7,
    reviews: 85,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1600&q=80',
    logoSeed: 'Navalha de Ouro',
    isOpen: true,
    closesAt: '20:00',
    priceFrom: 39,
    nextSlot: 'Hoje, 19:10',
    responseTime: 'Responde em cerca de 10 min',
    waitTime: 'Fila de aproximadamente 15 min',
    featured: false,
    premium: false,
    tags: ['Corte', 'Barba', 'Toalha Quente'],
    amenities: ['Cerveja artesanal', 'Wi-Fi', 'TV esportiva'],
    heroBlurb: 'Classica, movimentada e com clima de barbearia tradicional para quem gosta de ritual completo.',
    reviewHighlights: ['Barba muito elogiada', 'Preco justo', 'Equipe simpatica'],
    services: [
      { id: 's1', name: 'Corte Tradicional', price: 39, duration: 35, description: 'Corte na maquina ou tesoura com acabamento na navalha.' },
      { id: 's2', name: 'Barba Gold', price: 34, duration: 30, description: 'Barba modelada com toalha quente e pomada refrescante.', badge: 'Favorito' },
      { id: 's3', name: 'Combo Augusta', price: 68, duration: 60, description: 'Cabelo + barba + sobrancelha.' },
    ],
    barbers: [
      { id: 'b1', name: 'Diego Nunes', avatar: 'https://i.pravatar.cc/160?u=diego-nunes', role: 'Barber', specialty: 'Barba desenhada', experience: '8 anos' },
      { id: 'b2', name: 'Marcos Lima', avatar: 'https://i.pravatar.cc/160?u=marcos-lima', role: 'Senior Barber', specialty: 'Corte classico', experience: '10 anos' },
      { id: 'b3', name: 'Equipe Livre', avatar: '', role: 'Primeiro disponivel', specialty: 'Agendamento mais rapido', experience: 'Sem preferencia' },
    ],
    reviewsList: [
      { id: 'r1', name: 'Rodrigo T.', rating: 5, text: 'Minha barba nunca ficou tao alinhada. Volto sempre.', date: '3 dias atras', service: 'Barba Gold' },
      { id: 'r2', name: 'Bruno A.', rating: 4, text: 'Clima muito bom e equipe agil.', date: '8 dias atras', service: 'Corte Tradicional' },
      { id: 'r3', name: 'Caio M.', rating: 5, text: 'Excelente custo-beneficio para quem trabalha na regiao.', date: '3 semanas atras', service: 'Combo Augusta' },
    ],
  },
  {
    id: '3',
    source: 'demo',
    slug: 'vintage-club',
    name: 'Vintage Club Barbearia',
    neighborhood: 'Jardins',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Rua Oscar Freire, 200 - Jardins, Sao Paulo - SP',
    coordinates: { lat: -23.5654, lng: -46.6689 },
    phone: '(11) 97777-7777',
    hours: { open: '10:00', close: '22:00', days: 'Ter - Dom' },
    rating: 4.8,
    reviews: 210,
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
    logoSeed: 'Vintage Club Barbearia',
    isOpen: false,
    closesAt: '22:00',
    priceFrom: 52,
    nextSlot: 'Amanha, 10:20',
    responseTime: 'Responde em ate 15 min',
    waitTime: 'Agenda costuma lotar rapido',
    featured: true,
    premium: true,
    tags: ['Estilo Classico', 'Toalha Quente', 'Whisky'],
    amenities: ['Lounge', 'Bebidas premium', 'Ar-condicionado'],
    heroBlurb: 'Uma barbearia autoral, com ambiente de clube privado e acabamento impecavel para estilos classicos.',
    reviewHighlights: ['Ambiente sofisticado', 'Experiencia memoravel', 'Equipe detalhista'],
    services: [
      { id: 's1', name: 'Classic Club Cut', price: 52, duration: 40, description: 'Corte classico com finalizacao de pomada premium.', badge: 'Exclusivo' },
      { id: 's2', name: 'Barba Vintage', price: 42, duration: 35, description: 'Modelagem e tratamento com toalha quente.' },
      { id: 's3', name: 'Pacote Gentlemen', price: 92, duration: 75, description: 'Cabelo, barba e limpeza facial premium.' },
    ],
    barbers: [
      { id: 'b1', name: 'Henrique Dantas', avatar: 'https://i.pravatar.cc/160?u=henrique-dantas', role: 'Lead Stylist', specialty: 'Pompadour e risca', experience: '11 anos' },
      { id: 'b2', name: 'Paulo Tavares', avatar: 'https://i.pravatar.cc/160?u=paulo-tavares', role: 'Barber', specialty: 'Barbas classicas', experience: '6 anos' },
    ],
    reviewsList: [
      { id: 'r1', name: 'Gustavo L.', rating: 5, text: 'A melhor atmosfera de todas. Vale cada real.', date: '5 dias atras', service: 'Pacote Gentlemen' },
      { id: 'r2', name: 'Murilo C.', rating: 5, text: 'Se voce gosta de acabamento detalhado, essa e a escolha.', date: '2 semanas atras', service: 'Classic Club Cut' },
      { id: 'r3', name: 'Victor S.', rating: 4, text: 'Otimo atendimento e ambiente muito bonito.', date: '1 mes atras', service: 'Barba Vintage' },
    ],
  },
  {
    id: '4',
    source: 'demo',
    slug: 'casa-norte-studio',
    name: 'Casa Norte Studio',
    neighborhood: 'Pinheiros',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Rua dos Pinheiros, 880 - Pinheiros, Sao Paulo - SP',
    coordinates: { lat: -23.5677, lng: -46.6905 },
    phone: '(11) 96666-4444',
    hours: { open: '09:00', close: '20:30', days: 'Seg - Sab' },
    rating: 4.8,
    reviews: 164,
    imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1512690459411-b0fd1c65e07c?auto=format&fit=crop&w=1600&q=80',
    logoSeed: 'Casa Norte Studio',
    isOpen: true,
    closesAt: '20:30',
    priceFrom: 49,
    nextSlot: 'Hoje, 20:00',
    responseTime: 'Responde em ate 8 min',
    waitTime: 'Atendimento pontual',
    featured: false,
    premium: true,
    tags: ['Cacheado', 'Visagismo', 'Low Fade'],
    amenities: ['Cafe especial', 'Tomada individual', 'Pet friendly'],
    heroBlurb: 'Foco em consultoria de imagem, cortes modernos e atendimento muito humano.',
    reviewHighlights: ['Entende o rosto do cliente', 'Atendimento consultivo', 'Otimo para cabelo cacheado'],
    services: [
      { id: 's1', name: 'Consult Cut', price: 49, duration: 45, description: 'Corte com analise de formato de rosto e rotina.', badge: 'Indicacao da casa' },
      { id: 's2', name: 'Barba de Precisao', price: 36, duration: 30, description: 'Desenho detalhado para barba curta ou longa.' },
      { id: 's3', name: 'Refresh Executivo', price: 74, duration: 60, description: 'Cabelo + barba com finalizacao discreta para o dia a dia.' },
      { id: 's4', name: 'Color Blend', price: 95, duration: 70, description: 'Pigmentacao e harmonizacao para grisalhos.' },
    ],
    barbers: [
      { id: 'b1', name: 'Aline Costa', avatar: 'https://i.pravatar.cc/160?u=aline-costa', role: 'Image Consultant', specialty: 'Visagismo e cacheados', experience: '9 anos' },
      { id: 'b2', name: 'Renan Souza', avatar: 'https://i.pravatar.cc/160?u=renan-souza', role: 'Fade Specialist', specialty: 'Low fade e taper', experience: '8 anos' },
      { id: 'b3', name: 'Leandro Melo', avatar: 'https://i.pravatar.cc/160?u=leandro-melo', role: 'Color Artist', specialty: 'Pigmentacao natural', experience: '5 anos' },
    ],
    reviewsList: [
      { id: 'r1', name: 'Rafael G.', rating: 5, text: 'Foi a primeira vez que senti uma consultoria de verdade antes do corte.', date: '1 dia atras', service: 'Consult Cut' },
      { id: 'r2', name: 'Pedro H.', rating: 5, text: 'Entendem muito de cabelo ondulado. Resultado excelente.', date: '6 dias atras', service: 'Consult Cut' },
      { id: 'r3', name: 'Leonardo P.', rating: 4, text: 'Equipe muito educada e lugar bonito.', date: '2 semanas atras', service: 'Refresh Executivo' },
    ],
  },
  {
    id: '5',
    source: 'demo',
    slug: 'orbit-grooming-lab',
    name: 'Orbit Grooming Lab',
    neighborhood: 'Vila Mariana',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Rua Domingo de Moraes, 320 - Vila Mariana, Sao Paulo - SP',
    coordinates: { lat: -23.5899, lng: -46.6343 },
    phone: '(11) 95555-3131',
    hours: { open: '08:30', close: '19:30', days: 'Seg - Sex' },
    rating: 4.6,
    reviews: 97,
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=1600&q=80',
    logoSeed: 'Orbit Grooming Lab',
    isOpen: true,
    closesAt: '19:30',
    priceFrom: 37,
    nextSlot: 'Hoje, 17:50',
    responseTime: 'Responde em cerca de 12 min',
    waitTime: 'Ultimas vagas do dia',
    featured: false,
    premium: false,
    tags: ['Rapido', 'Executivo', 'Barba'],
    amenities: ['Check-in digital', 'Pagamento por aproximacao', 'Lockers'],
    heroBlurb: 'Ideal para quem quer agendar, chegar, cortar e voltar para a rotina sem perder qualidade.',
    reviewHighlights: ['Agilidade sem correria', 'Bom para horario de almoco', 'Equipe objetiva'],
    services: [
      { id: 's1', name: 'Corte Express', price: 37, duration: 30, description: 'Fluxo rapido para manter o corte em dia.', badge: 'Mais rapido' },
      { id: 's2', name: 'Barba Smart', price: 30, duration: 25, description: 'Desenho, alinhamento e finalizacao simples.' },
      { id: 's3', name: 'Combo Lunch Break', price: 59, duration: 50, description: 'Cabelo + barba para quem tem agenda apertada.' },
    ],
    barbers: [
      { id: 'b1', name: 'Thiago Reis', avatar: 'https://i.pravatar.cc/160?u=thiago-reis', role: 'Express Barber', specialty: 'Acabamento rapido', experience: '7 anos' },
      { id: 'b2', name: 'Vitor Freitas', avatar: 'https://i.pravatar.cc/160?u=vitor-freitas', role: 'Barber', specialty: 'Barba e social', experience: '6 anos' },
      { id: 'b3', name: 'Primeiro horario livre', avatar: '', role: 'Alocacao automatica', specialty: 'Maior disponibilidade', experience: 'Sem preferencia' },
    ],
    reviewsList: [
      { id: 'r1', name: 'Eduardo J.', rating: 5, text: 'Salvou meu horario de almoco varias vezes.', date: '4 dias atras', service: 'Corte Express' },
      { id: 'r2', name: 'Daniel K.', rating: 4, text: 'Muito pratico para quem trabalha perto do metro.', date: '9 dias atras', service: 'Combo Lunch Break' },
      { id: 'r3', name: 'Fabio O.', rating: 5, text: 'Servico rapido e bem feito.', date: '2 semanas atras', service: 'Barba Smart' },
    ],
  },
];

export function getBarbershopBySlug(slug: string | undefined): MarketplaceBarbershop {
  return MARKETPLACE_BARBERSHOPS.find((shop) => shop.slug === slug) ?? MARKETPLACE_BARBERSHOPS[0];
}
