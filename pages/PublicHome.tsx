import React from 'react';
import { MOCK_ACHIEVEMENTS, MOCK_MEMBERS } from '../constants';
import { ApprovalStatus, Member } from '../types';
import { Calendar, PartyPopper, Trophy, User } from 'lucide-react';

export const PublicHome: React.FC = () => {
  // Filter for approved achievements
  const publicAchievements = MOCK_ACHIEVEMENTS.filter(a => a.status === ApprovalStatus.APPROVED);
  
  // Fake "Today's Birthdays" logic - normally would check dates against new Date()
  // For demo, we just show the student if their day matches loosely or hardcode for display
  const todaysBirthdays = MOCK_MEMBERS.filter(m => m.id === '2'); // Example: Rahul

  // Upcoming events placeholder
  const upcomingEvents = [
    { title: 'Diwali Celebration', date: '2025-11-01', type: 'Festival' },
    { title: 'Guest Lecture: Cloud Computing', date: '2025-11-05', type: 'Academic' },
  ];

  const getMemberName = (id: string) => MOCK_MEMBERS.find(m => m.id === id)?.name || 'Unknown Member';

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-mca-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20" 
            src="https://picsum.photos/1600/600?grayscale" 
            alt="Department Background" 
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-serif">
            MCA Department
          </h1>
          <p className="text-xl text-mca-100 max-w-2xl">
            Celebrating excellence, innovation, and community. Welcome to our automated greetings and announcements portal.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Birthdays & Greetings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-pink-500">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper className="text-pink-500 w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-800">Today's Greetings</h2>
              </div>
              
              {todaysBirthdays.length > 0 ? (
                <div className="space-y-4">
                  {todaysBirthdays.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-3 bg-pink-50 rounded-lg">
                      <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-gray-900">{m.name}</p>
                        <p className="text-sm text-pink-600 font-medium">Happy Birthday!</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No birthdays today.</p>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-600 mb-2">Upcoming Festivals</p>
                <div className="bg-orange-50 p-3 rounded-lg text-orange-800 text-sm">
                  🪔 <strong>Diwali</strong> is in 2 days!
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-mca-500">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-mca-500 w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-800">Department Calendar</h2>
              </div>
              <ul className="space-y-3">
                {upcomingEvents.map((evt, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="font-medium text-gray-700">{evt.title}</span>
                    <span className="text-mca-600 bg-mca-50 px-2 py-1 rounded text-xs">{evt.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2 & 3: Achievements Wall */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500 w-8 h-8" />
                <h2 className="text-2xl font-bold text-gray-900">Wall of Achievements</h2>
              </div>
              <span className="text-sm text-gray-500">Updated: Today</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicAchievements.map(achievement => (
                <div key={achievement.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                  <div className="p-6 flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{achievement.description}</p>
                    
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                       <div className="bg-gray-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-gray-600" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-800">{getMemberName(achievement.memberId)}</p>
                         <p className="text-xs text-gray-500">{achievement.date}</p>
                       </div>
                    </div>
                  </div>
                  {achievement.certificateGenerated && (
                     <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          ✓ Certificate Issued
                        </span>
                        {/* In a real app, this would link to download */}
                        <button className="text-xs text-mca-600 hover:underline">View</button>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
