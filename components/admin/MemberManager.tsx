import React, { useState, useMemo, useRef } from 'react';
import { Member, Role } from '../../types';
import { parseCSV } from '../../utils/csvParser';
import { getMediaUrl } from '../../services/api';
import { Search, Download, Upload, Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface MemberManagerProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  handleOpenAddMember: () => void;
  handleOpenEditMember: (member: Member) => void;
  handleDeleteMember: (id: string) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  setMembers,
  handleOpenAddMember,
  handleOpenEditMember,
  handleDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const lowerTerm = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(lowerTerm) || 
      m.email.toLowerCase().includes(lowerTerm) ||
      m.role.toLowerCase().includes(lowerTerm) ||
      (m.year && m.year.toString().toLowerCase().includes(lowerTerm))
    );
  }, [members, searchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newMembers = await parseCSV(file);
      if (newMembers.length > 0) {
        setMembers(prev => [...prev, ...newMembers]);
        alert(`Successfully imported ${newMembers.length} members.`);
      } else {
        alert("No valid members found in CSV. Please check format.");
      }
    } catch (err: any) {
      alert(err.message || "Error parsing CSV file.");
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Role,DOB,Department,WhatsappNumber,Year\nJohn Doe,john@example.com,Student,2000-01-01,MCA,1234567890,2025";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "members_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
         <div>
           <h2 className="text-lg font-bold text-gray-900">Member Directory</h2>
           <p className="text-sm text-gray-500">Manage students, faculty, and alumni records.</p>
         </div>
         
         <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <div className="relative w-full md:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400"/>
               </div>
               <input 
                  type="text" 
                  className="pl-10 block w-full border-gray-300 rounded-md border p-2 text-sm focus:ring-mca-500 focus:border-mca-500"
                  placeholder="Search name, email, year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium border border-gray-300"
                title="Download CSV Template"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium border border-gray-300"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button 
                onClick={handleOpenAddMember}
                className="flex items-center gap-2 px-3 py-2 bg-mca-600 text-white rounded-md hover:bg-mca-700 text-sm font-medium shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
         </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={getMediaUrl(member.photoUrl)} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.role === Role.STUDENT ? 'bg-green-100 text-green-800' : 
                        member.role === Role.FACULTY ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.year || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenEditMember(member)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit Member"
                    >
                      <Edit className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              )) : (
                 <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     {searchTerm ? 'No members match your search.' : 'No members found. Add a member or upload a CSV.'}
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
