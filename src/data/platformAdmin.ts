export type PlatformModuleSlug =
  | 'overview'
  | 'administrators'
  | 'barbershops'
  | 'professionals'
  | 'customers'
  | 'bookings'
  | 'services'
  | 'finance'
  | 'payments'
  | 'plans'
  | 'campaigns'
  | 'reviews'
  | 'support'
  | 'notifications'
  | 'content'
  | 'analytics'
  | 'security'
  | 'settings';

export type PlatformRole = 'super_admin' | 'operations' | 'finance' | 'support' | 'growth' | 'readonly';

export interface PlatformModuleDefinition {
  slug: PlatformModuleSlug;
  label: string;
  shortLabel: string;
  description: string;
  group: 'Essencial' | 'Operacao' | 'Crescimento' | 'Governanca';
  icon: string;
  accent: string;
  primaryAction: string;
  defaultFilters: string[];
  highlights: string[];
}

export interface PlatformEntityBlueprint {
  name: string;
  purpose: string;
  source: 'supabase_live' | 'planned_table' | 'computed_view';
  fields: string[];
}

export interface PlatformApiBlueprint {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  purpose: string;
  auth: string;
}

export interface PlatformPermissionMatrixRow {
  module: string;
  super_admin: string;
  operations: string;
  finance: string;
  support: string;
  growth: string;
  readonly: string;
}

