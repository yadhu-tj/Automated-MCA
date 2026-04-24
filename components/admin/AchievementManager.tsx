import React, { useMemo, useRef, useState } from 'react';
import { Award, Edit, Save, Trash2, Upload, X } from 'lucide-react';
import { Achievement, ApprovalStatus, Member } from '../../types';
import { api } from '../../services/api';

interface AchievementManagerProps {
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  members: Member[];
}

const emptyAchievementForm: Omit<Achievement, 'id'> = {
  memberId: '',
  title: '',
  description: '',
  date: '',
  status: ApprovalStatus.PENDING,
  certificateGenerated: false,
};

export const AchievementManager: React.FC<AchievementManagerProps> = ({ achievements, setAchievements, members }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [achievementForm, setAchievementForm] = useState<Omit<Achievement, 'id'>>(emptyAchievementForm);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCertificateFile, setSelectedCertificateFile] = useState<{
    name: string;
    mimeType: string;
    dataUrl: string;
  } | null>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  const resetCertificateSelection = () => {
    setSelectedCertificateFile(null);
    if (certificateInputRef.current) {
      certificateInputRef.current.value = '';
    }
  };

  const filteredAchievements = useMemo(() => {
    if (!searchTerm) return achievements;
    const lower = searchTerm.toLowerCase();
    return achievements.filter((achievement) => {
      const memberName = members.find((member) => member.id === achievement.memberId)?.name || '';
      return (
        achievement.title.toLowerCase().includes(lower) ||
        achievement.description.toLowerCase().includes(lower) ||
        achievement.status.toLowerCase().includes(lower) ||
        memberName.toLowerCase().includes(lower)
      );
    });
  }, [achievements, members, searchTerm]);

  const resetForm = () => {
    setAchievementForm(emptyAchievementForm);
    setEditingAchievementId(null);
    resetCertificateSelection();
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievementId(achievement.id);
    setAchievementForm({
      memberId: achievement.memberId,
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      status: achievement.status,
      certificateGenerated: achievement.certificateGenerated,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.deleteAchievement(id);
      setAchievements((prev) => prev.filter((achievement) => achievement.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete achievement.');
    }
  };

  const handleCertificatePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      alert('Only image files and PDF certificates are supported.');
      event.target.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read certificate file.'));
      reader.readAsDataURL(file);
    });

    setSelectedCertificateFile({
      name: file.name,
      mimeType: file.type,
      dataUrl,
    });
    setAchievementForm(prev => ({ ...prev, certificateGenerated: true }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.memberId || !achievementForm.title || !achievementForm.description || !achievementForm.date) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...achievementForm,
        ...(selectedCertificateFile ? {
          certificateFileName: selectedCertificateFile.name,
          certificateFileData: selectedCertificateFile.dataUrl,
          certificateMimeType: selectedCertificateFile.mimeType,
          certificateGenerated: true,
        } : {}),
      };

      if (editingAchievementId) {
        const updated = await api.updateAchievement(editingAchievementId, payload);
        setAchievements((prev) => prev.map((achievement) => achievement.id === editingAchievementId ? updated : achievement));
      } else {
        const created = await api.createAchievement(payload);
        setAchievements((prev) => [created, ...prev]);
      }
      resetCertificateSelection();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Failed to save achievement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-500" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Wall of Achievements</h2>
            <p className="text-sm text-gray-500">Manage the achievement cards shown on the public wall.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border border-gray-300 rounded-md p-2"
            value={achievementForm.memberId}
            onChange={(e) => setAchievementForm({ ...achievementForm, memberId: e.target.value })}
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="border border-gray-300 rounded-md p-2"
            value={achievementForm.date}
            onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Achievement title"
            className="border border-gray-300 rounded-md p-2"
            value={achievementForm.title}
            onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-md p-2"
            value={achievementForm.status}
            onChange={(e) => setAchievementForm({ ...achievementForm, status: e.target.value as ApprovalStatus })}
          >
            <option value={ApprovalStatus.PENDING}>Pending</option>
            <option value={ApprovalStatus.APPROVED}>Approved</option>
            <option value={ApprovalStatus.REJECTED}>Rejected</option>
          </select>
          <textarea
            placeholder="Achievement description"
            className="border border-gray-300 rounded-md p-2 md:col-span-2"
            rows={3}
            value={achievementForm.description}
            onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
          />
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={achievementForm.certificateGenerated}
              onChange={(e) => {
                const checked = e.target.checked;
                setAchievementForm({ ...achievementForm, certificateGenerated: checked });
                if (!checked) {
                  resetCertificateSelection();
                }
              }}
            />
            Certificate generated
          </label>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate File</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={certificateInputRef}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2 bg-white"
              onChange={handleCertificatePick}
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: PNG, JPG, WEBP, GIF, PDF.</p>
            {selectedCertificateFile && (
              <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{selectedCertificateFile.name}</span>
                <button type="button" onClick={resetCertificateSelection} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            {editingAchievementId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-yellow-500 text-white disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-2" />
              {isSaving ? 'Saving...' : editingAchievementId ? 'Update Achievement' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Existing Achievements</h3>
            <p className="text-sm text-gray-500">These entries power the public wall.</p>
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="Search achievements..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAchievements.length > 0 ? filteredAchievements.map((achievement) => {
            const memberName = members.find((member) => member.id === achievement.memberId)?.name || 'Unknown Member';
            return (
              <div key={achievement.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      achievement.status === ApprovalStatus.APPROVED ? 'bg-green-100 text-green-700' :
                      achievement.status === ApprovalStatus.REJECTED ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {achievement.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{memberName} - {achievement.date}</p>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.certificateGenerated ? 'Certificate generated' : 'Certificate not generated'}</p>
                  {achievement.certificateFileName && achievement.certificateGenerated && (
                    <p className="text-xs text-mca-700 mt-1">File: {achievement.certificateFileName}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(achievement)} className="text-indigo-600 hover:text-indigo-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(achievement.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? 'No achievements matched your search.' : 'No achievements yet. Add the first one above.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
