import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  Scissors,
  Store,
  Trash2,
} from 'lucide-react';
import { getCurrentSessionContext } from '../lib/auth';
import { loadCurrentOwnerSetup, saveCurrentOwnerSetup } from '../lib/shopSetup';

type PlanTier = 'pro' | 'premium';

interface BusinessHourFormRow {
  dayOfWeek: number;
  label: string;
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
}

interface ServiceFormRow {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  badge: string;
}

interface FormState {
  shopName: string;
  description: string;
  documentNumber: string;
  ownerPhone: string;
  whatsapp: string;
  instagramHandle: string;
  postalCode: string;
  addressLine: string;
  neighborhood: string;
  city: string;
  state: string;
  countryCode: string;
  plan: PlanTier;
  businessHours: BusinessHourFormRow[];
  services: ServiceFormRow[];
}

const DEFAULT_HOURS: BusinessHourFormRow[] = [
  { dayOfWeek: 0, label: 'Domingo', isOpen: false, opensAt: '09:00', closesAt: '18:00' },
  { dayOfWeek: 1, label: 'Segunda', isOpen: true, opensAt: '09:00', closesAt: '19:00' },
  { dayOfWeek: 2, label: 'Terca', isOpen: true, opensAt: '09:00', closesAt: '19:00' },
  { dayOfWeek: 3, label: 'Quarta', isOpen: true, opensAt: '09:00', closesAt: '19:00' },
  { dayOfWeek: 4, label: 'Quinta', isOpen: true, opensAt: '09:00', closesAt: '19:00' },
  { dayOfWeek: 5, label: 'Sexta', isOpen: true, opensAt: '09:00', closesAt: '19:00' },
  { dayOfWeek: 6, label: 'Sabado', isOpen: true, opensAt: '09:00', closesAt: '17:00' },
];

