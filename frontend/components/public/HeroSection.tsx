import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

const SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80',
];

const SLIDE_INTERVAL = 5000; // ms between slides

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        const bg = heroRef.current.querySelector('.hero-bg') as HTMLElement;
        if (bg) {
          bg.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Staggered fade-up via inline styles
  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: 0,
    transform: 'translateY(30px)',
    animation: `fade-up 0.8s ease-out ${delay}s forwards`,
  });

  return (
    <section ref={heroRef} className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
      {/* Parallax Background wrapper */}
      <div className="hero-bg absolute inset-0 will-change-transform">
        {/* Slideshow images — all stacked, only activeSlide is visible */}
        {SLIDESHOW_IMAGES.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: idx === activeSlide ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        ))}

        {/* Dark gradient overlay on top of images */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(8,47,73,0.88) 0%, rgba(12,74,110,0.82) 50%, rgba(7,89,133,0.78) 100%)',
          }}
        />

        {/* Decorative floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-mca-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Dot-grid pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.03,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-mca-200 text-sm font-medium mb-8"
          style={fadeUp(0.1)}
        >
          <Sparkles className="w-4 h-4" />
          <span>University College of Computing</span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-serif"
          style={fadeUp(0.2)}
        >
          MCA
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mca-300 via-sky-300 to-mca-400">
            Department
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-mca-100/80 max-w-2xl mx-auto leading-relaxed"
          style={fadeUp(0.3)}
        >
          Celebrating excellence, innovation, and community in the
          Master of Computer Applications program.
        </p>

        <div
          className="mt-10 flex flex-wrap justify-center gap-4"
          style={fadeUp(0.4)}
        >
          <div className="flex items-center gap-3 text-mca-200/70 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Portal Active</span>
          </div>
          <div className="w-px h-5 bg-white/20" />
          <span className="text-mca-200/70 text-sm">Greetings • Achievements • Events</span>
        </div>
      </div>

      {/* Slideshow indicator dots */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDESHOW_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: idx === activeSlide ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              transform: idx === activeSlide ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  );
};
