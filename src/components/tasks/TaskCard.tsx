import React from 'react';
import { Clock, MessageSquare, CheckSquare, Paperclip, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Task, TaskPriority } from '../../types/database';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { clients, projects, profiles } = useAgencyData();

  const client = clients.find((c) => c.id === task.client_id);
  const project = projects.find((p) => p.id === task.project_id);
  const assignee = profiles.find((p) => p.id === task.assignee_id);

  const checklists = dataService.getChecklists(task.id);
  const comments = dataService.getComments(task.id);
  const attachments = dataService.getAttachments(task.id);

  const completedChecklistsCount = checklists.filter((c) => c.is_completed).length;
  const checklistPercentage =
    checklists.length > 0 ? Math.round((completedChecklistsCount / checklists.length) * 100) : 0;

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Low
          </span>
        );
    }
  };

  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `Today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04),0_1px_2px_-1px_rgba(11,31,58,0.02)] hover:border-[#0B1F3A] hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Client & Project Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F8FA] text-[#667085] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DD52C]"></span>
            <span className="truncate max-w-[190px]">
              {client?.company || 'Agency'} · {project?.name || 'General'}
            </span>
          </span>
          <span className="font-mono text-[10px] text-[#9CA3AF]">#{task.task_number}</span>
        </div>

        {/* Task Title */}
        <h3 className="text-xs font-semibold text-[#182230] leading-snug group-hover:text-[#0B1F3A] transition-colors mb-2 line-clamp-2">
          {task.title}
        </h3>

        {/* Deliverable preview badge if any */}
        {attachments.length > 0 && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EFF3FF] text-[#0B1F3A] text-[10px] font-mono border border-[#D6E3FF]">
              <Paperclip size={10} />
              <span>{attachments[0].file_name}</span>
            </span>
          </div>
        )}

        {/* Checklist Progress if checklists exist */}
        {checklists.length > 0 && (
          <div className="mb-3 pt-0.5">
            <div className="flex items-center justify-between text-[11px] text-[#667085] mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare size={12} className="text-[#0B1F3A]" />
                <span>
                  {completedChecklistsCount}/{checklists.length} subtasks done
                </span>
              </span>
              <span className="font-mono font-semibold text-[#0B1F3A]">
                {checklistPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
              <div
                className="bg-[#9DD52C] h-full rounded-full transition-all duration-300"
                style={{ width: `${checklistPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          <span className="flex items-center gap-1 text-[11px] text-[#667085] font-mono">
            <Clock size={11} className={task.priority === 'urgent' ? 'text-rose-500' : 'text-[#9CA3AF]'} />
            <span>{formatDueDate(task.due_date)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-[#9CA3AF]">
              <MessageSquare size={11} />
              <span>{comments.length}</span>
            </span>
          )}

          {/* Assignee Avatar */}
          <div
            className="w-5 h-5 rounded-full overflow-hidden bg-[#0B1F3A] text-white flex items-center justify-center text-[9px] font-bold ring-1 ring-white shrink-0"
            title={assignee?.full_name || 'Unassigned'}
          >
            {assignee?.avatar_url ? (
              <img src={assignee.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{assignee?.initials || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
