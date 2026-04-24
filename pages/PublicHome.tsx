import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { ApprovalStatus, Member, Achievement, DepartmentEvent } from '../types';
import { BookOpen, Users, Award, Sparkles } from 'lucide-react';

import { HeroSection } from '../components/public/HeroSection';
import { GreetingsWidget } from '../components/public/GreetingsWidget';
import { DepartmentCalendar } from '../components/public/DepartmentCalendar';
import { AchievementWall } from '../components/public/AchievementWall';

/* ─── Intersection-Observer fade-in hook (inline styles, no Tailwind class swapping) ─── */
function useFadeInRef() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state via inline style
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

export const PublicHome: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publicAchievements, setPublicAchievements] = useState<Achievement[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DepartmentEvent[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await api.getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const achievements = await api.getAchievements();
        setPublicAchievements(achievements.filter(a => a.status === ApprovalStatus.APPROVED));
        const events = await api.getEvents();
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };
    fetchAdditionalData();
  }, []);

  // Today's birthdays
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const todaysBirthdays = members.filter(m => {
    if (!m.dob) return false;
    const [, month, day] = m.dob.split('-');
    return parseInt(month) === currentMonth && parseInt(day) === currentDay;
  });

  const getMemberName = (id: string) =>
    members.find(m => String(m.id) === String(id))?.name || 'Unknown Member';

  // Fade-in section refs
  const welcomeRef = useFadeInRef();
  const greetingsRef = useFadeInRef();
  const lowerRef = useFadeInRef();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-mca-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-mca-500 animate-spin" />
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading Department Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Welcome Section ── */}
      <div ref={welcomeRef}>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="glass rounded-2xl p-8 md:p-10 shadow-xl border border-white/40">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-mca-600 text-sm font-semibold mb-3 bg-mca-50 px-4 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                Official Department Portal
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-4">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-mca-600 to-mca-800">
                  UCC MCA
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Your one-stop portal for department greetings, member achievements, upcoming events
                and celebrations. Stay connected with everything happening in the MCA family.
              </p>
            </div>

            {/* Info stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Users className="w-5 h-5" />, label: 'Members', value: members.length, color: 'text-mca-600 bg-mca-50' },
                { icon: <Award className="w-5 h-5" />, label: 'Achievements', value: publicAchievements.length, color: 'text-amber-600 bg-amber-50' },
                { icon: <BookOpen className="w-5 h-5" />, label: 'Events', value: upcomingEvents.length, color: 'text-emerald-600 bg-emerald-50' },
                { icon: <Sparkles className="w-5 h-5" />, label: 'Birthdays Today', value: todaysBirthdays.length, color: 'text-pink-600 bg-pink-50' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Greetings Slider Section ── */}
      <div ref={greetingsRef}>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-pink-500 to-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Greetings</h2>
          </div>
          <GreetingsWidget todaysBirthdays={todaysBirthdays} upcomingEvents={upcomingEvents} />
        </section>
      </div>

      {/* ── Parallax Divider ── */}
      <div className="my-16 relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(12,74,110,0.92) 0%, rgba(14,165,233,0.85) 100%), url('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1600&q=80')`,
          }}
        />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-2">
              Explore
            </p>
            <p className="text-white text-2xl md:text-3xl font-bold font-serif">
              Calendar &amp; Achievements
            </p>
          </div>
        </div>
      </div>

      {/* ── Calendar + Achievements Grid ── */}
      <div ref={lowerRef}>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-mca-500 to-mca-700" />
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              </div>
              <DepartmentCalendar upcomingEvents={upcomingEvents} />
            </div>

            {/* Achievements */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
              </div>
              <AchievementWall
                publicAchievements={publicAchievements}
                getMemberName={getMemberName}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
