import React from 'react';
import { Star, Sparkles, Calendar, Clock } from 'lucide-react';
import { DepartmentEvent, Template, EventCategory } from '../../types';
import { resolveTemplate } from '../../utils/templateResolver';

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

          return (
            <div
              key={event.id}
              className="glow-card relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md group hover:shadow-xl transition-all duration-300"
              style={{
                ['--glow-color' as any]: 'rgba(245,158,11,0.3)',
              }}
            >
              {/* Header colored bar */}
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />

              {/* Card content */}
              <div className="p-6 bg-gradient-to-br from-amber-50/40 via-orange-50/10 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Star className="w-6 h-6 animate-spin-slow" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-amber-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {daysText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 relative bg-white/75 backdrop-blur-sm border border-amber-100/50 rounded-xl p-3.5 shadow-inner">
                  <span className="absolute -top-2 left-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Festive Greeting
                  </span>
                  <p className="text-sm text-gray-600 italic leading-relaxed pt-1.5">
                    "{resolvedMessage}"
                  </p>
                </div>

                {event.location && (
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5 justify-end">
                    <span>Venue:</span>
                    <span className="font-medium text-gray-600">{event.location}</span>
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
