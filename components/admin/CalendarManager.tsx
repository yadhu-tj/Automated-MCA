import React, { useMemo, useState } from 'react';
import { CalendarDays, Edit, Trash2, Save, X } from 'lucide-react';
import { DepartmentEvent } from '../../types';
import { api } from '../../services/api';

interface CalendarManagerProps {
  events: DepartmentEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DepartmentEvent[]>>;
}

const emptyEventForm: Omit<DepartmentEvent, 'id'> = {
  title: '',
  date: '',
  type: 'Notice',
  description: '',
  location: '',
};

export const CalendarManager: React.FC<CalendarManagerProps> = ({ events, setEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventForm, setEventForm] = useState<Omit<DepartmentEvent, 'id'>>(emptyEventForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    const lower = searchTerm.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(lower) ||
      event.type.toLowerCase().includes(lower) ||
      (event.description || '').toLowerCase().includes(lower) ||
      (event.location || '').toLowerCase().includes(lower)
    );
  }, [events, searchTerm]);

  const resetForm = () => {
    setEventForm(emptyEventForm);
    setEditingEventId(null);
  };

  const handleEdit = (event: DepartmentEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description || '',
      location: event.location || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this calendar entry?')) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete event.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.type) {
      alert('Please fill in title, date, and type.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingEventId) {
        const updated = await api.updateEvent(editingEventId, eventForm);
        setEvents((prev) => prev.map((event) => event.id === editingEventId ? updated : event));
      } else {
        const created = await api.createEvent(eventForm);
        setEvents((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-mca-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Department Calendar</h2>
            <p className="text-sm text-gray-500">Create and manage department events visible on the public homepage.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event title"
            className="border border-gray-300 rounded-md p-2"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
          />
          <input
            type="date"
            className="border border-gray-300 rounded-md p-2"
            value={eventForm.date}
            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Type e.g. Festival, Notice"
            className="border border-gray-300 rounded-md p-2"
            value={eventForm.type}
            onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location (optional)"
            className="border border-gray-300 rounded-md p-2"
            value={eventForm.location || ''}
            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
          />
          <textarea
            placeholder="Description (optional)"
            className="border border-gray-300 rounded-md p-2 md:col-span-2"
            rows={3}
            value={eventForm.description || ''}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
          />
          <div className="md:col-span-2 flex justify-end gap-3">
            {editingEventId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-mca-600 text-white disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-2" />
              {isSaving ? 'Saving...' : editingEventId ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Existing Events</h3>
            <p className="text-sm text-gray-500">Use these entries to populate the department calendar.</p>
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <div key={event.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-mca-50 text-mca-700">{event.type}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{event.date}{event.location ? ` - ${event.location}` : ''}</p>
                {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(event)} className="text-indigo-600 hover:text-indigo-800">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? 'No events matched your search.' : 'No calendar events yet. Add the first one above.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
