import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Sparkles, TrendingUp, MapPin, CheckCircle2, ArrowRight, Star } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-lime-400 selection:text-black overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-lime-400" />
            <h1 className="text-xl font-bold tracking-tight">
              Barber<span className="text-lime-400 font-normal">Flow</span>
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <Link to="/marketplace" className="hover:text-white transition-colors">Explorar Barbearias</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link to="/register" className="bg-lime-400 text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-lime-500 transition-colors">
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-lime-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-lime-400 text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" /> Novo: Visagismo com Inteligência Artificial
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            O sistema definitivo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">barbearias modernas</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Atraia mais clientes pelo nosso marketplace, gerencie sua agenda, comissões e ofereça visagismo com IA em uma única plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to="/onboarding" className="w-full sm:w-auto px-8 py-4 bg-lime-400 text-black rounded-full font-bold text-lg hover:bg-lime-500 transition-transform hover:scale-105 flex items-center justify-center gap-2">
              Começar Teste Grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              Sou Cliente (Marketplace)
            </Link>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
            <div className="rounded-t-2xl border border-white/10 border-b-0 bg-[#0a0a0a] p-2 shadow-2xl overflow-hidden">
              <div className="rounded-xl border border-white/5 bg-[#111] h-[400px] md:h-[600px] w-full relative overflow-hidden flex">
                {/* Mock Sidebar */}
                <div className="w-48 border-r border-white/5 hidden md:flex flex-col p-4 gap-2">
                  <div className="h-8 w-24 bg-white/10 rounded mb-6"></div>
                  <div className="h-8 w-full bg-lime-400/10 rounded"></div>
                  <div className="h-8 w-full bg-white/5 rounded"></div>
                  <div className="h-8 w-full bg-white/5 rounded"></div>
                </div>
                {/* Mock Content */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-white/10 rounded"></div>
                    <div className="h-10 w-32 bg-lime-400 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl border border-white/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="recursos" className="py-24 relative z-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo que sua barbearia precisa</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Uma plataforma completa que substitui todos os outros sistemas que você usa hoje.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Agenda */}
            <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-lime-400/30 transition-colors group">
              <Calendar className="w-10 h-10 text-lime-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Agenda Inteligente</h3>
              <p className="text-slate-400 mb-8 max-w-md">
                Diga adeus ao WhatsApp e caderninho. Seus clientes agendam sozinhos 24/7, com lembretes automáticos para reduzir faltas.
              </p>
              <div className="bg-black/50 rounded-2xl p-4 border border-white/5 max-w-sm">
                 <div className="flex items-center justify-between mb-3">
                   <span className="text-sm font-medium">Hoje, 14:00</span>
                   <span className="text-xs font-bold bg-lime-400/20 text-lime-400 px-2 py-1 rounded-md">Confirmado</span>
                 </div>
                 <div className="text-sm text-slate-300 font-medium">Corte Clássico + Barba</div>
                 <div className="text-xs text-slate-500 mt-1">com Rafael Mendes</div>
              </div>
            </div>

            {/* Feature 2: Visagismo */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-lime-400/30 transition-colors group">
              <Sparkles className="w-10 h-10 text-lime-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Visagismo IA</h3>
              <p className="text-slate-400">
                Ofereça uma experiência premium. Nossa IA analisa o rosto do cliente e sugere os melhores cortes.
              </p>
            </div>

            {/* Feature 3: Marketplace */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-lime-400/30 transition-colors group">
              <MapPin className="w-10 h-10 text-lime-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Marketplace B2C</h3>
              <p className="text-slate-400">
                Seja descoberto por milhares de clientes na sua região buscando por barbearias de qualidade.
              </p>
            </div>

            {/* Feature 4: Gestão */}
            <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-lime-400/30 transition-colors group">
              <TrendingUp className="w-10 h-10 text-lime-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Gestão Financeira e Comissões</h3>
              <p className="text-slate-400 mb-8 max-w-md">
                Controle total do seu faturamento. Split de pagamentos automático e cálculo de comissões da equipe em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-black/50 rounded-2xl p-5 border border-white/5">
                  <div className="text-sm text-slate-400 mb-2">Faturamento Hoje</div>
                  <div className="text-2xl font-bold text-lime-400">R$ 1.250,00</div>
                </div>
                <div className="flex-1 bg-black/50 rounded-2xl p-5 border border-white/5">
                  <div className="text-sm text-slate-400 mb-2">Comissões a Pagar</div>
                  <div className="text-2xl font-bold text-white">R$ 450,00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">"O BarberFlow mudou o patamar da minha barbearia."</h2>
          <p className="text-xl text-slate-400 mb-8">"Reduzimos as faltas em 80% e o faturamento aumentou 30% no primeiro mês com o marketplace."</p>
          <div className="flex items-center justify-center gap-4">
            <img src="https://i.pravatar.cc/150?u=owner" alt="Owner" className="w-12 h-12 rounded-full" />
            <div className="text-left">
              <div className="font-bold">Thiago Silva</div>
              <div className="text-sm text-slate-500">Dono da Navalha de Ouro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-slate-400 text-lg">Escolha o plano ideal para o momento da sua barbearia.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Pro Plan */}
             <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
               <h3 className="text-2xl font-bold mb-2">PRO</h3>
               <p className="text-slate-400 mb-6">Essencial para organizar a casa.</p>
               <div className="text-4xl font-bold mb-8">R$ 99<span className="text-lg text-slate-400 font-normal">/mês</span></div>
               
               <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Agenda Ilimitada</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Gestão de Equipe e Comissões</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Presença no Marketplace</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Dashboard Financeiro</span></li>
               </ul>
               
               <Link to="/onboarding" className="block w-full py-4 text-center rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-bold">
                 Começar Teste Grátis
               </Link>
             </div>

             {/* Premium Plan */}
             <div className="bg-lime-400/10 border border-lime-400/50 rounded-3xl p-8 relative flex flex-col">
               <div className="absolute top-0 right-8 -translate-y-1/2 bg-lime-400 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                 Mais Popular
               </div>
               <h3 className="text-2xl font-bold mb-2 text-lime-400">PREMIUM</h3>
               <p className="text-slate-400 mb-6">Para barbearias que querem escalar.</p>
               <div className="text-4xl font-bold mb-8">R$ 149<span className="text-lg text-slate-400 font-normal">/mês</span></div>
               
               <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-white font-medium">Tudo do plano PRO</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Visagismo com IA</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Lembretes por WhatsApp automáticos</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" /> <span className="text-slate-300">Split de Pagamentos</span></li>
               </ul>
               
               <Link to="/onboarding" className="block w-full py-4 text-center rounded-xl bg-lime-400 text-black hover:bg-lime-500 transition-colors font-bold shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                 Começar Teste Grátis
               </Link>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-lime-400/10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para transformar sua barbearia?</h2>
          <p className="text-xl text-slate-300 mb-10">Junte-se a centenas de barbearias que já estão faturando mais com o BarberFlow.</p>
          <Link to="/onboarding" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-400 text-black rounded-full font-bold text-lg hover:bg-lime-500 transition-transform hover:scale-105">
            Criar Conta Grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-lime-400" />
            <span className="text-xl font-bold tracking-tight">Barber<span className="text-lime-400 font-normal">Flow</span></span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 BarberFlow. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
