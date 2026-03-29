import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Template, EventCategory } from '../../types';

// Constants.ts was deleted, so we provide an empty array as placeholder
const MOCK_TEMPLATES: Template[] = [];

export const TemplateManager: React.FC = () => {
  return (
    <div>
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
         <div className="flex gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
               <p className="text-sm font-bold text-blue-900">What are Templates?</p>
               <p className="text-sm text-blue-700 mt-1">
                 Templates are reusable text patterns used by the automation system to generate greetings for Birthdays, Festivals, and Achievements. 
                 The system replaces placeholders like <code>{`{name}`}</code> or <code>{`{achievement}`}</code> with actual member data when sending messages.
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TEMPLATES.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
               <h3 className="font-bold text-gray-900">{t.name}</h3>
               <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 uppercase tracking-wide">{t.category}</span>
            </div>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded italic border border-dashed border-gray-300 flex-grow">
              "{t.content}"
            </p>
            <div className="mt-4 flex justify-end pt-4 border-t border-gray-50 gap-3">
               <button className="text-sm text-gray-500 hover:text-red-600">Delete</button>
               <button className="text-sm text-mca-600 font-medium hover:text-mca-800">Edit Template</button>
            </div>
          </div>
        ))}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition min-h-[200px]">
           <Plus className="w-8 h-8 text-gray-400 mb-2"/>
           <span className="text-sm font-medium text-gray-500">Create New Template</span>
        </div>
      </div>
    </div>
  );
};
