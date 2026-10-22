import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types/database';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';

interface TaskListViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onSelectTask }) => {
  const { clients, projects, profiles } = useAgencyData();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isUpcomingCollapsed, setIsUpcomingCollapsed] = useState(false);
  const [sortByDueTime, setSortByDueTime] = useState(true);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Split into Due Today vs Upcoming/Other
  let dueTodayTasks = tasks.filter((t) => {
    const d = new Date(t.due_date);
    return d >= startOfToday && d <= endOfToday;
  });

  let upcomingTasks = tasks.filter((t) => {
    const d = new Date(t.due_date);
    return d > endOfToday || d < startOfToday;
  });

  if (sortByDueTime) {
    dueTodayTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    upcomingTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  const handleToggleCheck = (e: React.MouseEvent, taskId: string, currentStatus: string) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    dataService.updateTask(taskId, { status: nextStatus });
  };

  const handleSelectRow = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleBulkMarkDone = () => {
    selectedTaskIds.forEach((id) => {
      dataService.updateTask(id, { status: 'done' });
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDefer = () => {
    selectedTaskIds.forEach((id) => {
      const task = dataService.getTaskById(id);
      if (task) {
        const d = new Date(task.due_date);
        d.setDate(d.getDate() + 1);
        dataService.updateTask(id, { due_date: d.toISOString() });
      }
    });
    setSelectedTaskIds([]);
  };

  const getPriorityChip = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold tracking-wider shrink-0 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-bold tracking-wider shrink-0 uppercase">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60 text-[10px] font-bold tracking-wider shrink-0 uppercase">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold tracking-wider shrink-0 uppercase">
            Low
          </span>
        );
    }
  };

  const formatTaskTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* SECTION: DUE TODAY */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DD52C]"></span>
            <h2 className="text-sm font-bold text-[#0B1F3A] tracking-tight">Due Today</h2>
            <span className="text-xs text-[#667085] font-mono">({dueTodayTasks.length})</span>
          </div>

          <button
            onClick={() => setSortByDueTime(!sortByDueTime)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#667085] hover:text-[#0B1F3A] transition-colors"
          >
            <span>Sort: Due time</span>
            <ArrowUpDown size={12} />
          </button>
        </div>

        {dueTodayTasks.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] text-center text-xs text-[#667085]">
            No pending tasks due today. All caught up!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dueTodayTasks.map((task) => {
              const client = clients.find((c) => c.id === task.client_id);
              const project = projects.find((p) => p.id === task.project_id);
              const assignee = profiles.find((p) => p.id === task.assignee_id);
              const isChecked = task.status === 'done';
              const isSelected = selectedTaskIds.includes(task.id);

              return (
                <article
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`relative flex items-start gap-3 p-3 bg-white rounded-xl border transition-all cursor-pointer group shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] ${
                    isChecked
                      ? 'bg-slate-50 border-[#E5E7EB] opacity-75'
                      : task.priority === 'urgent'
                      ? 'border-rose-200/90 hover:border-rose-400'
                      : 'border-[#E5E7EB] hover:border-[#0B1F3A]'
                  } ${isSelected ? 'ring-2 ring-[#0B1F3A]' : ''}`}
                >
                  {/* Custom Checkbox */}
                  <div
                    onClick={(e) => handleToggleCheck(e, task.id, task.status)}
                    className={`mt-0.5 w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isChecked
                        ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white'
                        : 'border-[#D1D5DB] hover:border-[#0B1F3A]'
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          isChecked ? 'line-through text-[#9CA3AF]' : 'text-[#182230] group-hover:text-[#0B1F3A]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {getPriorityChip(task.priority)}
                    </div>

                    <p className="text-[11px] text-[#667085] flex items-center gap-1.5 truncate">
                      <span className="font-medium text-[#0B1F3A]">{client?.company || 'Agency'}</span>
                      <span className="text-[#D1D5DB]">·</span>
                      <span className="truncate">{project?.name || 'General Project'}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#F3F4F6] mt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                        <Clock
                          size={12}
                          className={task.priority === 'urgent' ? 'text-rose-600' : 'text-[#9CA3AF]'}
                        />
                        <span
                          className={`font-mono ${
                            task.priority === 'urgent' ? 'font-semibold text-rose-700' : ''
                          }`}
                        >
                          {formatTaskTime(task.due_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleSelectRow(e, task.id)}
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected
                              ? 'bg-[#0B1F3A] text-white'
                              : 'text-[#9CA3AF] hover:text-[#0B1F3A]'
                          }`}
                          title="Select for batch action"
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                        <div
                          className="w-5 h-5 rounded-full bg-[#EFF3FF] text-[#0B1F3A] text-[10px] font-bold flex items-center justify-center font-mono ring-1 ring-white"
                          title={assignee?.full_name || 'Unassigned'}
                        >
                          {assignee?.initials || 'AM'}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: UPCOMING / ALL OTHER */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
            <h2 className="text-sm font-bold text-[#0B1F3A] tracking-tight">Upcoming This Week</h2>
            <span className="text-xs text-[#667085] font-mono">({upcomingTasks.length})</span>
          </div>

          <button
            onClick={() => setIsUpcomingCollapsed(!isUpcomingCollapsed)}
            className="text-[#667085] hover:text-[#0B1F3A] transition-colors p-1"
          >
            {isUpcomingCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {!isUpcomingCollapsed && (
          <div className="flex flex-col bg-white rounded-xl border border-[#E5E7EB] overflow-hidden divide-y divide-[#F3F4F6] shadow-[0_1px_3px_0_rgba(11,31,58,0.02)]">
            {upcomingTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#667085]">No upcoming tasks</div>
            ) : (
              upcomingTasks.map((task) => {
                const client = clients.find((c) => c.id === task.client_id);
                const assignee = profiles.find((p) => p.id === task.assignee_id);
                const isChecked = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="flex items-center justify-between p-3 hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        onClick={(e) => handleToggleCheck(e, task.id, task.status)}
                        className={`w-4 h-4 rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer ${
                          isChecked
                            ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white'
                            : 'border-[#D1D5DB] hover:border-[#0B1F3A]'
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>

                      <div className="truncate">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isChecked ? 'line-through text-[#9CA3AF]' : 'text-[#182230] group-hover:text-[#0B1F3A]'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[11px] text-[#667085] truncate font-mono">
                          {client?.company || 'Agency'} · {formatTaskTime(task.due_date)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getPriorityChip(task.priority)}
                      <div className="w-5 h-5 rounded-full bg-[#EFF3FF] text-[#0B1F3A] text-[10px] font-bold flex items-center justify-center font-mono ring-1 ring-white">
                        {assignee?.initials || 'U'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Floating Quick Action Dock (matches Stitch design Image_6_80fc6de8.html) */}
      {selectedTaskIds.length > 0 && (
        <aside className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0B1F3A] text-white rounded-xl shadow-2xl border border-[#1A3355] animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DD52C] animate-pulse"></span>
            <span className="text-xs font-semibold text-white">{selectedTaskIds.length} selected</span>
            <span className="text-[#8EA3C2]">·</span>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-[#C5D5EB] text-xs hover:text-white underline"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDefer}
              className="h-7 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
            >
              <Clock size={12} />
              <span>Defer +1d</span>
            </button>
            <button
              onClick={handleBulkMarkDone}
              className="h-7 px-2.5 bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <CheckCheck size={13} strokeWidth={2.5} />
              <span>Mark Done</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
