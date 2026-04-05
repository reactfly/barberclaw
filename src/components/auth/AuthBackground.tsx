import React, { useEffect, useState } from 'react';

const AUTH_SLIDES = [
  'https://growmoneydigital.com.br/barberflow/01.jpg',
  'https://growmoneydigital.com.br/barberflow/02.jpg',
  'https://growmoneydigital.com.br/barberflow/03.jpg',
];

export const AuthBackground: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % AUTH_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {AUTH_SLIDES.map((image, index) => (
        <div
          key={image}
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,rgba(7,7,7,0.42)_0%,rgba(7,7,7,0.58)_55%,rgba(7,7,7,0.82)_100%)]" />
    </div>
  );
};
