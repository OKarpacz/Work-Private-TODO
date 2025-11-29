import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, Briefcase, Home, User, Clock } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: CheckCircle2,
      color: '#8B5CF6',
      title: 'Witaj w Work-Private TODO',
      description: 'Zarządzaj wszystkimi zadaniami w jednym miejscu - prywatne, służbowe i domowe.',
    },
    {
      icon: User,
      color: '#3B82F6',
      title: 'Private',
      description: 'Twoje osobiste cele, nawyki i marzenia. Przestrzeń tylko dla Ciebie.',
    },
    {
      icon: Briefcase,
      color: '#F59E0B',
      title: 'Work',
      description: 'Projekty zawodowe, spotkania i współpraca z zespołem. Wszystko pod kontrolą.',
    },
    {
      icon: Home,
      color: '#10B981',
      title: 'Home',
      description: 'Zadania rodzinne i domowe. Dziel się z bliskimi i organizuj wspólne życie.',
    },
    {
      icon: Clock,
      color: '#EC4899',
      title: 'Work-Life Balance',
      description: 'Automatycznie ukrywaj zadania służbowe po godzinach pracy. Dbaj o równowagę.',
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-500"
          style={{ backgroundColor: `${slide.color}15` }}
        >
          <Icon size={64} style={{ color: slide.color }} strokeWidth={1.5} />
        </div>

        <h1 
          className="text-center mb-4 transition-all duration-500"
          style={{ color: slide.color }}
        >
          {slide.title}
        </h1>

        <p className="text-center text-gray-600 max-w-sm">
          {slide.description}
        </p>

        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: currentSlide === index ? '32px' : '8px',
                backgroundColor: currentSlide === index ? slide.color : '#E5E7EB',
              }}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={nextSlide}
          className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: slide.color }}
        >
          <span>{currentSlide < slides.length - 1 ? 'Dalej' : 'Zacznij korzystać'}</span>
          <ChevronRight size={20} />
        </button>

        {currentSlide > 0 && (
          <button
            onClick={onComplete}
            className="w-full py-3 text-gray-500 mt-2"
          >
            Pomiń
          </button>
        )}
      </div>
    </div>
  );
}
