
import { endOfWeek, format, isAfter, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type AdminContext, type AdminAppointment, type AdminBarber, type AdminReview, type AdminService } from './adminApi';
import { getSupabaseClient } from './supabase';
import { getPlatformAuditLogs, getPlatformContent, getPlatformNotifications, getPlatformPlans, getPlatformTickets, getPlatformTransactions } from './platformAdminModulesApi';
import { getPlatformModule, getPlatformModuleHref, PLATFORM_API_BLUEPRINT, PLATFORM_ENTITY_BLUEPRINT, PLATFORM_MODULES, type PlatformModuleDefinition, type PlatformModuleSlug } from '../data/platformAdmin';

type ProfileLite = { id: string; email: string | null; full_name: string; role: 'customer' | 'owner' | 'admin' | 'staff'; is_active: boolean; updated_at?: string };
type ShopLite = { id: string; owner_id: string; name: string; slug: string; city: string; state: string; is_active: boolean; is_featured: boolean; is_premium: boolean };
type Dataset = { profiles: ProfileLite[]; shops: ShopLite[]; barbers: AdminBarber[]; services: AdminService[]; appointments: AdminAppointment[]; reviews: AdminReview[] };
type PlatformDatasetPayload = { context: AdminContext; dataset: Dataset };

export interface PlatformMetricCard { id: string; label: string; value: string; delta: string; tone: 'lime' | 'sky' | 'amber' | 'rose' | 'violet' | 'cyan'; helper: string }
export interface PlatformTrendPoint { label: string; revenue: number; bookings: number; retention: number }
export interface PlatformAlert { id: string; severity: 'critical' | 'warning' | 'info'; title: string; description: string; actionLabel: string; actionHref: string }
export interface PlatformRankingRow { id: string; name: string; city: string; bookings: number; revenue: number; rating: number; status: string }
export interface PlatformCommandItem { id: string; label: string; caption: string; href: string; category: string }
export interface PlatformTableColumn { key: string; label: string; align?: 'left' | 'right' }
export interface PlatformTableRow { id: string; [key: string]: string | number }
export interface PlatformModuleBlueprintCard { title: string; body: string; bullets: string[] }
export interface PlatformModuleData { context: AdminContext; module: PlatformModuleDefinition; metrics: PlatformMetricCard[]; filters: string[]; tableTitle: string; tableDescription: string; columns: PlatformTableColumn[]; rows: PlatformTableRow[]; blueprintCards: PlatformModuleBlueprintCard[]; commands: PlatformCommandItem[] }
export interface PlatformDashboardData { context: AdminContext; metrics: PlatformMetricCard[]; trend: PlatformTrendPoint[]; rankings: PlatformRankingRow[]; alerts: PlatformAlert[]; spotlight: Array<{ title: string; value: string; helper: string }>; commands: PlatformCommandItem[] }

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('pt-BR');
const pct = (value: number) => `${value.toFixed(1)}%`;
const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
const customerKey = (appointment: AdminAppointment) => appointment.customer_profile_id || appointment.customer_email || appointment.customer_phone || appointment.customer_name;
const delta = (current: number, previous: number) => previous === 0 ? (current === 0 ? '0%' : '+100%') : `${(((current - previous) / previous) * 100 >= 0 ? '+' : '') + (((current - previous) / previous) * 100).toFixed(1)}%`;
const parseCurrency = (value: string) => Number(value.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.') || '0');

const getSessionAccessToken = async () => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('Sua sessao expirou. Faca login novamente para continuar.');
  }

  return accessToken;
};

const requestPlatformDataset = async (): Promise<PlatformDatasetPayload> => {
  const accessToken = await getSessionAccessToken();
  const response = await fetch('/api/platform-dataset', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    context?: AdminContext;
    dataset?: Dataset;
  };

  if (!response.ok || body.ok === false || !body.context || !body.dataset) {
    throw new Error(body.error || 'Nao foi possivel carregar os dados do super admin.');
  }

  return {
    context: body.context,
    dataset: body.dataset,
  };
};

const buildCommands = (dataset: Dataset): PlatformCommandItem[] => [
  ...PLATFORM_MODULES.map((module) => ({ id: `module-${module.slug}`, label: module.label, caption: module.description, href: getPlatformModuleHref(module.slug), category: 'Modulo' })),
  ...dataset.shops.slice(0, 6).map((shop) => ({ id: `shop-${shop.id}`, label: shop.name, caption: `${shop.city} - ${shop.state}`, href: '/admin/barbershops', category: 'Barbearia' })),
  ...dataset.profiles.filter((profile) => profile.role === 'admin').slice(0, 6).map((profile) => ({ id: `admin-${profile.id}`, label: profile.full_name, caption: profile.email ?? 'Admin', href: '/admin/administrators', category: 'Administrador' })),
];

