import { Member, Achievement, DepartmentEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_ORIGIN = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const getMediaUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
};

export const api = {
  loginAdmin: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to login');
    }
    return response.json();
  },

  getAchievements: async (): Promise<Achievement[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  getAchievement: async (id: string): Promise<Achievement> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch achievement');
    }
    return response.json();
  },

  createAchievement: async (achievementData: Omit<Achievement, 'id'>): Promise<Achievement> => {
    const response = await fetch(`${API_BASE_URL}/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(achievementData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create achievement');
    }
    return response.json();
  },

  updateAchievement: async (id: string, achievementData: Omit<Achievement, 'id'>): Promise<Achievement> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(achievementData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update achievement');
    }
    return response.json();
  },

  deleteAchievement: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete achievement');
    }
  },

  generateGreeting: async (category: string, recipientRole: string, context: string): Promise<{ title: string; message: string; tone: string } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-greeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ category, recipientRole, context }),
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  getEvents: async (): Promise<DepartmentEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  getUpcomingEvents: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [
        { title: 'Diwali Celebration', date: '2025-11-01', type: 'Festival' },
        { title: 'Guest Lecture: Cloud Computing', date: '2025-11-05', type: 'Academic' },
      ];
    }
  },

  createEvent: async (eventData: Omit<DepartmentEvent, 'id'>): Promise<DepartmentEvent> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create event');
    }
    return response.json();
  },

  updateEvent: async (id: string, eventData: Omit<DepartmentEvent, 'id'>): Promise<DepartmentEvent> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update event');
    }
    return response.json();
  },

  deleteEvent: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete event');
    }
  },

  uploadMemberPhoto: async (file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/members/upload-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload photo');
    }
    return response.json();
  },

  getMembers: async (): Promise<Member[]> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  createMember: async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    const payload = {
      ...memberData,
      photoUrl: memberData.photoUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(memberData.name || 'User')}`,
    };
    console.debug('[api.createMember] sending payload', payload);
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[api.createMember] request failed', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.detail || 'Failed to create member');
    }
    const created = await response.json();
    console.debug('[api.createMember] created member', created);
    return created;
  },

  updateMember: async (id: string | number, memberData: Omit<Member, 'id'>): Promise<Member> => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update member');
    }
    return response.json();
  }
};