export const PLATFORM_MODULES: PlatformModuleDefinition[] = [
  {
    slug: 'overview',
    label: 'Visao Geral',
    shortLabel: 'Dashboard',
    description: 'Centro executivo com KPIs de crescimento, operacao, seguranca e saude da plataforma.',
    group: 'Essencial',
    icon: 'LayoutDashboard',
    accent: 'lime',
    primaryAction: 'Abrir centro de comandos',
    defaultFilters: ['Hoje', '7 dias', '30 dias', 'Todas as unidades'],
    highlights: ['KPIs em tempo real', 'Alertas criticos', 'Ranking de unidades'],
  },
  {
    slug: 'administrators',
    label: 'Administradores',
    shortLabel: 'Admins',
    description: 'Gestao de acessos, niveis de permissao, 2FA, sessoes e trilha de auditoria.',
    group: 'Governanca',
    icon: 'ShieldCheck',
    accent: 'sky',
    primaryAction: 'Convidar administrador',
    defaultFilters: ['Todos os perfis', 'Ativos', '2FA pendente'],
    highlights: ['RBAC por modulo', 'Controle de sessoes', 'Historico de atividades'],
  },
  {
    slug: 'barbershops',
    label: 'Barbearias',
    shortLabel: 'Barbearias',
    description: 'Onboarding, aprovacao, documentacao, planos, saude operacional e destaque comercial.',
    group: 'Essencial',
    icon: 'Store',
    accent: 'amber',
    primaryAction: 'Cadastrar barbearia',
    defaultFilters: ['Ativas', 'Pendentes', 'Suspensas', 'Premium'],
    highlights: ['KYC operacional', 'Planos e repasses', 'Acompanhamento por unidade'],
  },
  {
    slug: 'professionals',
    label: 'Profissionais',
    shortLabel: 'Barbeiros',
    description: 'Cadastro de barbeiros, produtividade, agenda, folgas, documentos e reputacao.',
    group: 'Operacao',
    icon: 'Scissors',
    accent: 'violet',
    primaryAction: 'Cadastrar barbeiro',
    defaultFilters: ['Ativos', 'Mais produtivos', 'Documentacao pendente'],
    highlights: ['Agenda e disponibilidade', 'Ranking interno', 'Especialidades'],
  },
  {
    slug: 'customers',
    label: 'Clientes',
    shortLabel: 'Clientes',
    description: 'Segmentacao, historico de compra, fidelidade, consentimentos LGPD e risco de churn.',
    group: 'Operacao',
    icon: 'Users',
    accent: 'cyan',
    primaryAction: 'Exportar segmentos',
    defaultFilters: ['Recorrentes', 'Novos', 'Alto ticket', 'Em risco'],
    highlights: ['Perfil de consumo', 'LTV e frequencia', 'Bloqueio de conta'],
  },
  {
    slug: 'bookings',
    label: 'Agendamentos',
    shortLabel: 'Agenda',
    description: 'Controle centralizado de agenda com filtros, conflitos, no-show e operacao multiunidade.',
    group: 'Operacao',
    icon: 'CalendarRange',
    accent: 'blue',
    primaryAction: 'Criar agendamento',
    defaultFilters: ['Hoje', 'Confirmados', 'No-show', 'Remarcados'],
    highlights: ['Timeline global', 'Regras de conflito', 'Historico de alteracoes'],
  },
  {
    slug: 'services',
    label: 'Servicos',
    shortLabel: 'Servicos',
    description: 'Catalogo por categoria, duracao, precificacao, promocao e disponibilidade por unidade.',
    group: 'Operacao',
    icon: 'BadgeDollarSign',
    accent: 'emerald',
    primaryAction: 'Criar servico',
    defaultFilters: ['Ativos', 'Promocionais', 'Maior margem'],
    highlights: ['Catalogo modular', 'Precificacao dinamica', 'Config por barbearia'],
  },
  {
    slug: 'finance',
    label: 'Financeiro',
    shortLabel: 'Financeiro',
    description: 'Receita da plataforma, repasses, inadimplencia, conciliação, fluxo de caixa e margem.',
    group: 'Essencial',
    icon: 'Wallet',
    accent: 'green',
    primaryAction: 'Fechar periodo',
    defaultFilters: ['Mes atual', 'Por unidade', 'Comissao', 'Repasse'],
    highlights: ['GMV da marketplace', 'Fluxo de caixa', 'Comissoes da plataforma'],
  },
  {
    slug: 'payments',
    label: 'Pagamentos',
    shortLabel: 'Pagamentos',
    description: 'Transacoes, chargebacks, reembolsos, falhas, reprocessamento e trilha de eventos.',
    group: 'Essencial',
    icon: 'CreditCard',
    accent: 'fuchsia',
    primaryAction: 'Reprocessar falhas',
    defaultFilters: ['Aprovados', 'Falharam', 'Chargeback', 'Pix'],
    highlights: ['Logs completos', 'Status por gateway', 'Reembolso parcial e total'],
  },
  {
    slug: 'plans',
    label: 'Planos e Assinaturas',
    shortLabel: 'Planos',
    description: 'Catalogo comercial da plataforma com trials, recursos, upgrades e renovacoes.',
    group: 'Crescimento',
    icon: 'Gem',
    accent: 'pink',
    primaryAction: 'Criar plano',
    defaultFilters: ['Ativos', 'Trial', 'Vencendo', 'Cancelados'],
    highlights: ['MRR e churn', 'Upgrade e downgrade', 'Limites por plano'],
  },
  {
    slug: 'campaigns',
    label: 'Campanhas',
    shortLabel: 'Campanhas',
    description: 'Cupons, cashback, campanhas sazonais, automacoes de crescimento e segmentacao.',
    group: 'Crescimento',
    icon: 'Megaphone',
    accent: 'orange',
    primaryAction: 'Nova campanha',
    defaultFilters: ['Ativas', 'Cupons', 'Sazonais', 'Performance'],
    highlights: ['Cupons por publico', 'Cashback', 'ROI por campanha'],
  },
  {
    slug: 'reviews',
    label: 'Avaliacoes',
    shortLabel: 'Reputacao',
    description: 'Moderacao, reputacao, fraude, ranking de unidades e evolucao de NPS.',
    group: 'Crescimento',
    icon: 'Star',
    accent: 'yellow',
    primaryAction: 'Abrir moderacao',
    defaultFilters: ['Publicadas', 'Pendentes', 'Baixa nota'],
    highlights: ['Moderacao central', 'Sinais de abuso', 'Ranking reputacional'],
  },
  {
    slug: 'support',
    label: 'Suporte',
    shortLabel: 'Suporte',
    description: 'Tickets, SLA, escalonamento, macros de resposta e disputas operacionais.',
    group: 'Operacao',
    icon: 'LifeBuoy',
    accent: 'red',
    primaryAction: 'Abrir chamado',
    defaultFilters: ['Abertos', 'Criticos', 'SLA estourando'],
    highlights: ['Fila por prioridade', 'Macros e playbooks', 'Historico omnichannel'],
  },
  {
    slug: 'notifications',
    label: 'Notificacoes',
    shortLabel: 'Notificacoes',
    description: 'Gatilhos transacionais e campanhas por email, push, SMS e WhatsApp.',
    group: 'Crescimento',
    icon: 'BellRing',
    accent: 'indigo',
    primaryAction: 'Criar automacao',
    defaultFilters: ['Transacionais', 'Promocionais', 'Falhas', 'Templates'],
    highlights: ['Templates editaveis', 'Fila de entrega', 'Historico de disparos'],
  },
  {
    slug: 'content',
    label: 'Conteudo e CMS',
    shortLabel: 'Conteudo',
    description: 'Home, banners, FAQ, termos, SEO, landings e conteudo institucional da plataforma.',
    group: 'Crescimento',
    icon: 'PanelsTopLeft',
    accent: 'rose',
    primaryAction: 'Criar pagina',
    defaultFilters: ['Publicados', 'Rascunhos', 'SEO critico'],
    highlights: ['CMS modular', 'SEO basico', 'Banners e destaques'],
  },
  {
    slug: 'analytics',
    label: 'Analytics',
    shortLabel: 'Relatorios',
    description: 'Centro analitico com comparativos, cohorts, retencao, exportacao e insights.',
    group: 'Essencial',
    icon: 'LineChart',
    accent: 'teal',
    primaryAction: 'Exportar relatorio',
    defaultFilters: ['30 dias', 'Por unidade', 'Por barbeiro', 'CSV'],
    highlights: ['Comparativos por periodo', 'Retencao', 'Exportacao multipla'],
  },
  {
    slug: 'security',
    label: 'Seguranca e Auditoria',
    shortLabel: 'Seguranca',
    description: 'Fraude, acessos, sessoes, eventos administrativos, compliance e saude da plataforma.',
    group: 'Governanca',
    icon: 'Shield',
    accent: 'slate',
    primaryAction: 'Abrir auditoria',
    defaultFilters: ['Ultimas 24h', 'Admin actions', 'Risco alto'],
    highlights: ['Logs completos', 'Sessoes ativas', 'Deteccao de comportamento anomalo'],
  },
  {
    slug: 'settings',
    label: 'Configuracoes Globais',
    shortLabel: 'Config',
    description: 'Taxas, idioma, moeda, fuso, cancelamento, integracoes e parametros do produto.',
    group: 'Governanca',
    icon: 'Settings2',
    accent: 'zinc',
    primaryAction: 'Salvar parametros',
    defaultFilters: ['Financeiro', 'Operacao', 'Integracoes'],
    highlights: ['Parametros centrais', 'Feature flags', 'Integrações externas'],
  },
];

