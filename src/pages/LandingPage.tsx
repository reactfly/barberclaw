import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors, Calendar, Sparkles, TrendingUp, MapPin,
  CheckCircle2, ArrowRight, Star, Users, Zap,
  Shield, BarChart3, Clock, Navigation
} from 'lucide-react';
import { PublicHeader } from '../components/marketplace/PublicHeader';

const HERO_SLIDES = [
  'https://growmoneydigital.com.br/barberflow/01.jpg',
  'https://growmoneydigital.com.br/barberflow/02.jpg',
  'https://growmoneydigital.com.br/barberflow/03.jpg',
];

// ── Typewriter phrases ──────────────────────────────────────────────

const TYPEWRITER_PHRASES = [
  'barbearias modernas',
  'agendamento inteligente',
  'visagismo com IA',
  'gestão de comissões',
  'experiência premium',
  'marketplace exclusivo',
];

// ── Typewriter hook ─────────────────────────────────────────────────

function useTypewriter(phrases: string[], typingSpeed = 80, deletingSpeed = 40, pauseTime = 2200) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        return;
      }

      const deleteTimer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deleteTimer);
    }

    // Typing
    if (displayText.length < currentPhrase.length) {
      const typeTimer = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(typeTimer);
    }

    // Finished typing → pause
    setIsPaused(true);
  }, [displayText, phraseIndex, isDeleting, isPaused, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

// ── Intersection Observer hook for scroll animations ────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Animated counter ────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString('pt-BR')}{suffix}</span>;
}

