import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Plus,
  FileText,
  Image as ImageIcon,
  Table,
  Video,
  Download,
  Trash2,
  Clock,
  Send,
  Lock,
  Globe,
  Upload,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useAgencyData } from '../../hooks/useAgencyData';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const { profiles, clients, projects, currentUser } = useAgencyData();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskTag, setNewSubtaskTag] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loggedHours, setLoggedHours] = useState<number>(0);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState('1.0');

  useEffect(() => {
    if (taskId) {
      const t = dataService.getTaskById(taskId);
      if (t) {
        setTask(t);
        setTitleValue(t.title);
        setDescriptionValue(t.description || '');
        setLoggedHours(t.time_spent_hours || 0);
      } else {
        setTask(null);
      }
    }
  }, [taskId]);

  if (!taskId || !task) return null;

  const client = clients.find((c) => c.id === task.client_id);
  const project = projects.find((p) => p.id === task.project_id);
  const assignee = profiles.find((p) => p.id === task.assignee_id);
  const reviewer = profiles.find((p) => p.id === task.reviewer_id);

  const checklists = dataService.getChecklists(task.id);
  const comments = dataService.getComments(task.id);
  const attachments = dataService.getAttachments(task.id);

  const completedChecklistsCount = checklists.filter((c) => c.is_completed).length;
  const checklistPercentage =
    checklists.length > 0 ? Math.round((completedChecklistsCount / checklists.length) * 100) : 0;

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updated = dataService.updateTask(task.id, { status: newStatus });
    if (updated) setTask(updated);
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    const updated = dataService.updateTask(task.id, { priority: newPriority });
    if (updated) setTask(updated);
  };

  const handleAssigneeChange = (assigneeId: string) => {
    const updated = dataService.updateTask(task.id, { assignee_id: assigneeId });
    if (updated) setTask(updated);
  };

  const handleReviewerChange = (reviewerId: string) => {
    const updated = dataService.updateTask(task.id, { reviewer_id: reviewerId });
    if (updated) setTask(updated);
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      const updated = dataService.updateTask(task.id, { title: titleValue.trim() });
      if (updated) setTask(updated);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    const updated = dataService.updateTask(task.id, { description: descriptionValue });
    if (updated) setTask(updated);
    setIsEditingDesc(false);
  };

  const handleToggleChecklist = (id: string) => {
    dataService.toggleChecklist(id);
    setTask({ ...task });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    dataService.addChecklist(task.id, newSubtaskTitle.trim(), newSubtaskTag.trim() || undefined);
    setNewSubtaskTitle('');
    setNewSubtaskTag('');
    setShowAddSubtask(false);
    setTask({ ...task });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    dataService.addComment(task.id, newComment.trim(), isInternalComment);
    setNewComment('');
    setTask({ ...task });
  };

  const handleLogTime = () => {
    const val = parseFloat(hoursToAdd) || 0;
    const total = (task.time_spent_hours || 0) + val;
    dataService.updateTask(task.id, { time_spent_hours: total });
    setLoggedHours(total);
    setShowLogTimeModal(false);
  };

  const handleDeleteTask = () => {
    dataService.deleteTask(task.id);
    onClose();
  };

  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'high':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'low':
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B1F3A]/40 backdrop-blur-[3px] transition-opacity duration-200"
      />

      {/* Drawer Container (Desktop slide-over, Mobile bottom-sheet) */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200 border-l border-[#E5E7EB]">
        {/* Header */}
        <div className="px-5 pt-3.5 pb-3 border-b border-[#E5E7EB] bg-white flex-shrink-0">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-2 md:hidden"></div>

          <div className="flex items-center justify-between">
            {/* Task Breadcrumbs */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-xs font-semibold text-[#0B1F3A] bg-[#EFF3FF] px-2 py-0.5 rounded">
                Task #{task.task_number}
              </span>
              <span className="text-[#9CA3AF] text-xs">/</span>
              <span className="text-xs text-[#667085] truncate font-medium">
                {client?.company || 'Agency'} · {project?.name || 'General Project'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-[#667085]">
              {currentUser.role !== 'client' && (
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  title="Delete Task"
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F7F8FA] hover:text-[#0B1F3A] transition-colors ml-1"
                aria-label="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Delete confirmation bar */}
          {showDeleteConfirm && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between animate-in fade-in">
              <span className="text-xs text-rose-800 font-medium">Delete this task permanently?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-[#667085] hover:text-[#182230] px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
          {/* Status & Priority Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="appearance-none inline-flex items-center pl-3 pr-7 py-1 rounded-full bg-[#EFF3FF] border border-[#D6E3FF] text-[#0B1F3A] text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9DD52C]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#0B1F3A]">
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* Priority Selector */}
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className={`appearance-none inline-flex items-center pl-3 pr-7 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none ${getPriorityStyle(
                  task.priority
                )}`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* Sprint Tag */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[#667085] font-mono text-[11px]">
              {task.sprint || 'Sprint 42'}
            </span>

            {/* Client-visible badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                task.is_client_visible
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {task.is_client_visible ? (
                <>
                  <Globe size={10} /> Client Visible
                </>
              ) : (
                <>
                  <Lock size={10} /> Internal Only
                </>
              )}
            </span>
          </div>

          {/* Task Title */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-1.5">
                <textarea
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="w-full p-2 border border-[#0B1F3A] rounded-lg text-lg font-bold text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#9DD52C]/40 leading-snug"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="text-xs text-[#667085] hover:text-[#182230] px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTitle}
                    className="text-xs font-semibold bg-[#0B1F3A] text-white px-3 py-1 rounded hover:bg-[#18345C]"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <h2
                onClick={() => currentUser.role !== 'client' && setIsEditingTitle(true)}
                className={`text-xl font-bold text-[#0B1F3A] leading-snug tracking-tight ${
                  currentUser.role !== 'client' ? 'hover:text-[#18345C] cursor-pointer' : ''
                }`}
                title={currentUser.role !== 'client' ? 'Click to edit title' : ''}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* 2-Column Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]">
            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Assignee
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E5E7EB] bg-white flex-shrink-0">
                  {assignee?.avatar_url ? (
                    <img
                      src={assignee.avatar_url}
                      alt={assignee.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[10px] bg-[#EFF3FF] text-[#0B1F3A]">
                      {assignee?.initials || 'AM'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {currentUser.role === 'client' ? (
                    <p className="text-xs font-semibold text-[#0B1F3A] truncate">
                      {assignee?.full_name || 'Unassigned'}
                    </p>
                  ) : (
                    <select
                      value={task.assignee_id || ''}
                      onChange={(e) => handleAssigneeChange(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-[#0B1F3A] truncate border-0 p-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {profiles
                        .filter((p) => p.role !== 'client')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.title})
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="text-[10px] text-[#667085] truncate leading-none mt-0.5">
                    {assignee?.title || 'Team Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviewer */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Reviewer
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#9DD52C]/30 flex-shrink-0">
                  {reviewer?.avatar_url ? (
                    <img
                      src={reviewer.avatar_url}
                      alt={reviewer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[10px] bg-[#9DD52C] text-[#0B1F3A]">
                      {reviewer?.initials || 'JC'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {currentUser.role === 'client' ? (
                    <p className="text-xs font-semibold text-[#0B1F3A] truncate">
                      {reviewer?.full_name || 'Unassigned'}
                    </p>
                  ) : (
                    <select
                      value={task.reviewer_id || ''}
                      onChange={(e) => handleReviewerChange(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-[#0B1F3A] truncate border-0 p-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {profiles
                        .filter((p) => p.role !== 'client')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.title})
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="text-[10px] text-[#667085] truncate leading-none mt-0.5">
                    {reviewer?.title || 'Lead Reviewer'}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-2 h-[1px] bg-[#E5E7EB]"></div>

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Due Date
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#182230]">
                <Calendar size={14} className="text-rose-600 shrink-0" />
                <span className="font-mono text-[11px]">
                  {new Date(task.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  ·{' '}
                  {new Date(task.due_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Client & Project */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Client & Project
              </span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-sm bg-[#9DD52C] flex-shrink-0"></span>
                <span className="text-xs font-medium text-[#0B1F3A] truncate">
                  {client?.company || 'Apex'} · {project?.name || 'Q4 Peak Ads'}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Description
              </h4>
              {currentUser.role !== 'client' && !isEditingDesc && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="text-[11px] text-[#0B1F3A] hover:underline font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  className="w-full p-3 border border-[#E5E7EB] rounded-xl text-xs text-[#182230] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#9DD52C]"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="text-xs text-[#667085] px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="text-xs font-semibold bg-[#0B1F3A] text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#182230] leading-relaxed">
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-[#9CA3AF] italic">No description provided.</p>
                )}
              </div>
            )}
          </div>

          {/* Subtasks & Deliverables Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                  Subtasks & Deliverables
                </h4>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#EFF3FF] text-[#0B1F3A] font-semibold">
                  {completedChecklistsCount}/{checklists.length}
                </span>
              </div>
              <div className="w-16 h-1.5 bg-[#EFF3FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9DD52C] transition-all duration-300"
                  style={{ width: `${checklistPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5">
              {checklists.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    item.is_completed
                      ? 'border-[#E5E7EB] bg-[#F7F8FA]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#0B1F3A]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-[#0B1F3A] focus:ring-0 cursor-pointer accent-[#0B1F3A]"
                  />
                  <span
                    className={`flex-1 text-xs select-none ${
                      item.is_completed
                        ? 'line-through text-[#9CA3AF]'
                        : 'text-[#182230] font-medium'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.tag && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EFF3FF] text-[#0B1F3A] border border-[#D6E3FF]">
                      {item.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            {currentUser.role !== 'client' && (
              <>
                {showAddSubtask ? (
                  <form onSubmit={handleAddSubtask} className="p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg space-y-2">
                    <input
                      type="text"
                      placeholder="Subtask or deliverable name..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#0B1F3A]"
                      autoFocus
                    />
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Tag (e.g. 3.8x or $1k)"
                        value={newSubtaskTag}
                        onChange={(e) => setNewSubtaskTag(e.target.value)}
                        className="w-32 text-xs p-1.5 bg-white border border-[#E5E7EB] rounded font-mono"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddSubtask(false)}
                          className="text-xs text-[#667085] px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs font-semibold bg-[#0B1F3A] text-white px-3 py-1 rounded"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddSubtask(true)}
                    className="inline-flex items-center gap-1.5 text-[#0B1F3A] hover:text-[#18345C] text-xs font-semibold pt-0.5"
                  >
                    <Plus size={14} />
                    <span>Add subtask</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Attachments ({attachments.length})
              </h4>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#0B1F3A] transition-colors flex-shrink-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3FF] flex items-center justify-center text-[#0B1F3A]">
                    {att.file_type.includes('image') ? (
                      <ImageIcon size={15} />
                    ) : att.file_type.includes('video') ? (
                      <Video size={15} />
                    ) : (
                      <Table size={15} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#0B1F3A] truncate max-w-[120px]">
                      {att.file_name}
                    </p>
                    <p className="font-mono text-[10px] text-[#9CA3AF]">
                      {(att.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9CA3AF] hover:text-[#0B1F3A] p-1 ml-1"
                    title="Open or Download"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))}

              {currentUser.role !== 'client' && (
                <button
                  onClick={() => {
                    const sampleName = prompt('Enter asset filename:', 'Campaign_Mockup_v3.png');
                    if (sampleName) {
                      dataService.addAttachment({
                        task_id: task.id,
                        project_id: task.project_id,
                        client_id: task.client_id,
                        file_name: sampleName,
                        file_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
                        file_size_bytes: 1845000,
                        file_type: 'image/png',
                        is_deliverable: true,
                        is_client_visible: true,
                      });
                      setTask({ ...task });
                    }
                  }}
                  className="w-10 h-11 flex items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] hover:border-[#0B1F3A] text-[#9CA3AF] hover:text-[#0B1F3A] flex-shrink-0 transition-colors"
                  title="Upload attachment"
                >
                  <Upload size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Activity & Internal Comment Feed */}
          <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Activity & Discussion
              </h4>
              <span className="text-[10px] text-[#667085] bg-[#F7F8FA] border border-[#E5E7EB] px-2 py-0.5 rounded-full font-mono">
                {currentUser.role === 'client' ? 'Client Discussion' : 'Internal Agency Feed'}
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-2">
              {comments.map((comm) => {
                const author = profiles.find((p) => p.id === comm.author_id);
                return (
                  <div
                    key={comm.id}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E5E7EB] bg-white flex-shrink-0">
                      {author?.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#EFF3FF] text-[#0B1F3A]">
                          {author?.initials || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0B1F3A]">
                          {author?.full_name || 'Team Member'}
                        </span>
                        <span className="font-mono text-[10px] text-[#9CA3AF]">
                          {new Date(comm.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#182230] mt-1 leading-relaxed">{comm.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Comment Input */}
            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 p-1.5 pl-3 bg-white border border-[#E5E7EB] rounded-full focus-within:border-[#0B1F3A] focus-within:ring-2 focus-within:ring-[#9DD52C]/30 transition-all shadow-xs"
            >
              <input
                type="text"
                placeholder={
                  currentUser.role === 'client'
                    ? 'Add feedback for the agency team...'
                    : 'Add an internal comment...'
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-transparent border-0 p-0 text-xs text-[#182230] placeholder:text-[#9CA3AF] focus:ring-0"
              />
              <button
                type="submit"
                className="w-7 h-7 rounded-full bg-[#9DD52C] text-[#0B1F3A] flex items-center justify-center font-bold hover:brightness-105 active:scale-95 transition-all shrink-0"
                aria-label="Send comment"
              >
                <Send size={13} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Docked Action Bar */}
        <div className="p-3.5 bg-white border-t border-[#E5E7EB] flex items-center gap-3 flex-shrink-0">
          {/* Secondary CTA: Log Time */}
          <button
            onClick={() => setShowLogTimeModal(true)}
            className="px-3.5 h-11 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-[#182230] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#EFF3FF] active:scale-95 transition-all"
          >
            <Clock size={16} className="text-[#667085]" />
            <span>
              {loggedHours > 0 ? `${loggedHours.toFixed(1)}h logged` : 'Log Time'}
            </span>
          </button>

          {/* Primary Milestone CTA: 'Mark Complete' */}
          <button
            onClick={() => {
              const nextStatus = task.status === 'done' ? 'in_progress' : 'done';
              handleStatusChange(nextStatus);
            }}
            className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs ${
              task.status === 'done'
                ? 'bg-[#EFF3FF] text-[#0B1F3A] border border-[#D6E3FF] hover:bg-[#DFE9FC]'
                : 'bg-[#9DD52C] text-[#0B1F3A] hover:bg-[#8EC526]'
            }`}
          >
            <CheckCircle2 size={18} strokeWidth={2.4} />
            <span>{task.status === 'done' ? 'Reopen Task' : 'Mark Complete'}</span>
          </button>
        </div>

        {/* Log Time Modal */}
        {showLogTimeModal && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 w-72 shadow-2xl space-y-3">
              <h4 className="text-sm font-bold text-[#0B1F3A]">Log Hours Spent</h4>
              <p className="text-xs text-[#667085]">
                Currently logged: {loggedHours.toFixed(1)} hours
              </p>
              <input
                type="number"
                step="0.5"
                min="0.25"
                value={hoursToAdd}
                onChange={(e) => setHoursToAdd(e.target.value)}
                className="w-full text-sm p-2 border border-[#E5E7EB] rounded-lg font-mono focus:border-[#0B1F3A]"
                placeholder="Hours (e.g. 1.5)"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowLogTimeModal(false)}
                  className="text-xs text-[#667085] px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogTime}
                  className="text-xs font-bold bg-[#0B1F3A] text-white px-3 py-1.5 rounded-lg"
                >
                  Save Time
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
