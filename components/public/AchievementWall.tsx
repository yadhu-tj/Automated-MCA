import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, User, Award, ExternalLink } from 'lucide-react';
import { Achievement, ApprovalStatus } from '../../types';

interface AchievementWallProps {
  publicAchievements: Achievement[];
  getMemberName: (id: string) => string;
}

export const AchievementWall: React.FC<AchievementWallProps> = ({ publicAchievements, getMemberName }) => {
  return (
    <div className="glow-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Wall of Achievements</h2>
              <p className="text-amber-100 text-xs">Celebrating our department's best</p>
            </div>
          </div>
          <span className="text-xs text-amber-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
            {publicAchievements.length} Achievement{publicAchievements.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-5">
        {publicAchievements.length > 0 ? (
          <div className="space-y-4">
            {publicAchievements.map((achievement, idx) => (
              <div
                key={achievement.id}
                className="group relative p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300"
              >
                {/* Rank badge */}
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">#{idx + 1}</span>
                </div>

                <div className="ml-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                      {achievement.title}
                    </h3>
                    <span className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      achievement.status === ApprovalStatus.APPROVED
                        ? 'bg-emerald-100 text-emerald-700'
                        : achievement.status === ApprovalStatus.REJECTED
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {achievement.status}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{achievement.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mca-400 to-mca-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{getMemberName(achievement.memberId)}</p>
                        <p className="text-[10px] text-gray-400">{achievement.date}</p>
                      </div>
                    </div>

                    {achievement.certificateGenerated && achievement.certificateFilePath && (
                      <Link
                        to={`/certificate/${achievement.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mca-600 hover:text-mca-800 bg-mca-50 hover:bg-mca-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Certificate
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No approved achievements published yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