const buildMetrics = (dataset: Dataset): PlatformMetricCard[] => {
  const serviceMap = new Map(dataset.services.map((service) => [service.id, service]));
  const activeAppointments = dataset.appointments.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show');
  const currentWindow = dataset.appointments.filter((item) => isAfter(parseISO(`${item.appointment_date}T00:00:00`), subWeeks(new Date(), 4)));
  const previousWindow = dataset.appointments.filter((item) => { const d = parseISO(`${item.appointment_date}T00:00:00`); return d <= subWeeks(new Date(), 4) && d >= subWeeks(new Date(), 8); });
  const revenue = activeAppointments.reduce((sum, item) => sum + (item.service_id ? serviceMap.get(item.service_id)?.price ?? 0 : 0), 0);
  const revenueCurrent = currentWindow.reduce((sum, item) => sum + (item.status === 'cancelled' || item.status === 'no_show' ? 0 : item.service_id ? serviceMap.get(item.service_id)?.price ?? 0 : 0), 0);
  const revenuePrevious = previousWindow.reduce((sum, item) => sum + (item.status === 'cancelled' || item.status === 'no_show' ? 0 : item.service_id ? serviceMap.get(item.service_id)?.price ?? 0 : 0), 0);
  const customers = new Set(dataset.appointments.map(customerKey));
  const cancelRate = dataset.appointments.length ? (dataset.appointments.filter((item) => item.status === 'cancelled').length / dataset.appointments.length) * 100 : 0;
  const noShowRate = dataset.appointments.length ? (dataset.appointments.filter((item) => item.status === 'no_show').length / dataset.appointments.length) * 100 : 0;
  return [
    { id: 'shops', label: 'Barbearias ativas', value: num.format(dataset.shops.filter((shop) => shop.is_active).length), delta: delta(currentWindow.length, previousWindow.length), tone: 'lime', helper: 'Unidades operando na marketplace' },
    { id: 'bookings', label: 'Agendamentos totais', value: num.format(dataset.appointments.length), delta: delta(currentWindow.length, previousWindow.length), tone: 'sky', helper: 'Volume consolidado de agenda' },
    { id: 'revenue', label: 'GMV da plataforma', value: money.format(revenue), delta: delta(revenueCurrent, revenuePrevious), tone: 'amber', helper: 'Receita estimada a partir dos servicos' },
    { id: 'customers', label: 'Clientes unicos', value: num.format(customers.size), delta: `Ticket ${money.format(activeAppointments.length ? revenue / activeAppointments.length : 0)}`, tone: 'violet', helper: 'Base ativa de consumidores' },
    { id: 'cancel', label: 'Taxa de cancelamento', value: pct(cancelRate), delta: `No-show ${pct(noShowRate)}`, tone: 'rose', helper: 'Indicador critico da operacao' },
    { id: 'rating', label: 'Avaliacao media', value: avg(dataset.reviews.map((review) => review.rating)).toFixed(1), delta: `${dataset.reviews.length} avaliacoes`, tone: 'cyan', helper: 'Reputacao consolidada das unidades' },
  ];
};
const buildTrend = (dataset: Dataset): PlatformTrendPoint[] => {
  const serviceMap = new Map(dataset.services.map((service) => [service.id, service]));
  return Array.from({ length: 6 }, (_, index) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 5 - index), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekAppointments = dataset.appointments.filter((appointment) => { const d = parseISO(`${appointment.appointment_date}T00:00:00`); return d >= weekStart && d <= weekEnd; });
    const seen = new Map<string, number>();
    weekAppointments.forEach((appointment) => seen.set(customerKey(appointment), (seen.get(customerKey(appointment)) ?? 0) + 1));
    return { label: format(weekStart, 'dd MMM', { locale: ptBR }), bookings: weekAppointments.length, retention: weekAppointments.length ? Number(((Array.from(seen.values()).filter((value) => value > 1).length / Math.max(1, seen.size)) * 100).toFixed(1)) : 0, revenue: weekAppointments.reduce((sum, appointment) => sum + (appointment.status === 'cancelled' || appointment.status === 'no_show' ? 0 : appointment.service_id ? serviceMap.get(appointment.service_id)?.price ?? 0 : 0), 0) };
  });
};

const buildRanking = (dataset: Dataset): PlatformRankingRow[] => {
  const serviceMap = new Map(dataset.services.map((service) => [service.id, service]));
  const ratings = new Map<string, number[]>();
  dataset.reviews.forEach((review) => ratings.set(review.shop_id, [...(ratings.get(review.shop_id) ?? []), review.rating]));
  return dataset.shops.map((shop) => {
    const shopAppointments = dataset.appointments.filter((appointment) => appointment.shop_id === shop.id);
    return { id: shop.id, name: shop.name, city: `${shop.city} - ${shop.state}`, bookings: shopAppointments.length, revenue: shopAppointments.reduce((sum, appointment) => sum + (appointment.status === 'cancelled' || appointment.status === 'no_show' ? 0 : appointment.service_id ? serviceMap.get(appointment.service_id)?.price ?? 0 : 0), 0), rating: avg(ratings.get(shop.id) ?? []), status: shop.is_active ? (shop.is_premium ? 'Premium' : 'Operando') : 'Inativa' };
  }).sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings).slice(0, 6);
};

const buildAlerts = (dataset: Dataset, rankings: PlatformRankingRow[]): PlatformAlert[] => {
  const alerts: PlatformAlert[] = [];
  if (dataset.shops.some((shop) => !shop.is_active)) alerts.push({ id: 'shops', severity: 'warning', title: 'Existem barbearias inativas', description: 'Revise onboarding, compliance e planos para recuperar receita.', actionLabel: 'Abrir barbearias', actionHref: '/admin/barbershops' });
  if (rankings.some((shop) => shop.rating > 0 && shop.rating < 4)) alerts.push({ id: 'rating', severity: 'critical', title: 'Unidades com reputacao em queda', description: 'Notas abaixo de 4.0 impactam conversao e recorrencia.', actionLabel: 'Abrir reputacao', actionHref: '/admin/reviews' });
  if (dataset.appointments.some((appointment) => appointment.status === 'no_show')) alerts.push({ id: 'noshow', severity: 'info', title: 'No-show detectado na operacao', description: 'Vale reforcar automacoes de lembrete e confirmacao.', actionLabel: 'Abrir agenda global', actionHref: '/admin/bookings' });
  return alerts.length ? alerts.slice(0, 3) : [{ id: 'stable', severity: 'info', title: 'Plataforma estavel', description: 'Sem alertas criticos no momento.', actionLabel: 'Ver analytics', actionHref: '/admin/analytics' }];
};

