import { HairstyleOption, Barber, TimeSlot } from './types';

export const ALLOWED_CUTS = [
  HairstyleOption.LOW_FADE,
  HairstyleOption.MID_FADE,
  HairstyleOption.HIGH_FADE,
  HairstyleOption.SKIN_FADE,
  HairstyleOption.TAPER_FADE,
  HairstyleOption.BUZZ_CUT,
  HairstyleOption.FRENCH_CROP,
  HairstyleOption.POMPADOUR,
  HairstyleOption.SLICK_BACK,
  HairstyleOption.MULLET_MODERNO,
  HairstyleOption.CORTE_SOCIAL,
  HairstyleOption.DEGRADE_COM_RISCO,
  HairstyleOption.FLAT_TOP,
  HairstyleOption.MOICANO_DISFARCADO,
  HairstyleOption.AFRO_NUDRED,
  HairstyleOption.BLINDADO,
  HairstyleOption.SURFISTA,
  HairstyleOption.CAESAR_CUT,
  HairstyleOption.QUIFF,
  HairstyleOption.SIDE_PART,
];

export const STYLE_PREFERENCES = [
  "Todos",
  "Moderno",
  "Clássico",
  "Degradê (Fade)",
  "Texturizado",
  "Militar/Curto",
  "Com Riscos/Desenhos",
  "Barba Definida",
  "Sobrancelha Modelada",
  "Estilo Navalhado"
];

export const MOCK_BARBERS: Barber[] = [
  { id: "1", name: "Carlos Silva", specialty: "Degradê & Barba", avatar: "https://picsum.photos/100/100?random=1", active: true },
  { id: "2", name: "João 'Navalha'", specialty: "Cortes Clássicos", avatar: "https://picsum.photos/100/100?random=2", active: true },
  { id: "3", name: "Mike Oliveira", specialty: "Visagismo & Freestyle", avatar: "https://picsum.photos/100/100?random=3", active: true },
];

export const MOCK_SLOTS: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: false },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
  { time: "18:00", available: false },
];