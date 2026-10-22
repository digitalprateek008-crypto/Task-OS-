import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, User } from 'lucide-react';
import { dataService } from '../../services/dataService';

import { UserRole, Profile } from '../../types/database';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('team_member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the team member name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deptMap: Record<UserRole, Profile['department']> = {
        admin: 'Leadership',
        project_manager: 'Account Management',
        team_member: 'Media Buying',
        client: 'Client'
      };

      const titleMap: Record<UserRole, string> = {
        admin: 'Agency Director',
        project_manager: 'Project Manager',
        team_member: 'Marketing Specialist',
        client: 'Client Representative'
      };

      dataService.addTeamMember({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        title: titleMap[role],
        department: deptMap[role],
        role,
        avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add team member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 flex items-center justify-center text-[#0B1F3A]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Team Member</h2>
              <p className="text-xs text-gray-500">Invite or register an agency staff member</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="sarah@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Agency Role *</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              >
                <option value="admin">Admin / Director</option>
                <option value="project_manager">Project Manager</option>
                <option value="team_member">Marketing Specialist / Creative / SEO</option>
                <option value="client">Client Contact</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
