import { Member, Role, EventCategory, Achievement, ApprovalStatus, Template } from './types';

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@mca.edu',
    role: Role.FACULTY,
    dob: '1980-05-15',
    photoUrl: 'https://picsum.photos/200/200?random=1',
    department: 'MCA',
    year: '2015' // Joined Year
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul.k@student.mca.edu',
    role: Role.STUDENT,
    dob: '2001-10-30', // Assume today is near this date for demo
    photoUrl: 'https://picsum.photos/200/200?random=2',
    department: 'MCA',
    year: '2025' // Graduating Year
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya.p@alumni.mca.edu',
    role: Role.ALUMNI,
    dob: '1995-12-12',
    photoUrl: 'https://picsum.photos/200/200?random=3',
    department: 'MCA',
    year: '2018' // Graduated Year
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@mca.edu',
    role: Role.ADMIN,
    dob: '1990-01-01',
    photoUrl: 'https://picsum.photos/200/200?random=4',
    department: 'Admin'
  }
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '101',
    memberId: '2',
    title: 'Hackathon Winner 2025',
    description: 'Secured 1st place in the National Smart India Hackathon.',
    date: '2025-10-25',
    status: ApprovalStatus.APPROVED,
    certificateGenerated: true
  },
  {
    id: '102',
    memberId: '1',
    title: 'Best Research Paper',
    description: 'Published a paper on AI in Education in IEEE Access.',
    date: '2025-09-15',
    status: ApprovalStatus.APPROVED,
    certificateGenerated: false
  }
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Standard Birthday',
    category: EventCategory.BIRTHDAY,
    content: 'Wishing you a very Happy Birthday, {name}! Have a wonderful year ahead. - MCA Department'
  },
  {
    id: 't2',
    name: 'Formal Achievement',
    category: EventCategory.ACHIEVEMENT,
    content: 'Congratulations {name} on {achievement}. Your hard work brings glory to the MCA Department.'
  },
  {
    id: 't3',
    name: 'Diwali Festival Greeting',
    category: EventCategory.FESTIVAL,
    content: 'Happy Diwali to you and your family, {name}! May the festival of lights bring prosperity and joy. Best wishes, MCA Dept.'
  }
];