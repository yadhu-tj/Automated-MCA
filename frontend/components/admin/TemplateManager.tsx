import React, { useState } from 'react';
import { Edit, FileText, Plus, Trash2, X } from 'lucide-react';
import { Template, EventCategory } from '../../types';
import { api } from '../../services/api';

const DEFAULT_TEMPLATE_FORM: Omit<Template, 'id'> = {
  name: '',
  category: EventCategory.BIRTHDAY,
  content: '',
  backgroundImage: '',
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
            template.id === editingTemplate.id
              ? updatedTemplate
              : template
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
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.deleteTemplate(templateId);
        setTemplates((prev) => prev.filter((template) => template.id !== templateId));
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };

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
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">{template.name}</h3>
              <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 uppercase tracking-wide">
                {template.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded italic border border-dashed border-gray-300 flex-grow">
              "{template.content}"
            </p>
            {template.backgroundImage && (
              <p className="text-xs text-gray-400 mt-3 truncate">{template.backgroundImage}</p>
            )}
            <div className="mt-4 flex justify-end pt-4 border-t border-gray-50 gap-3">
              <button
                type="button"
                onClick={() => handleDelete(template.id)}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => openEditModal(template)}
                className="inline-flex items-center gap-1 text-sm text-mca-600 font-medium hover:text-mca-800"
              >
                <Edit className="w-4 h-4" />
                Edit Template
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-gray-50 p-6 rounded-lg shadow-inner border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition min-h-[200px]"
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-500">Create New Template</span>
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
            className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl border border-white/70"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <p className="text-sm text-gray-500">Prepare reusable greeting text.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="template-name">
              Template Name
            </label>
            <input
              id="template-name"
              value={templateForm.name}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
              placeholder="Birthday greeting"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="template-category">
              Category
            </label>
            <select
              id="template-category"
              value={templateForm.category}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, category: event.target.value as EventCategory }))}
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
            >
              {Object.values(EventCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="template-content">
              Content
            </label>
            <textarea
              id="template-content"
              value={templateForm.content}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full min-h-32 p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
              placeholder="Dear {name}, wishing you..."
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="template-background">
              Background Image URL
            </label>
            <input
              id="template-background"
              value={templateForm.backgroundImage}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, backgroundImage: event.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
              placeholder="https://example.com/background.jpg"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-mca-600 text-white rounded-md font-semibold hover:bg-mca-700"
              >
                {isSaving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
