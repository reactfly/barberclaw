
export enum HairstyleOption {
  LOW_FADE = "Low Fade (Degradê Baixo)",
  MID_FADE = "Mid Fade (Degradê Médio)",
  HIGH_FADE = "High Fade (Degradê Alto)",
  SKIN_FADE = "Skin Fade (Navalhado)",
  TAPER_FADE = "Taper Fade (Americano)",
  BUZZ_CUT = "Buzz Cut (Militar)",
  FRENCH_CROP = "French Crop (Texturizado)",
  POMPADOUR = "Pompadour",
  SLICK_BACK = "Slick Back (Penteado para trás)",
  MULLET_MODERNO = "Mullet Moderno",
  CORTE_SOCIAL = "Corte Social Clássico",
  DEGRADE_COM_RISCO = "Degradê com Risco (Razor Part)",
  FLAT_TOP = "Flat Top",
  MOICANO_DISFARCADO = "Moicano Disfarçado",
  AFRO_NUDRED = "Afro Nudred",
  BLINDADO = "Corte Blindado (Geométrico)",
  SURFISTA = "Surfista (Camadas Longas)",
  CAESAR_CUT = "Caesar Cut (Reto com Franja)",
  QUIFF = "Quiff (Topete Texturizado)",
  SIDE_PART = "Side Part (Divisão Lateral)"
}

export interface CutSuggestion {
  name: string;
  reason: string;
}

export interface VisagismAnalysisResult {
  faceShape: string;
  suggestedCuts: CutSuggestion[];
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  barberId: string;
  barberName: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  service?: string;
  createdAt: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  createdAt: number;
}
