import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { MOCK_MEMBERS, MOCK_TEMPLATES } from '../constants';
import { Member, Template, Role, EventCategory, Achievement, ApprovalStatus } from '../types';
import { generateGreetingSuggestion } from '../services/geminiService';
import { CertificatePreview } from '../components/CertificatePreview';
import { Users, FileText, Award, Sparkles, Send, Loader2, CheckCircle, Plus, Upload, Download, Trash2, Edit, X, Save, Search } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'templates' | 'certificates'>('members');
  
  // State for Members
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Member Modal (Add/Edit)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    name: '', email: '', role: Role.STUDENT, department: 'MCA', dob: '', whatsappNumber: '', year: ''
  });
  
  // State for Generator
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementDesc, setAchievementDesc] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{title: string, message: string} | null>(null);
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  // --- Member CRUD Handlers ---

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
      if (selectedMemberId === id) setSelectedMemberId('');
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!memberForm.name || !memberForm.email || !memberForm.dob) {
      alert("Please fill in all required fields (Name, Email, DOB).");
      return;
    }

    if (editingMember) {
      // Update existing
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberForm } as Member : m));
    } else {
      // Add new
      const newMember: Member = {
        id: `man-${Date.now()}`,
        photoUrl: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(memberForm.name)}`,
        ...memberForm as Member
      };
      setMembers(prev => [...prev, newMember]);
    }
    setIsMemberModalOpen(false);
  };

  // --- Search Filter ---
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

  // --- CSV Upload Handler ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r\n|\n/);
        if (lines.length < 2) {
            alert("CSV file is empty or missing headers");
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const newMembers: Member[] = [];

        for(let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if(!line) continue;
            
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const memberObj: any = {
                id: `csv-${Date.now()}-${i}`,
                photoUrl: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(values[0] || 'User')}`,
                role: Role.STUDENT,
                department: 'MCA'
            };

            let hasName = false;
            headers.forEach((header, idx) => {
                const val = values[idx];
                if (!val) return;
                if (header.includes('name')) { memberObj.name = val; hasName = true; }
                else if (header.includes('email')) memberObj.email = val;
                else if (header.includes('role')) {
                    if (val.toLowerCase().includes('faculty')) memberObj.role = Role.FACULTY;
                    else if (val.toLowerCase().includes('alumni')) memberObj.role = Role.ALUMNI;
                    else if (val.toLowerCase().includes('admin')) memberObj.role = Role.ADMIN;
                    else memberObj.role = Role.STUDENT;
                }
                else if (header.includes('department') || header.includes('dept')) memberObj.department = val;
                else if (header.includes('dob') || header.includes('birth')) memberObj.dob = val;
                else if (header.includes('whatsapp') || header.includes('phone')) memberObj.whatsappNumber = val;
                else if (header.includes('year') || header.includes('batch')) memberObj.year = val;
            });

            if (hasName) newMembers.push(memberObj as Member);
        }

        if (newMembers.length > 0) {
            setMembers(prev => [...prev, ...newMembers]);
            alert(`Successfully imported ${newMembers.length} members.`);
        } else {
            alert("No valid members found in CSV. Please check format.");
        }

      } catch (err) {
          console.error(err);
          alert("Error parsing CSV file.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
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

  // --- AI Handler ---
  const handleAIGenerate = async () => {
    if (!selectedMemberId || !achievementDesc) {
      alert("Please select a member and describe the achievement first.");
      return;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsGeneratingAI(true);
    const suggestion = await generateGreetingSuggestion(
      EventCategory.ACHIEVEMENT,
      member.role,
      achievementDesc
    );
    setIsGeneratingAI(false);

    if (suggestion) {
      setAchievementTitle(suggestion.title);
      setGeneratedContent({ title: suggestion.title, message: suggestion.message });
    } else {
      alert("Failed to generate suggestion. Check API Key or try again.");
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

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

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
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
                            <img className="h-10 w-10 rounded-full object-cover" src={member.photoUrl} alt="" />
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
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div>
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
             <div className="flex gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                   <p className="text-sm font-bold text-blue-900">What are Templates?</p>
                   <p className="text-sm text-blue-700 mt-1">
                     Templates are reusable text patterns used by the automation system to generate greetings for Birthdays, Festivals, and Achievements. 
                     The system replaces placeholders like <code>{`{name}`}</code> or <code>{`{achievement}`}</code> with actual member data when sending messages.
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TEMPLATES.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="font-bold text-gray-900">{t.name}</h3>
                   <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 uppercase tracking-wide">{t.category}</span>
                </div>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded italic border border-dashed border-gray-300 flex-grow">
                  "{t.content}"
                </p>
                <div className="mt-4 flex justify-end pt-4 border-t border-gray-50 gap-3">
                   <button className="text-sm text-gray-500 hover:text-red-600">Delete</button>
                   <button className="text-sm text-mca-600 font-medium hover:text-mca-800">Edit Template</button>
                </div>
              </div>
            ))}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition min-h-[200px]">
               <Plus className="w-8 h-8 text-gray-400 mb-2"/>
               <span className="text-sm font-medium text-gray-500">Create New Template</span>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATES & AI GENERATOR TAB */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left Panel: Inputs */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-purple-600"/> Generate Achievement
                 </h3>
                 
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
                      <select 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-mca-500 focus:border-mca-500 p-2 border"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                      >
                        <option value="">-- Choose Member --</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.role}) - {m.year || 'N/A'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Context</label>
                      <textarea 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-mca-500 focus:border-mca-500 p-2 border h-24"
                        placeholder="e.g. Won 1st prize in National Hackathon for Smart Agriculture project..."
                        value={achievementDesc}
                        onChange={(e) => setAchievementDesc(e.target.value)}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">Provide details for the AI to generate a title and message.</p>
                    </div>

                    <button 
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI || !selectedMemberId}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
                    >
                      {isGeneratingAI ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                      {isGeneratingAI ? 'Asking Gemini...' : 'AI Suggestion'}
                    </button>

                    {generatedContent && (
                      <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100">
                        <p className="text-xs text-purple-800 font-bold uppercase mb-1">AI Suggestion:</p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{generatedContent.title}</p>
                        <p className="text-xs text-gray-600 italic">"{generatedContent.message}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Final Title (for Certificate)</label>
                       <input 
                         type="text"
                         className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                         value={achievementTitle}
                         onChange={(e) => setAchievementTitle(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm font-medium">
                 <Send className="w-4 h-4"/>
                 Approve & Send (Email/WhatsApp)
              </button>
           </div>

           {/* Right Panel: Preview */}
           <div className="lg:col-span-8">
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 min-h-[500px] flex items-center justify-center">
                 {selectedMember && achievementTitle ? (
                    <div className="transform scale-75 md:scale-90 origin-center transition-transform">
                      <CertificatePreview 
                        recipientName={selectedMember.name}
                        achievementTitle={achievementTitle}
                        achievementDetail={achievementDesc || 'For exemplary performance.'}
                        date={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                 ) : (
                    <div className="text-center text-gray-400">
                       <Award className="w-16 h-16 mx-auto mb-3 opacity-20"/>
                       <p>Select a member and define achievement<br/>to preview certificate.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MEMBER MODAL */}
      {isMemberModalOpen && (
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
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                     <input 
                        type="email" 
                        required 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                            value={memberForm.role}
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
                            value={memberForm.year}
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
                            value={memberForm.dob}
                            onChange={(e) => setMemberForm({...memberForm, dob: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp No.</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                            placeholder="+91..."
                            value={memberForm.whatsappNumber}
                            onChange={(e) => setMemberForm({...memberForm, whatsappNumber: e.target.value})}
                        />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                        value={memberForm.department}
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
                       className="px-4 py-2 text-white bg-mca-600 rounded-md hover:bg-mca-700 flex items-center gap-2"
                     >
                       <Save className="w-4 h-4"/>
                       Save Member
                     </button>
                  </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};