// ── Component ────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const typedText = useTypewriter(TYPEWRITER_PHRASES, 70, 35, 2400);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="marketplace-shell min-h-screen overflow-x-hidden bg-[#070707] font-sans text-slate-100 selection:bg-lime-400 selection:text-black">
      <PublicHeader />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="relative pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-28 lg:pt-40">
        <div className="absolute inset-0 overflow-hidden">
          {HERO_SLIDES.map((image, index) => (
            <div
              key={image}
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ease-in-out ${
                index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.55)_0%,rgba(7,7,7,0.22)_35%,rgba(7,7,7,0.72)_100%)]" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-lime-400/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-2/3 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-5 md:px-6">
          {/* Badge */}
          <div className="marketplace-kicker mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-lime-400 animate-fade-in-up sm:text-sm">
            <Sparkles className="w-3.5 h-3.5" /> Novo: Visagismo com Inteligência Artificial
          </div>
          
          {/* Headline with Typewriter */}
          <h1 className="marketplace-display mx-auto mb-6 max-w-5xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="marketplace-fluid-hero block text-white">
              O sistema definitivo para
            </span>
            <span className="marketplace-fluid-hero mt-2 block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-lime-300 to-emerald-400">
                {typedText}
              </span>
              <span className="typewriter-cursor ml-1 inline-block w-[3px] sm:w-[4px] h-[0.75em] align-middle bg-lime-400 rounded-full" />
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="marketplace-copy mx-auto mb-10 max-w-2xl text-sm text-slate-400 animate-fade-in-up sm:text-base md:text-lg" style={{ animationDelay: '200ms' }}>
            Atraia mais clientes pelo nosso marketplace, gerencie sua agenda, comissões e ofereça visagismo com IA — tudo em uma única plataforma.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 animate-fade-in-up sm:flex-row sm:gap-4" style={{ animationDelay: '300ms' }}>
            <Link to="/onboarding" className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(163,230,53,0.25)] transition-all hover:scale-105 hover:bg-lime-500 active:scale-95 sm:w-auto sm:px-7 sm:py-3.5 sm:text-base">
              Começar Teste Grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/[0.08] sm:w-auto sm:px-7 sm:py-3.5 sm:text-base">
              <MapPin className="w-4 h-4" /> Explorar Barbearias
            </Link>
          </div>

          {/* Dashboard Mock */}
          <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-t-2xl border border-white/10 border-b-0 bg-[#0c0c0c] p-1.5 shadow-2xl shadow-black/50">
              <div className="rounded-xl border border-white/[0.06] bg-[#111] w-full relative overflow-hidden flex" style={{ height: 'clamp(280px, 40vw, 550px)' }}>
                {/* Sidebar mock */}
                <div className="w-44 border-r border-white/[0.06] hidden md:flex flex-col p-4 gap-2.5">
                  <div className="h-7 w-20 bg-lime-400/10 rounded-md mb-4" />
                  <div className="h-8 w-full bg-lime-400/10 rounded-lg" />
                  <div className="h-8 w-full bg-white/[0.04] rounded-lg" />
                  <div className="h-8 w-full bg-white/[0.04] rounded-lg" />
                  <div className="h-8 w-full bg-white/[0.04] rounded-lg" />
                </div>
                {/* Content mock */}
                <div className="flex-1 p-5 md:p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="h-7 w-36 bg-white/[0.07] rounded-md" />
                    <div className="h-9 w-28 bg-lime-400 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="h-24 sm:h-28 bg-white/[0.03] rounded-xl border border-white/[0.05] p-4">
                      <div className="h-3 w-16 bg-white/[0.07] rounded mb-2" />
                      <div className="h-5 w-20 bg-lime-400/20 rounded" />
                    </div>
                    <div className="h-24 sm:h-28 bg-white/[0.03] rounded-xl border border-white/[0.05] p-4">
                      <div className="h-3 w-16 bg-white/[0.07] rounded mb-2" />
                      <div className="h-5 w-20 bg-white/[0.08] rounded" />
                    </div>
                    <div className="h-24 sm:h-28 bg-white/[0.03] rounded-xl border border-white/[0.05] p-4 hidden md:block">
                      <div className="h-3 w-16 bg-white/[0.07] rounded mb-2" />
                      <div className="h-5 w-20 bg-white/[0.08] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════════ */}
      <section className="py-10 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { value: 500, suffix: '+', label: 'Barbearias ativas' },
              { value: 25000, suffix: '+', label: 'Agendamentos/mês' },
              { value: 80, suffix: '%', label: 'Redução em faltas' },
              { value: 4.9, suffix: '', label: 'Avaliação média' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="marketplace-fluid-stat font-bold text-lime-400">
                  {stat.suffix === '' ? stat.value.toFixed(1) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES BENTO GRID
          ═══════════════════════════════════════════════════════ */}
      <section id="recursos" className="py-20 md:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <SectionHeader
            title="Tudo que sua barbearia precisa"
            subtitle="Uma plataforma completa que substitui todos os outros sistemas que você usa hoje."
          />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            {/* Feature 1: Agenda - spans 4 */}
            <FeatureCard className="md:col-span-4" icon={Calendar} title="Agenda Inteligente">
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                Diga adeus ao WhatsApp e caderninho. Seus clientes agendam sozinhos 24/7, com lembretes automáticos para reduzir faltas.
              </p>
              <div className="bg-black/40 rounded-xl p-4 border border-white/[0.05] max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Hoje, 14:00</span>
                  <span className="text-[10px] font-bold bg-lime-400/15 text-lime-400 px-2 py-1 rounded-md uppercase tracking-wider">Confirmado</span>
                </div>
                <div className="text-sm text-slate-300 font-medium">Corte Clássico + Barba</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 60 min • com Rafael Mendes
                </div>
              </div>
            </FeatureCard>

            {/* Feature 2: Visagismo - spans 2 */}
            <FeatureCard className="md:col-span-2" icon={Sparkles} title="Visagismo IA">
              <p className="text-slate-400 text-sm">
                Ofereça uma experiência premium. Nossa IA analisa o rosto do cliente e sugere os melhores cortes para seu formato facial.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-400/20 to-emerald-400/10 flex items-center justify-center">
                  <span className="text-2xl">🧔</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                  <span className="text-2xl">✂️</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </FeatureCard>

            {/* Feature 3: Marketplace - spans 2 */}
            <FeatureCard className="md:col-span-2" icon={MapPin} title="Marketplace & Mapas">
              <p className="text-slate-400 text-sm">
                Seja descoberto por milhares de clientes na sua região. Mapas interativos com Mapbox e rotas em tempo real.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-lime-400/10 text-lime-400 px-2.5 py-1.5 rounded-lg font-medium">
                  <Navigation className="w-3 h-3" /> Rotas GPS
                </div>
                <div className="flex items-center gap-1 bg-white/[0.05] text-slate-400 px-2.5 py-1.5 rounded-lg font-medium">
                  <MapPin className="w-3 h-3" /> Geolocalização
                </div>
              </div>
            </FeatureCard>

            {/* Feature 4: Gestão - spans 4 */}
            <FeatureCard className="md:col-span-4" icon={TrendingUp} title="Gestão Financeira e Comissões">
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                Controle total do seu faturamento. Split de pagamentos automático e cálculo de comissões da equipe em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-xs text-slate-500 mb-1 font-medium">Faturamento Hoje</div>
                  <div className="text-xl font-bold text-lime-400">R$ 1.250</div>
                  <div className="text-[10px] text-lime-400/60 mt-1 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +18% vs ontem
                  </div>
                </div>
                <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-xs text-slate-500 mb-1 font-medium">Comissões a Pagar</div>
                  <div className="text-xl font-bold text-white">R$ 450</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> 3 profissionais
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <SectionHeader
            title="Simples de começar"
            subtitle="Em 3 passos você já está no ar com tudo funcionando."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: '01', icon: Users, title: 'Crie sua conta', desc: 'Preencha os dados da sua barbearia e personalize seu perfil no marketplace.' },
              { step: '02', icon: Zap, title: 'Configure os serviços', desc: 'Adicione barbeiros, serviços, preços e seus horários de funcionamento.' },
              { step: '03', icon: BarChart3, title: 'Comece a faturar', desc: 'Receba agendamentos online e gerencie tudo pelo painel administrativo.' },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-lime-400/20 transition-all h-full">
                  <div className="text-5xl font-black text-white/[0.04] absolute top-4 right-6">{item.step}</div>
                  <div className="w-11 h-11 bg-lime-400/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-lime-400/20 transition-colors">
                    <item.icon className="w-5 h-5 text-lime-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <SectionHeader
            title="O que nossos clientes dizem"
            subtitle="Barbearias de todo o Brasil já transformaram seus negócios."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: 'O BarberFlow mudou o patamar da minha barbearia. Reduzimos as faltas em 80% e o faturamento subiu 30%.',
                name: 'Thiago Silva',
                role: 'Navalha de Ouro • São Paulo',
                avatar: 'https://i.pravatar.cc/150?u=thiago',
              },
              {
                quote: 'O visagismo com IA é um diferencial absurdo. Os clientes ficam impressionados e sempre voltam.',
                name: 'Carlos Mendes',
                role: 'BarberFlow Premium • Belo Horizonte',
                avatar: 'https://i.pravatar.cc/150?u=carlos2',
              },
              {
                quote: 'O marketplace trouxe clientes que eu nunca teria alcançado. Minha agenda lota toda semana agora.',
                name: 'Roberto Lima',
                role: 'Vintage Club • Rio de Janeiro',
                avatar: 'https://i.pravatar.cc/150?u=roberto',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════ */}
      <section id="planos" className="py-20 md:py-28 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <SectionHeader
            title="Planos simples e transparentes"
            subtitle="Escolha o plano ideal para o momento da sua barbearia."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col hover:border-white/15 transition-colors">
              <h3 className="marketplace-fluid-card text-white mb-1">PRO</h3>
              <p className="marketplace-copy text-slate-500 text-sm mb-6">Essencial para organizar a casa.</p>
              <div className="text-4xl font-bold mb-8">
                R$ 99<span className="text-base text-slate-500 font-normal">/mês</span>
              </div>
              
              <ul className="space-y-3.5 mb-8 flex-1">
                {['Agenda Ilimitada', 'Gestão de Equipe e Comissões', 'Presença no Marketplace', 'Dashboard Financeiro'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/onboarding" className="block w-full py-3.5 text-center rounded-xl border border-white/15 hover:bg-white/5 transition-colors font-bold text-sm">
                Começar Teste Grátis
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-lime-400/[0.06] border border-lime-400/30 rounded-2xl p-6 md:p-8 relative flex flex-col">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-lime-400 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                Mais Popular
              </div>
              <h3 className="marketplace-fluid-card text-lime-400 mb-1">PREMIUM</h3>
              <p className="marketplace-copy text-slate-500 text-sm mb-6">Para barbearias que querem escalar.</p>
              <div className="text-4xl font-bold mb-8">
                R$ 149<span className="text-base text-slate-500 font-normal">/mês</span>
              </div>
              
              <ul className="space-y-3.5 mb-8 flex-1">
                {[
                  { text: 'Tudo do plano PRO', bold: true },
                  { text: 'Visagismo com IA' },
                  { text: 'Lembretes por WhatsApp automáticos' },
                  { text: 'Split de Pagamentos' },
                  { text: 'Mapas e Rotas (Mapbox)' },
                ].map(f => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                    <span className={f.bold ? 'text-white font-medium' : 'text-slate-300'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/onboarding" className="block w-full py-3.5 text-center rounded-xl bg-lime-400 text-black hover:bg-lime-500 transition-all font-bold text-sm shadow-[0_0_25px_rgba(163,230,53,0.2)]">
                Começar Teste Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST BADGES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Shield, title: 'Dados seguros', desc: 'Criptografia de ponta' },
              { icon: Zap, title: '99.9% uptime', desc: 'Sempre disponível' },
              { icon: Users, title: 'Suporte 24/7', desc: 'Time dedicado' },
              { icon: Star, title: 'Nota 4.9', desc: 'Avaliação dos clientes' },
            ].map((b, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 bg-white/[0.04] rounded-xl mx-auto flex items-center justify-center mb-3">
                  <b.icon className="w-5 h-5 text-lime-400" />
                </div>
                <div className="font-semibold text-sm">{b.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.06] via-transparent to-emerald-400/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-lime-400/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-10 text-center">
          <h2 className="marketplace-fluid-section text-white mb-5">Pronto para transformar sua barbearia?</h2>
          <p className="marketplace-copy text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Junte-se a centenas de barbearias que já estão faturando mais com o BarberFlow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-400 text-black rounded-full font-bold text-base hover:bg-lime-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(163,230,53,0.25)]">
              Criar Conta Grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] border border-white/10 text-white rounded-full font-bold text-base hover:bg-white/[0.08] transition-all">
              Sou Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-lime-400 rounded-lg flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-base font-bold tracking-tight">
                Barber<span className="text-lime-400 font-normal">Flow</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="text-slate-600 text-xs">
              © 2026 BarberFlow. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ── Sub-Components ──────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`text-center mb-12 md:mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <h2 className="marketplace-fluid-section text-white mb-3">{title}</h2>
      <p className="marketplace-copy text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

function FeatureCard({
  className = '',
  icon: Icon,
  title,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6 hover:border-lime-400/20 transition-all duration-500 group ${className} ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-lime-400/20 transition-colors">
        <Icon className="w-5 h-5 text-lime-400" />
      </div>
      <h3 className="marketplace-fluid-card text-white mb-2">{title}</h3>
      {children}
    </div>
  );
}
