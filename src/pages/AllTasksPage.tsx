import React, { useState } from 'react';
import {
  Search,
  LayoutList,
  LayoutGrid,
  Filter,
  Plus,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { TaskListView } from '../components/tasks/TaskListView';
import { TaskKanbanView } from '../components/tasks/TaskKanbanView';
import { TaskStatus, TaskPriority } from '../types/database';

interface AllTasksPageProps {
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
}

export const AllTasksPage: React.FC<AllTasksPageProps> = ({
  onSelectTask,
  onOpenCreateTask,
}) => {
  const { tasks, projects, clients, profiles, currentUser } = useAgencyData();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  let filteredTasks = [...tasks];

  if (search.trim()) {
    filteredTasks = filteredTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.task_number.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (clientFilter !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.client_id === clientFilter);
  }

  if (projectFilter !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.project_id === projectFilter);
  }

  if (priorityFilter !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.priority === priorityFilter);
  }

  if (assigneeFilter !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.assignee_id === assigneeFilter);
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search all tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg text-[#182230] focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`h-7 px-2.5 rounded flex items-center gap-1 text-xs font-semibold ${
                  viewMode === 'list' ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-[#667085]'
                }`}
              >
                <LayoutList size={13} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`h-7 px-2.5 rounded flex items-center gap-1 text-xs font-semibold ${
                  viewMode === 'board' ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-[#667085]'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Board</span>
              </button>
            </div>

            {currentUser.role !== 'client' && (
              <button
                onClick={() => onOpenCreateTask()}
                className="h-8 px-3 rounded-lg bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#F3F4F6]">
          {/* Client filter */}
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setProjectFilter('all');
            }}
            className="text-xs h-7 px-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded text-[#667085] focus:outline-none"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs h-7 px-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded text-[#667085] focus:outline-none"
          >
            <option value="all">All Projects</option>
            {(clientFilter === 'all'
              ? projects
              : projects.filter((p) => p.client_id === clientFilter)
            ).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs h-7 px-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded text-[#667085] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs h-7 px-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded text-[#667085] focus:outline-none"
          >
            <option value="all">All Assignees</option>
            {profiles
              .filter((p) => p.role !== 'client')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
          </select>

          {(clientFilter !== 'all' ||
            projectFilter !== 'all' ||
            priorityFilter !== 'all' ||
            assigneeFilter !== 'all') && (
            <button
              onClick={() => {
                setClientFilter('all');
                setProjectFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
              }}
              className="text-xs text-[#0B1F3A] hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
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