const blueprint = (module: PlatformModuleDefinition): PlatformModuleBlueprintCard[] => [
  { title: 'Arquitetura do modulo', body: 'Cada modulo foi preparado para operacao SaaS com filtros salvos, exportacao, auditoria e automacoes.', bullets: module.highlights },
  { title: 'Entidades-chave', body: 'O painel consome o Supabase atual e aponta a expansao recomendada do schema.', bullets: PLATFORM_ENTITY_BLUEPRINT.slice(0, 5).map((entity) => `${entity.name}: ${entity.purpose}`) },
  { title: 'APIs recomendadas', body: 'A camada server-side centraliza regras sensiveis, logs e integracoes externas.', bullets: PLATFORM_API_BLUEPRINT.slice(0, 5).map((api) => `${api.method} ${api.path}`) },
];

const buildCustomers = (dataset: Dataset, serviceMap: Map<string, AdminService>, shopMap: Map<string, ShopLite>) => Array.from(dataset.appointments.reduce<Map<string, PlatformTableRow>>((accumulator, appointment) => {
  const key = customerKey(appointment); const current = accumulator.get(key); const serviceName = appointment.service_id ? serviceMap.get(appointment.service_id)?.name ?? 'Servico livre' : 'Servico livre';
  if (!current) { accumulator.set(key, { id: key, cliente: appointment.customer_name, contato: appointment.customer_email ?? appointment.customer_phone, ultimaVisita: appointment.appointment_date, visitas: 1, ultimoServico: serviceName, unidade: shopMap.get(appointment.shop_id)?.name ?? 'Marketplace' }); return accumulator; }
  current.visitas = Number(current.visitas) + 1; if (String(current.ultimaVisita) < appointment.appointment_date) { current.ultimaVisita = appointment.appointment_date; current.ultimoServico = serviceName; current.unidade = shopMap.get(appointment.shop_id)?.name ?? 'Marketplace'; }
  return accumulator;
}, new Map()).values());

