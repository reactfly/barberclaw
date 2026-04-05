import React from 'react';
import { Scissors, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onAdminClick?: () => void;
  isAdminMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAdminClick, isAdminMode }) => {
  return (
    <header className="w-full py-5 px-6 bg-[#0f1115]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => !isAdminMode && window.scrollTo(0, 0)}>
        <div className="bg-lime-400 p-2.5 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-transform group-hover:scale-105">
          <Scissors className="text-slate-900 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-normal tracking-wide text-white leading-none">
            Barber<span className="text-lime-400 font-normal">Flow</span>
          </h1>
          <p className="text-xs md:text-sm font-extralight text-slate-500 uppercase tracking-widest mt-0.5 font-sans">Visagismo IA</p>
        </div>
      </div>
      
      <nav className="hidden md:flex gap-8 text-base md:text-lg font-extralight text-slate-400 items-center font-sans tracking-wide">
        {!isAdminMode ? (
          <>
            <a href="#" className="hover:text-lime-400 transition-colors">Início</a>
            <a href="#visagismo" className="hover:text-lime-400 transition-colors">Visagismo IA</a>
            <a href="#servicos" className="hover:text-lime-400 transition-colors">Serviços</a>
            <a href="#agendamento" className="hover:text-lime-400 transition-colors">Agendar</a>
            <div className="h-4 w-px bg-slate-800 mx-2"></div>
            <button 
              onClick={onAdminClick}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 font-economica font-normal text-lg"
            >
              <ShieldCheck className="w-4 h-4" /> Admin
            </button>
          </>
        ) : (
          <button 
            onClick={onAdminClick}
            className="text-lime-400 hover:text-lime-300 font-normal transition-colors flex items-center gap-2 bg-lime-400/10 px-4 py-2 rounded-full font-economica text-xl"
          >
            ← Voltar para o Site
          </button>
        )}
      </nav>
      
      {/* Mobile Menu Button - Simplified */}
      <button 
        className="md:hidden text-slate-300 font-normal bg-white/5 px-4 py-2 rounded-full font-economica text-xl"
        onClick={onAdminClick}
      >
        {isAdminMode ? 'Sair Admin' : 'Admin'}
      </button>
    </header>
  );
};