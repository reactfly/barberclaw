import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ScanFace, Layers, Calendar, ArrowRight, Scissors } from 'lucide-react';

const AUTO_ADVANCE_DURATION = 6000;

const SLIDES = [
  {
    id: 1,
    title: "Get Ready",
    subtitle: "Estilo de outro nível",
    description: "A revolução no seu visual começa aqui. Unimos a barbearia clássica com Inteligência Artificial de ponta.",
    icon: <Scissors className="w-12 h-12 text-slate-900" />,
    theme: "lime",
    bgImage: "https://growmoneydigital.com.br/barberflow/01.jpg"
  },
  {
    id: 2,
    title: "Visagismo IA",
    subtitle: "Análise Biométrica",
    description: "Envie uma selfie. Nossa IA escaneia a geometria do seu rosto e recomenda o corte matematicamente perfeito.",
    icon: <ScanFace className="w-12 h-12 text-lime-400" />,
    theme: "dark",
    bgImage: "https://growmoneydigital.com.br/barberflow/02.jpg"
  },
  {
    id: 3,
    title: "Simulação Real",
    subtitle: "Preview Instantâneo",
    description: "Não imagine, veja! Simulamos o corte escolhido diretamente na sua foto antes mesmo de sentar na cadeira.",
    icon: <Layers className="w-12 h-12 text-blue-400" />,
    theme: "dark",
    bgImage: "https://growmoneydigital.com.br/barberflow/03.jpg"
  },
  {
    id: 4,
    title: "Agende Fácil",
    subtitle: "Sem Ligações",
    description: "Gostou do resultado? Garanta seu horário com nossos especialistas em segundos.",
    icon: <Calendar className="w-12 h-12 text-white" />,
    theme: "dark",
    bgImage: "https://growmoneydigital.com.br/barberflow/01.jpg"
  }
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const IntroOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('barberflow_intro_seen');
    if (!hasSeenIntro) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
    
    // Generate Particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Mouse Parallax Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // -10 to 10px
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto Advance Logic
  useEffect(() => {
    if (!isVisible) return;

    if (currentSlide === SLIDES.length - 1) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / AUTO_ADVANCE_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= AUTO_ADVANCE_DURATION) {
        setCurrentSlide(prev => prev + 1);
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [currentSlide, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('barberflow_intro_seen', 'true');
    document.body.style.overflow = 'auto';
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const activeSlide = SLIDES[currentSlide];
  const isLimeTheme = activeSlide.theme === 'lime';

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-between p-6 transition-colors duration-1000 overflow-hidden ${isLimeTheme ? 'bg-lime-400' : 'bg-[#0f1115]'}`}
    >
      
      {/* Background Images */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.bgImage}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 ${slide.theme === 'lime' ? 'bg-lime-400/90' : 'bg-gradient-to-b from-[#0a0c10]/90 via-[#0a0c10]/70 to-[#0a0c10]'}`}></div>
        </div>
      ))}

      {/* Dynamic Background Layer (Parallax) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
      >
        {!isLimeTheme ? (
           <>
              <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-lime-400/10 blur-[150px] rounded-full animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
           </>
        ) : (
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>
        )}

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full opacity-30 animate-float ${isLimeTheme ? 'bg-black' : 'bg-white'}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Progress Bars Top */}
      <div className="w-full flex gap-2 z-20 pt-4 max-w-md mx-auto">
        {SLIDES.map((_, idx) => (
          <div key={idx} className="h-1.5 rounded-full flex-1 bg-black/10 overflow-hidden relative">
            <div 
               className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear ${isLimeTheme ? 'bg-black' : 'bg-lime-400'}`}
               style={{ 
                 width: idx < currentSlide ? '100%' : idx === currentSlide ? `${progress}%` : '0%' 
               }}
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={handleClose}
        className={`absolute top-12 right-6 z-20 p-2 rounded-full font-normal text-2xl transition-all font-economica uppercase tracking-wider hover:scale-105 ${isLimeTheme ? 'text-black hover:bg-black/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
      >
        Pular
      </button>

      {/* Main Content with Transition */}
      <div 
        key={currentSlide}
        className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto z-10 animate-fade-in-up"
      >
         {/* Icon Container with Parallax Inverse */}
         <div 
           className={`w-28 h-28 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl transition-transform duration-200 ease-out ${isLimeTheme ? 'bg-black text-lime-400' : 'bg-[#1c1c1e] border border-white/10'}`}
           style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
         >
            {activeSlide.icon}
         </div>

         <span className={`text-xl font-medium tracking-[0.2em] uppercase mb-4 font-sans ${isLimeTheme ? 'text-black/60' : 'text-lime-400'}`}>
            {activeSlide.subtitle}
         </span>

         <h2 className={`text-9xl font-display font-normal uppercase mb-6 leading-[0.85] tracking-tight ${isLimeTheme ? 'text-black' : 'text-white'}`}>
            {activeSlide.title}
         </h2>

         <p className={`text-3xl font-extralight leading-relaxed font-sans ${isLimeTheme ? 'text-black/70' : 'text-slate-400'}`}>
            {activeSlide.description}
         </p>
      </div>

      {/* Footer Action */}
      <div className="w-full max-w-sm mx-auto z-20 pb-8">
        <button
          onClick={nextSlide}
          className={`w-full py-5 rounded-full font-normal text-3xl flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] font-economica uppercase tracking-wide
            ${isLimeTheme 
              ? 'bg-black text-white hover:bg-black/90' 
              : 'bg-lime-400 text-black hover:bg-lime-300 shadow-lime-400/20'
            }`}
        >
          {currentSlide === SLIDES.length - 1 ? "Começar Agora" : "Continuar"}
          {currentSlide === SLIDES.length - 1 ? <Sparkles className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>

    </div>
  );
};