import React, { useState } from 'react';
import { Member, Role } from '../../types';
import { X, Save, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface MemberModalProps {
  isMemberModalOpen: boolean;
  setIsMemberModalOpen: (open: boolean) => void;
  editingMember: Member | null;
  memberForm: Partial<Member>;
  setMemberForm: (form: Partial<Member>) => void;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isMemberModalOpen,
  setIsMemberModalOpen,
  editingMember,
  memberForm,
  setMemberForm,
  setMembers
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email || !memberForm.dob) {
      alert("Please fill in all required fields (Name, Email, DOB).");
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        const updated = await api.updateMember(editingMember.id, memberForm as Omit<Member, 'id'>);
        setMembers(prev => prev.map(m => m.id === editingMember.id ? updated : m));
        setIsMemberModalOpen(false);
      } else {
        const newMember = await api.createMember(memberForm as Omit<Member, 'id'>);
        setMembers(prev => [...prev, newMember]);
        setIsMemberModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating member:", error);
      alert(error.message || "Error creating member.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMemberModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-900">
               {editingMember ? 'Edit Member' : 'Add New Member'}
             </h3>
             <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
             </button>
          </div>
          <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                    value={memberForm.name || ''}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                 <input 
                    type="email" 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                    value={memberForm.email || ''}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        value={memberForm.role || Role.STUDENT}
                        onChange={(e) => setMemberForm({...memberForm, role: e.target.value as Role})}
                    >
                        <option value={Role.STUDENT}>Student</option>
                        <option value={Role.FACULTY}>Faculty</option>
                        <option value={Role.ALUMNI}>Alumni</option>
                        <option value={Role.ADMIN}>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year/Batch</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        placeholder="e.g. 2025"
                        value={memberForm.year || ''}
                        onChange={(e) => setMemberForm({...memberForm, year: e.target.value})}
                    />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input 
                        type="date" 
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        value={memberForm.dob || ''}
                        onChange={(e) => setMemberForm({...memberForm, dob: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp No.</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        placeholder="+91..."
                        value={memberForm.whatsappNumber || ''}
                        onChange={(e) => setMemberForm({...memberForm, whatsappNumber: e.target.value})}
                    />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                    value={memberForm.department || ''}
                    onChange={(e) => setMemberForm({...memberForm, department: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <button 
                   type="button"
                   onClick={() => setIsMemberModalOpen(false)}
                   className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isSaving}
                   className="px-4 py-2 text-white bg-mca-600 rounded-md hover:bg-mca-700 flex items-center gap-2 disabled:opacity-50 transition-opacity"
                 >
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                   {isSaving ? 'Saving...' : 'Save Member'}
                 </button>
              </div>
          </form>
       </div>
    </div>
  );
};