export const PLATFORM_ENTITY_BLUEPRINT: PlatformEntityBlueprint[] = [
  {
    name: 'profiles',
    purpose: 'Base identitaria dos usuarios, admins, clientes e operadores da plataforma.',
    source: 'supabase_live',
    fields: ['id', 'email', 'full_name', 'role', 'phone', 'is_active', 'primary_barbershop_id'],
  },
  {
    name: 'barbershops',
    purpose: 'Tenant principal da marketplace, com dados comerciais, operacionais e geo.',
    source: 'supabase_live',
    fields: ['id', 'owner_id', 'name', 'slug', 'city', 'state', 'is_active', 'is_featured', 'is_premium'],
  },
  {
    name: 'barbers',
    purpose: 'Profissionais vinculados as unidades, utilizados para agenda e produtividade.',
    source: 'supabase_live',
    fields: ['id', 'shop_id', 'profile_id', 'name', 'specialty', 'experience_label', 'is_active'],
  },
  {
    name: 'appointments',
    purpose: 'Agenda operacional e historico de atendimento da plataforma.',
    source: 'supabase_live',
    fields: ['id', 'shop_id', 'service_id', 'barber_id', 'customer_name', 'appointment_date', 'start_time', 'status'],
  },
  {
    name: 'reviews',
    purpose: 'Reputacao publica e moderacao de experiencias.',
    source: 'supabase_live',
    fields: ['id', 'shop_id', 'rating', 'review_text', 'status', 'customer_name', 'created_at'],
  },
  {
    name: 'platform_plans',
    purpose: 'Catalogo de planos da marketplace com recursos, limites e precificacao.',
    source: 'planned_table',
    fields: ['id', 'name', 'billing_cycle', 'price_cents', 'trial_days', 'max_barbers', 'max_locations'],
  },
  {
    name: 'platform_transactions',
    purpose: 'Livro razao de pagamentos, taxas, chargebacks, repasses e conciliacao.',
    source: 'planned_table',
    fields: ['id', 'shop_id', 'appointment_id', 'gateway', 'payment_method', 'gross_amount', 'net_amount', 'status'],
  },
  {
    name: 'platform_tickets',
    purpose: 'Central de suporte com SLA, prioridade e historico de atendimento.',
    source: 'planned_table',
    fields: ['id', 'requester_profile_id', 'shop_id', 'priority', 'status', 'sla_due_at', 'owner_admin_id'],
  },
  {
    name: 'platform_audit_logs',
    purpose: 'Rastro completo das acoes administrativas e eventos sensiveis.',
    source: 'planned_table',
    fields: ['id', 'actor_profile_id', 'module', 'action', 'target_type', 'target_id', 'ip_address', 'created_at'],
  },
  {
    name: 'platform_notification_jobs',
    purpose: 'Fila de notificacoes por canal com template, gatilho e status de entrega.',
    source: 'planned_table',
    fields: ['id', 'channel', 'template_key', 'audience_type', 'trigger_type', 'status', 'sent_at'],
  },
];

