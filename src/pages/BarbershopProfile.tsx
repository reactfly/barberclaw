import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Heart,
  MapPin,
  Phone,
  Scissors,
  Share2,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { BookingCalendar } from '../components/marketplace/BookingCalendar';
import { MapboxNavigator } from '../components/map/MapboxNavigator';
import { getBarbershopBySlug } from '../data/marketplace';
import { formatDistance, haversineDistance } from '../lib/mapbox';
import { useGeolocation } from '../hooks/useGeolocation';

type BookingStep = 1 | 2 | 3;
type ProfileTab = 'booking' | 'location' | 'reviews';

export const BarbershopProfile: React.FC = () => {
  const { slug } = useParams();
  const { location: userLocation, requestLocation } = useGeolocation();

  const shop = getBarbershopBySlug(slug);
  const [selectedService, setSelectedService] = useState<string | null>(shop.services[0]?.id ?? null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [activeTab, setActiveTab] = useState<ProfileTab>('booking');
  const [liked, setLiked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const selectedServiceData = shop.services.find((service) => service.id === selectedService) ?? null;
  const selectedBarberData = shop.barbers.find((barber) => barber.id === selectedBarber) ?? null;
  const userDistance = userLocation ? haversineDistance(userLocation, shop.coordinates) : null;

  const handleNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep((current) => (current + 1) as BookingStep);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, text: `Confira ${shop.name} no BarberFlow`, url });
        return;
      } catch {
        // Fallback to clipboard below.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(false);
    }
  };

  return (
    <div className="marketplace-shell marketplace-safe-bottom min-h-screen bg-[#050505] text-slate-100">
      <section className="relative h-[300px] overflow-hidden sm:h-[360px] md:h-[430px]">
        <img
          src={shop.coverImageUrl}
          alt={shop.name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(5,5,5,0.72)_55%,#050505_100%)]" />

        <div className="absolute left-0 right-0 top-0 z-10 px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              to="/marketplace"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60 sm:px-4"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{shareCopied ? 'Link copiado' : 'Compartilhar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLiked((current) => !current)}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-md transition-colors ${
                  liked ? 'bg-red-500/20 text-red-200' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 -mt-20 px-4 pb-10 sm:-mt-24 sm:px-5 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5 md:rounded-[32px] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border-4 border-[#050505] bg-zinc-900 shadow-xl sm:h-24 sm:w-24 sm:rounded-[28px]">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${shop.logoSeed}&backgroundColor=a3e635&textColor=000000`}
                    alt={shop.name}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="marketplace-label rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-300">
                      {shop.premium ? 'Premium' : 'Curadoria BarberFlow'}
                    </span>
                    <span
                      className={`marketplace-label rounded-full px-3 py-1 text-[11px] font-semibold ${
                        shop.isOpen ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'
                      }`}
                    >
                      {shop.isOpen ? `Aberto ate ${shop.closesAt}` : 'Fechado agora'}
                    </span>
                  </div>
                  <h1 className="marketplace-display marketplace-fluid-title mt-3 text-white">{shop.name}</h1>
                  <p className="marketplace-copy mt-3 max-w-3xl text-sm text-slate-300 md:text-base">{shop.heroBlurb}</p>
                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {shop.rating} ({shop.reviews} avaliacoes)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-lime-300" />
                      {shop.address}
                    </span>
                    <a href={`tel:${shop.phone}`} className="inline-flex items-center gap-1 transition-colors hover:text-lime-300">
                      <Phone className="h-4 w-4 text-sky-300" />
                      {shop.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">Proximo horario</p>
                  <p className="mt-2 text-sm font-semibold text-white">{shop.nextSlot}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">A partir de</p>
                  <p className="mt-2 text-sm font-semibold text-white">R$ {shop.priceFrom}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">Distancia</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {userDistance !== null ? formatDistance(userDistance) : 'Ative sua localizacao'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {shop.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1 scrollbar-hide">
            {[
              { key: 'booking' as const, label: 'Agendar', icon: Calendar },
              { key: 'location' as const, label: 'Como chegar', icon: MapPin },
              { key: 'reviews' as const, label: 'Avaliacoes', icon: Star },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex min-w-fit items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:flex-1 ${
                  activeTab === tab.key ? 'bg-lime-400 text-black' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'booking' && (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 md:rounded-[32px] md:p-7">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="marketplace-kicker text-xs text-lime-300">Agendamento guiado</p>
                    <h2 className="marketplace-fluid-section mt-2 text-white">Monte seu atendimento ideal</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
                    Etapa {bookingStep} de 3
                  </div>
                </div>

                <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-lime-400 transition-all" style={{ width: `${bookingStep * 33.33}%` }} />
                </div>

                {bookingStep === 1 && (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/10">
                        <Scissors className="h-5 w-5 text-lime-300" />
                      </div>
                      <div>
                        <h3 className="marketplace-fluid-card text-white">Escolha o servico</h3>
                        <p className="text-sm text-slate-400">Selecione o formato de atendimento que mais combina com o momento.</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {shop.services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service.id)}
                          className={`rounded-3xl border p-4 text-left transition-all sm:p-5 md:rounded-[28px] ${
                            selectedService === service.id
                              ? 'border-lime-400/40 bg-lime-400/10 shadow-[0_24px_60px_rgba(132,204,22,0.08)]'
                              : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="marketplace-fluid-card text-white">{service.name}</h4>
                                {service.badge && (
                                  <span className="rounded-full bg-lime-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-200">
                                    {service.badge}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                              <p className="text-sm font-semibold text-white">R$ {service.price}</p>
                              <p className="mt-1 text-xs text-slate-400">{service.duration} min</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        disabled={!selectedService}
                        onClick={handleNextStep}
                        className="rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {bookingStep === 2 && (
                  <div className="space-y-8">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar para servicos
                    </button>

                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10">
                          <User className="h-5 w-5 text-sky-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Escolha o profissional</h3>
                          <p className="text-sm text-slate-400">Veja especialidade e experiencia antes de reservar.</p>
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        {shop.barbers.map((barber) => (
                          <button
                            key={barber.id}
                            type="button"
                            onClick={() => setSelectedBarber(barber.id)}
                            className={`rounded-3xl border p-4 text-left transition-all md:rounded-[28px] ${
                              selectedBarber === barber.id
                                ? 'border-lime-400/40 bg-lime-400/10'
                                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {barber.avatar ? (
                                <img
                                  src={barber.avatar}
                                  alt={barber.name}
                                  className="h-16 w-16 rounded-2xl object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                                  <User className="h-7 w-7 text-slate-500" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="marketplace-fluid-card text-white">{barber.name}</h4>
                                <p className="mt-1 text-sm text-slate-400">{barber.role}</p>
                                <p className="mt-3 text-sm text-slate-300">{barber.specialty}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{barber.experience}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/10">
                          <CalendarClock className="h-5 w-5 text-lime-300" />
                        </div>
                        <div>
                        <h3 className="marketplace-fluid-card text-white">Selecione data e horario</h3>
                          <p className="text-sm text-slate-400">Agenda dinamica com melhor visualizacao de horarios livres.</p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:rounded-[28px] md:p-6">
                        <BookingCalendar
                          durationMinutes={selectedServiceData?.duration}
                          onSelectDateTime={(date, time) => setSelectedDateTime({ date, time })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!selectedBarber || !selectedDateTime}
                        onClick={handleNextStep}
                        className="rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Revisar agendamento
                      </button>
                    </div>
                  </div>
                )}

                {bookingStep === 3 && (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-400/15">
                      <CheckCircle2 className="h-10 w-10 text-lime-300" />
                    </div>
                    <h3 className="marketplace-fluid-title mt-6 text-white">Agendamento confirmado</h3>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
                      Sua reserva foi registrada com sucesso. Agora voce ja pode abrir a rota, ligar para a barbearia ou voltar ao marketplace.
                    </p>

                    <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/10 bg-black/20 p-4 text-left sm:p-5 md:rounded-[28px]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Servico</p>
                          <p className="mt-2 font-semibold text-white">{selectedServiceData?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Profissional</p>
                          <p className="mt-2 font-semibold text-white">{selectedBarberData?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Data</p>
                          <p className="mt-2 font-semibold text-white">
                            {selectedDateTime?.date.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Horario</p>
                          <p className="mt-2 font-semibold text-white">{selectedDateTime?.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setActiveTab('location')}
                        className="rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-lime-300"
                      >
                        Ver como chegar
                      </button>
                      <Link
                        to="/marketplace"
                        className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]"
                      >
                        Voltar ao marketplace
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 md:rounded-[32px] md:p-6 xl:sticky xl:top-24 xl:h-fit">
                <p className="marketplace-kicker text-xs text-lime-300">Resumo da reserva</p>
                <h3 className="marketplace-fluid-section mt-2 text-white">Seu atendimento</h3>

                <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">Servico selecionado</p>
                  <p className="mt-2 font-semibold text-white">{selectedServiceData?.name ?? 'Escolha um servico'}</p>
                  {selectedServiceData && (
                    <p className="mt-1 text-sm text-slate-400">
                      {selectedServiceData.duration} min • R$ {selectedServiceData.price}
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-[28px] border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">Profissional</p>
                  <p className="mt-2 font-semibold text-white">{selectedBarberData?.name ?? 'Escolha na etapa 2'}</p>
                  <p className="mt-1 text-sm text-slate-400">{selectedBarberData?.specialty ?? 'Veja perfil e experiencia antes de confirmar.'}</p>
                </div>

                <div className="mt-4 rounded-[28px] border border-white/10 bg-black/20 p-4">
                  <p className="marketplace-label text-xs text-slate-500">Agenda</p>
                  <p className="mt-2 font-semibold text-white">
                    {selectedDateTime ? selectedDateTime.date.toLocaleDateString('pt-BR') : 'Selecione data e hora'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{selectedDateTime?.time ?? shop.nextSlot}</p>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="marketplace-label text-xs text-slate-500">Resposta</p>
                    <p className="mt-2 text-sm font-semibold text-white">{shop.responseTime}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="marketplace-label text-xs text-slate-500">Diferenciais</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {shop.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          )}

          {activeTab === 'location' && (
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="marketplace-label text-xs text-slate-500">Endereco</p>
                  <p className="mt-3 text-sm leading-6 text-white">{shop.address}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="marketplace-label text-xs text-slate-500">Funcionamento</p>
                  <p className="mt-3 text-sm text-white">{shop.hours?.days}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {shop.hours?.open} - {shop.hours?.close}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="marketplace-label text-xs text-slate-500">Sua distancia</p>
                  <p className="mt-3 text-sm text-white">
                    {userDistance !== null ? formatDistance(userDistance) : 'Ative sua localizacao'}
                  </p>
                  {userDistance === null && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="mt-3 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.05]"
                    >
                      Usar minha localizacao
                    </button>
                  )}
                </div>
              </div>
              <MapboxNavigator barbershop={shop} />
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:rounded-[32px] md:p-6">
                <p className="marketplace-kicker text-xs text-lime-300">Percepcao dos clientes</p>
                <div className="marketplace-fluid-title mt-4 text-white">{shop.rating}</div>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${value <= Math.round(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-400">{shop.reviews} avaliacoes registradas</p>

                <div className="mt-6 space-y-3">
                  {shop.reviewHighlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                      <Sparkles className="mr-2 inline h-4 w-4 text-lime-300" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {shop.reviewsList.map((review) => (
                  <article key={review.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/10 text-sm font-bold text-lime-300">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{review.name}</p>
                          <p className="text-sm text-slate-500">
                            {review.date} | {review.service}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-4 w-4 ${value <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{review.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
