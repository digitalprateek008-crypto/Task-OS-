import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Mail,
  Phone,
  Globe,
  DollarSign,
  User,
  ArrowRight,
  Folder,
  CheckCircle2,
  Edit2,
  Archive,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { dataService } from '../services/dataService';
import { CreateClientModal } from '../components/modals/CreateClientModal';
import { Client } from '../types/database';

interface ClientsPageProps {
  onSelectTask: (taskId: string) => void;
  onOpenWorkspace?: (clientId: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ onSelectTask, onOpenWorkspace }) => {
  const { clients, projects, tasks, profiles, currentUser, approvals } = useAgencyData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeClients = clients.filter(
    (c) =>
      c.status !== 'archived' &&
      (c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.services.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  const clientProjects = selectedClient
    ? projects.filter((p) => p.client_id === selectedClient.id)
    : [];

  const clientTasks = selectedClient
    ? tasks.filter((t) => t.client_id === selectedClient.id)
    : [];

  const clientApprovals = selectedClient
    ? approvals.filter((a) => a.client_id === selectedClient.id)
    : [];

  const handleArchive = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Archive this client?')) {
      dataService.archiveClient(clientId);
    }
  };

  const handleEdit = (c: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToEdit(c);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Client Accounts</h1>
          <p className="text-xs text-[#667085]">
            Manage brand partnerships, retainers, and client portal permissions
          </p>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => {
              setClientToEdit(null);
              setIsModalOpen(true);
            }}
            className="h-8 px-3 rounded-lg bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>New Client</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Filter clients by brand, contact, or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-8 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#182230] focus:outline-none focus:border-[#0B1F3A]"
        />
      </div>

      {/* Client Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeClients.map((client) => {
          const am = profiles.find((p) => p.id === client.account_manager_id);
          const pCount = projects.filter((p) => p.client_id === client.id).length;
          const tCount = tasks.filter((t) => t.client_id === client.id).length;
          const isSelected = selectedClientId === client.id;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(isSelected ? null : client.id)}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] ${
                isSelected ? 'border-[#0B1F3A] ring-2 ring-[#0B1F3A]' : 'border-[#E5E7EB] hover:border-[#0B1F3A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9DD52C]"></span>
                  <div className="flex items-center gap-1">
                    {currentUser.role !== 'client' && (
                      <>
                        <button
                          onClick={(e) => handleEdit(client, e)}
                          title="Edit client"
                          className="text-[#9CA3AF] hover:text-[#0B1F3A] p-1"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleArchive(client.id, e)}
                          title="Archive client"
                          className="text-[#9CA3AF] hover:text-rose-600 p-1"
                        >
                          <Archive size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#0B1F3A] mb-0.5">{client.company}</h3>
                <p className="text-xs text-[#667085] mb-2">{client.name}</p>

                {/* Contact metadata */}
                <div className="space-y-1 text-xs text-[#667085] mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{client.contact_email}</span>
                  </div>
                  {client.website && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe size={12} className="text-[#9CA3AF] shrink-0" />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="truncate text-[#0B1F3A] hover:underline"
                      >
                        {client.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Services Pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {client.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[10px] font-medium text-[#0B1F3A]"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#0B1F3A]">
                  ${(client.monthly_budget / 1000).toFixed(0)}k/mo
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#667085] text-[11px]">
                    {pCount}p · {tCount}t
                  </span>
                  {onOpenWorkspace && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWorkspace(client.id);
                      }}
                      className="px-2 py-0.5 rounded bg-[#0B1F3A] hover:bg-[#122b4e] text-white text-[10px] font-semibold flex items-center gap-1 transition"
                    >
                      Workspace <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Client Detailed Profile View */}
      {selectedClient && (
        <section className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">
                {selectedClient.company} Client Profile & Deliverables
              </h3>
              <p className="text-xs text-[#667085]">
                Contact: {selectedClient.name} ({selectedClient.contact_email}) · Retainer: ${selectedClient.monthly_budget.toLocaleString()}/mo
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onOpenWorkspace && (
                <button
                  onClick={() => onOpenWorkspace(selectedClient.id)}
                  className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>Open Full Client Workspace (12 Tabs)</span>
                  <ArrowRight size={14} className="text-[#9DD52C]" />
                </button>
              )}
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                Active Client
              </span>
            </div>
          </div>

          {/* Client Projects List */}
          <div>
            <h4 className="text-xs font-bold text-[#0B1F3A] mb-2 uppercase tracking-wider">
              Associated Projects ({clientProjects.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clientProjects.map((p) => {
                const prog = dataService.getProjectProgress(p.id);
                return (
                  <div key={p.id} className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#0B1F3A]">{p.code}</span>
                      <span className="text-xs font-mono font-bold text-[#0B1F3A]">{prog.percentage}%</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0B1F3A]">{p.name}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">{prog.completedTasks}/{prog.totalTasks} tasks completed</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Deliverables & Approvals */}
          <div>
            <h4 className="text-xs font-bold text-[#0B1F3A] mb-2 uppercase tracking-wider">
              Client Deliverables & Approvals ({clientApprovals.length})
            </h4>
            <div className="divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
              {clientApprovals.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#667085]">No deliverables submitted yet.</div>
              ) : (
                clientApprovals.map((appr) => (
                  <div key={appr.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#0B1F3A]">{appr.title}</p>
                      <p className="text-[11px] text-[#667085]">Version {appr.version_tag} · {appr.deliverable_type}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        appr.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : appr.status === 'changes_requested'
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {appr.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Client Active Tasks */}
          <div>
            <h4 className="text-xs font-bold text-[#0B1F3A] mb-2 uppercase tracking-wider">
              Active Tasks ({clientTasks.length})
            </h4>
            <div className="divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-xl overflow-hidden">
              {clientTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="p-3 flex items-center justify-between hover:bg-[#F7F8FA] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#EFF3FF] text-[#0B1F3A] px-1.5 py-0.2 rounded">
                      #{t.task_number}
                    </span>
                    <span className="text-xs font-medium text-[#182230]">{t.title}</span>
                  </div>
                  <span className="text-xs font-mono text-[#667085]">
                    {new Date(t.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};
