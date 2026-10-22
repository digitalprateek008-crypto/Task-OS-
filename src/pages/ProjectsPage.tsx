import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  MoreVertical,
  Archive,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { dataService } from '../services/dataService';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { Project } from '../types/database';

interface ProjectsPageProps {
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: any) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectTask, onOpenCreateTask }) => {
  const { projects, clients, profiles, tasks, currentUser } = useAgencyData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => p.status !== 'archived');

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const projectTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject.id)
    : [];

  const handleArchive = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Archive this project?')) {
      dataService.archiveProject(projectId);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Projects & Deliverables</h1>
          <p className="text-xs text-[#667085]">
            Track delivery progress, sprint deadlines, and media campaign budgets
          </p>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-8 px-3 rounded-lg bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeProjects.map((project) => {
          const client = clients.find((c) => c.id === project.client_id);
          const pm = profiles.find((p) => p.id === project.project_manager_id);
          const progress = dataService.getProjectProgress(project.id);
          const isSelected = selectedProjectId === project.id;
          const spendPct =
            project.budget > 0 ? Math.min(100, Math.round((project.spend / project.budget) * 100)) : 0;

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] ${
                isSelected ? 'border-[#0B1F3A] ring-2 ring-[#0B1F3A]' : 'border-[#E5E7EB] hover:border-[#0B1F3A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-[#EFF3FF] text-[#0B1F3A] px-2 py-0.5 rounded border border-[#D6E3FF]">
                    {project.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#667085] font-semibold">{client?.company}</span>
                    {currentUser.role !== 'client' && (
                      <button
                        onClick={(e) => handleArchive(project.id, e)}
                        title="Archive project"
                        className="text-[#9CA3AF] hover:text-rose-600 p-1"
                      >
                        <Archive size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#0B1F3A] leading-snug mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed mb-3">
                  {project.description || 'Campaign delivery and conversion sprints.'}
                </p>

                {/* Task Completion Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#667085] flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-[#0B1F3A]" />
                      <span>Progress</span>
                    </span>
                    <span className="font-mono font-bold text-[#0B1F3A]">
                      {progress.completedTasks}/{progress.totalTasks} done ({progress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
                    <div
                      className="bg-[#9DD52C] h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget Burn Meter */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#667085]">Media Budget Burn</span>
                    <span className="font-mono text-[#0B1F3A]">
                      ${(project.spend / 1000).toFixed(1)}k / ${(project.budget / 1000).toFixed(1)}k ({spendPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#EFF3FF] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        spendPct > 85 ? 'bg-rose-500' : 'bg-[#0B1F3A]'
                      }`}
                      style={{ width: `${spendPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-[#667085]">
                  <Calendar size={12} />
                  <span className="font-mono">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Ongoing'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#667085]">PM:</span>
                  <div className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-[9px] font-mono">
                    {pm?.initials || 'MV'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Tasks Details View */}
      {selectedProject && (
        <section className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#EFF3FF] text-[#0B1F3A] px-2 py-0.5 rounded">
                  {selectedProject.code}
                </span>
                <h3 className="text-base font-bold text-[#0B1F3A]">{selectedProject.name} Tasks</h3>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Showing {projectTasks.length} tasks linked to this project
              </p>
            </div>

            {currentUser.role !== 'client' && (
              <button
                onClick={() => onOpenCreateTask()}
                className="h-8 px-3 rounded-lg bg-[#0B1F3A] text-white hover:bg-[#18345C] text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Task to Project</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {projectTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#667085]">
                No tasks assigned to this project yet.
              </div>
            ) : (
              projectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-[#F7F8FA] px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#0B1F3A] bg-[#EFF3FF] px-1.5 py-0.5 rounded font-semibold">
                      #{t.task_number}
                    </span>
                    <span className="text-xs font-semibold text-[#182230] truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="font-mono text-[11px] text-[#667085]">
                      {new Date(t.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="capitalize font-semibold text-[10px] px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[#0B1F3A]">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
