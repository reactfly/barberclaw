import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import {
  createBarber,
  createService,
  deleteBarber,
  deleteService,
  getStaffData,
  inviteStaffMember,
  updateBarber,
  updateService,
  type AdminBarber,
  type AdminService,
  type MembershipRole,
  type StaffData,
} from '../lib/adminApi';

interface BarberFormState {
  id: string | null;
  name: string;
  roleLabel: string;
  specialty: string;
  experienceLabel: string;
  avatarUrl: string;
  isActive: boolean;
}

interface ServiceFormState {
  id: string | null;
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  badge: string;
  isActive: boolean;
}

interface InviteFormState {
  fullName: string;
  email: string;
  membershipRole: MembershipRole;
  roleLabel: string;
  specialty: string;
  experienceLabel: string;
  avatarUrl: string;
  commissionRate: string;
  createBarberProfile: boolean;
}

const EMPTY_BARBER: BarberFormState = {
  id: null,
  name: '',
  roleLabel: '',
  specialty: '',
  experienceLabel: '',
  avatarUrl: '',
  isActive: true,
};

const EMPTY_SERVICE: ServiceFormState = {
  id: null,
  name: '',
  description: '',
  price: '',
  durationMinutes: '30',
  badge: '',
  isActive: true,
};

const EMPTY_INVITE: InviteFormState = {
  fullName: '',
  email: '',
  membershipRole: 'barber',
  roleLabel: 'Barbeiro',
  specialty: '',
  experienceLabel: '',
  avatarUrl: '',
  commissionRate: '0',
  createBarberProfile: true,
};

