import React, { useRef, useState, useEffect } from 'react';
import { PartyPopper, Cake, Star, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Member, DepartmentEvent } from '../../types';

interface GreetingsWidgetProps {
  todaysBirthdays: Member[];
  upcomingEvents: DepartmentEvent[];
}

interface GreetingCard {
  id: string;
  type: 'birthday' | 'festival';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  bgGradient: string;
  glowColor: string;
  photoUrl?: string;
}

export const GreetingsWidget: React.FC<GreetingsWidgetProps> = ({ todaysBirthdays, upcomingEvents }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Build greeting cards from real data
  const greetingCards: GreetingCard[] = [];

  // Birthday cards
  todaysBirthdays.forEach((m) => {
    greetingCards.push({
      id: `bday-${m.id}`,
      type: 'birthday',
      icon: <Cake className="w-6 h-6" />,
      title: m.name,
      subtitle: 'Happy Birthday! 🎂',
      accent: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      glowColor: 'rgba(244,63,94,0.3)',
      photoUrl: m.photoUrl,
    });
  });

  // If no birthdays today, add a placeholder
  if (todaysBirthdays.length === 0) {
    greetingCards.push({
      id: 'no-bday',
      type: 'birthday',
      icon: <Gift className="w-6 h-6" />,
      title: 'No Birthdays Today',
      subtitle: 'Check back tomorrow! 🎁',
      accent: 'from-gray-400 to-gray-500',
      bgGradient: 'from-gray-50 to-slate-50',
      glowColor: 'rgba(148,163,184,0.2)',
    });
  }

  // Festival / event cards from upcoming events that are festivals
  const festivalEvents = upcomingEvents.filter(
    (e) => e.type?.toLowerCase() === 'festival' || e.type?.toLowerCase() === 'holiday'
  );

  festivalEvents.forEach((evt) => {
    const daysUntil = Math.ceil(
      (new Date(evt.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysText = daysUntil <= 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`;

    greetingCards.push({
      id: `fest-${evt.id}`,
      type: 'festival',
      icon: <Star className="w-6 h-6" />,
      title: evt.title,
      subtitle: `🎉 ${daysText}`,
      accent: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      glowColor: 'rgba(245,158,11,0.3)',
    });
  });

  // If no festivals, show a fallback
  if (festivalEvents.length === 0) {
    greetingCards.push({
      id: 'no-fest',
      type: 'festival',
      icon: <Star className="w-6 h-6" />,
      title: 'No Upcoming Festivals',
      subtitle: 'Stay tuned for announcements! ✨',
      accent: 'from-amber-400 to-yellow-400',
      bgGradient: 'from-amber-50 to-yellow-50',
      glowColor: 'rgba(245,158,11,0.15)',
    });
  }

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      return () => el.removeEventListener('scroll', checkScrollability);
    }
  }, [greetingCards.length]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 320;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-mca-700 hover:bg-mca-50 transition-all -ml-4 backdrop-blur"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-mca-700 hover:bg-mca-50 transition-all -mr-4 backdrop-blur"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Cards slider */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {greetingCards.map((card) => (
          <div
            key={card.id}
            className="glow-card flex-shrink-0 w-72 sm:w-80 snap-start rounded-2xl overflow-hidden bg-white border border-gray-100"
            style={{
              ['--glow-color' as any]: card.glowColor,
            }}
          >
            {/* Top gradient bar */}
            <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />

            <div className={`p-6 bg-gradient-to-br ${card.bgGradient}`}>
              <div className="flex items-start gap-4">
                {card.photoUrl ? (
                  <img
                    src={card.photoUrl}
                    alt={card.title}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white shadow-md`}>
                    {card.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg truncate">{card.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
                </div>
              </div>

              {/* Decorative badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${card.accent} text-white shadow-sm`}>
                  {card.type === 'birthday' ? <Cake className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  {card.type === 'birthday' ? 'Birthday' : 'Festival'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
