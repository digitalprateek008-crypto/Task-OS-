import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
}) => {
  const { clients, profiles } = useAgencyData();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id ?? ''));
  const [description, setDescription] = useState('');
  const [projectManagerId, setProjectManagerId] = useState(
    profiles.find((p) => p.role === 'project_manager')?.id || profiles[0]?.id || ''
  );
  const [budget, setBudget] = useState('35000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !clientId) return;

    dataService.createProject({
      name: name.trim(),
      code: code.trim(),
      client_id: clientId,
      description: description.trim(),
      project_manager_id: projectManagerId,
      budget: parseFloat(budget) || 20000,
      start_date: startDate,
      due_date: dueDate,
      team_member_ids: [projectManagerId, profiles[0]?.id, profiles[1]?.id].filter(Boolean),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/40 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9DD52C]"></span>
            <h3 className="font-bold text-sm text-[#0B1F3A]">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FA]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Peak Ads & Scaling"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(
                      e.target.value
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase() + '-26'
                    );
                  }
                }}
                className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="APEX-Q4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
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
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Project Manager</label>
              <select
                value={projectManagerId}
                onChange={(e) => setProjectManagerId(e.target.value)}
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Budget ($)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Project goals, deliverable scopes, KPIs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
