# Arquitetura do Sistema: Marketplace + SaaS para Barbearias (BarberFlow)

## 1. Visão Geral da Arquitetura e Stack Tecnológica

O sistema é projetado como uma plataforma **Multi-Tenant**, onde o Marketplace atua como o agregador público (B2C) e o Painel SaaS atua como o sistema de gestão para as barbearias (B2B).

**Stack Recomendada (Produção):**
- **Frontend (Marketplace & SaaS):** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Next.js Route Handlers (API) ou um backend separado em NestJS se a lógica de agendamento ficar muito complexa.
- **Banco de Dados:** PostgreSQL (hospedado na Neon, Supabase ou AWS RDS).
- **ORM:** Prisma (excelente tipagem e facilidade com relações complexas).
- **Autenticação:** NextAuth.js v5 (Auth.js) ou Clerk (suporte nativo a multi-tenant/organizações).
- **Pagamentos:** Stripe (assinaturas SaaS) e Mercado Pago/Asaas (split de pagamentos para agendamentos).
- **Armazenamento:** UploadThing ou AWS S3 (fotos de perfil, fachada, portfólio).
- **Mapas/Geolocalização:** Google Maps API ou Mapbox.
- **Notificações:** Resend (Email), Twilio/Evolution API (WhatsApp/SMS).

**Estratégia Multi-Tenant:**
Usaremos uma abordagem de **Isolamento Lógico (Row-Level)** no banco de dados. Todas as tabelas relacionadas à barbearia terão um `barbershopId` (Tenant ID). O Prisma cuidará das consultas filtrando por esse ID. Para URLs, podemos usar subdomínios (`barbearia.barberflow.com`) ou rotas (`barberflow.com/b/barbearia`).

---

## 2. Modelos do Banco de Dados (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- USUÁRIOS E AUTENTICAÇÃO ---
enum Role {
  CUSTOMER
  BARBER
  OWNER
  SUPERADMIN
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String?
  phone         String?
  avatarUrl     String?
  role          Role      @default(CUSTOMER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relações
  ownedShops    Barbershop[] @relation("ShopOwner")
  barberProfile Barber?
  appointments  Appointment[] @relation("CustomerAppointments")
  reviews       Review[]
}

// --- TENANT: BARBEARIA ---
model Barbershop {
  id              String    @id @default(cuid())
  slug            String    @unique // Para URL amigável
  name            String
  cnpj            String?
  description     String?
  phone           String?
  whatsapp        String?
  instagram       String?
  logoUrl         String?
  bannerUrl       String?
  
  // Localização
  address         String
  city            String
  state           String
  zipCode         String
  latitude        Float?
  longitude       Float?

  // SaaS Plan
  plan            String    @default("FREE") // FREE, PRO, PREMIUM
  stripeSubId     String?
  isActive        Boolean   @default(true)

  ownerId         String
  owner           User      @relation("ShopOwner", fields: [ownerId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relações
  barbers         Barber[]
  services        Service[]
  appointments    Appointment[]
  reviews         Review[]
  operatingHours  OperatingHour[]
}

// --- BARBEIROS (FUNCIONÁRIOS) ---
model Barber {
  id            String    @id @default(cuid())
  bio           String?
  commissionRate Float?   // Porcentagem de comissão
  isActive      Boolean   @default(true)

  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])

  barbershopId  String
  barbershop    Barbershop @relation(fields: [barbershopId], references: [id])

  appointments  Appointment[]
  services      BarberService[] // Serviços que este barbeiro realiza
  schedules     BarberSchedule[] // Horários de trabalho específicos
}

// --- SERVIÇOS ---
model Service {
  id            String    @id @default(cuid())
  name          String
  description   String?
  price         Float
  durationMins  Int
  imageUrl      String?
  category      String?

  barbershopId  String
  barbershop    Barbershop @relation(fields: [barbershopId], references: [id])

  barbers       BarberService[]
  appointments  Appointment[]
}

// Tabela de junção: Quais barbeiros fazem quais serviços
model BarberService {
  barberId  String
  serviceId String
  barber    Barber  @relation(fields: [barberId], references: [id])
  service   Service @relation(fields: [serviceId], references: [id])

  @@id([barberId, serviceId])
}

// --- AGENDAMENTOS ---
enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELED
  NO_SHOW
}

