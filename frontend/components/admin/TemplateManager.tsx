import React, { useState, useRef } from 'react';
import { Edit, FileText, Plus, Trash2, X, Upload, Sparkles, Image, Info, Award, Cake, Star, HelpCircle } from 'lucide-react';
import { Template, EventCategory } from '../../types';
import { api, getMediaUrl } from '../../services/api';
import { resolveTemplate } from '../../utils/templateResolver';

const DEFAULT_TEMPLATE_FORM: Omit<Template, 'id'> = {
  name: '',
  category: EventCategory.BIRTHDAY,
  content: '',
  backgroundImage: '',
};

interface BackgroundPreset {
  name: string;
  value: string;
  previewClass: string;
}

const PRESET_BACKGROUNDS: BackgroundPreset[] = [
  {
    name: 'Royal Blue & Gold',
    value: 'linear-gradient(135deg, #1e3a8a 0%, #0d1b2a 100%)',
    previewClass: 'bg-gradient-to-br from-blue-900 to-slate-950 border-amber-400 border-2'
  },
  {
    name: 'Emerald Festive',
    value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    previewClass: 'bg-gradient-to-br from-emerald-950 to-emerald-800 border-emerald-400 border-2'
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #7c2d12 0%, #4c0519 100%)',
    previewClass: 'bg-gradient-to-br from-orange-950 to-rose-950 border-orange-500 border-2'
  },
  {
    name: 'Luxury Purple',
    value: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)',
    previewClass: 'bg-gradient-to-br from-purple-900 to-indigo-950 border-purple-500 border-2'
  },
  {
    name: 'Modern Slate',
    value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    previewClass: 'bg-gradient-to-br from-slate-800 to-slate-950 border-slate-700 border-2'
  }
];

const CATEGORY_PLACEHOLDERS: Record<EventCategory, { label: string; tag: string; desc: string }[]> = {
  [EventCategory.BIRTHDAY]: [
    { label: 'Name', tag: '{name}', desc: "Recipient's full name" },
    { label: 'Role', tag: '{role}', desc: "e.g. Student, Faculty" },
    { label: 'Department', tag: '{department}', desc: "e.g. MCA Dept." },
    { label: 'Year', tag: '{year}', desc: "e.g. 2025" },
    { label: 'Date', tag: '{date}', desc: "Today's date" },
  ],
  [EventCategory.FESTIVAL]: [
    { label: 'Festival Title', tag: '{title}', desc: "e.g. Christmas Celebration" },
    { label: 'Event Type', tag: '{type}', desc: "e.g. Festival, Holiday" },
    { label: 'Date', tag: '{date}', desc: "Scheduled date" },
    { label: 'Location', tag: '{location}', desc: "e.g. Seminar Hall" },
    { label: 'Description', tag: '{description}', desc: "Event description details" },
    { label: 'Days Until', tag: '{daysUntil}', desc: "e.g. In 3 days, Today!" },
  ],
  [EventCategory.ACHIEVEMENT]: [
    { label: 'Name', tag: '{name}', desc: "Recipient's full name" },
    { label: 'Role', tag: '{role}', desc: "Member's role" },
    { label: 'Department', tag: '{department}', desc: "Member's department" },
    { label: 'Year', tag: '{year}', desc: "Member's batch/year" },
    { label: 'Achievement Title', tag: '{achievementTitle}', desc: "e.g. Winner of CyberHack" },
    { label: 'Achievement Desc', tag: '{achievementDesc}', desc: "Description of details" },
    { label: 'Date', tag: '{date}', desc: "Award date" },
  ],
  [EventCategory.FAREWELL]: [
    { label: 'Name', tag: '{name}', desc: "Member's name" },
    { label: 'Role', tag: '{role}', desc: "Member's role" },
    { label: 'Year', tag: '{year}', desc: "e.g. 2022-2025 batch" },
    { label: 'Date', tag: '{date}', desc: "Current date" },
  ],
  [EventCategory.NOTICE]: [
    { label: 'Notice Title', tag: '{title}', desc: "e.g. Semester Exams" },
    { label: 'Date', tag: '{date}', desc: "Notice date" },
    { label: 'Location', tag: '{location}', desc: "e.g. Block Lobby" },
    { label: 'Description', tag: '{description}', desc: "Notice message contents" },
  ],
};

