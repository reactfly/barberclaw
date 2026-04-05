
import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { backendService } from '../services/backendService';
import { Review } from '../types';

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = () => {
    setReviews(backendService.getReviews());
  };

  useEffect(() => {
    loadReviews();
    // Listen for custom event when a new review is added
    window.addEventListener('reviews-updated', loadReviews);
    return () => window.removeEventListener('reviews-updated', loadReviews);
  }, []);

  return (
    <section className="py-24 px-6 bg-[#0a0c10] relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-lime-400 text-lime-400" />)}
          </div>
          <h2 className="text-7xl md:text-9xl font-display font-normal tracking-tight text-white mb-6">
            Aprovado pela <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-600">Comunidade</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((review) => (
            <div key={review.id} className="bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 relative group hover:border-lime-400/20 transition-all duration-300">
              <Quote className="absolute top-8 right-8 w-10 h-10 text-white/5" />
              
              <div className="flex items-center gap-4 mb-6">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full border-2 border-lime-400" />
                <div>
                  <h4 className="text-white font-medium font-sans uppercase text-xl">{review.name}</h4>
                  <p className="text-slate-500 text-lg font-sans font-extralight">{review.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'fill-lime-400 text-lime-400' : 'text-slate-700'}`} 
                  />
                ))}
              </div>

              <p className="text-slate-300 font-sans font-extralight leading-relaxed text-2xl">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
