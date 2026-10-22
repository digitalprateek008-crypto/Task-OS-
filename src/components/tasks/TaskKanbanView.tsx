import React, { useState } from 'react';
import { Plus, ArrowLeft, ArrowRight, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Task, TaskStatus } from '../../types/database';
import { TaskCard } from './TaskCard';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';

interface TaskKanbanViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: <Clock size={14} />, color: 'text-[#667085]' },
  { id: 'in_progress', label: 'In Progress', icon: <RefreshCw size={14} />, color: 'text-blue-600' },
  { id: 'in_review', label: 'In Review', icon: <Clock size={14} />, color: 'text-amber-600' },
  { id: 'done', label: 'Done', icon: <CheckCircle size={14} />, color: 'text-emerald-600' },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onSelectTask,
  onOpenCreateTask,
}) => {
  const { currentUser } = useAgencyData();
  const [activeMobileColumn, setActiveMobileColumn] = useState<TaskStatus>('in_progress');

  const getTasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const activeMobileIndex = COLUMNS.findIndex((c) => c.id === activeMobileColumn);
  const prevColumn = activeMobileIndex > 0 ? COLUMNS[activeMobileIndex - 1] : null;
  const nextColumn = activeMobileIndex < COLUMNS.length - 1 ? COLUMNS[activeMobileIndex + 1] : null;

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Mobile Column Navigation Tabs */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 border-b border-[#E5E7EB] bg-white sticky top-14 z-20">
        {COLUMNS.map((col) => {
          const count = getTasksByStatus(col.id).length;
          const isActive = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColumn(col.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#0B1F3A] text-white shadow-xs font-semibold'
                  : 'text-[#667085] hover:bg-[#F7F8FA]'
              }`}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#9DD52C]"></span>}
              <span>{col.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#18345C] text-[#9DD52C]' : 'bg-[#EFF3FF] text-[#0B1F3A]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Multi-Column Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 items-start pt-3">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div
              key={col.id}
              className="bg-[#F7F8FA] rounded-2xl p-3 border border-[#E5E7EB] flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  <span className={col.color}>{col.icon}</span>
                  <span className="text-xs font-bold text-[#0B1F3A]">{col.label}</span>
                  <span className="text-[11px] font-mono bg-white text-[#667085] px-1.5 py-0.2 rounded-full border border-[#E5E7EB]">
                    {colTasks.length}
                  </span>
                </div>

                {currentUser.role !== 'client' && (
                  <button
                    onClick={() => onOpenCreateTask(col.id)}
                    className="p-1 rounded-md text-[#667085] hover:text-[#0B1F3A] hover:bg-white transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus size={15} />
                  </button>
                )}
              </div>

              {/* Task Cards Stack */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-230px)] custom-scrollbar pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-[#D1D5DB] rounded-xl flex items-center justify-center text-xs text-[#9CA3AF]">
                    No tasks in {col.label}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onSelectTask(task.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Single Column View */}
      <div className="md:hidden flex flex-col gap-3 pt-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-1.5">
              <span>{COLUMNS.find((c) => c.id === activeMobileColumn)?.label}</span>
              <span className="text-[#667085] text-xs font-normal">
                ({getTasksByStatus(activeMobileColumn).length})
              </span>
            </h2>
          </div>
          {currentUser.role !== 'client' && (
            <button
              onClick={() => onOpenCreateTask(activeMobileColumn)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0B1F3A] hover:text-[#18345C] py-1 px-2 rounded-lg bg-white border border-[#E5E7EB]"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {getTasksByStatus(activeMobileColumn).length === 0 ? (
            <div className="p-8 bg-white border border-dashed border-[#D1D5DB] rounded-xl text-center text-xs text-[#9CA3AF]">
              No tasks in this column
            </div>
          ) : (
            getTasksByStatus(activeMobileColumn).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onSelectTask(task.id)}
              />
            ))
          )}
        </div>

        {/* Floating Quick Column Switcher Pill Bar (matches Stitch design Image_8_240b8f3a.html) */}
        <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center justify-between w-full max-w-sm h-11 px-3 bg-[#0B1F3A] text-white rounded-full shadow-[0_10px_25px_-5px_rgba(11,31,58,0.25)] border border-[#1A3355] backdrop-blur">
            {prevColumn ? (
              <button
                onClick={() => setActiveMobileColumn(prevColumn.id)}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-white/10 active:scale-95 text-xs text-white"
              >
                <ArrowLeft size={14} />
                <span className="font-medium">{prevColumn.label}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                  {getTasksByStatus(prevColumn.id).length}
                </span>
              </button>
            ) : (
              <div />
            )}

            <span className="w-px h-4 bg-white/20"></span>

            {nextColumn ? (
              <button
                onClick={() => setActiveMobileColumn(nextColumn.id)}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-white/10 active:scale-95 text-xs text-white"
              >
                <span className="font-medium">{nextColumn.label}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                  {getTasksByStatus(nextColumn.id).length}
                </span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
