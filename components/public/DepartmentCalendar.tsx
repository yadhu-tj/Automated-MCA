import React from 'react';
import { Calendar } from 'lucide-react';

interface EventType {
  title: string;
  date: string;
  type: string;
}

interface DepartmentCalendarProps {
  upcomingEvents: EventType[];
}

export const DepartmentCalendar: React.FC<DepartmentCalendarProps> = ({ upcomingEvents }) => {
  return (
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
  );
};
