import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  BarChart3,
  Layers,
  Settings,
  Database,
  FileSpreadsheet,
  Edit3,
  Server,
} from 'lucide-react';
import { IntegrationPlatform, ClientIntegration, Client } from '../../types/database';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';
import { ConnectPlatformModal } from './ConnectPlatformModal';
import { BackendIntegrationPlanModal } from '../modals/BackendIntegrationPlanModal';

interface IntegrationsHubProps {
  clientId?: string;
  onNavigateToAnalytics?: (tab: string, clientId?: string) => void;
  onOpenImporter?: (clientId?: string) => void;
  onOpenManualEntry?: (clientId?: string) => void;
}

interface PlatformDefinition {
  platform: IntegrationPlatform;
  title: string;
  category: 'Meta Platforms' | 'Google Platforms' | 'Data & Reporting';
  description: string;
  supportedData: string[];
}

const PLATFORMS_ROSTER: PlatformDefinition[] = [
  // META
  {
    platform: 'meta_ads',
    title: 'Meta Ads Manager',
    category: 'Meta Platforms',
    description: 'Campaigns, ad sets, ads, spend, link clicks, ROAS, and conversion attribution.',
    supportedData: ['Ad Spend', 'ROAS', 'CPM', 'CPC', 'Conversions'],
  },
  {
    platform: 'meta_business',
    title: 'Meta Business Portfolio',
    category: 'Meta Platforms',
    description: 'Agency partner assets, business portfolios, and centralized permissions.',
    supportedData: ['Partner Ad Accounts', 'Pixels', 'Catalogs'],
  },
  {
    platform: 'facebook_pages',
    title: 'Facebook Pages',
    category: 'Meta Platforms',
    description: 'Page impressions, organic reach, followers, and published post metrics.',
    supportedData: ['Page Reach', 'Followers', 'Post Engagement'],
  },
  {
    platform: 'instagram_business',
    title: 'Instagram Professional',
    category: 'Meta Platforms',
    description: 'Reels performance, story reach, profile visits, and engagement rates.',
    supportedData: ['Followers', 'Reach', 'Likes', 'Comments', 'Saves'],
  },

  // GOOGLE
  {
    platform: 'google_ads',
    title: 'Google Ads',
    category: 'Google Platforms',
    description: 'Search campaigns, Performance Max, keywords, impressions, and cost per conversion.',
    supportedData: ['Search Spend', 'Impressions', 'Clicks', 'Conv. Value', 'ROAS'],
  },
  {
    platform: 'ga4',
    title: 'Google Analytics 4',
    category: 'Google Platforms',
    description: 'Active users, sessions, engaged time, conversions, and channel acquisition.',
    supportedData: ['Active Users', 'Sessions', 'Engagement Rate', 'Key Events'],
  },
  {
    platform: 'google_search_console',
    title: 'Google Search Console',
    category: 'Google Platforms',
    description: 'Organic search clicks, query impressions, average ranking position, and CTR.',
    supportedData: ['Search Queries', 'Clicks', 'CTR', 'Average Position'],
  },
  {
    platform: 'google_tag_manager',
    title: 'Google Tag Manager',
    category: 'Google Platforms',
    description: 'Container health, conversion tag firing, and event tracking QA.',
    supportedData: ['Tags Deployed', 'Triggers', 'Container Status'],
  },

  // DATA AND REPORTING
  {
    platform: 'excel_csv',
    title: 'Excel / CSV Ad Reports',
    category: 'Data & Reporting',
    description: 'Upload .xlsx, .xls, and .csv advertising reports with custom column mapping.',
    supportedData: ['Imported Spend', 'Impressions', 'Clicks', 'Leads', 'ROAS'],
  },
  {
    platform: 'manual_entry',
    title: 'Manual Metrics Entry',
    category: 'Data & Reporting',
    description: 'Log verified advertising spend and conversions for offline or unintegrated channels.',
    supportedData: ['Period Spend', 'Manual Leads', 'Revenue Notes'],
  },
  {
    platform: 'generic',
    title: 'Generic Data Source',
    category: 'Data & Reporting',
    description: 'Configure custom endpoints or webhook ingestion for proprietary client data.',
    supportedData: ['Custom REST Ingestion', 'Webhook Records'],
  },
];

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  clientId,
  onNavigateToAnalytics,
  onOpenImporter,
  onOpenManualEntry,
}) => {
  const { clients, integrations, refresh } = useAgencyData();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || 'all');
  const [connectingPlatform, setConnectingPlatform] = useState<IntegrationPlatform | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [serverConfig, setServerConfig] = useState<{
    meta?: { configured: boolean };
    google?: { configured: boolean };
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.integrations) {
          setServerConfig(data.integrations);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Meta Platforms', 'Google Platforms', 'Data & Reporting'];

  const filteredPlatforms = PLATFORMS_ROSTER.filter((p) => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  const getClientIntegrationForPlatform = (
    platform: IntegrationPlatform,
    targetClientId?: string
  ): ClientIntegration | undefined => {
    if (targetClientId && targetClientId !== 'all') {
      return integrations.find(
        (i) => i.platform === platform && i.client_id === targetClientId
      );
    }
    // If global, return first matching
    return integrations.find((i) => i.platform === platform);
  };

  const getStatusBadge = (status?: string, platform?: IntegrationPlatform) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Connected
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <RefreshCw size={10} className="animate-spin text-blue-600" />
            Syncing
          </span>
        );
      case 'sync_error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle size={10} />
            Sync Error
          </span>
        );
      case 'setup_required':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Configuration Required
          </span>
        );
      default: {
        const isMeta = platform && ['meta_ads', 'meta_business', 'facebook_pages', 'instagram_business'].includes(platform);
        const isGoogle = platform && ['ga4', 'google_search_console', 'google_ads', 'google_tag_manager'].includes(platform);
        const isUnconfigured = (isMeta && serverConfig && !serverConfig.meta?.configured) || (isGoogle && serverConfig && !serverConfig.google?.configured);

        if (isUnconfigured) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Server credentials required for automatic OAuth">
              Configuration Required
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F8FA] text-[#667085] border border-[#E5E7EB]">
            Not Connected
          </span>
        );
      }
    }
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm('Disconnect this marketing integration?')) {
      dataService.disconnectIntegration(integrationId);
      refresh();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Integrations Hub</h1>
          <p className="text-xs text-[#667085]">
            Manage client connections across Meta, Google, Excel/CSV reports, and custom data sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0B1F3A] hover:bg-[#F7F8FA] flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Server size={13} className="text-[#0B1F3A]" />
            <span>Architecture Plan</span>
          </button>

          {/* Client workspace selector */}
          {!clientId && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#667085] font-medium">Filter by Client:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg font-medium text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
              >
                <option value="all">All Clients ({clients.length})</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#E5E7EB] pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-[#667085] hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlatforms.map((item) => {
          const activeIntegration = getClientIntegrationForPlatform(
            item.platform,
            clientId || (selectedClientId !== 'all' ? selectedClientId : undefined)
          );
          const isConnected = activeIntegration?.status === 'connected';
          const clientObj = activeIntegration
            ? clients.find((c) => c.id === activeIntegration.client_id)
            : null;

          return (
            <div
              key={item.platform}
              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-[0_1px_3px_0_rgba(11,31,58,0.04)] ${
                isConnected
                  ? 'border-emerald-200 ring-1 ring-emerald-100'
                  : 'border-[#E5E7EB] hover:border-[#0B1F3A]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center font-bold text-xs">
                      {item.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0B1F3A] leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-[#667085]">{item.category}</span>
                    </div>
                  </div>
                  {getStatusBadge(activeIntegration?.status, item.platform)}
                </div>

                <p className="text-xs text-[#667085] leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Connection details if active */}
                {isConnected && activeIntegration && (
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-xs space-y-1 mb-3">
                    {clientObj && (
                      <p className="text-[#0B1F3A] font-semibold truncate">
                        Client: <span className="text-[#667085] font-normal">{clientObj.company}</span>
                      </p>
                    )}
                    {activeIntegration.account_name && (
                      <p className="text-[#0B1F3A] font-semibold truncate">
                        Asset: <span className="text-[#667085] font-normal">{activeIntegration.account_name}</span>
                      </p>
                    )}
                    {activeIntegration.external_account_id && (
                      <p className="font-mono text-[11px] text-[#667085] truncate">
                        ID: {activeIntegration.external_account_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Available Data Pills */}
                <div className="space-y-1 mb-3">
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider block">
                    Supported Metrics
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.supportedData.map((d) => (
                      <span
                        key={d}
                        className="px-1.5 py-0.2 rounded bg-[#F7F8FA] border border-[#E5E7EB] text-[9px] font-mono text-[#0B1F3A]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                {item.platform === 'excel_csv' ? (
                  <button
                    onClick={() => onOpenImporter && onOpenImporter(clientId || (selectedClientId !== 'all' ? selectedClientId : undefined))}
                    className="w-full h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <FileSpreadsheet size={13} className="text-[#9DD52C]" />
                    <span>Upload Ad Report</span>
                  </button>
                ) : item.platform === 'manual_entry' ? (
                  <button
                    onClick={() => onOpenManualEntry && onOpenManualEntry(clientId || (selectedClientId !== 'all' ? selectedClientId : undefined))}
                    className="w-full h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <Edit3 size={13} className="text-[#9DD52C]" />
                    <span>Log Manual Numbers</span>
                  </button>
                ) : isConnected ? (
                  <>
                    <button
                      onClick={() => {
                        if (onNavigateToAnalytics) {
                          onNavigateToAnalytics(item.platform, activeIntegration?.client_id);
                        }
                      }}
                      className="h-8 px-2.5 rounded-lg bg-[#EFF3FF] text-[#0B1F3A] text-xs font-semibold hover:bg-[#DFE9FC] flex items-center gap-1 flex-1 justify-center"
                    >
                      <BarChart3 size={13} />
                      <span>View Analytics</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(activeIntegration!.id)}
                      className="h-8 px-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                      title="Disconnect integration"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConnectingPlatform(item.platform)}
                    className="w-full h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus size={14} className="text-[#9DD52C]" />
                    <span>Connect & Verify</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Modal */}
      <ConnectPlatformModal
        isOpen={Boolean(connectingPlatform)}
        platform={connectingPlatform}
        clientId={clientId || (selectedClientId !== 'all' ? selectedClientId : undefined)}
        onClose={() => setConnectingPlatform(null)}
        onSuccess={() => {
          setConnectingPlatform(null);
          refresh();
        }}
      />

      {/* Backend Architecture Plan Modal */}
      <BackendIntegrationPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  );
};
