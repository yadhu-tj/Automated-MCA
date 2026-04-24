import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ApprovalStatus, Member, Achievement } from '../types';

import { HeroSection } from '../components/public/HeroSection';
import { GreetingsWidget } from '../components/public/GreetingsWidget';
import { DepartmentCalendar } from '../components/public/DepartmentCalendar';
import { AchievementWall } from '../components/public/AchievementWall';

export const PublicHome: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [publicAchievements, setPublicAchievements] = useState<Achievement[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        if (api.getAchievements) {
          const achievements = await api.getAchievements();
          setPublicAchievements(achievements);
        }
        if (api.getUpcomingEvents) {
          const events = await api.getUpcomingEvents();
          setUpcomingEvents(events);
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };
    fetchAdditionalData();
  }, []);
  
  // Real "Today's Birthdays" logic against real member DB
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const todaysBirthdays = members.filter(m => {
    if (!m.dob) return false;
    const [year, month, day] = m.dob.split('-');
    return parseInt(month) === currentMonth && parseInt(day) === currentDay;
  });

  const getMemberName = (id: string) => members.find(m => String(m.id) === String(id))?.name || 'Unknown Member';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mca-600 mb-4"></div>
          <span>Loading Department Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Birthdays & Greetings */}
          <div className="lg:col-span-1 space-y-6">
            <GreetingsWidget todaysBirthdays={todaysBirthdays} />
            <DepartmentCalendar upcomingEvents={upcomingEvents} />
          </div>

          {/* Column 2 & 3: Achievements Wall */}
          <AchievementWall 
            publicAchievements={publicAchievements} 
            getMemberName={getMemberName} 
          />

        </div>
      </div>
    </div>
  );
};
