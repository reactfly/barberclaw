import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar } from 'lucide-react';

interface HeroProps {
  onStartVisagism: () => void;
  onStartScheduling: () => void;
}

const bgImages = [
  "https://growmoneydigital.com.br/barberflow/01.jpg",
  "https://growmoneydigital.com.br/barberflow/02.jpg",
  "https://growmoneydigital.com.br/barberflow/03.jpg"
];

export const Hero: React.FC<HeroProps> = ({ onStartVisagism, onStartScheduling }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [currentBg, setCurrentBg] = useState(0);

  const phrases = [
    "Matematicamente", 
    "Via Inteligência Artificial", 
    "Pela Geometria Facial", 
    "Com Precisão Digital"
  ];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      let speed = isDeleting ? 30 : 100; // Deletar é mais rápido que digitar

      if (!isDeleting && text === fullText) {
        speed = 2000; // Pausa ao terminar a frase
        setIsDeleting(true);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        speed = 500; // Pausa antes de começar a próxima
      }

      setTypingSpeed(speed);
    };

    const timer = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 px-6 text-center overflow-hidden min-h-[80vh] flex flex-col justify-center">
      {/* Background Slider */}
      {bgImages.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentBg ? 'opacity-55' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/90 via-[#0a0c10]/50 to-[#0a0c10]"></div>
        </div>
      ))}

      {/* Background Abstract Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-lime-400/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
           <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
           <span className="text-sm md:text-base font-medium text-slate-300 tracking-widest uppercase font-display font-normal">Nova IA 2.0 Disponível</span>
        </div>

        <h2 className="text-6xl md:text-8xl lg:text-9xl font-display font-normal text-white mb-6 md:mb-8 leading-[0.85] tracking-tight min-h-[200px] md:min-h-[auto]">
          O corte perfeito <br />
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500 font-normal">
              {text}
            </span>
            <span className="inline-block w-1.5 h-[0.65em] align-middle bg-lime-400 ml-2 animate-pulse mb-4"></span>
          </span>
          <br /> desenhado para você.
        </h2>
        
        <p className="text-lg md:text-2xl text-slate-400 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-sans font-extralight">
          Pare de adivinhar. Nossa IA analisa 50+ pontos do seu rosto para recomendar o estilo exato que maximiza sua estética.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
          <button 
            onClick={onStartVisagism}
            className="group relative flex items-center justify-center gap-2 md:gap-3 bg-lime-400 hover:bg-lime-300 text-slate-900 font-normal font-economica text-xl md:text-2xl py-4 px-8 md:px-10 rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(163,230,53,0.3)] tracking-wide uppercase"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 fill-slate-900 group-hover:rotate-12 transition-transform" />
            Análise de Visagismo
          </button>
          
          <button 
            onClick={onStartScheduling}
            className="flex items-center justify-center gap-2 md:gap-3 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-normal font-economica text-xl md:text-2xl py-4 px-8 md:px-10 rounded-full border border-white/5 transition-all hover:border-white/20 tracking-wide uppercase"
          >
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
            Agendar Agora
          </button>
        </div>

        {/* Social Proof / Tech Badge */}
        <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 font-sans">
           <div className="flex items-center gap-2">
             <div className="text-sm md:text-base font-medium font-mono border border-white/30 rounded px-2 py-1">GEMINI</div>
             <span className="text-xl font-extralight">Powered Engine</span>
           </div>
           <div className="h-4 w-px bg-white/20"></div>
           <div className="text-xl font-extralight">5.000+ Análises Realizadas</div>
        </div>

      </div>
    </section>
  );
};