import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Filter,
  Plus,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { TaskListView } from '../components/tasks/TaskListView';
import { TaskKanbanView } from '../components/tasks/TaskKanbanView';
import { Task, TaskStatus } from '../types/database';

interface MyTasksPageProps {
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
}

export const MyTasksPage: React.FC<MyTasksPageProps> = ({
  onSelectTask,
  onOpenCreateTask,
}) => {
  const { currentUser, tasks, projects } = useAgencyData();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'in_review' | 'done'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Filter tasks assigned to current user (or all client tasks if client role)
  let myTasks = tasks.filter((t) => {
    if (currentUser.role === 'client') return true;
    return t.assignee_id === currentUser.id;
  });

  if (selectedProjectId !== 'all') {
    myTasks = myTasks.filter((t) => t.project_id === selectedProjectId);
  }

  if (searchFilter.trim()) {
    myTasks = myTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.task_number.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  // Filter by status tab
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  let filteredTasks = myTasks;
  if (activeTab === 'today') {
    filteredTasks = myTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d >= startOfToday && d <= endOfToday && t.status !== 'done';
    });
  } else if (activeTab === 'upcoming') {
    filteredTasks = myTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d > endOfToday && t.status !== 'done';
    });
  } else if (activeTab === 'in_review') {
    filteredTasks = myTasks.filter((t) => t.status === 'in_review');
  } else if (activeTab === 'done') {
    filteredTasks = myTasks.filter((t) => t.status === 'done');
  }

  const counts = {
    all: myTasks.length,
    today: myTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d >= startOfToday && d <= endOfToday && t.status !== 'done';
    }).length,
    upcoming: myTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d > endOfToday && t.status !== 'done';
    }).length,
    in_review: myTasks.filter((t) => t.status === 'in_review').length,
    done: myTasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header bar: Project Filter, Search, and View Mode Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search tasks or clients..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full h-[38px] pl-8 pr-3 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#182230] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#9DD52C]/40 transition-all"
          />
        </div>

        {/* Project Filter */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="h-[38px] px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#182230] font-medium focus:outline-none focus:border-[#0B1F3A]"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* View Switcher (List active vs Kanban) */}
        <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg p-0.5 shadow-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`h-7 px-2.5 rounded flex items-center gap-1 text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#182230]'
            }`}
          >
            <LayoutList size={14} />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`h-7 px-2.5 rounded flex items-center gap-1 text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#182230]'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Board</span>
          </button>
        </div>
      </div>

      {/* Horizontal Status Tab Pills (matching Stitch design Image_6_80fc6de8.html) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeTab === 'all'
              ? 'bg-[#0B1F3A] text-white font-semibold'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] font-mono opacity-80">{counts.all}</span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeTab === 'today'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          <span>Today</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#9DD52C] text-[#0B1F3A] text-[10px] font-bold">
            {counts.today}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[#0B1F3A] text-white font-semibold'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[10px] font-mono opacity-80">{counts.upcoming}</span>
        </button>

        <button
          onClick={() => setActiveTab('in_review')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeTab === 'in_review'
              ? 'bg-[#0B1F3A] text-white font-semibold'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          <span>In Review</span>
          <span className="text-[10px] font-mono opacity-80">{counts.in_review}</span>
        </button>

        <button
          onClick={() => setActiveTab('done')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all ${
            activeTab === 'done'
              ? 'bg-[#0B1F3A] text-white font-semibold'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          <span>Completed</span>
          <span className="text-[10px] font-mono opacity-80">{counts.done}</span>
        </button>
      </div>

      {/* Render View */}
      {viewMode === 'list' ? (
        <TaskListView tasks={filteredTasks} onSelectTask={onSelectTask} />
      ) : (
        <TaskKanbanView
          tasks={filteredTasks}
          onSelectTask={onSelectTask}
          onOpenCreateTask={onOpenCreateTask}
        />
      )}
    </div>
  );
};
