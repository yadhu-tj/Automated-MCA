import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Member, Role } from '../types';
import { api } from '../services/api';
import { Users, FileText, Award } from 'lucide-react';

import { MemberManager } from '../components/admin/MemberManager';
import { MemberModal } from '../components/admin/MemberModal';
import { TemplateManager } from '../components/admin/TemplateManager';
import { GeneratorTab } from '../components/admin/GeneratorTab';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'templates' | 'certificates'>('members');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

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

  // handleSaveMember logic moved to MemberModal.tsx

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage department data, greetings, and certificates.</p>
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

      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex mb-6">
         <button 
           onClick={() => setActiveTab('members')}
           className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
         >
           <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Members</div>
         </button>
         <button 
           onClick={() => setActiveTab('templates')}
           className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'templates' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
         >
           <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Templates</div>
         </button>
         <button 
           onClick={() => setActiveTab('certificates')}
           className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'certificates' ? 'bg-mca-100 text-mca-700' : 'text-gray-600 hover:bg-gray-50'}`}
         >
           <div className="flex items-center gap-2"><Award className="w-4 h-4"/> Certificates & AI</div>
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