export const PLATFORM_API_BLUEPRINT: PlatformApiBlueprint[] = [
  {
    name: 'platform-dashboard',
    method: 'GET',
    path: '/api/admin/platform/dashboard',
    purpose: 'Retorna KPIs, graficos, ranking, alertas e sinais de risco da plataforma.',
    auth: 'super_admin|operations|finance|growth|readonly',
  },
  {
    name: 'platform-barbershops-list',
    method: 'GET',
    path: '/api/admin/platform/barbershops',
    purpose: 'Lista barbearias com filtros, paginacao, status operacional e dados de plano.',
    auth: 'super_admin|operations|finance|growth|readonly',
  },
  {
    name: 'platform-barbershops-upsert',
    method: 'POST',
    path: '/api/admin/platform/barbershops',
    purpose: 'Cria ou atualiza uma unidade com dados cadastrais, geolocalizacao e compliance.',
    auth: 'super_admin|operations',
  },
  {
    name: 'platform-bookings-list',
    method: 'GET',
    path: '/api/admin/platform/bookings',
    purpose: 'Retorna agenda global com filtros por unidade, barbeiro, cliente e status.',
    auth: 'super_admin|operations|support|readonly',
  },
  {
    name: 'platform-finance-summary',
    method: 'GET',
    path: '/api/admin/platform/finance/summary',
    purpose: 'Resumo de receita, repasse, comissoes, inadimplencia e conciliacao.',
    auth: 'super_admin|finance|readonly',
  },
  {
    name: 'platform-payments-actions',
    method: 'PATCH',
    path: '/api/admin/platform/payments/:id',
    purpose: 'Reprocessa, estorna ou sinaliza chargeback em transacoes.',
    auth: 'super_admin|finance',
  },
  {
    name: 'platform-campaigns',
    method: 'POST',
    path: '/api/admin/platform/campaigns',
    purpose: 'Cria campanhas, cupons e automacoes de crescimento segmentadas.',
    auth: 'super_admin|growth',
  },
  {
    name: 'platform-security-audit',
    method: 'GET',
    path: '/api/admin/platform/security/audit',
    purpose: 'Consulta logs de auditoria, sessoes ativas e eventos de risco.',
    auth: 'super_admin|readonly',
  },
];

export const PLATFORM_PERMISSION_MATRIX: PlatformPermissionMatrixRow[] = [
  {
    module: 'Dashboard executivo',
    super_admin: 'Full',
    operations: 'Leitura + acao operacional',
    finance: 'Leitura financeira',
    support: 'Leitura limitada',
    growth: 'Leitura de crescimento',
    readonly: 'Leitura',
  },
  {
    module: 'Administradores e permissoes',
    super_admin: 'Full',
    operations: 'Sem acesso',
    finance: 'Sem acesso',
    support: 'Sem acesso',
    growth: 'Sem acesso',
    readonly: 'Sem acesso',
  },
  {
    module: 'Barbearias e onboarding',
    super_admin: 'Full',
    operations: 'Criar/editar/suspender',
    finance: 'Visualizar plano e financeiro',
    support: 'Visualizar',
    growth: 'Destacar e segmentar',
    readonly: 'Leitura',
  },
  {
    module: 'Agendamentos e operacao',
    super_admin: 'Full',
    operations: 'Full',
    finance: 'Leitura',
    support: 'Reagendar/cancelar',
    growth: 'Leitura',
    readonly: 'Leitura',
  },
  {
    module: 'Financeiro e pagamentos',
    super_admin: 'Full',
    operations: 'Leitura',
    finance: 'Full',
    support: 'Sem acesso',
    growth: 'Leitura macro',
    readonly: 'Leitura',
  },
  {
    module: 'Campanhas e notificacoes',
    super_admin: 'Full',
    operations: 'Leitura',
    finance: 'Sem acesso',
    support: 'Leitura',
    growth: 'Full',
    readonly: 'Leitura',
  },
  {
    module: 'Seguranca e auditoria',
    super_admin: 'Full',
    operations: 'Sem acesso',
    finance: 'Leitura',
    support: 'Sem acesso',
    growth: 'Sem acesso',
    readonly: 'Leitura limitada',
  },
];

export const getPlatformModule = (slug: PlatformModuleSlug) =>
  PLATFORM_MODULES.find((module) => module.slug === slug) ?? PLATFORM_MODULES[0];

export const getPlatformModuleHref = (slug: PlatformModuleSlug) =>
  slug === 'overview' ? '/admin' : `/admin/${slug}`;
