import React, { useEffect, useState } from 'react';
import { Bell, CreditCard, Loader2, Palette, Store } from 'lucide-react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { getSettingsData, saveShopSettings, type AdminBusinessHour, type SettingsData } from '../lib/adminApi';

interface HourFormRow {
  day_of_week: number;
  label: string;
  is_open: boolean;
  opens_at: string;
  closes_at: string;
}

const DAY_LABELS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

const mapHours = (hours: AdminBusinessHour[]): HourFormRow[] =>
  DAY_LABELS.map((label, day_of_week) => {
    const existing = hours.find((entry) => entry.day_of_week === day_of_week);
    return {
      day_of_week,
      label,
      is_open: existing?.is_open ?? day_of_week !== 0,
      opens_at: existing?.opens_at?.slice(0, 5) ?? '09:00',
      closes_at: existing?.closes_at?.slice(0, 5) ?? (day_of_week === 6 ? '17:00' : '19:00'),
    };
  });

export const AdminSettings: React.FC = () => {
  const [data, setData] = useState<SettingsData | null>(null);
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    instagramHandle: '',
    documentNumber: '',
    postalCode: '',
    addressLine: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [hoursForm, setHoursForm] = useState<HourFormRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    setFeedback('');
    const result = await getSettingsData();
    setData(result);
    setShopForm({
      name: result.context.shop.name,
      description: result.context.shop.description ?? '',
      phone: result.context.shop.phone ?? '',
      whatsapp: result.context.shop.whatsapp ?? '',
      instagramHandle: result.context.shop.instagram_handle ?? '',
      documentNumber: result.context.shop.document_number ?? '',
      postalCode: result.context.shop.postal_code ?? '',
      addressLine: result.context.shop.address_line,
      neighborhood: result.context.shop.neighborhood ?? '',
      city: result.context.shop.city,
      state: result.context.shop.state,
    });
    setHoursForm(mapHours(result.businessHours));
  };

  useEffect(() => {
    let isMounted = true;

    load()
      .catch((error) => {
        if (isMounted) {
          setFeedback(error instanceof Error ? error.message : 'Nao foi possivel carregar as configuracoes.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateHour = (dayOfWeek: number, changes: Partial<HourFormRow>) => {
    setHoursForm((current) =>
      current.map((entry) => (entry.day_of_week === dayOfWeek ? { ...entry, ...changes } : entry))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');

    try {
      await saveShopSettings({
        ...shopForm,
        businessHours: hoursForm.map((entry) => ({
          day_of_week: entry.day_of_week,
          is_open: entry.is_open,
          opens_at: entry.is_open ? entry.opens_at : null,
          closes_at: entry.is_open ? entry.closes_at : null,
        })),
      });

      await load();
      setFeedback('Configuracoes salvas com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel salvar as configuracoes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0a0a0a]/50 px-8 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 md:pl-0">
            <h2 className="text-2xl font-bold">Configuracoes</h2>
            <p className="text-sm text-slate-400">Gerencie perfil, contato e horario da sua barbearia</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving || !data?.context.canManageShop}
            className="w-full rounded-full bg-lime-400 px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        </header>

        <div className="max-w-5xl p-4 md:p-8">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-hide lg:col-span-1 lg:flex-col lg:pb-0">
                <button className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left font-medium text-white whitespace-nowrap">
                  <Store className="h-5 w-5" /> Perfil
                </button>
                <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-400 whitespace-nowrap">
                  <Palette className="h-5 w-5" /> Aparencia
                </button>
                <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-400 whitespace-nowrap">
                  <CreditCard className="h-5 w-5" /> Assinatura
                </button>
                <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-400 whitespace-nowrap">
                  <Bell className="h-5 w-5" /> Notificacoes
                </button>
              </div>

              <div className="space-y-8 lg:col-span-3">
                {feedback ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'border-lime-400/40 bg-lime-400/10 text-lime-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
                    {feedback}
                  </div>
                ) : null}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
                  <h3 className="mb-6 text-xl font-bold">Informacoes Basicas</h3>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-zinc-800">
                        <span className="text-center text-xs text-slate-400">Logo<br />em breve</span>
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-slate-300">Nome da Barbearia</label>
                        <input value={shopForm.name} onChange={(event) => setShopForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Descricao Curta</label>
                      <textarea value={shopForm.description} onChange={(event) => setShopForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Telefone</label>
                        <input value={shopForm.phone} onChange={(event) => setShopForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">WhatsApp</label>
                        <input value={shopForm.whatsapp} onChange={(event) => setShopForm((current) => ({ ...current, whatsapp: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Instagram</label>
                        <input value={shopForm.instagramHandle} onChange={(event) => setShopForm((current) => ({ ...current, instagramHandle: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">CNPJ / CPF</label>
                        <input value={shopForm.documentNumber} onChange={(event) => setShopForm((current) => ({ ...current, documentNumber: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
                  <h3 className="mb-6 text-xl font-bold">Endereco</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">CEP</label>
                      <input value={shopForm.postalCode} onChange={(event) => setShopForm((current) => ({ ...current, postalCode: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Bairro</label>
                      <input value={shopForm.neighborhood} onChange={(event) => setShopForm((current) => ({ ...current, neighborhood: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-slate-300">Endereco Completo</label>
                    <input value={shopForm.addressLine} onChange={(event) => setShopForm((current) => ({ ...current, addressLine: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Cidade</label>
                      <input value={shopForm.city} onChange={(event) => setShopForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Estado</label>
                      <input value={shopForm.state} onChange={(event) => setShopForm((current) => ({ ...current, state: event.target.value.toUpperCase() }))} maxLength={2} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
                  <h3 className="mb-6 text-xl font-bold">Horario de Funcionamento</h3>
                  <div className="space-y-3">
                    {hoursForm.map((entry) => (
                      <div key={entry.day_of_week} className="flex flex-col gap-4 rounded-xl border border-white/5 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-3 font-medium">
                          <input type="checkbox" checked={entry.is_open} onChange={(event) => updateHour(entry.day_of_week, { is_open: event.target.checked })} className="h-5 w-5 accent-lime-400" />
                          {entry.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="time" value={entry.opens_at} onChange={(event) => updateHour(entry.day_of_week, { opens_at: event.target.value })} disabled={!entry.is_open} className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none" />
                          <span className="text-slate-500">ate</span>
                          <input type="time" value={entry.closes_at} onChange={(event) => updateHour(entry.day_of_week, { closes_at: event.target.value })} disabled={!entry.is_open} className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
