import { Member } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // Fetch all members from Python backend
  getMembers: async (): Promise<Member[]> => {
    const response = await fetch(`${API_BASE_URL}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  // Send a new member to Python backend
  createMember: async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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