import React from 'react';
import { Cake, Sparkles, Send } from 'lucide-react';
import { Member, Template, EventCategory } from '../../types';
import { resolveTemplate } from '../../utils/templateResolver';
import { getMediaUrl } from '../../services/api';


interface BirthdaysWidgetProps {
  todaysBirthdays: Member[];
  templates: Template[];
}

export const BirthdaysWidget: React.FC<BirthdaysWidgetProps> = ({ todaysBirthdays, templates }) => {
  const birthdayTemplate = templates.find(template => template.category === EventCategory.BIRTHDAY);

  // If no birthdays today, render an extremely lightweight, compact banner
  if (todaysBirthdays.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glass rounded-xl px-5 py-3.5 flex items-center gap-3 border border-white/50 shadow-sm text-gray-600">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
            <Cake className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">
            No birthdays today. Wishing all MCA members a wonderful and productive day!
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-pink-500 to-rose-600 shadow-sm" />
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Today's Birthdays
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 animate-pulse">
            Celebration Time!
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todaysBirthdays.map((member) => {
          const resolvedMessage = birthdayTemplate
            ? resolveTemplate(birthdayTemplate.content, {
                name: member.name,
                role: member.role,
                department: member.department,
                year: member.year || '',
                date: new Date().toISOString().split('T')[0],
              })
            : `Wishing you a very Happy Birthday, ${member.name}!`;

          const hasCustomBg = !!birthdayTemplate?.backgroundImage;
          const isGradient = birthdayTemplate?.backgroundImage?.startsWith('linear-gradient') || birthdayTemplate?.backgroundImage?.startsWith('radial-gradient');
          
          const bgStyle: React.CSSProperties = {
            ['--glow-color' as any]: 'rgba(244,63,94,0.3)',
          };
          
          if (hasCustomBg) {
            if (isGradient) {
              bgStyle.background = birthdayTemplate!.backgroundImage;
            } else {
              bgStyle.backgroundImage = `url(${getMediaUrl(birthdayTemplate!.backgroundImage)})`;
              bgStyle.backgroundSize = 'cover';
              bgStyle.backgroundPosition = 'center';
            }
          }

          return (
            <div
              key={member.id}
              className={`glow-card relative rounded-2xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 border ${
                hasCustomBg
                  ? 'border-transparent text-white'
                  : 'bg-white border-gray-100 text-gray-900'
              }`}
              style={bgStyle}
            >
              {/* Header colored bar (rendered only if no custom background) */}
              {!hasCustomBg && <div className="h-2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400" />}

              {/* Dark overlay for contrast in uploaded backgrounds */}
              {hasCustomBg && !isGradient && (
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px] z-0" />
              )}
              
              {/* Card content */}
              <div className="p-6 relative z-10 bg-gradient-to-br from-pink-50/20 via-rose-50/5 to-transparent h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    {member.photoUrl ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={getMediaUrl(member.photoUrl)}
                          alt={member.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-pink-50 shadow-md group-hover:scale-105 transition-transform duration-300"
                        />

                        <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-1 shadow-md">
                          <Cake className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md flex-shrink-0 relative">
                        <Cake className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate transition-colors ${
                        hasCustomBg ? 'text-white group-hover:text-pink-200' : 'text-gray-900 group-hover:text-pink-600'
                      }`}>
                        {member.name}
                      </h3>
                      <p className={`text-xs font-medium tracking-wide uppercase ${
                        hasCustomBg ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {member.role} {member.year ? `• ${member.year}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 relative backdrop-blur-sm border rounded-xl p-3.5 shadow-inner ${
                    hasCustomBg
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/75 border-pink-100/50'
                  }`}>
                    <span className={`absolute -top-2 left-3 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                      hasCustomBg
                        ? 'bg-white/20 text-white border border-white/10'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      <Sparkles className="w-2.5 h-2.5" /> Greeting
                    </span>
                    <p className={`text-sm italic leading-relaxed pt-1.5 ${
                      hasCustomBg ? 'text-white/95' : 'text-gray-600'
                    }`}>
                      "{resolvedMessage}"
                    </p>
                  </div>
                </div>

                {member.whatsappNumber && (
                  <div className="mt-4 flex justify-end">
                    <a
                      href={`https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(resolvedMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-300 border shadow-sm ${
                        hasCustomBg
                          ? 'bg-white/20 text-white hover:bg-white hover:text-slate-900 border-white/20 hover:border-white'
                          : 'bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white border-pink-100 hover:border-pink-600'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Wish
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
