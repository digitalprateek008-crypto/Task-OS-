import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Palette,
  Award,
  Bell,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { Task, TaskPriority } from '../types/database';
import { dataService } from '../services/dataService';

interface DashboardPageProps {
  onSelectTask: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onOpenCreateTask: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTask,
  onNavigateToTasks,
  onOpenCreateTask,
}) => {
  const { currentUser, stats, tasks, clients, projects, profiles, activities } = useAgencyData();

  // Due today tasks
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dueTodayTasks = tasks.filter((t) => {
    const d = new Date(t.due_date);
    return d >= startOfToday && d <= endOfToday;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleCheck = (e: React.MouseEvent, taskId: string, currentStatus: string) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    dataService.updateTask(taskId, { status: nextStatus });
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
          <span className="px-2 py-0.5 rounded-full bg-[#EFF3FF] text-[#0B1F3A] text-[10px] font-bold shrink-0">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#F7F8FA] text-[#667085] text-[10px] font-medium shrink-0">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#F7F8FA] text-[#9CA3AF] text-[10px] font-medium shrink-0">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* 1. Warm Personal Greeting Section (Stitch Anchor) */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EFF3FF] text-[#0B1F3A] font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DD52C] animate-pulse"></span>
            Sprint W43
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] tracking-tight flex items-center gap-2">
          {getGreeting()}, {currentUser.full_name.split(' ')[0]} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs text-[#667085]">
          {currentUser.title} ·{' '}
          <span className="font-semibold text-[#0B1F3A]">
            {dueTodayTasks.length} tasks scheduled today
          </span>
        </p>
      </section>

      {/* 2. Operational Summary Cards (2x2 Grid matching Stitch design Image_4_6f81a1e2.html) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* In Progress */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              In Progress
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0B1F3A]"></span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#0B1F3A] leading-none font-mono">
              {stats.inProgress}
            </span>
            <span className="text-xs text-[#667085]">Active</span>
          </div>
        </div>

        {/* Due Today */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#9DD52C]/20 rounded-full blur-sm"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Due Today
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#9DD52C] text-[#0B1F3A] text-[10px] font-bold">
              Priority
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between relative z-10">
            <span className="text-3xl font-extrabold text-[#0B1F3A] leading-none font-mono">
              {stats.dueToday}
            </span>
            <span className="text-xs font-semibold text-[#486800]">Ready</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Overdue
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
              Action Req.
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600 leading-none font-mono">
              {stats.overdue}
            </span>
            <span className="text-xs text-[#667085]">Pending</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle size={16} className="text-[#9CA3AF]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#667085] leading-none font-mono">
              {stats.completed}
            </span>
            <span className="text-xs text-[#9CA3AF]">This sprint</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Priority Tasks Due Today (Left) + Pulse & Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols on desktop): Tasks Due Today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0B1F3A]">Tasks Due Today</h2>
              <span className="w-5 h-5 rounded-full bg-[#EFF3FF] flex items-center justify-center text-[#0B1F3A] text-xs font-bold font-mono">
                {dueTodayTasks.length}
              </span>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-semibold text-[#0B1F3A] hover:text-[#18345C] flex items-center transition-colors"
            >
              <span>View all ({tasks.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {dueTodayTasks.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-[#E5E7EB] text-center text-xs text-[#667085]">
                No tasks due today. You can create a new task or review upcoming milestones.
              </div>
            ) : (
              dueTodayTasks.slice(0, 4).map((task) => {
                const client = clients.find((c) => c.id === task.client_id);
                const project = projects.find((p) => p.id === task.project_id);
                const assignee = profiles.find((p) => p.id === task.assignee_id);
                const isChecked = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] hover:border-[#9DD52C] transition-all flex flex-col gap-2.5 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          onClick={(e) => handleToggleCheck(e, task.id, task.status)}
                          className={`mt-0.5 w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white'
                              : task.priority === 'urgent'
                              ? 'border-rose-500 text-rose-500'
                              : 'border-[#D1D5DB] hover:border-[#0B1F3A]'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3
                            className={`text-xs font-semibold text-[#0B1F3A] leading-tight group-hover:text-[#18345C] truncate ${
                              isChecked ? 'line-through text-[#9CA3AF]' : ''
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span className="text-[11px] text-[#667085] mt-0.5 truncate">
                            {client?.company || 'Agency'} / {project?.name || 'General'}
                          </span>
                        </div>
                      </div>
                      {getPriorityChip(task.priority)}
                    </div>

                    <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#667085]">
                        <Clock
                          size={13}
                          className={task.priority === 'urgent' ? 'text-rose-600' : 'text-[#9CA3AF]'}
                        />
                        <span
                          className={`font-mono text-[11px] ${
                            task.priority === 'urgent' ? 'font-semibold text-rose-700' : ''
                          }`}
                        >
                          Due {new Date(task.due_date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                          {assignee?.initials || 'U'}
                        </div>
                        <span className="text-[#667085] text-xs font-medium">
                          {assignee?.full_name ? assignee.full_name.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Workload Pulse & Recent Activity */}
        <div className="space-y-4">
          {/* Team Workload & Agency Pulse */}
          <section className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#0B1F3A]">Team Workload & Agency Pulse</h2>
                <p className="text-[11px] text-[#667085]">Live cross-department capacity</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F7F8FA] border border-[#E5E7EB]">
                <span className="w-2 h-2 rounded-full bg-[#9DD52C]"></span>
                <span className="text-[11px] font-semibold text-[#0B1F3A] font-mono">12 of 15 active</span>
              </div>
            </div>

            {/* Department Progress Gauges */}
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Creative Track */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#182230] font-medium">Creative Studio</span>
                  <span className="font-mono text-rose-600 font-semibold text-[11px]">92% cap</span>
                </div>
                <div className="w-full h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Media Buying Track */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#182230] font-medium">Media Buying</span>
                  <span className="font-mono text-[#0B1F3A] font-semibold text-[11px]">78% cap</span>
                </div>
                <div className="w-full h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B1F3A] rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* SEO / Content Track */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#182230] font-medium">Organic & SEO</span>
                  <span className="font-mono text-[#486800] font-semibold text-[11px]">65% cap</span>
                </div>
                <div className="w-full h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9DD52C] rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Agency Activity */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#0B1F3A]">Recent Agency Activity</h2>
              <span className="text-[11px] text-[#9CA3AF] font-mono">Real-time</span>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#F3F4F6] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] overflow-hidden">
              {activities.slice(0, 3).map((act) => {
                const user = profiles.find((p) => p.id === act.user_id);
                return (
                  <div
                    key={act.id}
                    className="p-3 flex items-start gap-2.5 hover:bg-[#F7F8FA] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#EFF3FF] flex items-center justify-center shrink-0 mt-0.5 text-[#0B1F3A]">
                      {act.action === 'uploaded_deliverable' ? (
                        <Palette size={12} />
                      ) : act.action === 'approved_deliverable' ? (
                        <Award size={12} className="text-[#486800]" />
                      ) : (
                        <Bell size={12} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0B1F3A]">
                          {user?.full_name || 'Team Member'}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] font-mono">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] leading-snug truncate">
                        {act.target_title}
                      </p>
                      {Boolean(act.metadata?.label) && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#EFF3FF] text-[#0B1F3A] text-[9px] font-semibold">
                            {String(act.metadata?.label)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
