
import { Barber, Appointment, TimeSlot, Review } from "../types";

const STORAGE_KEYS = {
  BARBERS: "barberflow_barbers",
  APPOINTMENTS: "barberflow_appointments",
  BLOCKED_SLOTS: "barberflow_blocked_slots",
  REVIEWS: "barberflow_reviews",
};

const DEFAULT_BARBERS: Barber[] = [
  { id: "1", name: "Carlos Silva", specialty: "Degradê & Barba", avatar: "https://picsum.photos/100/100?random=1", active: true },
  { id: "2", name: "João 'Navalha'", specialty: "Cortes Clássicos", avatar: "https://picsum.photos/100/100?random=2", active: true },
  { id: "3", name: "Mike Oliveira", specialty: "Visagismo & Freestyle", avatar: "https://picsum.photos/100/100?random=3", active: true },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Ricardo M.",
    role: "Dev Senior",
    text: "Eu nunca soube que meu rosto era 'Diamante' até usar a IA deles. O corte sugerido (Faux Hawk) mudou totalmente minha aparência. Recomendo demais.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "r2",
    name: "Lucas Ferreira",
    role: "Empreendedor",
    text: "A praticidade de agendar sem ter que ligar é incrível. O sistema de visagismo não é apenas um truque, o barbeiro realmente seguiu a geometria.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    createdAt: Date.now() - 86400000
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

interface BlockedSlotsMap {
  [barberId: string]: {
    [date: string]: string[];
  };
}

export const backendService = {
  // --- BARBERS ---
  getBarbers: (): Barber[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.BARBERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(DEFAULT_BARBERS));
      return DEFAULT_BARBERS;
    }
    return JSON.parse(stored);
  },

  addBarber: (name: string, specialty: string): Barber => {
    const barbers = backendService.getBarbers();
    const newBarber: Barber = {
      id: generateId(),
      name,
      specialty,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff`,
      active: true,
    };
    barbers.push(newBarber);
    localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
    return newBarber;
  },

  deleteBarber: (id: string) => {
    const barbers = backendService.getBarbers().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
  },

  // --- REVIEWS ---
  getReviews: (): Review[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(stored);
  },

  addReview: (review: Omit<Review, "id" | "createdAt" | "avatar">): Review => {
    const reviews = backendService.getReviews();
    const newReview: Review = {
      ...review,
      id: generateId(),
      createdAt: Date.now(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=a3e635&color=000`
    };
    reviews.unshift(newReview); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event('reviews-updated'));
    return newReview;
  },

  // --- APPOINTMENTS ---
  getAppointments: (): Appointment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return stored ? JSON.parse(stored) : [];
  },

  createAppointment: (appointment: Omit<Appointment, "id" | "createdAt">): Appointment => {
    const appointments = backendService.getAppointments();
    const blockedMap = backendService.getBlockedSlots();
    
    const isBooked = appointments.some(
      (app) => app.barberId === appointment.barberId && app.date === appointment.date && app.time === appointment.time
    );

    const barberBlocks = blockedMap[appointment.barberId]?.[appointment.date] || [];
    const isBlocked = barberBlocks.includes(appointment.time);

    if (isBooked || isBlocked) {
      throw new Error("Este horário não está mais disponível.");
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
      createdAt: Date.now(),
    };

    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return newAppointment;
  },

  // --- AVAILABILITY LOGIC ---
  getBlockedSlots: (): BlockedSlotsMap => {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS);
    return stored ? JSON.parse(stored) : {};
  },

  toggleSlotBlock: (barberId: string, date: string, time: string) => {
    const map = backendService.getBlockedSlots();
    if (!map[barberId]) map[barberId] = {};
    if (!map[barberId][date]) map[barberId][date] = [];
    const index = map[barberId][date].indexOf(time);
    if (index > -1) {
      map[barberId][date].splice(index, 1);
    } else {
      map[barberId][date].push(time);
    }
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(map));
  },

  getAvailableSlots: (barberId: string, date: string): TimeSlot[] => {
    const appointments = backendService.getAppointments();
    const blockedMap = backendService.getBlockedSlots();
    const businessHours = [
      "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];
    const takenTimes = appointments
      .filter((app) => app.barberId === barberId && app.date === date)
      .map((app) => app.time);
    const blockedTimes = blockedMap[barberId]?.[date] || [];
    return businessHours.map((time) => ({
      time,
      available: !takenTimes.includes(time) && !blockedTimes.includes(time),
    }));
  },

  getAdminSlotsStatus: (barberId: string, date: string) => {
    const slots = backendService.getAvailableSlots(barberId, date);
    const appointments = backendService.getAppointments().filter(
      app => app.barberId === barberId && app.date === date
    );
    const blockedMap = backendService.getBlockedSlots();
    const blockedTimes = blockedMap[barberId]?.[date] || [];
    return slots.map(slot => {
       let status: 'available' | 'booked' | 'blocked' = 'available';
       if (blockedTimes.includes(slot.time)) status = 'blocked';
       const appointment = appointments.find(a => a.time === slot.time);
       if (appointment) status = 'booked';
       return { time: slot.time, status, appointment };
    });
  }
};
