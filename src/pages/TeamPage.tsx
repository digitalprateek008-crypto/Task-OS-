import React, { useState } from 'react';
import { Users, Shield, CheckCircle2, AlertTriangle, ArrowRightLeft, UserCheck, Plus } from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { dataService } from '../services/dataService';
import { AddTeamMemberModal } from '../components/modals/AddTeamMemberModal';

export const TeamPage: React.FC = () => {
  const { profiles, tasks, currentUser, setCurrentUser } = useAgencyData();
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const departments = [
    'All',
    'Media Buying',
    'Creative Studio',
    'Organic & SEO',
    'Account Management',
    'Leadership',
    'Client',
  ];

  const filteredProfiles = profiles.filter((p) => {
    if (departmentFilter === 'All') return true;
    return p.department === departmentFilter;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'project_manager':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'team_member':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'client':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1F3A]">Agency Team Roster</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#9DD52C] text-[#0B1F3A] text-xs font-bold font-mono">
              {profiles.length} Members
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Agency specialists, media buyers, creative designers, and account managers
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#122b4e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus size={14} className="text-[#9DD52C]" />
          <span>Add Member</span>
        </button>
      </div>

      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {departments.map((dep) => (
          <button
            key={dep}
            onClick={() => setDepartmentFilter(dep)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              departmentFilter === dep
                ? 'bg-[#0B1F3A] text-white shadow-xs font-semibold'
                : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
            }`}
          >
            {dep}
          </button>
        ))}
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map((member) => {
          const memberTasks = tasks.filter((t) => t.assignee_id === member.id);
          const activeTasks = memberTasks.filter((t) => t.status !== 'done');
          const completedTasks = memberTasks.filter((t) => t.status === 'done');
          const isCurrent = currentUser.id === member.id;

          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] ${
                isCurrent ? 'border-[#0B1F3A] ring-2 ring-[#9DD52C]' : 'border-[#E5E7EB] hover:border-[#0B1F3A]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#EFF3FF] flex-shrink-0">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#0B1F3A]">
                          {member.initials || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#0B1F3A]">{member.full_name}</h3>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-[#9DD52C]" title="Current user"></span>
                        )}
                      </div>
                      <p className="text-xs text-[#667085] leading-none mt-0.5">{member.title}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${getRoleBadge(
                      member.role
                    )}`}
                  >
                    {member.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-[#667085] space-y-1 mb-3">
                  <p>
                    <span className="font-semibold text-[#0B1F3A]">Department:</span> {member.department}
                  </p>
                  <p className="truncate font-mono text-[11px] text-[#9CA3AF]">{member.email}</p>
                </div>
              </div>

              {/* Workload Stats & Switch User CTA */}
              <div className="pt-3 border-t border-[#F3F4F6] space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded bg-[#F7F8FA] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#667085] block">Active Tasks</span>
                    <span className="font-mono font-bold text-xs text-[#0B1F3A]">
                      {activeTasks.length}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-[#F7F8FA] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#667085] block">Completed</span>
                    <span className="font-mono font-bold text-xs text-emerald-700">
                      {completedTasks.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentUser(member.id)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-[#EFF3FF] text-[#0B1F3A] border border-[#D6E3FF] cursor-default'
                      : 'bg-[#0B1F3A] text-white hover:bg-[#18345C] active:scale-95'
                  }`}
                >
                  <UserCheck size={13} />
                  <span>{isCurrent ? 'Active User (You)' : 'Test As This Member'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