model Appointment {
  id            String    @id @default(cuid())
  startTime     DateTime
  endTime       DateTime
  status        AppointmentStatus @default(PENDING)
  totalPrice    Float
  notes         String?

  customerId    String
  customer      User      @relation("CustomerAppointments", fields: [customerId], references: [id])

  barberId      String
  barber        Barber    @relation(fields: [barberId], references: [id])

  serviceId     String
  service       Service   @relation(fields: [serviceId], references: [id])

  barbershopId  String
  barbershop    Barbershop @relation(fields: [barbershopId], references: [id])

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// --- AVALIAÇÕES ---
model Review {
  id            String    @id @default(cuid())
  rating        Int       // 1 a 5
  comment       String?
  
  customerId    String
  customer      User      @relation(fields: [customerId], references: [id])

  barbershopId  String
  barbershop    Barbershop @relation(fields: [barbershopId], references: [id])

  createdAt     DateTime  @default(now())
}

// --- HORÁRIOS DE FUNCIONAMENTO ---
model OperatingHour {
  id            String    @id @default(cuid())
  dayOfWeek     Int       // 0 = Domingo, 1 = Segunda...
  openTime      String    // "09:00"
  closeTime     String    // "19:00"
  isClosed      Boolean   @default(false)

  barbershopId  String
  barbershop    Barbershop @relation(fields: [barbershopId], references: [id])
}

model BarberSchedule {
  id            String    @id @default(cuid())
  dayOfWeek     Int
  startTime     String
  endTime       String
  isOff         Boolean   @default(false)

  barberId      String
  barber        Barber    @relation(fields: [barberId], references: [id])
}
```

---

## 3. Estrutura de Pastas (Next.js App Router)

```text
/src
  /app
    /(marketplace)          # Rotas públicas B2C
      /page.tsx             # Home: Busca e Mapa
      /search/page.tsx      # Resultados de busca avançada
      /b/[slug]/page.tsx    # Perfil da Barbearia
      /b/[slug]/book/page.tsx # Fluxo de agendamento
    /(saas)                 # Rotas B2B (Painel da Barbearia)
      /dashboard/page.tsx   # Visão geral, métricas
      /dashboard/calendar   # Agenda drag-and-drop
      /dashboard/staff      # Gestão de barbeiros
      /dashboard/services   # Gestão de serviços
      /dashboard/settings   # Configurações do tenant
    /(auth)                 # Rotas de Autenticação
      /login/page.tsx
      /register/page.tsx
      /onboarding/page.tsx  # Fluxo de criação do Tenant
    /api                    # Route Handlers (REST/GraphQL/tRPC)
  /components
    /ui                     # Componentes base (shadcn/ui)
    /marketplace            # Componentes específicos do B2C
    /saas                   # Componentes específicos do B2B
    /shared                 # Componentes compartilhados
  /lib
    prisma.ts               # Instância do Prisma
    utils.ts                # Funções utilitárias (cn, formatação)
    stripe.ts               # Cliente Stripe
  /server
    /actions                # Server Actions do Next.js 15
  /types                    # Definições de tipos TypeScript
```

---

## 4. Fluxos de Usuário Principais

**Fluxo 1: Cliente agendando um corte (B2C)**
1. Acessa a Home, permite localização ou digita CEP.
2. Vê mapa com pins e lista de barbearias próximas.
3. Clica em uma barbearia -> Abre a página de Perfil (fotos, avaliações, serviços).
4. Clica em "Agendar" -> Seleciona o Serviço.
5. Seleciona o Barbeiro (ou "Qualquer um").
6. Seleciona Data e Hora (sistema checa disponibilidade real no banco).
7. Faz Login/Cadastro rápido (se não estiver logado).
8. Confirma agendamento -> Recebe WhatsApp de confirmação.

**Fluxo 2: Dono de Barbearia criando conta (B2B Onboarding)**
1. Acessa página "Para Barbearias" -> Clica em "Criar Conta".
2. Preenche dados pessoais e cria usuário (Role: OWNER).
3. Entra no Onboarding Wizard (Passo a Passo):
   - Passo 1: Nome da Barbearia, URL amigável (slug), Endereço.
   - Passo 2: Horário de funcionamento padrão.
   - Passo 3: Adicionar primeiros serviços e preços.
   - Passo 4: Escolher plano SaaS (Stripe Checkout).
4. Redirecionado para o Dashboard Administrativo.

**Fluxo 3: Gestão de Agenda pelo Barbeiro**
1. Barbeiro faz login (Role: BARBER).
2. Cai direto na sua visão de Calendário (Dia/Semana).
3. Vê os agendamentos do dia. Pode clicar para ver detalhes do cliente.
4. Pode bloquear horários (ex: almoço, imprevisto).
5. Pode marcar um agendamento como "Concluído" ou "Não Compareceu".

---

## 5. Telas Principais (Design System: Dark, Gold, Forest Green)

1. **Marketplace Home (B2C):**
   - Hero section com barra de busca grande ("Onde você quer cortar o cabelo?").
   - Seção "Perto de você" com cards horizontais (Foto, Nome, Distância, Estrelas).
   - Mapa interativo (metade da tela no desktop).

2. **Perfil da Barbearia (B2C):**
   - Header com foto de capa (Banner) e Logo sobreposto.
   - Abas: "Serviços", "Barbeiros", "Avaliações", "Sobre".
   - Botão flutuante (mobile) "Agendar Agora" em dourado/verde.

3. **SaaS Dashboard (B2B):**
   - Sidebar escura com ícones (Visão Geral, Agenda, Clientes, Equipe, Financeiro).
   - Topbar com seletor de unidade (se houver filiais) e notificações.
   - Cards de métricas: Receita Hoje, Agendamentos Pendentes.
   - Gráfico de faturamento semanal.

4. **Calendário SaaS (B2B):**
   - Visão estilo Google Calendar.
   - Colunas por barbeiro (Visão Diária) ou por dias (Visão Semanal).
   - Cards de agendamento coloridos por status (Verde = Confirmado, Cinza = Pendente).

---

## 6. Prompts Adicionais Sugeridos

Quando quiser gerar partes específicas, você pode usar os seguintes prompts:

- *"Gere o componente de Calendário Drag-and-Drop para o painel SaaS usando react-big-calendar ou construindo do zero com CSS Grid, permitindo visualização por barbeiro."*
- *"Crie o fluxo de Onboarding Multi-step para a barbearia (Wizard) usando React Hook Form e Zod para validação."*
- *"Implemente a página de Perfil da Barbearia pública com a listagem de serviços e o modal de seleção de horários disponíveis."*
- *"Crie o mapa interativo do Marketplace usando Leaflet/React-Leaflet, renderizando pins baseados em um array de barbearias mockadas."*
