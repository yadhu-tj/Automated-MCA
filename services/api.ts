import { Member, Achievement } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Login admin
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

  // Optional endpoints if implemented in backend
  getAchievements: async (): Promise<Achievement[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
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

  getUpcomingEvents: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [
        { title: 'Diwali Celebration', date: '2025-11-01', type: 'Festival' },
        { title: 'Guest Lecture: Cloud Computing', date: '2025-11-05', type: 'Academic' },
      ]; // fallback data
    }
  },

  // Fetch all members from Python backend
  getMembers: async (): Promise<Member[]> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  // Send a new member to Python backend
  createMember: async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(memberData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create member');
    }
    return response.json();
  },

  // Update existing member
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
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update member');
    }
    return response.json();
  }
};