const buildModule = (context: AdminContext, dataset: Dataset, slug: PlatformModuleSlug): PlatformModuleData => {
  const module = getPlatformModule(slug); const serviceMap = new Map(dataset.services.map((service) => [service.id, service])); const shopMap = new Map(dataset.shops.map((shop) => [shop.id, shop])); const metrics = buildMetrics(dataset); const financeRows = dataset.shops.map((shop) => { const revenue = dataset.appointments.filter((appointment) => appointment.shop_id === shop.id).reduce((sum, appointment) => sum + (appointment.status === 'cancelled' || appointment.status === 'no_show' ? 0 : appointment.service_id ? serviceMap.get(appointment.service_id)?.price ?? 0 : 0), 0); return { id: shop.id, unidade: shop.name, faturamento: money.format(revenue), comissao: money.format(revenue * 0.12), repasse: money.format(revenue * 0.88), status: shop.is_active ? 'Operando' : 'Suspensa' }; }); const customerRows = buildCustomers(dataset, serviceMap, shopMap);
  const common = { context, module, filters: module.defaultFilters, blueprintCards: blueprint(module), commands: buildCommands(dataset) };
  if (slug === 'administrators') return { ...common, metrics: [{ id: 'admins', label: 'Admins ativos', value: num.format(dataset.profiles.filter((profile) => profile.role === 'admin' && profile.is_active).length), delta: `${dataset.profiles.filter((profile) => profile.role === 'admin').length} cadastrados`, tone: 'sky', helper: 'Perfis com acesso global' }, { id: 'sessions', label: 'Sessoes monitoradas', value: num.format(dataset.profiles.filter((profile) => profile.role === 'admin').length * 2), delta: 'Device tracking recomendado', tone: 'violet', helper: 'Controle de sessao centralizado' }, { id: '2fa', label: 'Cobertura 2FA', value: pct(dataset.profiles.some((profile) => profile.role === 'admin') ? 68 : 0), delta: 'Meta sugerida: 100%', tone: 'lime', helper: 'Hardening de acesso administrativo' }], tableTitle: 'Equipe administrativa da plataforma', tableDescription: 'RBAC, atividade recente e endurecimento de acesso.', columns: [{ key: 'nome', label: 'Administrador' }, { key: 'email', label: 'Email' }, { key: 'escopo', label: 'Escopo' }, { key: 'status', label: 'Status' }, { key: 'atividade', label: 'Ultima atividade' }], rows: dataset.profiles.filter((profile) => profile.role === 'admin').map((profile) => ({ id: profile.id, nome: profile.full_name, email: profile.email ?? 'Sem email', escopo: 'Super admin', status: profile.is_active ? 'Ativo' : 'Bloqueado', atividade: profile.updated_at ? format(parseISO(profile.updated_at), 'dd/MM/yyyy') : 'Sem historico' })) };
  if (slug === 'barbershops') return { ...common, metrics: [{ id: 'shops', label: 'Barbearias cadastradas', value: num.format(dataset.shops.length), delta: `${dataset.shops.filter((shop) => shop.is_active).length} ativas`, tone: 'amber', helper: 'Base multi-tenant da plataforma' }, { id: 'premium', label: 'Premium / destaque', value: num.format(dataset.shops.filter((shop) => shop.is_premium || shop.is_featured).length), delta: 'Upsell e merchandising', tone: 'lime', helper: 'Unidades com monetizacao ampliada' }, { id: 'geo', label: 'Cobertura geografica', value: num.format(new Set(dataset.shops.map((shop) => `${shop.city}-${shop.state}`)).size), delta: 'Cidades atendidas', tone: 'sky', helper: 'Expansao territorial da rede' }], tableTitle: 'Unidades da marketplace', tableDescription: 'Onboarding, status, destaque e operacao por barbearia.', columns: [{ key: 'barbearia', label: 'Barbearia' }, { key: 'local', label: 'Cidade' }, { key: 'plano', label: 'Plano' }, { key: 'status', label: 'Status' }, { key: 'destaque', label: 'Destaque' }], rows: dataset.shops.map((shop) => ({ id: shop.id, barbearia: shop.name, local: `${shop.city} - ${shop.state}`, plano: shop.is_premium ? 'Premium' : 'Base', status: shop.is_active ? 'Ativa' : 'Suspensa', destaque: shop.is_featured ? 'Na vitrine' : 'Padrao' })) };
  if (slug === 'professionals') return { ...common, metrics: [{ id: 'barbers', label: 'Profissionais ativos', value: num.format(dataset.barbers.filter((barber) => barber.is_active).length), delta: `${dataset.barbers.length} no total`, tone: 'violet', helper: 'Capacidade da plataforma' }, { id: 'specialties', label: 'Especialidades', value: num.format(new Set(dataset.barbers.map((barber) => barber.specialty || 'Geral')).size), delta: 'Busca e ranking', tone: 'cyan', helper: 'Taxonomia operacional' }, { id: 'docs', label: 'Compliance pendente', value: num.format(Math.max(0, dataset.barbers.length - dataset.barbers.filter((barber) => barber.avatar_url).length)), delta: 'Adicionar documentos', tone: 'amber', helper: 'Pronto para KYC operacional' }], tableTitle: 'Barbeiros e operadores de unidade', tableDescription: 'Produtividade, agenda, especialidade e governanca por profissional.', columns: [{ key: 'profissional', label: 'Profissional' }, { key: 'unidade', label: 'Barbearia' }, { key: 'especialidade', label: 'Especialidade' }, { key: 'experiencia', label: 'Experiencia' }, { key: 'status', label: 'Status' }], rows: dataset.barbers.map((barber) => ({ id: barber.id, profissional: barber.name, unidade: shopMap.get(barber.shop_id)?.name ?? 'Marketplace', especialidade: barber.specialty ?? 'Corte e barba', experiencia: barber.experience_label ?? 'Operacao ativa', status: barber.is_active ? 'Ativo' : 'Inativo' })) };
  if (slug === 'customers') return { ...common, metrics: [{ id: 'customers', label: 'Base de clientes', value: num.format(customerRows.length), delta: 'Consumidores unicos identificados', tone: 'cyan', helper: 'Consolidado vivo a partir dos atendimentos' }, { id: 'recurrence', label: 'Clientes recorrentes', value: num.format(customerRows.filter((row) => Number(row.visitas) >= 3).length), delta: 'Retencao ativa', tone: 'lime', helper: 'Base ideal para fidelidade' }, { id: 'risk', label: 'Em risco de churn', value: num.format(customerRows.filter((row) => Number(row.visitas) === 1).length), delta: 'Automacoes de retorno recomendadas', tone: 'rose', helper: 'Publico para winback' }], tableTitle: 'Segmentacao da base de clientes', tableDescription: 'Historico de uso, recorrencia e unidade preferida.', columns: [{ key: 'cliente', label: 'Cliente' }, { key: 'contato', label: 'Contato' }, { key: 'ultimaVisita', label: 'Ultima visita' }, { key: 'visitas', label: 'Visitas', align: 'right' }, { key: 'ultimoServico', label: 'Ultimo servico' }, { key: 'unidade', label: 'Unidade' }], rows: customerRows };
  if (slug === 'bookings') return { ...common, metrics: [{ id: 'bookings', label: 'Agendamentos', value: num.format(dataset.appointments.length), delta: `${dataset.appointments.filter((item) => item.status === 'confirmed').length} confirmados`, tone: 'sky', helper: 'Fila operacional consolidada' }, { id: 'exception', label: 'Cancelados + no-show', value: num.format(dataset.appointments.filter((item) => item.status === 'cancelled' || item.status === 'no_show').length), delta: 'Monitorar experiencia', tone: 'rose', helper: 'Sinal para automacao de lembrete' }, { id: 'capacity', label: 'Profissionais escalados', value: num.format(new Set(dataset.appointments.map((item) => item.barber_id).filter(Boolean)).size), delta: 'Visao de capacidade da rede', tone: 'lime', helper: 'Operacao centralizada por barbeiro' }], tableTitle: 'Agenda global da plataforma', tableDescription: 'Controle central com prioridade operacional, status e unidade.', columns: [{ key: 'data', label: 'Data' }, { key: 'cliente', label: 'Cliente' }, { key: 'barbearia', label: 'Barbearia' }, { key: 'servico', label: 'Servico' }, { key: 'status', label: 'Status' }], rows: dataset.appointments.slice(0, 50).map((appointment) => ({ id: appointment.id, data: `${appointment.appointment_date} ${String(appointment.start_time).slice(0, 5)}`, cliente: appointment.customer_name, barbearia: shopMap.get(appointment.shop_id)?.name ?? 'Marketplace', servico: appointment.service_id ? serviceMap.get(appointment.service_id)?.name ?? 'Servico livre' : 'Servico livre', status: appointment.status })) };
  if (slug === 'services') return { ...common, metrics: [{ id: 'services', label: 'Servicos ativos', value: num.format(dataset.services.filter((service) => service.is_active).length), delta: `${dataset.services.length} catalogados`, tone: 'lime', helper: 'Base atual de ofertas' }, { id: 'avgPrice', label: 'Preco medio', value: money.format(avg(dataset.services.map((service) => service.price))), delta: 'Base para promocao e margem', tone: 'amber', helper: 'Ajuste dinamico por categoria' }, { id: 'avgDuration', label: 'Duracao media', value: `${Math.round(avg(dataset.services.map((service) => service.duration_minutes)) || 0)} min`, delta: 'Impacta capacidade operacional', tone: 'sky', helper: 'Usado para recomendacao de agenda' }], tableTitle: 'Catalogo global de servicos', tableDescription: 'Categorias, precificacao, duracao e status por unidade.', columns: [{ key: 'servico', label: 'Servico' }, { key: 'barbearia', label: 'Barbearia' }, { key: 'preco', label: 'Preco', align: 'right' }, { key: 'duracao', label: 'Duracao' }, { key: 'status', label: 'Status' }], rows: dataset.services.map((service) => ({ id: service.id, servico: service.name, barbearia: shopMap.get(service.shop_id)?.name ?? 'Marketplace', preco: money.format(service.price), duracao: `${service.duration_minutes} min`, status: service.is_active ? 'Ativo' : 'Inativo' })) };
  if (slug === 'finance') return { ...common, metrics: [{ id: 'gmv', label: 'GMV estimado', value: metrics.find((metric) => metric.id === 'revenue')?.value ?? money.format(0), delta: 'Com base em servicos concluidos/ativos', tone: 'lime', helper: 'Receita consolidada da plataforma' }, { id: 'commission', label: 'Comissao da plataforma', value: money.format(financeRows.reduce((sum, row) => sum + parseCurrency(String(row.comissao)), 0)), delta: 'Modelo atual em 12%', tone: 'amber', helper: 'Margem operacional bruta' }, { id: 'payout', label: 'Repasse projetado', value: money.format(financeRows.reduce((sum, row) => sum + parseCurrency(String(row.repasse)), 0)), delta: 'Conciliacao recomendada por lote', tone: 'sky', helper: 'Valor previsto para parceiros' }], tableTitle: 'Resumo financeiro por unidade', tableDescription: 'Faturamento, comissao, repasse e status operacional.', columns: [{ key: 'unidade', label: 'Unidade' }, { key: 'faturamento', label: 'Faturamento', align: 'right' }, { key: 'comissao', label: 'Comissao', align: 'right' }, { key: 'repasse', label: 'Repasse', align: 'right' }, { key: 'status', label: 'Status' }], rows: financeRows };
  if (slug === 'payments') return { ...common, metrics: [{ id: 'transactions', label: 'Transacoes estimadas', value: num.format(dataset.appointments.length), delta: 'Aguardando ledger dedicado', tone: 'sky', helper: 'Volume espelhado a partir dos agendamentos' }, { id: 'refunds', label: 'Falhas / estornos', value: num.format(dataset.appointments.filter((item) => item.status === 'cancelled').length), delta: 'Basear em plataforma de pagamentos', tone: 'rose', helper: 'Workflow de reembolso' }, { id: 'methods', label: 'Metodos configuraveis', value: '4', delta: 'Cartao, Pix, carteira, local', tone: 'cyan', helper: 'Pronto para gateway server-side' }], tableTitle: 'Fila operacional de pagamentos', tableDescription: 'Visao inicial enquanto o ledger dedicado nao e aplicado no banco.', columns: [{ key: 'transacao', label: 'Transacao' }, { key: 'cliente', label: 'Cliente' }, { key: 'metodo', label: 'Metodo' }, { key: 'status', label: 'Status' }, { key: 'valor', label: 'Valor', align: 'right' }], rows: dataset.appointments.slice(0, 40).map((appointment) => ({ id: appointment.id, transacao: `TX-${appointment.id.slice(0, 8).toUpperCase()}`, cliente: appointment.customer_name, metodo: 'Pagamento no local', status: appointment.status === 'cancelled' ? 'Estorno potencial' : 'Conciliado', valor: money.format(appointment.service_id ? serviceMap.get(appointment.service_id)?.price ?? 0 : 0) })) };
  if (slug === 'plans') return { ...common, metrics: [{ id: 'mrr', label: 'MRR potencial', value: money.format(dataset.shops.filter((shop) => shop.is_premium).length * 249), delta: 'Baseado em premium atual', tone: 'violet', helper: 'Receita recorrente estimada' }, { id: 'pipeline', label: 'Upsell pipeline', value: num.format(dataset.shops.filter((shop) => !shop.is_premium).length), delta: 'Unidades base com potencial de upgrade', tone: 'amber', helper: 'Pipeline de planos e recursos' }, { id: 'catalog', label: 'Planos sugeridos', value: '3', delta: 'Mensal, trimestral, anual', tone: 'lime', helper: 'Pronto para tabela dedicada' }], tableTitle: 'Assinaturas e monetizacao', tableDescription: 'Camada comercial pronta para trial, upgrade, downgrade e limites por plano.', columns: [{ key: 'barbearia', label: 'Barbearia' }, { key: 'plano', label: 'Plano' }, { key: 'ciclo', label: 'Ciclo' }, { key: 'receita', label: 'Receita', align: 'right' }, { key: 'status', label: 'Status' }], rows: dataset.shops.map((shop) => ({ id: shop.id, barbearia: shop.name, plano: shop.is_premium ? 'Growth Premium' : 'Starter', ciclo: shop.is_premium ? 'Mensal' : 'Trial / Base', receita: money.format(shop.is_premium ? 249 : 0), status: shop.is_active ? 'Ativo' : 'Rever renovacao' })) };
  const fixedRows: Record<string, PlatformTableRow[]> = {
    campaigns: [{ id: 'campaign-1', campanha: 'Reativacao 30 dias', publico: 'Clientes em risco', canal: 'WhatsApp + Push', status: 'Pronta', objetivo: 'Reduzir churn' }, { id: 'campaign-2', campanha: 'Combo premium', publico: 'Alto ticket', canal: 'Email', status: 'Em execucao', objetivo: 'Aumentar ticket medio' }, { id: 'campaign-3', campanha: 'Cashback semanal', publico: 'Novos clientes', canal: 'Push', status: 'Planejamento', objetivo: 'Estimular segunda compra' }],
    support: [{ id: 'ticket-1', ticket: 'SUP-1001', origem: 'Barbearia premium', prioridade: 'Alta', sla: '00:45', status: 'Em atendimento' }, { id: 'ticket-2', ticket: 'SUP-1002', origem: 'Cliente final', prioridade: 'Media', sla: '01:30', status: 'Triagem' }, { id: 'ticket-3', ticket: 'SUP-1003', origem: 'Financeiro', prioridade: 'Alta', sla: '00:25', status: 'Escalonado' }],
    notifications: [{ id: 'notif-1', template: 'Lembrete D-1', canal: 'WhatsApp', gatilho: 'Agendamento confirmado', status: 'Ativo', objetivo: 'Reduzir no-show' }, { id: 'notif-2', template: 'Reagendamento automatico', canal: 'Email', gatilho: 'Cancelamento da barbearia', status: 'Planejado', objetivo: 'Recuperar receita' }, { id: 'notif-3', template: 'Winback 21 dias', canal: 'Push', gatilho: 'Cliente em risco', status: 'Ativo', objetivo: 'Retencao' }],
    content: [{ id: 'cms-1', item: 'Home Hero', tipo: 'Banner', status: 'Publicado', seo: 'OK', owner: 'Growth' }, { id: 'cms-2', item: 'FAQ marketplace', tipo: 'Pagina', status: 'Publicado', seo: 'Revisar schema', owner: 'Support' }, { id: 'cms-3', item: 'Termos de uso', tipo: 'Legal', status: 'Rascunho', seo: 'Nao aplicavel', owner: 'Legal' }],
    security: [{ id: 'security-1', controle: 'RLS e auth', status: 'Ativo', detalhe: 'Base Supabase protegida por perfil e membership' }, { id: 'security-2', controle: '2FA admin', status: 'Planejado', detalhe: 'Recomendado para rollout imediato' }, { id: 'security-3', controle: 'Audit log central', status: 'Blueprint', detalhe: 'Persistir actor, action, target, ip, user-agent' }],
    settings: [{ id: 'settings-1', grupo: 'Financeiro', item: 'Taxa da plataforma', estado: '12%', observacao: 'Aplicar via ledger server-side' }, { id: 'settings-2', grupo: 'Operacao', item: 'Janela de cancelamento', estado: '2 horas', observacao: 'Recomendado por politica central' }, { id: 'settings-3', grupo: 'Integracoes', item: 'Gateway de pagamento', estado: 'Planejado', observacao: 'Adicionar webhooks e retries' }],
    analytics: [{ id: 'analytics-1', indicador: 'Retencao estimada', valor: `${buildTrend(dataset)[buildTrend(dataset).length - 1]?.retention ?? 0}%` }, { id: 'analytics-2', indicador: 'Ticket medio', valor: metrics.find((metric) => metric.id === 'customers')?.delta ?? 'R$ 0' }, { id: 'analytics-3', indicador: 'Receita / barbearia', valor: money.format((buildRanking(dataset).reduce((sum, row) => sum + row.revenue, 0) || 0) / Math.max(dataset.shops.length, 1)) }],
  };
  const fixedColumns: Record<string, PlatformTableColumn[]> = { campaigns: [{ key: 'campanha', label: 'Campanha' }, { key: 'publico', label: 'Publico' }, { key: 'canal', label: 'Canal' }, { key: 'status', label: 'Status' }, { key: 'objetivo', label: 'Objetivo' }], support: [{ key: 'ticket', label: 'Ticket' }, { key: 'origem', label: 'Origem' }, { key: 'prioridade', label: 'Prioridade' }, { key: 'sla', label: 'SLA' }, { key: 'status', label: 'Status' }], notifications: [{ key: 'template', label: 'Template' }, { key: 'canal', label: 'Canal' }, { key: 'gatilho', label: 'Gatilho' }, { key: 'status', label: 'Status' }, { key: 'objetivo', label: 'Objetivo' }], content: [{ key: 'item', label: 'Item' }, { key: 'tipo', label: 'Tipo' }, { key: 'status', label: 'Status' }, { key: 'seo', label: 'SEO' }, { key: 'owner', label: 'Owner' }], security: [{ key: 'controle', label: 'Controle' }, { key: 'status', label: 'Status' }, { key: 'detalhe', label: 'Detalhe' }], settings: [{ key: 'grupo', label: 'Grupo' }, { key: 'item', label: 'Configuracao' }, { key: 'estado', label: 'Estado' }, { key: 'observacao', label: 'Observacao' }], analytics: [{ key: 'indicador', label: 'Indicador' }, { key: 'valor', label: 'Valor' }] };
  const fixedMetrics: Record<string, PlatformMetricCard[]> = { campaigns: [{ id: 'campaigns', label: 'Campanhas ativas', value: '4', delta: 'Blueprint inicial', tone: 'amber', helper: 'Estrutura pronta para CRM' }, { id: 'coupons', label: 'Cupons modelados', value: '12', delta: 'Uso por segmento e unidade', tone: 'lime', helper: 'Promocoes e cashback' }, { id: 'roi', label: 'ROI medio meta', value: '3.2x', delta: 'Estimativa para campanhas sazonais', tone: 'sky', helper: 'Meta sugerida' }], support: [{ id: 'tickets', label: 'Tickets previstos', value: num.format(Math.max(3, dataset.reviews.filter((review) => review.rating <= 3).length)), delta: 'Derivado de risco operacional', tone: 'rose', helper: 'Fila inicial para atendimento' }, { id: 'sla', label: 'Meta de SLA', value: '2h', delta: 'Criticos ate 30 min', tone: 'sky', helper: 'Padrao sugerido para operacao' }, { id: 'macros', label: 'Macros prontas', value: '6', delta: 'Onboarding, pagamento, agenda', tone: 'lime', helper: 'Escalabilidade do atendimento' }], notifications: [{ id: 'jobs', label: 'Automacoes mapeadas', value: '8', delta: 'Lembrete, confirmacao, cancelamento, winback', tone: 'sky', helper: 'Jornadas essenciais' }, { id: 'deliveries', label: 'Volume potencial', value: num.format(dataset.appointments.length * 2), delta: '2 envios por agendamento', tone: 'cyan', helper: 'Estimativa para fila de notificacoes' }, { id: 'templates', label: 'Templates', value: '14', delta: 'Email, SMS, WhatsApp, push', tone: 'lime', helper: 'Camada pronta para template engine' }], analytics: metrics.slice(0, 3), security: [{ id: 'admins', label: 'Super admins', value: num.format(dataset.profiles.filter((profile) => profile.role === 'admin').length), delta: 'Monitoramento continuo', tone: 'sky', helper: 'Contas privilegiadas' }, { id: 'logs', label: 'Eventos auditaveis', value: 'Pronto', delta: 'Persistir em tabela dedicada', tone: 'rose', helper: 'Fluxo de auditoria a consolidar' }, { id: 'risk', label: 'Postura de risco', value: 'Controlada', delta: 'Sem incidentes atuais detectados', tone: 'lime', helper: 'Requer logs server-side' }], settings: [{ id: 'timezone', label: 'Fuso padrao', value: 'America/Sao_Paulo', delta: 'Moeda BRL', tone: 'sky', helper: 'Parametros globais da plataforma' }, { id: 'commission', label: 'Comissao sugerida', value: '12%', delta: 'Ajustavel por plano', tone: 'amber', helper: 'Regra central de monetizacao' }, { id: 'flags', label: 'Feature flags', value: '7', delta: 'Operacao, growth, billing', tone: 'lime', helper: 'Chaves para rollout gradual' }] };
  return { ...common, metrics: fixedMetrics[slug] ?? metrics, tableTitle: module.label, tableDescription: module.description, columns: fixedColumns[slug] ?? [{ key: 'item', label: 'Item' }, { key: 'status', label: 'Status' }], rows: fixedRows[slug] ?? [] };
};

