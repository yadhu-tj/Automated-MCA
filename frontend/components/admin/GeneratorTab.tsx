import React, { useState } from 'react';
import { Member, EventCategory, Template, ApprovalStatus } from '../../types';
import { Sparkles, Loader2, Send, Award, BookOpen } from 'lucide-react';
import { CertificatePreview } from '../CertificatePreview';
import { generateGreetingSuggestion } from '../../services/geminiService';
import { resolveTemplate } from '../../utils/templateResolver';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface GeneratorTabProps {
  members: Member[];
  templates: Template[];
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({ members, templates }) => {
  const navigate = useNavigate();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementDesc, setAchievementDesc] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ title: string; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const achievementTemplates = templates.filter(template => template.category === EventCategory.ACHIEVEMENT);
  const selectedTemplate = templates.find(template => template.id === selectedTemplateId);

  const buildTemplateValues = () => ({
    name: selectedMember?.name,
    role: selectedMember?.role,
    department: selectedMember?.department,
    year: selectedMember?.year,
    achievement: achievementDesc || achievementTitle,
    achievementTitle,
    date: new Date().toISOString().split('T')[0],
  });

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    if (!selectedMemberId) {
      alert('Please select a member before applying a template.');
      return;
    }

    const resolvedContent = resolveTemplate(selectedTemplate.content, buildTemplateValues());
    setGeneratedContent({
      title: selectedTemplate.name,
      message: resolvedContent,
    });

    setAchievementTitle(selectedTemplate.name);
  };

  const handleAIGenerate = async () => {
    if (!selectedMemberId || !achievementDesc) {
      alert("Please select a member and describe the achievement first.");
      return;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsGeneratingAI(true);
    try {
      const suggestion = await generateGreetingSuggestion(
        EventCategory.ACHIEVEMENT,
        member.role,
        achievementDesc
      );
      if (suggestion) {
        setAchievementTitle(suggestion.title);
        setGeneratedContent({ title: suggestion.title, message: suggestion.message });
      } else {
        alert("Failed to generate suggestion. Check API Key or try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating AI suggestion.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApproveAndSend = async () => {
    if (!selectedMemberId) {
      alert('Please select a member first.');
      return;
    }
    if (!achievementTitle) {
      alert('Please define the achievement title.');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsSaving(true);
    try {
      const payload = {
        memberId: selectedMemberId,
        title: achievementTitle,
        description: generatedContent?.message || achievementDesc || 'For exemplary performance.',
        date: new Date().toISOString().split('T')[0],
        status: ApprovalStatus.APPROVED,
        certificateGenerated: true,
      };

      const created = await api.createAchievement(payload);
      alert('Achievement certificate saved successfully!');

      const certificateUrl = `${window.location.origin}/certificate/${created.id}`;
      
      if (member.whatsappNumber) {
        const text = `Congratulations ${member.name}! You have been awarded the Certificate of Achievement for: *${achievementTitle}*.\n\nView and download details here: ${certificateUrl}`;
        const whatsappUrl = `https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        const text = `Congratulations ${member.name}!\n\nYou have been awarded the Certificate of Achievement for: ${achievementTitle}.\n\nView and download your certificate here: ${certificateUrl}`;
        const mailtoUrl = `mailto:${member.email}?subject=${encodeURIComponent("Certificate of Achievement - MCA Dept")}&body=${encodeURIComponent(text)}`;
        window.open(mailtoUrl, '_blank');
      }

      navigate(`/certificate/${created.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save achievement certificate.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Panel: Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-5">
          <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> Generate Achievement
          </h3>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Member</label>
            <select
              className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-slate-800 transition-colors"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) {m.year ? `- ${m.year}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Achievement Template</label>
            <div className="flex gap-2">
              <select
                className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-slate-800 transition-colors"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">-- Optional Template --</option>
                {achievementTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyTemplate}
                disabled={!selectedTemplateId || !selectedMemberId}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-4 h-4" /> Apply
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Achievement Title</label>
            <input
              type="text"
              className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-slate-800 transition-colors"
              placeholder="e.g. Winner of CyberHack 2026"
              value={achievementTitle}
              onChange={(e) => setAchievementTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Achievement Context / Details</label>
            <textarea
              className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border h-28 text-slate-800 transition-colors resize-none"
              placeholder="e.g. Won 1st prize in National Hackathon for Smart Agriculture project..."
              value={achievementDesc}
              onChange={(e) => setAchievementDesc(e.target.value)}
            ></textarea>
            <p className="text-xs text-slate-500 mt-1">Provide details for the AI to generate a title and message.</p>
          </div>

          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI || !selectedMemberId || !achievementDesc}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md font-semibold text-sm"
          >
            {isGeneratingAI ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {isGeneratingAI ? 'Asking Gemini...' : 'AI Suggestion'}
          </button>

          {generatedContent && (
            <div className="mt-4 p-4 bg-purple-50/50 rounded-lg border border-purple-100/50">
              <p className="text-xs text-purple-800 font-bold uppercase tracking-wider mb-1.5">AI Suggestion Result:</p>
              <p className="text-sm font-bold text-slate-800 mb-1">{generatedContent.title}</p>
              <p className="text-xs text-slate-600 italic leading-relaxed">"{generatedContent.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Preview & Approve */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Certificate Preview
            </h3>

            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex items-center justify-center min-h-[360px] shadow-inner overflow-x-auto">
              {selectedMember && achievementTitle ? (
                <div className="w-full min-w-[550px] transform scale-90 md:scale-95 origin-center transition-transform">
                  <CertificatePreview
                    recipientName={selectedMember.name}
                    achievementTitle={achievementTitle}
                    achievementDetail={generatedContent?.message || achievementDesc || 'For exemplary performance.'}
                    date={new Date().toISOString().split('T')[0]}
                    backgroundImage={selectedTemplate?.backgroundImage}
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400 py-16">
                  <Award className="w-16 h-16 mx-auto mb-3 opacity-20 text-indigo-600" />
                  <p className="font-medium text-slate-500">Select a member and define achievement</p>
                  <p className="text-sm text-slate-400 mt-1">to preview and generate the certificate.</p>
                </div>
              )}
            </div>
          </div>

          {selectedMember && achievementTitle && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleApproveAndSend}
                disabled={isSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm md:text-base cursor-pointer"
              >
                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                {isSaving ? 'Saving...' : selectedMember.whatsappNumber ? 'Approve & Send via WhatsApp' : 'Approve & Send via Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
