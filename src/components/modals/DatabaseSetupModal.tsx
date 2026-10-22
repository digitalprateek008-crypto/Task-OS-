import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { isSupabaseConfigured, checkSupabaseConnection } from '../../lib/supabase';
import { dataService } from '../../services/dataService';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    const res = await checkSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopyEnv = () => {
    const text = `VITE_SUPABASE_URL="https://your-project.supabase.co"\nVITE_SUPABASE_ANON_KEY="your-anon-public-key"`;
    navigator.clipboard.writeText(text);
    setCopiedType('env');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all Agency OS tasks, clients, and projects to factory demonstration state?')) {
      dataService.resetToDefaults();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center">
              <Database size={17} className="text-[#9DD52C]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B1F3A]">Database & Supabase Connection</h3>
              <p className="text-[11px] text-[#667085]">
                PostgreSQL schema, Row-Level Security, & local fallback
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Current Status Card */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold">
                {isSupabaseConfigured
                  ? 'Supabase Environment Variables Detected'
                  : 'Operating in Local Demonstration Mode'}
              </p>
              <p className="mt-0.5 text-[#667085] leading-relaxed">
                {isSupabaseConfigured
                  ? 'The app is configured to connect to your Supabase project. Click below to verify connection.'
                  : 'Agency OS is currently using a fully reactive, persistent in-browser database seeded with 15+ marketing team members and sample clients. All CRUD actions persist locally.'}
              </p>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
              <span>{isTesting ? 'Testing...' : 'Test Supabase Connection'}</span>
            </button>

            {testResult && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  testResult.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {testResult.message}
              </span>
            )}
          </div>

          {/* Configuration Instructions */}
          <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
            <h4 className="text-xs font-bold text-[#0B1F3A]">How to Connect Your Own Supabase Database:</h4>
            <ol className="text-xs text-[#667085] space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Create a project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0B1F3A] font-semibold underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink size={10} />
                </a>
              </li>
              <li>
                In your Supabase SQL Editor, run the migration file created in your project at:
                <code className="block mt-1 p-2 bg-[#F7F8FA] rounded text-[11px] font-mono text-[#0B1F3A] border border-[#E5E7EB]">
                  /supabase/migrations/20261022000000_agency_os_schema.sql
                </code>
              </li>
              <li>
                Optionally populate realistic initial agency data by running:
                <code className="block mt-1 p-2 bg-[#F7F8FA] rounded text-[11px] font-mono text-[#0B1F3A] border border-[#E5E7EB]">
                  /supabase/seed.sql
                </code>
              </li>
              <li>
                Set your project environment variables in your deployment (Vercel / GitHub):
                <div className="mt-1 relative bg-[#0B1F3A] text-white p-2.5 rounded text-[11px] font-mono">
                  <pre>
                    VITE_SUPABASE_URL=https://your-id.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                  <button
                    onClick={handleCopyEnv}
                    className="absolute top-2 right-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 text-white"
                  >
                    {copiedType === 'env' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedType === 'env' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </li>
            </ol>
          </div>

          {/* Factory Reset */}
          <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0B1F3A]">Demonstration Data</p>
              <p className="text-[11px] text-[#667085]">
                Reset mock clients, projects, tasks, and team rosters
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-200"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
