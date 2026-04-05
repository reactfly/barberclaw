import React from 'react';
import { Scissors, Zap, Clock, Check } from 'lucide-react';

const SERVICES = [
  {
    id: 1,
    name: "Corte Signature IA",
    description: "Corte personalizado baseado na análise de visagismo do algoritmo Gemini.",
    price: "R$ 80,00",
    time: "45 min",
    features: ["Análise Geométrica", "Lavagem Premium", "Finalização"]
  },
  {
    id: 2,
    name: "Barba Terapia",
    description: "Alinhamento com navalha, toalha quente e hidratação profunda.",
    price: "R$ 50,00",
    time: "30 min",
    features: ["Vapor de Ozônio", "Óleos Essenciais", "Massagem Facial"]
  },
  {
    id: 3,
    name: "Combo Completo (Hair + Beard)",
    description: "A experiência definitiva. Corte e barba alinhados matematicamente.",
    price: "R$ 110,00",
    time: "1h 15min",
    features: ["Visagismo Completo", "Bebida Cortesia", "Desconto de 15%"]
  },
  {
    id: 4,
    name: "Corte Infantil & Teens",
    description: "Estilo e paciência para os pequenos, com acabamento moderno.",
    price: "R$ 60,00",
    time: "40 min",
    features: ["Pomada Modeladora", "Certificado de Coragem"]
  }
];

export const ServicesList: React.FC = () => {
  return (
    <section id="servicos" className="py-24 px-6 bg-[#0a0c10] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-lime-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-lime-400 font-medium uppercase tracking-widest text-lg mb-3 font-sans">Menu de Serviços</h3>
          <h2 className="text-8xl md:text-9xl font-display font-normal tracking-tight text-white mb-4">
            Procedimentos <br/> <span className="text-slate-600">de Precisão</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SERVICES.map((service) => (
            <div key={service.id} className="group bg-[#1c1c1e] rounded-[32px] p-8 border border-white/5 hover:border-lime-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-lime-400/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Scissors className="w-24 h-24 text-lime-400 rotate-[-15deg]" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-5xl font-display font-normal text-white mb-2">{service.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider font-sans">
                      <Clock className="w-4 h-4" /> {service.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-4xl font-economica font-normal text-lime-400">{service.price}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-2xl mb-6 font-sans font-extralight leading-relaxed max-w-xs">
                  {service.description}
                </p>

                <div className="space-y-2 mb-8">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xl text-slate-300 font-sans font-extralight">
                      <Check className="w-5 h-5 text-lime-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                <a href="#agendamento" className="inline-flex items-center gap-2 text-white hover:text-lime-400 transition-colors font-economica uppercase text-2xl tracking-wide border-b border-white/20 hover:border-lime-400 pb-1">
                  Agendar este serviço <Zap className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};