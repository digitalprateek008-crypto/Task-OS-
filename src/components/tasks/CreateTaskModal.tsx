import React, { useState } from 'react';
import { X, Calendar, User, Building, Folder, AlertCircle } from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';
import { TaskPriority, TaskStatus } from '../../types/database';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultClientId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultClientId,
}) => {
  const { clients, projects, profiles } = useAgencyData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id ?? ''));
  const [projectId, setProjectId] = useState(
    defaultProjectId || (projects.find((p) => p.client_id === (defaultClientId || clients[0]?.id))?.id ?? projects[0]?.id ?? '')
  );
  const [assigneeId, setAssigneeId] = useState(profiles[0]?.id || '');
  const [reviewerId, setReviewerId] = useState(profiles[1]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [isClientVisible, setIsClientVisible] = useState(true);

  if (!isOpen) return null;

  // Filter projects for selected client
  const availableProjects = projects.filter((p) => p.client_id === clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || !clientId) return;

    dataService.createTask({
      title: title.trim(),
      description: description.trim(),
      client_id: clientId,
      project_id: projectId,
      assignee_id: assigneeId || undefined,
      reviewer_id: reviewerId || undefined,
      priority,
      status,
      due_date: new Date(dueDate).toISOString(),
      is_client_visible: isClientVisible,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/40 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9DD52C]"></span>
            <h3 className="font-bold text-sm text-[#0B1F3A]">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FA]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scale Advantage+ Shopping Campaign budget"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#9DD52C]/30 text-[#182230]"
              autoFocus
            />
          </div>

          {/* Client & Project Select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  const firstProj = projects.find((p) => p.client_id === e.target.value);
                  if (firstProj) setProjectId(firstProj.id);
                }}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                {availableProjects.length > 0 ? (
                  availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <option value="">No active projects for client</option>
                )}
              </select>
            </div>
          </div>

          {/* Assignee & Reviewer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                {profiles
                  .filter((p) => p.role !== 'client')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.title})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Reviewer</label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                {profiles
                  .filter((p) => p.role !== 'client')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.title})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Due Date & Time</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Description / Deliverable Brief
            </label>
            <textarea
              rows={3}
              placeholder="Outline deliverables, ROAS targets, copy specifications, or creative references..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A] text-[#182230]"
            />
          </div>

          {/* Client Visible checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_client_visible"
              checked={isClientVisible}
              onChange={(e) => setIsClientVisible(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B1F3A] accent-[#0B1F3A] cursor-pointer"
            />
            <label htmlFor="is_client_visible" className="text-xs text-[#182230] font-medium cursor-pointer">
              Visible to Client in Client Portal
            </label>
          </div>

          {/* Footer CTAs */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#F7F8FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] shadow-xs active:scale-95 transition-all"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
