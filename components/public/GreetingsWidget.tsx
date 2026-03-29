import React from 'react';
import { PartyPopper } from 'lucide-react';
import { Member } from '../../types';

interface GreetingsWidgetProps {
  todaysBirthdays: Member[];
}

export const GreetingsWidget: React.FC<GreetingsWidgetProps> = ({ todaysBirthdays }) => {
  return (
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
  );
};
