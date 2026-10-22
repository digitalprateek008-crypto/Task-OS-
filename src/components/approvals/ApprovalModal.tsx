import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Download, ExternalLink } from 'lucide-react';
import { Approval } from '../../types/database';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';

interface ApprovalModalProps {
  approval: Approval | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approval, isOpen, onClose }) => {
  const { clients, projects, profiles, currentUser } = useAgencyData();
  const [feedback, setFeedback] = useState('');
  const [decisionMode, setDecisionMode] = useState<'view' | 'approve' | 'request_changes'>('view');

  if (!isOpen || !approval) return null;

  const client = clients.find((c) => c.id === approval.client_id);
  const project = projects.find((p) => p.id === approval.project_id);
  const requester = profiles.find((p) => p.id === approval.requested_by);
  const reviewer = profiles.find((p) => p.id === approval.reviewed_by);
  const attachment = approval.attachment_id
    ? dataService.getAttachments().find((a) => a.id === approval.attachment_id)
    : null;

  const handleDecision = (decision: 'approved' | 'changes_requested') => {
    dataService.submitApprovalDecision(approval.id, decision, feedback.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                approval.status === 'approved'
                  ? 'bg-emerald-500'
                  : approval.status === 'changes_requested'
                  ? 'bg-rose-500'
                  : 'bg-[#9DD52C] animate-pulse'
              }`}
            ></span>
            <div>
              <h3 className="font-bold text-sm text-[#0B1F3A] truncate max-w-sm">
                {approval.title}
              </h3>
              <p className="text-[11px] text-[#667085]">
                {client?.company} · {project?.name} · Version {approval.version_tag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Status Badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#667085] font-medium">Deliverable Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider border ${
                approval.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : approval.status === 'changes_requested'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {approval.status.replace('_', ' ')}
            </span>
          </div>

          {/* Description */}
          {approval.description && (
            <div className="p-3 bg-[#F7F8FA] rounded-xl text-xs text-[#182230] leading-relaxed border border-[#E5E7EB]">
              <p className="font-semibold text-[#0B1F3A] mb-0.5">Deliverable Brief & Notes:</p>
              <p>{approval.description}</p>
            </div>
          )}

          {/* Attachment Preview */}
          {attachment && (
            <div className="p-3.5 border border-[#E5E7EB] rounded-xl flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#0B1F3A] truncate">
                    {attachment.file_name}
                  </p>
                  <p className="text-[10px] font-mono text-[#667085]">
                    {(attachment.file_size_bytes / (1024 * 1024)).toFixed(1)} MB · Ready for Sign-Off
                  </p>
                </div>
              </div>
              <a
                href={attachment.file_url}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] hover:bg-[#EFF3FF] text-[#0B1F3A] text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <span>View Asset</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Previous Review Feedback if reviewed */}
          {approval.reviewed_by && (
            <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#667085]">
                <span>Reviewed by {reviewer?.full_name || 'Client'}</span>
                <span className="font-mono">
                  {approval.reviewed_at && new Date(approval.reviewed_at).toLocaleDateString()}
                </span>
              </div>
              {approval.feedback_notes && (
                <p className="text-xs text-[#182230] italic font-medium pt-1">
                  "{approval.feedback_notes}"
                </p>
              )}
            </div>
          )}

          {/* Review Input Box */}
          <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
            <label className="block text-xs font-semibold text-[#0B1F3A]">
              Review Feedback & Client Comments
            </label>
            <textarea
              rows={3}
              placeholder="Add client sign-off notes, change requests, or timestamped feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0B1F3A] text-[#182230]"
            />
          </div>

          {/* Action Decision Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleDecision('changes_requested')}
              className="flex-1 h-10 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <AlertCircle size={15} />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => handleDecision('approved')}
              className="flex-1 h-10 rounded-xl bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <CheckCircle2 size={16} strokeWidth={2.4} />
              <span>Approve Deliverable</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
