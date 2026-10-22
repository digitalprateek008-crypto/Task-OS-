import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Check,
  FileText,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { ApprovalModal } from '../components/approvals/ApprovalModal';
import { Approval } from '../types/database';
import { dataService } from '../services/dataService';

export const ApprovalsPage: React.FC = () => {
  const { approvals, clients, projects, profiles, currentUser } = useAgencyData();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'changes_requested'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter based on client portal permissions (already filtered in dataService if role is client)
  const filteredApprovals = approvals.filter((a) => a.status === activeTab);

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const changesCount = approvals.filter((a) => a.status === 'changes_requested').length;

  const handleOpenReview = (appr: Approval) => {
    setSelectedApproval(appr);
    setIsModalOpen(true);
  };

  const handleQuickApprove = (appr: Approval, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.submitApprovalDecision(appr.id, 'approved', 'Quick approved via portal.');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1F3A]">Client Portal & Approvals</h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#9DD52C] text-[#0B1F3A] text-xs font-bold font-mono">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#667085]">
            Review creative deliverables, sign-off on ad campaigns, and submit change requests
          </p>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#667085] hover:bg-white'
          }`}
        >
          <Clock size={14} />
          <span>Pending Review</span>
          <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'approved'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#667085] hover:bg-white'
          }`}
        >
          <CheckCircle2 size={14} className="text-[#9DD52C]" />
          <span>Approved</span>
          <span className="font-mono text-[10px] bg-[#EFF3FF] text-[#0B1F3A] px-1.5 py-0.2 rounded-full">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('changes_requested')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'changes_requested'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#667085] hover:bg-white'
          }`}
        >
          <AlertCircle size={14} className="text-rose-400" />
          <span>Changes Requested</span>
          <span className="font-mono text-[10px] bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded-full">
            {changesCount}
          </span>
        </button>
      </div>

      {/* Deliverables List */}
      <div className="space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-[#E5E7EB] text-center text-xs text-[#667085]">
            No deliverables in "{activeTab.replace('_', ' ')}".
          </div>
        ) : (
          filteredApprovals.map((appr) => {
            const client = clients.find((c) => c.id === appr.client_id);
            const project = projects.find((p) => p.id === appr.project_id);
            const requester = profiles.find((p) => p.id === appr.requested_by);
            const reviewer = profiles.find((p) => p.id === appr.reviewed_by);

            return (
              <div
                key={appr.id}
                onClick={() => handleOpenReview(appr)}
                className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#0B1F3A] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-[#F7F8FA] border border-[#E5E7EB] text-[#0B1F3A] px-2 py-0.5 rounded">
                        {appr.version_tag}
                      </span>
                      <span className="text-xs text-[#667085] font-medium">
                        {client?.company} · {project?.name}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0B1F3A] group-hover:text-[#18345C] transition-colors leading-snug">
                      {appr.title}
                    </h3>

                    {appr.description && (
                      <p className="text-xs text-[#667085] mt-1 line-clamp-1">
                        {appr.description}
                      </p>
                    )}

                    {appr.feedback_notes && (
                      <p className="text-xs text-rose-700 italic mt-1 font-medium">
                        Feedback: "{appr.feedback_notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right text-xs">
                    <p className="text-[#667085] text-[11px]">Submitted by {requester?.full_name}</p>
                    <p className="font-mono text-[10px] text-[#9CA3AF]">
                      {new Date(appr.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {appr.status === 'pending' && (
                    <button
                      onClick={(e) => handleQuickApprove(appr, e)}
                      className="h-8 px-3 rounded-lg bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenReview(appr)}
                    className="h-8 px-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] hover:bg-[#EFF3FF] text-[#0B1F3A] text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Dialog Modal */}
      <ApprovalModal
        approval={selectedApproval}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApproval(null);
        }}
      />
    </div>
  );
};
