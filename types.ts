export enum Role {
  STUDENT = 'Student',
  FACULTY = 'Faculty',
  ALUMNI = 'Alumni',
  ADMIN = 'Admin',
  DIRECTOR = 'Director'
}

export enum EventCategory {
  BIRTHDAY = 'Birthday',
  FESTIVAL = 'Festival',
  ACHIEVEMENT = 'Achievement',
  FAREWELL = 'Farewell',
  NOTICE = 'Notice'
}

export enum ApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  dob: string; // ISO date string YYYY-MM-DD
  photoUrl: string;
  whatsappNumber?: string;
  department: string;
  year?: string; // e.g., "2025", "2nd Year", "2020-2023"
}

export interface Template {
  id: string;
  name: string;
  category: EventCategory;
  content: string;
  backgroundImage?: string;
}

export interface Achievement {
  id: string;
  memberId: string;
  title: string;
  description: string;
  date: string;
  status: ApprovalStatus;
  certificateGenerated: boolean;
}

export interface Log {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'Success' | 'Failed';
}

export interface AISuggestionResponse {
  suggestedTitle: string;
  suggestedMessage: string;
  tone: string;
}