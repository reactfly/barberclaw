import React from 'react';
import { Instagram } from 'lucide-react';

const HAIRCUTS = [
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop", // Fade clean
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop", // Beard
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800&auto=format&fit=crop", // Barber working
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop", // Classic
  "https://images.unsplash.com/photo-1503951914875-befbb363dd3f?q=80&w=800&auto=format&fit=crop", // Sharp lines
  "https://images.unsplash.com/photo-1634480630444-1b15d911b6a7?q=80&w=800&auto=format&fit=crop"  // Texture
];

export const Gallery: React.FC = () => {
  return (
    <section className="py-24 bg-[#0f1115] border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h2 className="text-8xl font-display font-normal tracking-tight text-white">
             Hall da Fama
           </h2>
           <p className="text-slate-400 mt-2 font-sans font-extralight text-3xl">
             Resultados reais. Precisão inquestionável.
           </p>
        </div>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-lime-400 border border-lime-400/30 px-6 py-2 rounded-full hover:bg-lime-400 hover:text-black transition-all font-economica text-2xl uppercase"
        >
          <Instagram className="w-5 h-5" /> Siga no Instagram
        </a>
      </div>

      {/* Marquee Effect Simulation (CSS-less simplified version via overflow-x) */}
      <div className="flex gap-4 overflow-x-auto pb-8 px-6 scrollbar-hide snap-x">
        {HAIRCUTS.map((src, index) => (
          <div key={index} className="min-w-[300px] md:min-w-[400px] h-[450px] rounded-[32px] overflow-hidden border border-white/10 relative group snap-center">
            <img 
              src={src} 
              alt={`Corte ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
               <span className="text-white font-display font-normal text-5xl tracking-wide">Sharp Cut #{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};