const getMockValues = (category: EventCategory) => {
  const todayStr = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  switch (category) {
    case EventCategory.BIRTHDAY:
      return {
        name: 'Jane Doe',
        role: 'Student',
        department: 'MCA Department',
        year: '2nd Year',
        date: todayStr,
      };
    case EventCategory.FESTIVAL:
      return {
        title: 'Christmas Celebration',
        type: 'Festival',
        date: '2026-12-25',
        location: 'Department Hall',
        description: 'Join us for cake cutting and celebrations.',
        daysUntil: 'In 3 days',
      };
    case EventCategory.ACHIEVEMENT:
      return {
        name: 'Aaron Paul',
        role: 'Student',
        department: 'MCA Dept.',
        year: '2024-2026',
        achievementTitle: 'ViteHack 1st Prize Winner',
        achievementDesc: 'Demonstrated outstanding web performance and premium aesthetic interface design in the national Hackathon.',
        date: todayStr,
      };
    case EventCategory.FAREWELL:
      return {
        name: 'Dr. Alan Turing',
        role: 'Head of Department',
        year: '2015 - 2026',
        date: todayStr,
      };
    case EventCategory.NOTICE:
      return {
        title: 'Important: Semester Fees Extended',
        date: todayStr,
        location: 'Admin Office',
        description: 'The deadline for fee submission has been extended to May 30, 2026 with no late fees.',
      };
    default:
      return {};
  }
};

