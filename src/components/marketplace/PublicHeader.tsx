import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Scissors, X } from 'lucide-react';

function navLinkClass(isActive: boolean): string {
  return isActive
    ? 'text-white'
    : 'text-slate-400 transition-colors hover:text-white';
}

export const PublicHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isMarketplaceRoute = location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/b/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/5 bg-[#070707]/90 shadow-lg shadow-black/20 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-5 md:h-[72px] md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 sm:h-10 sm:w-10">
            <Scissors className="h-4 w-4 text-black" />
          </div>
          <span className="marketplace-display text-base font-medium tracking-tight text-white sm:text-lg md:text-[1.65rem]">
            Barber<span className="font-normal text-lime-400">Flow</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="/#recursos" className={`marketplace-nav-link ${navLinkClass(false)}`}>
            Recursos
          </a>
          <a href="/#planos" className={`marketplace-nav-link ${navLinkClass(false)}`}>
            Planos
          </a>
          <Link to="/marketplace" className={`marketplace-nav-link ${navLinkClass(isMarketplaceRoute)}`}>
            Explorar Barbearias
          </Link>
          <Link
            to="/onboarding"
            className={`marketplace-nav-link ${navLinkClass(location.pathname.startsWith('/onboarding'))}`}
          >
            Para Barbearias
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-medium text-slate-400 transition-colors hover:text-white sm:block">
            Entrar
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-black transition-all hover:bg-lime-300 sm:px-5"
          >
            Criar Conta
          </Link>
          <button
            type="button"
            className="p-2 text-slate-300 transition-colors hover:text-white md:hidden"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3 p-5 text-base font-medium">
            <a href="/#recursos" className="marketplace-nav-link py-2 text-slate-300 transition-colors hover:text-white">
              Recursos
            </a>
            <a href="/#planos" className="marketplace-nav-link py-2 text-slate-300 transition-colors hover:text-white">
              Planos
            </a>
            <Link to="/marketplace" className="marketplace-nav-link py-2 text-white">
              Explorar Barbearias
            </Link>
            <Link to="/onboarding" className="marketplace-nav-link py-2 text-slate-300 transition-colors hover:text-white">
              Para Barbearias
            </Link>
            <div className="my-1 h-px bg-white/5" />
            <Link to="/login" className="py-2 text-slate-300 transition-colors hover:text-white">
              Entrar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
