import React from 'react';
import { Star, Sparkles, Calendar, Clock } from 'lucide-react';
import { DepartmentEvent, Template, EventCategory } from '../../types';
import { resolveTemplate } from '../../utils/templateResolver';
import { getMediaUrl } from '../../services/api';

interface FestivalsWidgetProps {
  upcomingEvents: DepartmentEvent[];
  templates: Template[];
}

export const FestivalsWidget: React.FC<FestivalsWidgetProps> = ({ upcomingEvents, templates }) => {
  const festivalTemplate = templates.find(template => template.category === EventCategory.FESTIVAL);

  // Extract events that match festival or holiday
  const festivalEvents = upcomingEvents.filter(
    (event) => event.type?.toLowerCase() === 'festival' || event.type?.toLowerCase() === 'holiday'
  );

  // If no upcoming festivals, render a super compact, clean banner
  if (festivalEvents.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glass rounded-xl px-5 py-3.5 flex items-center gap-3 border border-white/50 shadow-sm text-gray-600">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <Star className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">
            No upcoming department festivals or holidays scheduled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-500 to-orange-600 shadow-sm" />
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Upcoming Festivals &amp; Holidays
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">
            Celebrations
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {festivalEvents.map((event) => {
          const daysUntil = Math.ceil(
            (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const daysText = daysUntil <= 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`;
          
          const resolvedMessage = festivalTemplate
            ? resolveTemplate(festivalTemplate.content, {
                event: event.title,
                title: event.title,
                type: event.type,
                date: event.date,
                location: event.location || '',
                description: event.description || '',
                daysUntil: daysText,
              })
            : event.description || `Let's celebrate ${event.title}!`;

          const hasCustomBg = !!festivalTemplate?.backgroundImage;
          const isGradient = festivalTemplate?.backgroundImage?.startsWith('linear-gradient') || festivalTemplate?.backgroundImage?.startsWith('radial-gradient');
          
          const bgStyle: React.CSSProperties = {
            ['--glow-color' as any]: 'rgba(245,158,11,0.3)',
          };
          
          if (hasCustomBg) {
            if (isGradient) {
              bgStyle.background = festivalTemplate!.backgroundImage;
            } else {
              bgStyle.backgroundImage = `url(${getMediaUrl(festivalTemplate!.backgroundImage)})`;
              bgStyle.backgroundSize = 'cover';
              bgStyle.backgroundPosition = 'center';
            }
          }

          return (
            <div
              key={event.id}
              className={`glow-card relative rounded-2xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 border ${
                hasCustomBg
                  ? 'border-transparent text-white'
                  : 'bg-white border-gray-100 text-gray-900'
              }`}
              style={bgStyle}
            >
              {/* Header colored bar */}
              {!hasCustomBg && <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />}

              {/* Dark overlay for contrast in uploaded backgrounds */}
              {hasCustomBg && !isGradient && (
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px] z-0" />
              )}

              {/* Card content */}
              <div className="p-6 relative z-10 bg-gradient-to-br from-amber-50/20 via-orange-50/5 to-transparent h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                      hasCustomBg ? 'bg-white/20 border border-white/20' : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                    }`}>
                      <Star className="w-6 h-6 animate-spin-slow" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate transition-colors ${
                        hasCustomBg ? 'text-white group-hover:text-amber-200' : 'text-gray-900 group-hover:text-amber-600'
                      }`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <Clock className={`w-3 h-3 ${hasCustomBg ? 'text-amber-300' : 'text-amber-500'}`} />
                        <span className={`font-semibold px-2 py-0.5 rounded-md ${
                          hasCustomBg ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {daysText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 relative backdrop-blur-sm border rounded-xl p-3.5 shadow-inner ${
                    hasCustomBg
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/75 border-amber-100/50'
                  }`}>
                    <span className={`absolute -top-2 left-3 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                      hasCustomBg
                        ? 'bg-white/20 text-white border border-white/10'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Sparkles className="w-2.5 h-2.5" /> Festive Greeting
                    </span>
                    <p className={`text-sm italic leading-relaxed pt-1.5 ${
                      hasCustomBg ? 'text-white/95' : 'text-gray-600'
                    }`}>
                      "{resolvedMessage}"
                    </p>
                  </div>
                </div>

                {event.location && (
                  <p className="text-xs mt-3 flex items-center gap-1.5 justify-end opacity-85">
                    <span>Venue:</span>
                    <span className="font-bold">{event.location}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
