import React, { useState, useRef } from 'react';
import { Member, Role } from '../../types';
import { X, Save, Loader2, Upload, User, Trash2 } from 'lucide-react';
import { api, API_ORIGIN } from '../../services/api';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await api.uploadMemberPhoto(file);
      // result.photoUrl is a path like /uploads/photos/uuid.jpg
      setMemberForm({ ...memberForm, photoUrl: result.photoUrl });
    } catch (error: any) {
      console.error('Photo upload failed:', error);
      alert(error.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoUpload(file);
  };

  const handleRemovePhoto = () => {
    setMemberForm({ ...memberForm, photoUrl: '' });
  };

  /** Resolve photoUrl for display — handles both absolute URLs and server paths */
  const getDisplayUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_ORIGIN}${url}`;
  };

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

  const previewUrl = getDisplayUrl(memberForm.photoUrl);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
             <h3 className="text-lg font-bold text-gray-900">
               {editingMember ? 'Edit Member' : 'Add New Member'}
             </h3>
             <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
             </button>
          </div>
          <form onSubmit={handleSaveMember} className="p-6 space-y-4 overflow-y-auto">
              {/* ── Photo Upload Section ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {previewUrl ? (
                      <div className="relative group">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload zone */}
                  <div
                    className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-mca-500 bg-mca-50'
                        : 'border-gray-300 hover:border-mca-400 hover:bg-gray-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="w-6 h-6 text-mca-500 animate-spin" />
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium">
                          Click or drag image
                        </span>
                        <span className="text-[10px] text-gray-400">JPEG, PNG, WebP · Max 5 MB</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* ── Name ── */}
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

              {/* ── Email ── */}
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

              {/* ── Role + Year ── */}
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

              {/* ── DOB + WhatsApp ── */}
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

              {/* ── Department ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-mca-500 focus:border-mca-500"
                    value={memberForm.department || ''}
                    onChange={(e) => setMemberForm({...memberForm, department: e.target.value})}
                />
              </div>

              {/* ── Actions ── */}
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
                   disabled={isSaving || isUploading}
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
