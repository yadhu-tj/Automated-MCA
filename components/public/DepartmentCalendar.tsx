import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { DepartmentEvent } from '../../types';

interface DepartmentCalendarProps {
  upcomingEvents: DepartmentEvent[];
}

export const DepartmentCalendar: React.FC<DepartmentCalendarProps> = ({ upcomingEvents }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        day: d.getDate(),
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        weekday: d.toLocaleString('en-US', { weekday: 'short' }),
      };
    } catch {
      return { day: '--', month: '---', weekday: '---' };
    }
  };

  const getTypeColor = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('festival') || t.includes('holiday')) return 'bg-amber-500';
    if (t.includes('academic') || t.includes('lecture')) return 'bg-mca-500';
    if (t.includes('birthday')) return 'bg-pink-500';
    if (t.includes('farewell')) return 'bg-purple-500';
    return 'bg-slate-500';
  };

  return (
    <div className="glow-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mca-600 to-mca-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Department Calendar</h2>
            <p className="text-mca-200 text-xs">Upcoming events & activities</p>
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="p-5">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((evt) => {
              const fd = formatDate(evt.date);
              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-mca-50 border border-mca-100 flex flex-col items-center justify-center group-hover:bg-mca-100 transition-colors">
                    <span className="text-[10px] font-bold text-mca-600 leading-none">{fd.month}</span>
                    <span className="text-xl font-extrabold text-mca-800 leading-tight">{fd.day}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getTypeColor(evt.type)}`} />
                      <p className="font-semibold text-gray-800 text-sm truncate">{evt.title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fd.weekday}
                      </span>
                      {evt.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evt.location}
                        </span>
                      )}
                    </div>
                    {evt.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{evt.description}</p>
                    )}
                  </div>

                  {/* Type badge */}
                  <span className="flex-shrink-0 text-[10px] font-semibold text-mca-600 bg-mca-50 px-2 py-0.5 rounded-full border border-mca-100">
                    {evt.type}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No upcoming events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};