interface TemplateManagerProps {
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, setTemplates }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState<Omit<Template, 'id'>>(DEFAULT_TEMPLATE_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTemplateForm(DEFAULT_TEMPLATE_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      content: template.content,
      backgroundImage: template.backgroundImage || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setTemplateForm(DEFAULT_TEMPLATE_FORM);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingTemplate) {
        const updatedTemplate = await api.updateTemplate(editingTemplate.id, templateForm);
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === editingTemplate.id ? updatedTemplate : template
          )
        );
      } else {
        const createdTemplate = await api.createTemplate(templateForm);
        setTemplates((prev) => [...prev, createdTemplate]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This will also clean up its background image file from the server.')) {
      try {
        await api.deleteTemplate(templateId);
        setTemplates((prev) => prev.filter((template) => template.id !== templateId));
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };

  // Local image upload handlers
  const handleBackgroundUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be smaller than 10 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await api.uploadTemplateBackground(file);
      setTemplateForm((prev) => ({ ...prev, backgroundImage: result.backgroundImage }));
    } catch (error: any) {
      console.error('Template background background upload failed:', error);
      alert(error.message || 'Failed to upload background.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBackground = () => {
    setTemplateForm((prev) => ({ ...prev, backgroundImage: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBackgroundUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBackgroundUpload(file);
  };

  // Cursor-aware tag insertion
  const insertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newContent = before + tag + after;
    setTemplateForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Render cards with custom backgrounds or standard presets
  const getCardBgStyle = (bg?: string): React.CSSProperties => {
    if (!bg) return {};
    if (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient')) {
      return { background: bg };
    }
    return {
      backgroundImage: `url(${getMediaUrl(bg)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  // Resolve preview data
  const mockValues = getMockValues(templateForm.category);
  const previewMessage = resolveTemplate(templateForm.content || 'Select a placeholder or type content to see greeting here...', mockValues);

  return (
    <div>
      <div className="mb-6 bg-slate-900/5 backdrop-blur border border-slate-200/50 p-5 rounded-2xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-base">Interactive Template Dashboard</p>
            <p className="text-sm text-slate-600 mt-1">
              Create and manage visually stunning greeting layouts. Upload custom backgrounds, choose elegant gradients, and use merge tags to build professional automated announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const hasCustomBg = !!template.backgroundImage;
          const bgStyle = getCardBgStyle(template.backgroundImage);
          const isGrad = template.backgroundImage?.startsWith('linear-gradient');

          return (
            <div
              key={template.id}
              style={bgStyle}
              className={`relative rounded-2xl shadow-md border overflow-hidden flex flex-col h-full min-h-[220px] transition-all duration-300 hover:shadow-lg ${
                hasCustomBg 
                  ? 'border-transparent text-white' 
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              {/* Overlay for contrast in uploaded backgrounds */}
              {hasCustomBg && !isGrad && (
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px] z-0" />
              )}

              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg leading-snug drop-shadow-sm">{template.name}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider ${
                      hasCustomBg 
                        ? 'bg-white/20 text-white border border-white/10' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                  <p className={`text-sm italic leading-relaxed border-l-2 p-3 my-2 rounded-r-lg ${
                    hasCustomBg
                      ? 'bg-white/10 border-white/30 text-white/90'
                      : 'bg-slate-50 border-indigo-500 text-slate-600'
                  }`}>
                    "{template.content}"
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center gap-3 border-slate-200/20">
                  <span className="text-[10px] opacity-60 truncate max-w-[200px]">
                    {template.backgroundImage ? 'Has custom background' : 'Standard theme'}
                  </span>
                  
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(template.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                        hasCustomBg
                          ? 'text-white/80 hover:text-red-400 hover:bg-white/10'
                          : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(template)}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded transition-all ${
                        hasCustomBg
                          ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/70 hover:border-indigo-400 transition-all duration-300 min-h-[220px] p-6 shadow-inner group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:shadow-md transition-all mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Create New Template</span>
          <span className="text-xs text-slate-500 mt-1">Configure layout, presets, and tags</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close template modal"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl border border-white/70 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 leading-tight">
                    {editingTemplate ? 'Edit Template Layout' : 'Create Elegant Template'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure beautiful cards with variables and background styles.</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Split Screen Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-grow">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Template Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide" htmlFor="template-name">
                      Template Name
                    </label>
                    <input
                      id="template-name"
                      value={templateForm.name}
                      onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition"
                      placeholder="e.g. Birthday wish card"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide" htmlFor="template-category">
                      Category
                    </label>
                    <select
                      id="template-category"
                      value={templateForm.category}
                      onChange={(event) => setTemplateForm((prev) => ({ ...prev, category: event.target.value as EventCategory }))}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      {Object.values(EventCategory).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Click-to-Insert Placeholders */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Merge Tags (Click to Insert)</span>
                    <span title="Click tags to automatically insert them at the cursor location in the textarea.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {CATEGORY_PLACEHOLDERS[templateForm.category]?.map((placeholder) => (
                      <button
                        key={placeholder.tag}
                        type="button"
                        onClick={() => insertPlaceholder(placeholder.tag)}
                        className="px-2.5 py-1 text-xs font-bold bg-white text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 active:scale-95 shadow-sm transition"
                        title={placeholder.desc}
                      >
                        {placeholder.label} <code className="text-[10px] font-mono text-indigo-400 bg-indigo-50/50 px-1 rounded ml-1">{placeholder.tag}</code>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide" htmlFor="template-content">
                    Greeting Message Template
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="template-content"
                    value={templateForm.content}
                    onChange={(event) => setTemplateForm((prev) => ({ ...prev, content: event.target.value }))}
                    className="w-full min-h-[110px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition"
                    placeholder="Type template message, clicking merge tags above to construct structure..."
                    required
                  />
                </div>

                {/* Background Styling Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Background Styling
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Drag-and-drop Image Upload */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col justify-center items-center min-h-[110px] ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium text-slate-500">Uploading background...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-700">Upload background image</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">Drag-and-drop PNG, JPG, WebP</span>
                        </div>
                      )}
                    </div>

                    {/* Gradient Preset Grid */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Gradients Presets</span>
                        <div className="grid grid-cols-5 gap-2">
                          {PRESET_BACKGROUNDS.map((preset) => {
                            const isActive = templateForm.backgroundImage === preset.value;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setTemplateForm((prev) => ({ ...prev, backgroundImage: preset.value }))}
                                className={`w-8 h-8 rounded-full cursor-pointer transition-transform relative hover:scale-105 active:scale-95 ${preset.previewClass} ${
                                  isActive ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' : ''
                                }`}
                                title={preset.name}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {templateForm.backgroundImage && (
                        <button
                          type="button"
                          onClick={handleRemoveBackground}
                          className="mt-3 inline-flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Clear custom background
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Visual Preview Card */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-[360px] lg:h-auto min-h-[300px]">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-700 mb-3.5 pb-2 border-b border-slate-200/50">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Card Preview</span>
                  </div>

                  {/* Dynamic Visual Greeting Card */}
                  <div className="flex items-center justify-center">
                    {templateForm.category === EventCategory.ACHIEVEMENT ? (
                      // Mini Certificate layout
                      <div
                        style={getCardBgStyle(templateForm.backgroundImage)}
                        className={`w-full h-[200px] border-4 border-slate-900 rounded-lg p-1 relative overflow-hidden transition-all duration-300 ${
                          templateForm.backgroundImage ? 'text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {templateForm.backgroundImage && !templateForm.backgroundImage.startsWith('linear-gradient') && (
                          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px]" />
                        )}
                        <div className="relative z-10 border border-slate-300/40 h-full p-3 flex flex-col justify-between items-center text-center">
                          <div>
                            <span className="text-[10px] tracking-widest font-serif block uppercase opacity-70">Certificate of Achievement</span>
                            <span className="text-xs font-bold block mt-1 font-serif">{mockValues.name}</span>
                          </div>
                          <div className="my-1.5 max-h-[60px] overflow-hidden">
                            <span className="text-[10px] font-bold block leading-snug line-clamp-1">{mockValues.achievementTitle}</span>
                            <p className="text-[9px] opacity-75 mt-0.5 leading-relaxed line-clamp-2">"{previewMessage}"</p>
                          </div>
                          <div className="w-full flex justify-between items-end text-[8px] opacity-80 px-2 mt-1">
                            <div>Date: {mockValues.date}</div>
                            <div className="border-t border-slate-400 pt-0.5 px-2">Director Signature</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Greeting Card layout (Birthday, Festival, Notice, Farewell)
                      <div
                        style={getCardBgStyle(templateForm.backgroundImage)}
                        className={`relative rounded-2xl w-full h-[200px] shadow-md border overflow-hidden flex flex-col justify-between p-4 transition-all duration-300 ${
                          templateForm.backgroundImage ? 'border-transparent text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {templateForm.backgroundImage && !templateForm.backgroundImage.startsWith('linear-gradient') && (
                          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px]" />
                        )}

                        <div className="relative z-10 flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                            templateForm.category === EventCategory.BIRTHDAY
                              ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                              : templateForm.category === EventCategory.FESTIVAL
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}>
                            {templateForm.category === EventCategory.BIRTHDAY ? (
                              <Cake className="w-5 h-5" />
                            ) : templateForm.category === EventCategory.FESTIVAL ? (
                              <Star className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm truncate">{mockValues.name || mockValues.title}</h4>
                            <p className="text-[10px] uppercase opacity-75 leading-none mt-0.5">
                              {templateForm.category === EventCategory.BIRTHDAY 
                                ? `${mockValues.role} • ${mockValues.year}`
                                : templateForm.category === EventCategory.FESTIVAL
                                ? `${mockValues.type} • ${mockValues.daysUntil}`
                                : templateForm.category}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 my-2 max-h-[75px] overflow-hidden">
                          <p className={`text-xs italic leading-relaxed border-l-2 p-2 rounded-r-lg ${
                            templateForm.backgroundImage
                              ? 'bg-white/10 border-white/30 text-white/90'
                              : 'bg-slate-50 border-indigo-500 text-slate-600'
                          }`}>
                            "{previewMessage}"
                          </p>
                        </div>

                        <div className="relative z-10 flex justify-between items-center text-[9px] opacity-70">
                          <span>{mockValues.location || mockValues.date}</span>
                          <span>Auto Generated</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 flex gap-2 items-start mt-4">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-amber-800">
                    The layout shows a live representation with mock values. When dispatched, placeholders are evaluated dynamically against recipient records.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0 mt-5">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl active:scale-95 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
              >
                {isSaving ? 'Saving...' : editingTemplate ? 'Save Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
