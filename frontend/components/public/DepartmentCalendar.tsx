import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Search, Filter } from 'lucide-react';
import { DepartmentEvent } from '../../types';

interface DepartmentCalendarProps {
  upcomingEvents: DepartmentEvent[];
}

export const DepartmentCalendar: React.FC<DepartmentCalendarProps> = ({ upcomingEvents }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

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
    if (t.includes('festival') || t.includes('holiday')) return 'bg-amber-500 text-white';
    if (t.includes('academic') || t.includes('lecture')) return 'bg-sky-500 text-white';
    if (t.includes('birthday')) return 'bg-pink-500 text-white';
    if (t.includes('farewell')) return 'bg-purple-500 text-white';
    if (t.includes('seminar') || t.includes('workshop')) return 'bg-indigo-500 text-white';
    return 'bg-slate-500 text-white';
  };

  // Get unique event types dynamically
  const eventTypes = ['All', ...Array.from(new Set(upcomingEvents.map(evt => evt.type || 'Other')))];

  // Filter events based on search query and selected type
  const filteredEvents = upcomingEvents.filter(evt => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || (evt.type || 'Other') === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="glow-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-mca-700 to-mca-900 px-6 py-6 md:py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Calendar className="text-white w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-serif">Department Calendar</h2>
                <p className="text-mca-200 text-sm">Stay updated with academic schedules, seminars, and holidays</p>
              </div>
            </div>
            <span className="self-start md:self-auto text-xs text-mca-100 bg-white/10 px-3.5 py-1.5 rounded-full font-semibold backdrop-blur-sm">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} listed
            </span>
          </div>
        </div>

        {/* Controls: Search & Category Pills */}
        <div className="p-6 border-b border-gray-100 bg-slate-50/50">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, description, or location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-mca-500 focus:ring-2 focus:ring-mca-100 transition-all text-sm outline-none bg-white shadow-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mr-2 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter by:
              </span>
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-mca-600 text-white shadow-md shadow-mca-500/20 scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-mca-300 hover:text-mca-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Timeline / List */}
        <div className="p-6">
          {filteredEvents.length > 0 ? (
            <div className="relative border-l border-gray-100 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
              {filteredEvents.map((evt) => {
                const fd = formatDate(evt.date);
                return (
                  <div
                    key={evt.id}
                    className="relative group transition-all duration-300"
                  >
                    {/* Timeline Node Icon/Dot */}
                    <div className="absolute -left-[37px] md:-left-[45px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-mca-500 flex items-center justify-center shadow-sm group-hover:border-mca-700 transition-colors z-10">
                      <div className="w-2 h-2 rounded-full bg-mca-500 group-hover:bg-mca-700" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-gray-100 transition-all duration-300">
                      {/* Date block */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-mca-50 border border-mca-100 flex flex-col items-center justify-center group-hover:bg-mca-100 transition-colors shadow-sm self-start">
                        <span className="text-[10px] font-extrabold text-mca-600 leading-none tracking-wider">{fd.month}</span>
                        <span className="text-2xl font-black text-mca-800 leading-tight mt-0.5">{fd.day}</span>
                        <span className="text-[9px] text-mca-500 font-medium">{fd.weekday}</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-mca-700 transition-colors truncate">
                            {evt.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getTypeColor(evt.type)}`}>
                            {evt.type}
                          </span>
                        </div>

                        {evt.description && (
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {evt.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1.5 bg-gray-100/60 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {evt.date}
                          </span>
                          {evt.location && (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100/60 px-2.5 py-1 rounded-md">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-600">No events found</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">
                Try adjusting your search query or filter to find events.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
