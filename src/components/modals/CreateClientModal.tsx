import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';
import { Client } from '../../types/database';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
}) => {
  const { profiles } = useAgencyData();

  const [company, setCompany] = useState(clientToEdit?.company || '');
  const [contactName, setContactName] = useState(clientToEdit?.name || '');
  const [contactEmail, setContactEmail] = useState(clientToEdit?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(clientToEdit?.contact_phone || '');
  const [website, setWebsite] = useState(clientToEdit?.website || '');
  const [servicesInput, setServicesInput] = useState(
    clientToEdit?.services ? clientToEdit.services.join(', ') : 'Meta Ads, Google Ads, Creative'
  );
  const [accountManagerId, setAccountManagerId] = useState(
    clientToEdit?.account_manager_id || profiles[2]?.id || profiles[0]?.id || ''
  );
  const [monthlyBudget, setMonthlyBudget] = useState(
    clientToEdit ? String(clientToEdit.monthly_budget) : '25000'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !contactEmail.trim()) return;

    const services = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (clientToEdit) {
      dataService.updateClient(clientToEdit.id, {
        company: company.trim(),
        name: contactName.trim() || company.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        website: website.trim(),
        services,
        account_manager_id: accountManagerId,
        monthly_budget: parseFloat(monthlyBudget) || 0,
      });
    } else {
      dataService.createClient({
        company: company.trim(),
        name: contactName.trim() || company.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        website: website.trim(),
        services,
        account_manager_id: accountManagerId,
        monthly_budget: parseFloat(monthlyBudget) || 25000,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/40 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9DD52C]"></span>
            <h3 className="font-bold text-sm text-[#0B1F3A]">
              {clientToEdit ? 'Edit Client Profile' : 'Add New Client'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FA]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Company / Brand <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Athletics"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Primary Contact Name
              </label>
              <input
                type="text"
                placeholder="Chloe Daniels"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="client@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Account Manager
              </label>
              <select
                value={accountManagerId}
                onChange={(e) => setAccountManagerId(e.target.value)}
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
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Monthly Retainer / Budget ($)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Website URL</label>
            <input
              type="url"
              placeholder="https://company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Active Services (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Meta Ads, Google Search, TikTok UGC, SEO"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
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
              {clientToEdit ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
