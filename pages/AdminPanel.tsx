import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Member, Role, DepartmentEvent, Achievement } from '../types';
import { api } from '../services/api';
import { Users, FileText, Award, CalendarDays, Trophy } from 'lucide-react';

import { MemberManager } from '../components/admin/MemberManager';
import { MemberModal } from '../components/admin/MemberModal';
import { TemplateManager } from '../components/admin/TemplateManager';
import { GeneratorTab } from '../components/admin/GeneratorTab';
import { CalendarManager } from '../components/admin/CalendarManager';
import { AchievementManager } from '../components/admin/AchievementManager';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'templates' | 'calendar' | 'achievements' | 'certificates'>('members');

  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<DepartmentEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await api.getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  React.useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchCalendar();
  }, []);

  React.useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await api.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoadingAchievements(false);
      }
    };
    fetchAchievements();
  }, []);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    name: '', email: '', role: Role.STUDENT, department: 'MCA', dob: '', whatsappNumber: '', year: ''
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({ name: '', email: '', role: Role.STUDENT, department: 'MCA', dob: '', whatsappNumber: '', year: '' });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember(member);
    setMemberForm({ ...member });
    setIsMemberModalOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage members, the department calendar, achievements, templates, and certificates.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Public Home
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex mb-6 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Members</div>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'calendar' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Calendar</div>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'achievements' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Wall of Achievement</div>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'templates' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Templates</div>
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'certificates' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Certificates & AI</div>
        </button>
      </div>

      {activeTab === 'members' && (
        isLoadingMembers ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mca-600 mb-2"></div>
              <span>Loading Members...</span>
            </div>
          </div>
        ) : (
          <MemberManager
            members={members}
            setMembers={setMembers}
            handleOpenAddMember={handleOpenAddMember}
            handleOpenEditMember={handleOpenEditMember}
            handleDeleteMember={handleDeleteMember}
          />
        )
      )}

      {activeTab === 'calendar' && (
        isLoadingEvents ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mca-600 mb-2"></div>
              <span>Loading Calendar...</span>
            </div>
          </div>
        ) : (
          <CalendarManager events={events} setEvents={setEvents} />
        )
      )}

      {activeTab === 'achievements' && (
        isLoadingAchievements ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mca-600 mb-2"></div>
              <span>Loading Achievements...</span>
            </div>
          </div>
        ) : (
          <AchievementManager achievements={achievements} setAchievements={setAchievements} members={members} />
        )
      )}

      {activeTab === 'templates' && (
        <TemplateManager />
      )}

      {activeTab === 'certificates' && (
        <GeneratorTab members={members} />
      )}

      <MemberModal
        isMemberModalOpen={isMemberModalOpen}
        setIsMemberModalOpen={setIsMemberModalOpen}
        editingMember={editingMember}
        memberForm={memberForm}
        setMemberForm={setMemberForm}
        setMembers={setMembers}
      />
    </div>
  );
};
