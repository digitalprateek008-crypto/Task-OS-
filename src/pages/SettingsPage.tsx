import React, { useState } from 'react';
import {
  Building2,
  Database,
  Shield,
  Key,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Github,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import { dataService } from '../services/dataService';
import { BackendIntegrationPlanModal } from '../components/modals/BackendIntegrationPlanModal';
import { Server } from 'lucide-react';

interface SettingsPageProps {
  onOpenDatabaseModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenDatabaseModal }) => {
  const { currentUser, profiles } = useAgencyData();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const handleReset = () => {
    if (confirm('Reset all Agency OS tasks and data to initial state?')) {
      dataService.resetToDefaults();
      alert('Data reset to demonstration state.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-xl font-bold text-[#0B1F3A]">Agency Settings & Integration</h1>
        <p className="text-xs text-[#667085]">
          Configure agency workspace, Supabase connection, and role permissions
        </p>
      </div>

      {/* Organization Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-lg">
            KD
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">Kinetic Digital Agency</h3>
            <p className="text-xs text-[#667085]">Digital Marketing, Media Buying & UGC Production</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
            <span className="text-[#667085] block text-[11px]">Active Team</span>
            <span className="font-mono font-bold text-sm text-[#0B1F3A]">
              {profiles.filter((p) => p.role !== 'client').length} Specialists
            </span>
          </div>

          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
            <span className="text-[#667085] block text-[11px]">Active Sprint</span>
            <span className="font-mono font-bold text-sm text-[#0B1F3A]">Sprint W43 (Q4 Peak)</span>
          </div>

          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
            <span className="text-[#667085] block text-[11px]">Client Accounts</span>
            <span className="font-mono font-bold text-sm text-[#0B1F3A]">5 Enterprise Brands</span>
          </div>
        </div>
      </div>

      {/* Database Connection Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Supabase PostgreSQL Database</h3>
              <p className="text-xs text-[#667085]">
                {isSupabaseConfigured
                  ? 'Configured via environment variables'
                  : 'Operating in local demonstration engine'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDatabaseModal}
            className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Setup & Migration SQL</span>
          </button>
        </div>

        <div className="text-xs text-[#667085] leading-relaxed p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <span className="font-bold text-[#0B1F3A]">
              {isSupabaseConfigured ? 'Live Supabase Attached' : 'Reactive Local Storage Attached'}
            </span>
          </div>
          <p>
            The project includes full SQL migrations (`supabase/migrations/20261022000000_agency_os_schema.sql`)
            with Row-Level Security policies enforcing client separation and internal comments privacy.
          </p>
        </div>
      </div>

      {/* Backend Integration & OAuth Architecture Plan */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center">
              <Server size={16} className="text-[#9DD52C]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Backend Integration Plan (Meta & Google OAuth)</h3>
              <p className="text-xs text-[#667085]">Production architecture specifications and server secret safety</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>View Architecture Plan</span>
          </button>
        </div>
        <p className="text-xs text-[#667085] leading-relaxed">
          Detailed plans for Supabase RLS policies, server-side OAuth exchange routes, and zero-exposure client security guidelines.
        </p>
      </div>

      {/* Deployment & Environment Setup Guide */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#0B1F3A]" />
          <h3 className="text-sm font-bold text-[#0B1F3A]">Vercel & GitHub Deployment</h3>
        </div>

        <p className="text-xs text-[#667085] leading-relaxed">
          Agency OS is built for instant deployment on Vercel or any static/Node host.
          Set the following environment variables in your Vercel project settings:
        </p>

        <div className="p-3 bg-[#0B1F3A] text-white rounded-xl font-mono text-xs overflow-x-auto">
          <code>
            VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
            VITE_SUPABASE_ANON_KEY=your-public-anon-key
          </code>
        </div>
      </div>

      {/* Modal */}
      <BackendIntegrationPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      {/* Danger Zone */}
      <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-800">Factory Data Reset</h4>
          <p className="text-xs text-[#667085]">
            Re-seed all demonstration tasks, clients, and team member states
          </p>
        </div>
        <button
          onClick={handleReset}
          className="h-8 px-3 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};
