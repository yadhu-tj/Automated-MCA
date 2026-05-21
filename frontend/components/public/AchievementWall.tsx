import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, User, Award, ExternalLink, Search, Calendar } from 'lucide-react';
import { Achievement, ApprovalStatus } from '../../types';

interface AchievementWallProps {
  publicAchievements: Achievement[];
  getMemberName: (id: string) => string;
}

export const AchievementWall: React.FC<AchievementWallProps> = ({ publicAchievements, getMemberName }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter achievements by title, description, or member name
  const filteredAchievements = publicAchievements.filter((achievement) => {
    const memberName = getMemberName(achievement.memberId).toLowerCase();
    const title = achievement.title.toLowerCase();
    const description = achievement.description.toLowerCase();
    const query = searchQuery.toLowerCase();

    return title.includes(query) || description.includes(query) || memberName.includes(query);
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="glow-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-6 py-6 md:py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Trophy className="text-white w-6 h-6 animate-bounce-slow" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-serif">Wall of Achievements</h2>
                <p className="text-amber-100 text-sm">Celebrating the outstanding accomplishments of our department family</p>
              </div>
            </div>
            <span className="self-start md:self-auto text-xs text-amber-100 bg-white/15 px-3.5 py-1.5 rounded-full font-semibold backdrop-blur-sm">
              {filteredAchievements.length} Approved Achievement{filteredAchievements.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Search controls */}
        <div className="p-6 border-b border-gray-100 bg-slate-50/50">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search achievements by title, details, or student name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm outline-none bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6">
          {filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement, idx) => (
                <div
                  key={achievement.id}
                  className="group relative rounded-2xl border border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/20 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
                >
                  {/* Top gold bar */}
                  <div className="h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-extrabold">#{idx + 1}</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      {/* Title */}
                      <h3 className="font-bold text-gray-950 text-lg group-hover:text-amber-800 transition-colors line-clamp-2 pr-8 mb-2">
                        {achievement.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Footer elements */}
                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <div className="flex items-center justify-between gap-2">
                        {/* Member & Date */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mca-400 to-mca-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {getMemberName(achievement.memberId).charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{getMemberName(achievement.memberId)}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-300" />
                              {achievement.date}
                            </p>
                          </div>
                        </div>

                        {/* Certificate Button */}
                        {achievement.certificateGenerated && achievement.certificateFilePath && (
                          <Link
                            to={`/certificate/${achievement.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-mca-700 hover:text-white bg-mca-50 hover:bg-mca-600 rounded-lg transition-all duration-200 border border-mca-100"
                          >
                            <Award className="w-3 h-3" />
                            Certificate
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-600">No achievements found</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">
                Try adjusting your search query to find member achievements.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