const makeServiceId = () => `service-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEFAULT_SERVICES: ServiceFormRow[] = [
  { id: 'service-1', name: 'Corte Classico', description: '', price: '45', duration: '30', badge: 'Mais pedido' },
  { id: 'service-2', name: 'Barba', description: '', price: '35', duration: '30', badge: '' },
  { id: 'service-3', name: 'Combo Corte + Barba', description: '', price: '70', duration: '60', badge: 'Economize' },
];

const DEFAULT_FORM: FormState = {
  shopName: '',
  description: '',
  documentNumber: '',
  ownerPhone: '',
  whatsapp: '',
  instagramHandle: '',
  postalCode: '',
  addressLine: '',
  neighborhood: '',
  city: '',
  state: 'SP',
  countryCode: 'BR',
  plan: 'pro',
  businessHours: DEFAULT_HOURS,
  services: DEFAULT_SERVICES,
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none';

const smallInputClass =
  'w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none';

const cleanPrice = (value: string) => value.replace(',', '.').replace(/[^0-9.]/g, '');
const toPrice = (value: string) => Number.parseFloat(cleanPrice(value));
const toDuration = (value: string) => Number.parseInt(value.replace(/\D/g, ''), 10);

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const context = await getCurrentSessionContext();
        const snapshot = await loadCurrentOwnerSetup();

        if (!isMounted || !context) {
          return;
        }

        setForm((current) => ({
          ...current,
          ownerPhone: context.profile.phone ?? '',
          shopName: snapshot.shop?.name ?? current.shopName,
          description: snapshot.shop?.description ?? current.description,
          documentNumber: snapshot.shop?.document_number ?? current.documentNumber,
          whatsapp: snapshot.shop?.whatsapp ?? snapshot.shop?.phone ?? current.whatsapp,
          instagramHandle: snapshot.shop?.instagram_handle ?? current.instagramHandle,
          postalCode: snapshot.shop?.postal_code ?? current.postalCode,
          addressLine: snapshot.shop?.address_line ?? current.addressLine,
          neighborhood: snapshot.shop?.neighborhood ?? current.neighborhood,
          city: snapshot.shop?.city ?? current.city,
          state: snapshot.shop?.state ?? current.state,
          countryCode: snapshot.shop?.country_code ?? current.countryCode,
          plan: snapshot.shop?.is_premium ? 'premium' : current.plan,
          businessHours:
            snapshot.businessHours.length > 0
              ? DEFAULT_HOURS.map((entry) => {
                  const existing = snapshot.businessHours.find((hour) => hour.day_of_week === entry.dayOfWeek);
                  return existing
                    ? {
                        ...entry,
                        isOpen: existing.is_open,
                        opensAt: existing.opens_at?.slice(0, 5) ?? entry.opensAt,
                        closesAt: existing.closes_at?.slice(0, 5) ?? entry.closesAt,
                      }
                    : entry;
                })
              : current.businessHours,
          services:
            snapshot.services.length > 0
              ? snapshot.services.map((service) => ({
                  id: service.id,
                  name: service.name,
                  description: service.description ?? '',
                  price: String(service.price),
                  duration: String(service.duration_minutes),
                  badge: service.badge ?? '',
                }))
              : current.services,
        }));
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o onboarding.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeServices = useMemo(
    () => form.services.filter((service) => service.name.trim().length > 0),
    [form.services]
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateHour = (dayOfWeek: number, changes: Partial<BusinessHourFormRow>) => {
    setForm((current) => ({
      ...current,
      businessHours: current.businessHours.map((entry) =>
        entry.dayOfWeek === dayOfWeek ? { ...entry, ...changes } : entry
      ),
    }));
  };

  const updateService = (serviceId: string, changes: Partial<ServiceFormRow>) => {
    setForm((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === serviceId ? { ...service, ...changes } : service
      ),
    }));
  };

  const validateStep = () => {
    if (step === 1 && (!form.shopName.trim() || !form.addressLine.trim() || !form.city.trim() || !form.state.trim())) {
      return 'Preencha nome da barbearia, endereco, cidade e estado.';
    }

    if (step === 2) {
      const invalid = form.businessHours.find(
        (entry) => entry.isOpen && (!entry.opensAt || !entry.closesAt || entry.opensAt >= entry.closesAt)
      );
      if (invalid) {
        return `Revise os horarios de ${invalid.label}.`;
      }
    }

    if (step === 3) {
      if (activeServices.length === 0) {
        return 'Cadastre pelo menos um servico.';
      }

      const invalid = activeServices.find((service) => {
        const price = toPrice(service.price);
        const duration = toDuration(service.duration);
        return Number.isNaN(price) || price < 0 || Number.isNaN(duration) || duration <= 0;
      });

      if (invalid) {
        return 'Revise preco e duracao dos servicos.';
      }
    }

    return '';
  };

  const submit = async () => {
    setErrorMessage('');
    const validationError = validateStep();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    setIsSaving(true);
    try {
      await saveCurrentOwnerSetup({
        ownerPhone: form.ownerPhone,
        shop: {
          name: form.shopName,
          description: form.description,
          documentNumber: form.documentNumber,
          phone: form.ownerPhone,
          whatsapp: form.whatsapp,
          instagramHandle: form.instagramHandle,
          postalCode: form.postalCode,
          addressLine: form.addressLine,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          countryCode: form.countryCode,
          isPremium: form.plan === 'premium',
        },
        businessHours: form.businessHours.map((entry) => ({
          day_of_week: entry.dayOfWeek,
          is_open: entry.isOpen,
          opens_at: entry.isOpen ? entry.opensAt : null,
          closes_at: entry.isOpen ? entry.closesAt : null,
        })),
        services: activeServices.map((service, index) => ({
          name: service.name,
          description: service.description,
          price: toPrice(service.price),
          duration_minutes: toDuration(service.duration),
          badge: service.badge,
          display_order: index,
        })),
      });

      navigate('/admin', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar sua configuracao.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
        <p className="text-sm text-slate-400">Carregando seu onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-lime-400" />
          <h1 className="text-xl font-bold">Barber<span className="font-normal text-lime-400">Flow</span></h1>
        </div>
        <span className="text-sm text-slate-400">Passo {step} de 4</span>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-8 flex gap-2">{[1, 2, 3, 4].map((value) => <div key={value} className={`h-2 flex-1 rounded-full ${value <= step ? 'bg-lime-400' : 'bg-white/10'}`} />)}</div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl space-y-8">
            {step === 1 && (
              <section className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10"><Store className="h-6 w-6 text-lime-400" /></div>
                <div>
                  <h2 className="text-3xl font-bold">Dados da Barbearia</h2>
                  <p className="mt-2 text-slate-400">Vamos salvar sua base de cadastro no Supabase.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={form.shopName} onChange={(event) => setField('shopName', event.target.value)} className={inputClass} placeholder="Nome da Barbearia" />
                  <input value={form.documentNumber} onChange={(event) => setField('documentNumber', event.target.value)} className={inputClass} placeholder="CNPJ / CPF" />
                  <input value={form.ownerPhone} onChange={(event) => setField('ownerPhone', event.target.value)} className={inputClass} placeholder="Telefone principal" />
                  <input value={form.whatsapp} onChange={(event) => setField('whatsapp', event.target.value)} className={inputClass} placeholder="WhatsApp" />
                  <input value={form.instagramHandle} onChange={(event) => setField('instagramHandle', event.target.value)} className={inputClass} placeholder="Instagram" />
                  <input value={form.postalCode} onChange={(event) => setField('postalCode', event.target.value)} className={inputClass} placeholder="CEP" />
                </div>
                <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Descricao curta da barbearia" />
                <input value={form.addressLine} onChange={(event) => setField('addressLine', event.target.value)} className={inputClass} placeholder="Endereco completo" />
                <div className="grid gap-4 md:grid-cols-3">
                  <input value={form.neighborhood} onChange={(event) => setField('neighborhood', event.target.value)} className={inputClass} placeholder="Bairro" />
                  <input value={form.city} onChange={(event) => setField('city', event.target.value)} className={inputClass} placeholder="Cidade" />
                  <input value={form.state} onChange={(event) => setField('state', event.target.value.toUpperCase())} className={inputClass} placeholder="UF" maxLength={2} />
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10"><Clock className="h-6 w-6 text-sky-300" /></div>
                <div>
                  <h2 className="text-3xl font-bold">Horario de Funcionamento</h2>
                  <p className="mt-2 text-slate-400">Esses dados alimentam disponibilidade e marketplace.</p>
                </div>
                <div className="space-y-3">
                  {form.businessHours.map((entry) => (
                    <div key={entry.dayOfWeek} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <label className="flex items-center gap-3 font-medium">
                        <input type="checkbox" checked={entry.isOpen} onChange={(event) => updateHour(entry.dayOfWeek, { isOpen: event.target.checked })} className="h-5 w-5 accent-lime-400" />
                        {entry.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="time" value={entry.opensAt} onChange={(event) => updateHour(entry.dayOfWeek, { opensAt: event.target.value })} disabled={!entry.isOpen} className={smallInputClass} />
                        <span className="text-slate-500">ate</span>
                        <input type="time" value={entry.closesAt} onChange={(event) => updateHour(entry.dayOfWeek, { closesAt: event.target.value })} disabled={!entry.isOpen} className={smallInputClass} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10"><Scissors className="h-6 w-6 text-lime-300" /></div>
                <div>
                  <h2 className="text-3xl font-bold">Servicos Iniciais</h2>
                  <p className="mt-2 text-slate-400">Cadastre o minimo necessario para publicar sua agenda.</p>
                </div>
                <div className="space-y-4">
                  {form.services.map((service) => (
                    <div key={service.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Servico</span>
                        <button type="button" onClick={() => setField('services', form.services.length === 1 ? [{ id: makeServiceId(), name: '', description: '', price: '', duration: '30', badge: '' }] : form.services.filter((item) => item.id !== service.id))} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </button>
                      </div>
                      <input value={service.name} onChange={(event) => updateService(service.id, { name: event.target.value })} className={smallInputClass} placeholder="Nome do servico" />
                      <textarea value={service.description} onChange={(event) => updateService(service.id, { description: event.target.value })} rows={2} className={`${smallInputClass} resize-none`} placeholder="Descricao" />
                      <div className="grid gap-3 md:grid-cols-3">
                        <input value={service.price} onChange={(event) => updateService(service.id, { price: cleanPrice(event.target.value) })} className={smallInputClass} placeholder="Preco" />
                        <input value={service.duration} onChange={(event) => updateService(service.id, { duration: event.target.value.replace(/\D/g, '') })} className={smallInputClass} placeholder="Duracao em min" />
                        <input value={service.badge} onChange={(event) => updateService(service.id, { badge: event.target.value })} className={smallInputClass} placeholder="Badge opcional" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setField('services', [...form.services, { id: makeServiceId(), name: '', description: '', price: '', duration: '30', badge: '' }])} className="w-full rounded-xl border border-dashed border-white/20 py-3 text-sm font-medium text-slate-300 hover:border-white/40 hover:text-white inline-flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Adicionar servico
                  </button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10"><CreditCard className="h-6 w-6 text-yellow-400" /></div>
                <div>
                  <h2 className="text-3xl font-bold">Plano Inicial</h2>
                  <p className="mt-2 text-slate-400">Vamos registrar o tier da sua conta para iniciar a operacao.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { id: 'pro' as const, title: 'Plano PRO', price: 'R$ 99', items: ['Ate 5 barbeiros', 'Agendamentos ilimitados', 'WhatsApp e visagismo'] },
                    { id: 'premium' as const, title: 'Plano PREMIUM', price: 'R$ 199', items: ['Time ilimitado', 'Maior destaque', 'Relatorios avancados'] },
                  ].map((plan) => (
                    <button key={plan.id} type="button" onClick={() => setField('plan', plan.id)} className={`rounded-2xl border p-6 text-left ${form.plan === plan.id ? 'border-lime-400 bg-lime-400/5' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      <h3 className="text-xl font-bold">{plan.title}</h3>
                      <p className="mt-2 text-3xl font-bold">{plan.price}<span className="ml-1 text-sm font-normal text-slate-400">/mes</span></p>
                      <div className="mt-4 space-y-2 text-sm text-slate-300">{plan.items.map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-lime-400" /> {item}</div>)}</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                  <p className="font-semibold text-white">{form.shopName || 'Sua barbearia'}</p>
                  <p className="mt-2">{activeServices.length} servicos configurados • {form.city || 'Cidade pendente'} - {form.state || 'UF'}</p>
                </div>
              </section>
            )}

            {errorMessage && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>}

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => { setErrorMessage(''); setStep((current) => Math.max(1, current - 1)); }} className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium ${step === 1 ? 'pointer-events-none opacity-0' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <ArrowLeft className="h-5 w-5" /> Voltar
              </button>
              <button type="button" onClick={() => { void submit(); }} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-8 py-3 font-bold text-black hover:bg-lime-500 disabled:cursor-wait disabled:opacity-70">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {step === 4 ? 'Finalizar e Acessar Painel' : 'Proximo Passo'}
                {!isSaving ? <ArrowRight className="h-5 w-5" /> : null}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
