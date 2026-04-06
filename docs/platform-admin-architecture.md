# Super Admin Marketplace

## Objetivo
Painel global para administrar toda a marketplace de barbearias com foco em operacao, crescimento, seguranca, governanca e monetizacao.

## Mapa de paginas
- `/admin`: dashboard executivo com KPIs, alertas, ranking e tendencias
- `/admin/administrators`: admins, RBAC, 2FA, sessoes e auditoria
- `/admin/barbershops`: unidades, onboarding, compliance, planos e destaque
- `/admin/professionals`: barbeiros, especialidades, capacidade e compliance
- `/admin/customers`: CRM, segmentacao, recorrencia e churn
- `/admin/bookings`: agenda global, conflitos, no-show e operacao central
- `/admin/services`: catalogo, categorias, precificacao e duracao
- `/admin/finance`: GMV, comissoes, repasses e inadimplencia
- `/admin/payments`: transacoes, reembolsos, falhas e chargebacks
- `/admin/plans`: catalogo de planos, trial, upgrade e churn
- `/admin/campaigns`: cupons, cashback, campanhas e growth loops
- `/admin/reviews`: moderacao, reputacao e fraude
- `/admin/support`: tickets, SLA, macros e escalonamento
- `/admin/notifications`: automacoes, templates e historico de entregas
- `/admin/content`: banners, CMS, FAQ, termos e SEO
- `/admin/analytics`: comparativos, retencao, exportacoes e cohorts
- `/admin/security`: seguranca, logs, sessoes e risco
- `/admin/settings`: parametros globais, feature flags e integracoes

## Arquitetura de modulos
- `src/data/platformAdmin.ts`: contrato central do super admin, sitemap, permissoes, entidades e APIs
- `src/lib/platformAdminApi.ts`: camada de dados global integrada ao Supabase atual
- `src/components/platform-admin/*`: shell visual, navegacao, busca e renderizacao modular
- `src/pages/admin-platform/*`: dashboard, telas por modulo e roteamento por perfil
- `App.tsx`: roteamento inteligente entre admin global e admin operacional da barbearia

## Fluxos principais
1. Super admin entra em `/admin`
2. O app detecta `profile.role = admin`
3. O shell global e carregado com busca, sidebar e modulos
4. O dashboard mostra KPIs vivos do Supabase
5. Cada modulo abre uma vista especifica com cards, tabela, blueprint de dados e atalhos

## Permissoes e papeis
- `super_admin`: controle total da plataforma
- `operations`: gestao de barbearias, profissionais, agenda e suporte operacional
- `finance`: financeiro, pagamentos, repasses e planos
- `support`: suporte, tickets, reclamacoes e acoes assistidas
- `growth`: campanhas, conteudo, reputacao e CRM
- `readonly`: visao analitica e auditoria sem escrita

## Entidades principais
### Ja existentes no Supabase
- `profiles`
- `barbershops`
- `barbershop_memberships`
- `business_hours`
- `services`
- `barbers`
- `appointments`
- `blocked_slots`
- `reviews`

### Recomendadas para proxima etapa
- `platform_plans`
- `platform_subscriptions`
- `platform_transactions`
- `platform_payout_batches`
- `platform_campaigns`
- `platform_coupons`
- `platform_coupon_redemptions`
- `platform_tickets`
- `platform_ticket_messages`
- `platform_notification_templates`
- `platform_notification_jobs`
- `platform_delivery_logs`
- `platform_content_entries`
- `platform_feature_flags`
- `platform_integrations`
- `platform_audit_logs`
- `platform_access_events`

## APIs necessarias
- `GET /api/admin/platform/dashboard`
- `GET /api/admin/platform/barbershops`
- `POST /api/admin/platform/barbershops`
- `GET /api/admin/platform/bookings`
- `PATCH /api/admin/platform/bookings/:id`
- `GET /api/admin/platform/finance/summary`
- `GET /api/admin/platform/payments`
- `PATCH /api/admin/platform/payments/:id`
- `GET /api/admin/platform/plans`
- `POST /api/admin/platform/plans`
- `GET /api/admin/platform/campaigns`
- `POST /api/admin/platform/campaigns`
- `GET /api/admin/platform/reviews`
- `PATCH /api/admin/platform/reviews/:id`
- `GET /api/admin/platform/support/tickets`
- `POST /api/admin/platform/support/tickets`
- `GET /api/admin/platform/notifications`
- `POST /api/admin/platform/notifications`
- `GET /api/admin/platform/security/audit`
- `GET /api/admin/platform/settings`
- `PATCH /api/admin/platform/settings`

## Banco e escalabilidade
- manter `RLS` em todas as tabelas expostas
- criar tabelas de plataforma em schema dedicado com politicas por papel admin
- usar snapshots diarios para analytics e KPIs rapidos
- centralizar acoes sensiveis em funcoes server-side com service role
- registrar auditoria de toda acao critica do admin
- separar ledger financeiro de operacao de agenda

## Entrega implementada agora
- shell profissional do super admin
- dashboard global com KPIs, alertas, ranking e tendencia
- modulos navegaveis para toda a operacao da plataforma
- busca global por modulo, barbearia e administrador
- compatibilidade com o admin operacional existente
- blueprint de entidades, permissoes e APIs pronto para evolucao
