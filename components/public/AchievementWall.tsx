import React from 'react';
import { Trophy, User } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementWallProps {
  publicAchievements: Achievement[];
  getMemberName: (id: string) => string;
}

export const AchievementWall: React.FC<AchievementWallProps> = ({ publicAchievements, getMemberName }) => {
  return (
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
                  <button className="text-xs text-mca-600 hover:underline">View</button>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