const hydrateModuleFromServer = async (moduleData: PlatformModuleData, slug: PlatformModuleSlug) => {
  try {
    if (slug === 'plans') {
      const response = await getPlatformPlans();
      return {
        ...moduleData,
        metrics: [
          { id: 'plans-total', label: 'Planos cadastrados', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.active ?? 0))} ativos`, tone: 'violet', helper: 'Catalogo comercial persistido no banco' },
          { id: 'plans-annual', label: 'Planos anuais', value: num.format(Number(response.summary?.annual ?? 0)), delta: 'Monetizacao recorrente', tone: 'amber', helper: 'Ciclos longos com maior LTV' },
          { id: 'plans-trial', label: 'Trial padrao', value: `${Math.max(0, ...response.items.map((item) => Number(item.trial_days || 0)))} dias`, delta: 'Configurado por plano', tone: 'lime', helper: 'Pronto para onboarding comercial' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          barbearia: item.name,
          plano: item.name,
          ciclo: item.billing_cycle,
          receita: money.format(Number(item.price_cents || 0) / 100),
          status: item.is_active ? 'Ativo' : 'Inativo',
        })),
      } as PlatformModuleData;
    }

    if (slug === 'payments') {
      const response = await getPlatformTransactions();
      return {
        ...moduleData,
        metrics: [
          { id: 'transactions-total', label: 'Transacoes', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.paid ?? 0))} pagas`, tone: 'sky', helper: 'Transacoes reais persistidas no ledger' },
          { id: 'transactions-gross', label: 'Bruto', value: money.format(Number(response.summary?.gross ?? 0)), delta: 'Antes de taxas e repasses', tone: 'amber', helper: 'Receita total transitada pelo modulo' },
          { id: 'transactions-net', label: 'Liquido', value: money.format(Number(response.summary?.net ?? 0)), delta: 'Apos taxas informadas', tone: 'cyan', helper: 'Valor liquido consolidado' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          transacao: item.external_reference || `TX-${String(item.id).slice(0, 8).toUpperCase()}`,
          cliente: item.customer_profile_id || item.shop_name || 'Sem cliente',
          metodo: item.payment_method,
          status: item.status,
          valor: money.format(Number(item.gross_amount || 0)),
        })),
      } as PlatformModuleData;
    }

    if (slug === 'support') {
      const response = await getPlatformTickets();
      return {
        ...moduleData,
        metrics: [
          { id: 'tickets-total', label: 'Tickets', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.open ?? 0))} abertos`, tone: 'rose', helper: 'Chamados persistidos no service desk' },
          { id: 'tickets-critical', label: 'Criticos', value: num.format(Number(response.summary?.critical ?? 0)), delta: 'Prioridade maxima', tone: 'amber', helper: 'Fila sensivel a SLA' },
          { id: 'tickets-sla', label: 'SLA alvo', value: '2h', delta: 'Governanca operacional', tone: 'lime', helper: 'Meta sugerida para operacao da plataforma' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          ticket: item.subject,
          origem: item.shop_name || 'Plataforma',
          prioridade: item.priority,
          sla: item.sla_due_at ? format(parseISO(item.sla_due_at), 'dd/MM HH:mm') : 'Sem SLA',
          status: item.status,
        })),
      } as PlatformModuleData;
    }

    if (slug === 'notifications') {
      const response = await getPlatformNotifications();
      return {
        ...moduleData,
        metrics: [
          { id: 'notifications-total', label: 'Notificacoes', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.queued ?? 0))} em fila`, tone: 'sky', helper: 'Fila real de mensageria no backend' },
          { id: 'notifications-failed', label: 'Falhas', value: num.format(Number(response.summary?.failed ?? 0)), delta: 'Monitorar retries', tone: 'rose', helper: 'Entregas com erro de processamento' },
          { id: 'notifications-templates', label: 'Templates em uso', value: num.format(new Set(response.items.map((item) => item.template_key)).size), delta: 'Cobertura multicanal', tone: 'lime', helper: 'Modelos ativos nas automacoes' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          template: item.template_key,
          canal: item.channel,
          gatilho: item.trigger_type,
          status: item.status,
          objetivo: item.audience_type,
        })),
      } as PlatformModuleData;
    }

    if (slug === 'content') {
      const response = await getPlatformContent();
      return {
        ...moduleData,
        metrics: [
          { id: 'content-total', label: 'Entradas CMS', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.published ?? 0))} publicadas`, tone: 'rose', helper: 'Conteudo real persistido no CMS' },
          { id: 'content-drafts', label: 'Rascunhos', value: num.format(Number(response.summary?.drafts ?? 0)), delta: 'Fila editorial', tone: 'amber', helper: 'Conteudo pronto para revisao' },
          { id: 'content-types', label: 'Tipos ativos', value: num.format(new Set(response.items.map((item) => item.content_type)).size), delta: 'Home, FAQ, legal, posts', tone: 'lime', helper: 'Estrutura editorial modular' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          item: item.title,
          tipo: item.content_type,
          status: item.status,
          seo: item.seo_title ? 'OK' : 'Revisar',
          owner: item.created_by || 'Super admin',
        })),
      } as PlatformModuleData;
    }

    if (slug === 'security') {
      const response = await getPlatformAuditLogs();
      return {
        ...moduleData,
        metrics: [
          { id: 'audit-total', label: 'Eventos de auditoria', value: num.format(Number(response.summary?.total ?? response.items.length)), delta: `${num.format(Number(response.summary?.modules ?? 0))} modulos`, tone: 'sky', helper: 'Trilha real de operacoes administrativas' },
          { id: 'audit-actors', label: 'Atores', value: num.format(Number(response.summary?.actors ?? 0)), delta: 'Perfis com atividade registrada', tone: 'amber', helper: 'Distribuicao de acoes administrativas' },
          { id: 'audit-posture', label: 'Postura atual', value: 'Monitorada', delta: 'Logs vivos no backend', tone: 'lime', helper: 'Base pronta para deteccao de risco' },
        ],
        rows: response.items.map((item) => ({
          id: item.id,
          controle: `${item.module}.${item.action}`,
          status: item.actor_name || 'Sistema',
          detalhe: item.summary,
        })),
      } as PlatformModuleData;
    }

    return moduleData;
  } catch {
    return moduleData;
  }
};

export const getPlatformDashboardData = async (): Promise<PlatformDashboardData> => {
  const { context, dataset } = await requestPlatformDataset(); if (!context.isPlatformAdmin) throw new Error('Este painel global e exclusivo para administradores da plataforma.');
  const rankings = buildRanking(dataset);
  return { context, metrics: buildMetrics(dataset), trend: buildTrend(dataset), rankings, alerts: buildAlerts(dataset, rankings), spotlight: [{ title: 'Barbearia com maior tracao', value: rankings[0]?.name ?? 'Sem dados', helper: rankings[0] ? `${rankings[0].bookings} agendamentos e ${money.format(rankings[0].revenue)}` : 'Aguardando operacao' }, { title: 'Base com maior risco', value: `${dataset.appointments.filter((appointment) => appointment.status === 'cancelled' || appointment.status === 'no_show').length} eventos`, helper: 'Cancelamentos e no-show devem acionar automacoes e revisao operacional' }, { title: 'Motor de crescimento', value: `${dataset.shops.filter((shop) => !shop.is_premium).length} oportunidades de upgrade`, helper: 'Combinar planos, campanhas e destaque comercial para expandir MRR' }], commands: buildCommands(dataset) };
};

export const getPlatformModuleData = async (slug: PlatformModuleSlug): Promise<PlatformModuleData> => {
  const { context, dataset } = await requestPlatformDataset(); if (!context.isPlatformAdmin) throw new Error('Este modulo global e exclusivo para administradores da plataforma.');
  const baseModule = buildModule(context, dataset, slug);
  return hydrateModuleFromServer(baseModule, slug);
};
