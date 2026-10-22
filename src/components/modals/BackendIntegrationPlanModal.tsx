import React, { useState } from 'react';
import { X, ShieldCheck, Database, Key, Server, CheckCircle2, Copy, Check } from 'lucide-react';

interface BackendIntegrationPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendIntegrationPlanModal: React.FC<BackendIntegrationPlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#0B1F3A] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#9DD52C] text-[#0B1F3A] flex items-center justify-center font-bold">
              <Server size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Backend Integration & Security Architecture</h3>
              <p className="text-[11px] text-gray-300">
                Supabase PostgreSQL, Meta Marketing API, and Google OAuth implementation specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-[#0B1F3A]">
          {/* Section 1: Security & Zero Secret Leaks */}
          <div className="bg-[#EFF3FF] p-4 rounded-xl border border-[#D6E3FF] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#0B1F3A] w-4 h-4 shrink-0" />
              <h4 className="font-bold text-xs">Zero-Exposure Secret Architecture</h4>
            </div>
            <p className="text-[#667085] leading-relaxed">
              All client secrets (<code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D6E3FF]">META_APP_SECRET</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D6E3FF]">GOOGLE_CLIENT_SECRET</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D6E3FF]">DATABASE_URL</code>) reside exclusively in the server-side runtime (<code className="font-mono">server.ts</code>). They are never bundled into client JavaScript or exposed with <code className="font-mono">VITE_</code> prefixes.
            </p>
          </div>

          {/* Section 2: Environment Variables Reference */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#667085]">
              Required Server Environment Configuration (.env)
            </h4>
            <div className="bg-[#0B1F3A] text-white p-4 rounded-xl font-mono text-[11px] relative overflow-x-auto">
              <pre className="text-gray-200 leading-relaxed">
{`# 1. Meta Marketing API & Business Portfolio
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret
APP_URL=https://your-agency-os.com

# 2. Google Cloud Platform (GA4 & Search Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 3. Supabase PostgreSQL & RLS Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `META_APP_ID=\nMETA_APP_SECRET=\nAPP_URL=http://localhost:3000\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\nVITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=`,
                    'env'
                  )
                }
                className="absolute top-3 right-3 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1"
              >
                {copiedKey === 'env' ? <Check size={12} className="text-[#9DD52C]" /> : <Copy size={12} />}
                <span>{copiedKey === 'env' ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Meta OAuth & API Workflow */}
          <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-[10px]">1</span>
              Meta Ads Manager & Marketing API Workflow
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[#667085] leading-relaxed">
              <li>
                <strong className="text-[#0B1F3A]">Registered App:</strong> In Facebook Developer Portal, create a Business App and enable <strong className="text-[#0B1F3A]">Marketing API</strong>.
              </li>
              <li>
                <strong className="text-[#0B1F3A]">Requested Scopes:</strong> <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">ads_read</code>, <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">read_insights</code>, <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">pages_show_list</code>, <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">instagram_basic</code>.
              </li>
              <li>
                <strong className="text-[#0B1F3A]">Long-Lived Token Exchange:</strong> Server exchanges short-lived callback code for a 60-day token (<code className="font-mono">fb_exchange_token</code>).
              </li>
              <li>
                <strong className="text-[#0B1F3A]">Client Account Association:</strong> The operator selects the client's ad account (<code className="font-mono">act_XXXX</code>). Data is synced directly to <code className="font-mono">daily_metrics</code>.
              </li>
            </ol>
          </div>

          {/* Section 4: Google GA4 & Search Console */}
          <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-[10px]">2</span>
              Google Analytics 4 & Search Console Workflow
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[#667085] leading-relaxed">
              <li>
                <strong className="text-[#0B1F3A]">Google Cloud Console:</strong> Enable Google Analytics Data API and Search Console API.
              </li>
              <li>
                <strong className="text-[#0B1F3A]">Scopes:</strong> <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">analytics.readonly</code> and <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">webmasters.readonly</code>.
              </li>
              <li>
                <strong className="text-[#0B1F3A]">Offline Access:</strong> Google OAuth requests <code className="font-mono">access_type=offline</code> to store an encrypted refresh token for automated background updates.
              </li>
            </ol>
          </div>

          {/* Section 5: Supabase RLS & Database Migration */}
          <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-[10px]">3</span>
              Supabase PostgreSQL Multi-Tenant Separation
            </h4>
            <p className="text-[#667085] leading-relaxed">
              Complete migration SQL exists in <code className="font-mono bg-[#F7F8FA] px-1 py-0.5 rounded border border-[#E5E7EB]">supabase/migrations/20261022000000_agency_os_schema.sql</code>. All queries are protected by Row-Level Security so Client A never accesses Client B's analytics or deliverables.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#667085]">
            Full documentation saved at <code className="font-mono text-[#0B1F3A]">docs/BACKEND_INTEGRATION_PLAN.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#18345C] transition-all"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>
  );
};
