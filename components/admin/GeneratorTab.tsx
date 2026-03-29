import React, { useState } from 'react';
import { Member, EventCategory } from '../../types';
import { Sparkles, Loader2, Send, Award } from 'lucide-react';
import { CertificatePreview } from '../CertificatePreview';
import { generateGreetingSuggestion } from '../../services/geminiService';

interface GeneratorTabProps {
  members: Member[];
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({ members }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementDesc, setAchievementDesc] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{title: string, message: string} | null>(null);

  const handleAIGenerate = async () => {
    if (!selectedMemberId || !achievementDesc) {
      alert("Please select a member and describe the achievement first.");
      return;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsGeneratingAI(true);
    const suggestion = await generateGreetingSuggestion(
      EventCategory.ACHIEVEMENT,
      member.role,
      achievementDesc
    );
    setIsGeneratingAI(false);

    if (suggestion) {
      setAchievementTitle(suggestion.title);
      setGeneratedContent({ title: suggestion.title, message: suggestion.message });
    } else {
      alert("Failed to generate suggestion. Check API Key or try again.");
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
       {/* Left Panel: Inputs */}
       <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-purple-600"/> Generate Achievement
             </h3>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-mca-500 focus:border-mca-500 p-2 border"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role}) - {m.year || 'N/A'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Context</label>
                  <textarea 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-mca-500 focus:border-mca-500 p-2 border h-24"
                    placeholder="e.g. Won 1st prize in National Hackathon for Smart Agriculture project..."
                    value={achievementDesc}
                    onChange={(e) => setAchievementDesc(e.target.value)}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Provide details for the AI to generate a title and message.</p>
                </div>

                <button 
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI || !selectedMemberId}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
                >
                  {isGeneratingAI ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                  {isGeneratingAI ? 'Asking Gemini...' : 'AI Suggestion'}
                </button>

                {generatedContent && (
                  <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100">
                    <p className="text-xs text-purple-800 font-bold uppercase mb-1">AI Suggestion:</p>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{generatedContent.title}</p>
                    <p className="text-xs text-gray-600 italic">"{generatedContent.message}"</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Final Title (for Certificate)</label>
                   <input 
                     type="text"
                     className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                     value={achievementTitle}
                     onChange={(e) => setAchievementTitle(e.target.value)}
                   />
                </div>
             </div>
          </div>

          <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm font-medium">
             <Send className="w-4 h-4"/>
             Approve & Send (Email/WhatsApp)
          </button>
       </div>

       {/* Right Panel: Preview */}
       <div className="lg:col-span-8">
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 min-h-[500px] flex items-center justify-center">
             {selectedMember && achievementTitle ? (
                <div className="transform scale-75 md:scale-90 origin-center transition-transform">
                  <CertificatePreview 
                    recipientName={selectedMember.name}
                    achievementTitle={achievementTitle}
                    achievementDetail={achievementDesc || 'For exemplary performance.'}
                    date={new Date().toISOString().split('T')[0]}
                  />
                </div>
             ) : (
                <div className="text-center text-gray-400">
                   <Award className="w-16 h-16 mx-auto mb-3 opacity-20"/>
                   <p>Select a member and define achievement<br/>to preview certificate.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