export const AdminStaff: React.FC = () => {
  const [data, setData] = useState<StaffData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [barberForm, setBarberForm] = useState<BarberFormState>(EMPTY_BARBER);
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(EMPTY_SERVICE);
  const [inviteForm, setInviteForm] = useState<InviteFormState>(EMPTY_INVITE);
  const [isSavingBarber, setIsSavingBarber] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isInvitingStaff, setIsInvitingStaff] = useState(false);

  const canManageShop = data?.context.canManageShop ?? false;

  const load = async () => {
    const result = await getStaffData();
    setData(result);
  };

  useEffect(() => {
    let isMounted = true;

    load()
      .catch((error) => {
        if (isMounted) {
          setFeedback(error instanceof Error ? error.message : 'Nao foi possivel carregar equipe e servicos.');
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

  const activeBarbers = useMemo(() => data?.barbers.filter((barber) => barber.is_active) ?? [], [data]);
  const activeServices = useMemo(() => data?.services.filter((service) => service.is_active) ?? [], [data]);

  const openBarberEditor = (barber?: AdminBarber) => {
    setFeedback('');
    setBarberForm(
      barber
        ? {
            id: barber.id,
            name: barber.name,
            roleLabel: barber.role_label ?? '',
            specialty: barber.specialty ?? '',
            experienceLabel: barber.experience_label ?? '',
            avatarUrl: barber.avatar_url ?? '',
            isActive: barber.is_active,
          }
        : EMPTY_BARBER
    );
    setBarberModalOpen(true);
  };

  const openServiceEditor = (service?: AdminService) => {
    setFeedback('');
    setServiceForm(
      service
        ? {
            id: service.id,
            name: service.name,
            description: service.description ?? '',
            price: String(service.price),
            durationMinutes: String(service.duration_minutes),
            badge: service.badge ?? '',
            isActive: service.is_active,
          }
        : EMPTY_SERVICE
    );
    setServiceModalOpen(true);
  };

  const submitBarber = async () => {
    setIsSavingBarber(true);
    setFeedback('');

    try {
      if (!barberForm.name.trim()) {
        throw new Error('Informe o nome do profissional.');
      }

      if (barberForm.id) {
        await updateBarber(barberForm.id, barberForm);
      } else {
        await createBarber(barberForm);
      }

      await load();
      setBarberModalOpen(false);
      setBarberForm(EMPTY_BARBER);
      setFeedback('Profissional salvo com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel salvar o profissional.');
    } finally {
      setIsSavingBarber(false);
    }
  };

  const submitService = async () => {
    setIsSavingService(true);
    setFeedback('');

    try {
      const price = Number.parseFloat(serviceForm.price.replace(',', '.'));
      const duration = Number.parseInt(serviceForm.durationMinutes.replace(/\D/g, ''), 10);

      if (!serviceForm.name.trim() || Number.isNaN(price) || Number.isNaN(duration) || duration <= 0) {
        throw new Error('Preencha nome, preco e duracao validos para o servico.');
      }

      if (serviceForm.id) {
        await updateService(serviceForm.id, {
          name: serviceForm.name,
          description: serviceForm.description,
          price,
          durationMinutes: duration,
          badge: serviceForm.badge,
          isActive: serviceForm.isActive,
        });
      } else {
        await createService({
          name: serviceForm.name,
          description: serviceForm.description,
          price,
          durationMinutes: duration,
          badge: serviceForm.badge,
        });
      }

      await load();
      setServiceModalOpen(false);
      setServiceForm(EMPTY_SERVICE);
      setFeedback('Servico salvo com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel salvar o servico.');
    } finally {
      setIsSavingService(false);
    }
  };

  const removeBarber = async (barberId: string) => {
    try {
      await deleteBarber(barberId);
      await load();
      setFeedback('Profissional removido com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel remover o profissional.');
    }
  };

  const removeService = async (serviceId: string) => {
    try {
      await deleteService(serviceId);
      await load();
      setFeedback('Servico removido com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel remover o servico.');
    }
  };

  const submitInvite = async () => {
    setIsInvitingStaff(true);
    setFeedback('');

    try {
      const commissionRate = Number.parseFloat(inviteForm.commissionRate.replace(',', '.'));
      if (!inviteForm.fullName.trim() || !inviteForm.email.trim()) {
        throw new Error('Preencha nome e email do colaborador.');
      }

      if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        throw new Error('A comissao precisa ficar entre 0 e 100.');
      }

      await inviteStaffMember({
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        membershipRole: inviteForm.membershipRole,
        roleLabel: inviteForm.roleLabel,
        specialty: inviteForm.specialty,
        experienceLabel: inviteForm.experienceLabel,
        avatarUrl: inviteForm.avatarUrl,
        commissionRate,
        createBarberProfile: inviteForm.createBarberProfile,
      });

      await load();
      setInviteModalOpen(false);
      setInviteForm(EMPTY_INVITE);
      setFeedback('Convite enviado e equipe sincronizada com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel convidar o colaborador.');
    } finally {
      setIsInvitingStaff(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0a0a0a]/50 px-8 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 md:pl-0">
            <h2 className="text-2xl font-bold">Equipe e Servicos</h2>
            <p className="text-sm text-slate-400">Gerencie profissionais, cargos e cardapio de servicos</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFeedback('');
                setInviteForm(EMPTY_INVITE);
                setInviteModalOpen(true);
              }}
              disabled={!canManageShop}
              className="flex items-center justify-center gap-2 rounded-full border border-lime-400/30 px-4 py-2 text-sm font-bold text-lime-300 transition-colors hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Convidar Equipe
            </button>
            <button
              type="button"
              onClick={() => openServiceEditor()}
              disabled={!canManageShop}
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Novo Servico
            </button>
            <button
              type="button"
              onClick={() => openBarberEditor()}
              disabled={!canManageShop}
              className="flex items-center justify-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Novo Barbeiro
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
            </div>
          ) : (
            <>
              {feedback ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'border-lime-400/40 bg-lime-400/10 text-lime-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
                  {feedback}
                </div>
              ) : null}

              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Profissionais</h3>
                    <p className="text-sm text-slate-400">{activeBarbers.length} ativos no momento</p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
                  <table className="min-w-[720px] w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20 text-sm text-slate-400">
                        <th className="p-4 font-medium">Profissional</th>
                        <th className="p-4 font-medium">Cargo</th>
                        <th className="p-4 font-medium">Especialidade</th>
                        <th className="p-4 font-medium">Experiencia</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 text-right font-medium">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(data?.barbers ?? []).map((barber) => (
                        <tr key={barber.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {barber.avatar_url ? (
                                <img src={barber.avatar_url} alt={barber.name} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-lime-300">
                                  {barber.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold">{barber.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">{barber.role_label ?? 'Barbeiro'}</td>
                          <td className="p-4 text-slate-400">{barber.specialty ?? 'Nao informada'}</td>
                          <td className="p-4 text-slate-400">{barber.experience_label ?? 'Nao informada'}</td>
                          <td className="p-4">
                            <span className={`rounded-md px-2 py-1 text-xs font-bold ${barber.is_active ? 'bg-lime-400/20 text-lime-400' : 'bg-zinc-700/40 text-slate-300'}`}>
                              {barber.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => openBarberEditor(barber)} disabled={!canManageShop} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => { void removeBarber(barber.id); }} disabled={!canManageShop} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Servicos</h3>
                    <p className="text-sm text-slate-400">{activeServices.length} servicos ativos no cardapio</p>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {(data?.services ?? []).map((service) => (
                    <div key={service.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold">{service.name}</h4>
                            {service.badge ? (
                              <span className="rounded-full bg-lime-400/15 px-2 py-1 text-[11px] font-semibold text-lime-200">
                                {service.badge}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-slate-400">
                            {service.description ?? 'Servico sem descricao.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openServiceEditor(service)} disabled={!canManageShop} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => { void removeService(service.id); }} disabled={!canManageShop} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-slate-300">
                          {service.duration_minutes} min
                        </span>
                        <span className="font-bold text-lime-300">
                          {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {barberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-6 text-xl font-bold">{barberForm.id ? 'Editar profissional' : 'Adicionar profissional'}</h3>
            <div className="space-y-4">
              <input value={barberForm.name} onChange={(event) => setBarberForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Nome completo" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={barberForm.roleLabel} onChange={(event) => setBarberForm((current) => ({ ...current, roleLabel: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Cargo" />
                <input value={barberForm.experienceLabel} onChange={(event) => setBarberForm((current) => ({ ...current, experienceLabel: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Experiencia" />
              </div>
              <input value={barberForm.specialty} onChange={(event) => setBarberForm((current) => ({ ...current, specialty: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Especialidade" />
              <input value={barberForm.avatarUrl} onChange={(event) => setBarberForm((current) => ({ ...current, avatarUrl: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="URL do avatar (opcional)" />
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" checked={barberForm.isActive} onChange={(event) => setBarberForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 accent-lime-400" />
                Profissional ativo
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setBarberModalOpen(false)} className="rounded-full px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={() => { void submitBarber(); }} disabled={isSavingBarber} className="rounded-full bg-lime-400 px-6 py-2 font-bold text-black hover:bg-lime-500 disabled:opacity-60">
                {isSavingBarber ? 'Salvando...' : 'Salvar profissional'}
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-6 text-xl font-bold">{serviceForm.id ? 'Editar servico' : 'Adicionar servico'}</h3>
            <div className="space-y-4">
              <input value={serviceForm.name} onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Nome do servico" />
              <textarea value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Descricao" />
              <div className="grid gap-4 sm:grid-cols-3">
                <input value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Preco" />
                <input value={serviceForm.durationMinutes} onChange={(event) => setServiceForm((current) => ({ ...current, durationMinutes: event.target.value.replace(/\D/g, '') }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Duracao" />
                <input value={serviceForm.badge} onChange={(event) => setServiceForm((current) => ({ ...current, badge: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Badge" />
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" checked={serviceForm.isActive} onChange={(event) => setServiceForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 accent-lime-400" />
                Servico ativo
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setServiceModalOpen(false)} className="rounded-full px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={() => { void submitService(); }} disabled={isSavingService} className="rounded-full bg-lime-400 px-6 py-2 font-bold text-black hover:bg-lime-500 disabled:opacity-60">
                {isSavingService ? 'Salvando...' : 'Salvar servico'}
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-6 text-xl font-bold">Convidar colaborador com acesso real</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={inviteForm.fullName}
                  onChange={(event) => setInviteForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Nome completo"
                />
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Email do colaborador"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <select
                  value={inviteForm.membershipRole}
                  onChange={(event) =>
                    setInviteForm((current) => {
                      const nextRole = event.target.value as MembershipRole;
                      return {
                        ...current,
                        membershipRole: nextRole,
                        createBarberProfile:
                          nextRole === 'assistant' ? false : current.createBarberProfile,
                        roleLabel:
                          nextRole === 'manager'
                            ? 'Gerente'
                            : nextRole === 'assistant'
                              ? 'Assistente'
                              : 'Barbeiro',
                      };
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                >
                  <option value="barber">Barbeiro</option>
                  <option value="manager">Gerente</option>
                  <option value="assistant">Assistente</option>
                </select>
                <input
                  value={inviteForm.roleLabel}
                  onChange={(event) => setInviteForm((current) => ({ ...current, roleLabel: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Cargo exibido"
                />
                <input
                  value={inviteForm.commissionRate}
                  onChange={(event) => setInviteForm((current) => ({ ...current, commissionRate: event.target.value.replace(/[^\d,.-]/g, '') }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Comissao (%)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={inviteForm.specialty}
                  onChange={(event) => setInviteForm((current) => ({ ...current, specialty: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Especialidade"
                />
                <input
                  value={inviteForm.experienceLabel}
                  onChange={(event) => setInviteForm((current) => ({ ...current, experienceLabel: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                  placeholder="Experiencia"
                />
              </div>

              <input
                value={inviteForm.avatarUrl}
                onChange={(event) => setInviteForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                placeholder="URL do avatar (opcional)"
              />

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={inviteForm.createBarberProfile}
                  onChange={(event) => setInviteForm((current) => ({ ...current, createBarberProfile: event.target.checked }))}
                  className="h-4 w-4 accent-lime-400"
                />
                Criar tambem o perfil profissional em <code>barbers</code>
              </label>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
                O convite cria ou reutiliza um usuario real no Supabase Auth, sincroniza <code>profiles</code>, <code>barbershop_memberships</code> e, se marcado, tambem <code>barbers</code>.
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setInviteModalOpen(false)} className="rounded-full px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={() => { void submitInvite(); }} disabled={isInvitingStaff} className="rounded-full bg-lime-400 px-6 py-2 font-bold text-black hover:bg-lime-500 disabled:opacity-60">
                {isInvitingStaff ? 'Enviando...' : 'Enviar convite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
