import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { IntegrationPlatform, IntegrationStatus, Client } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useAgencyData } from '../../hooks/useAgencyData';

interface ConnectPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: IntegrationPlatform | null;
  clientId?: string;
  onSuccess?: () => void;
}

export const ConnectPlatformModal: React.FC<ConnectPlatformModalProps> = ({
  isOpen,
  onClose,
  platform,
  clientId,
  onSuccess,
}) => {
  const { clients } = useAgencyData();
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clientId || clients[0]?.id || ''
  );
  const [accountName, setAccountName] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');

  if (!isOpen || !platform) return null;

  const getPlatformDetails = () => {
    switch (platform) {
      case 'meta_ads':
        return {
          title: 'Connect Meta Ads Manager',
          category: 'Meta Platforms',
          instructions:
            'Use your official Meta Developer App credentials (META_APP_ID & META_APP_SECRET) or provide your authorized Meta System User / Long-Lived Token with ads_read and read_insights permissions.',
          accountIdLabel: 'Meta Ad Account ID (e.g. act_1234567890)',
        };
      case 'meta_business':
        return {
          title: 'Connect Meta Business Portfolio',
          category: 'Meta Platforms',
          instructions:
            'Connect your Meta Business Manager / Portfolio ID to synchronize agency partner ad accounts and assets.',
          accountIdLabel: 'Meta Business Manager ID',
        };
      case 'facebook_pages':
        return {
          title: 'Connect Facebook Pages',
          category: 'Meta Platforms',
          instructions:
            'Connect verified Facebook Pages with pages_show_list and read_insights permissions to track post reach, likes, and engagement.',
          accountIdLabel: 'Facebook Page ID',
        };
      case 'instagram_business':
        return {
          title: 'Connect Instagram Professional Account',
          category: 'Meta Platforms',
          instructions:
            'Authorize your Instagram Business or Creator account connected to your Facebook Page with instagram_basic and instagram_manage_insights permissions.',
          accountIdLabel: 'Instagram Account ID / Handle',
        };
      case 'ga4':
        return {
          title: 'Connect Google Analytics 4 (GA4)',
          category: 'Google Platforms',
          instructions:
            'Connect your Google Cloud OAuth application or supply a Service Account / Access Token with analytics.readonly scope to retrieve user engagement and key events.',
          accountIdLabel: 'GA4 Property ID (e.g. 123456789)',
        };
      case 'google_search_console':
        return {
          title: 'Connect Google Search Console',
          category: 'Google Platforms',
          instructions:
            'Connect authorized Search Console access with webmasters.readonly permissions to pull search queries, impressions, and organic click CTR.',
          accountIdLabel: 'Search Console Site URL (e.g. sc-domain:example.com)',
        };
      case 'google_ads':
        return {
          title: 'Connect Google Ads',
          category: 'Google Platforms',
          instructions:
            'Connect Google Ads API via Google Cloud OAuth and your Google Ads Developer Token to pull search and PMax campaigns.',
          accountIdLabel: 'Google Ads Customer ID (e.g. 123-456-7890)',
        };
      case 'google_tag_manager':
        return {
          title: 'Connect Google Tag Manager',
          category: 'Google Platforms',
          instructions:
            'Track GTM containers, published workspaces, and tag deployment health for conversion tracking QA.',
          accountIdLabel: 'GTM Container ID (e.g. GTM-XXXXXX)',
        };
      case 'generic':
        return {
          title: 'Configure Custom Marketing Data Source',
          category: 'Custom API Connector',
          instructions:
            'Configure a generic REST endpoint or webhook for custom marketing platforms, CRM leads, or third-party ad networks.',
          accountIdLabel: 'External System ID / Endpoint URL',
        };
      default:
        return {
          title: 'Configure Integration',
          category: 'Marketing Platform',
          instructions: 'Provide authorized credentials to synchronize real marketing data.',
          accountIdLabel: 'Account ID',
        };
    }
  };

  const details = getPlatformDetails();

  // Handle OAuth Trigger
  const handleStartOAuth = async () => {
    setIsVerifying(true);
    setVerificationError(null);

    const isMeta = ['meta_ads', 'meta_business', 'facebook_pages', 'instagram_business'].includes(
      platform
    );
    const endpoint = isMeta
      ? `/api/auth/meta/url?clientId=${selectedClientId}`
      : `/api/auth/google/url?platform=${platform}&clientId=${selectedClientId}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.setupRequired) {
        setVerificationError(
          `${data.error}. ${data.instructions} Set credentials in .env to initiate one-click OAuth, or enter an authorized API token below.`
        );
        setIsVerifying(false);
        return;
      }

      if (data.authUrl) {
        // Open OAuth dialog
        window.open(data.authUrl, 'Platform_OAuth', 'width=650,height=750');
      }
    } catch (err: any) {
      setVerificationError(`Failed to start OAuth: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle direct verification of supplied Token & Account ID
  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setVerificationError('Please select a client workspace.');
      return;
    }
    if (!externalAccountId.trim() && !accountName.trim()) {
      setVerificationError('Please provide an Account Name or External Account ID.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // If Meta token provided, verify against live Meta Graph API via server route
      if (
        ['meta_ads', 'meta_business', 'facebook_pages', 'instagram_business'].includes(platform) &&
        tokenInput.trim()
      ) {
        const verifyRes = await fetch('/api/integrations/meta/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenInput.trim() }),
        });
        const verifyData = await verifyRes.json();

        if (verifyData.error) {
          throw new Error(`Meta API rejected token: ${verifyData.error}`);
        }
      }

      // Save real integration record against the selected client
      dataService.saveIntegration({
        client_id: selectedClientId,
        platform,
        status: 'connected',
        account_name: accountName.trim() || `${details.category} (${externalAccountId})`,
        external_account_id: externalAccountId.trim(),
        config: {
          tokenConfigured: Boolean(tokenInput.trim()),
          verifiedAt: new Date().toISOString(),
        },
      });

      setIsVerifying(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationError(err.message || 'Failed to verify account permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#667085] tracking-wider">
              {details.category}
            </span>
            <h3 className="font-bold text-sm text-[#0B1F3A]">{details.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleVerifyAndSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          {verificationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{verificationError}</span>
            </div>
          )}

          <div className="p-3 bg-[#EFF3FF] rounded-xl border border-[#D6E3FF] text-xs text-[#0B1F3A] leading-relaxed">
            <p className="font-semibold mb-1">Official API Authorization Protocol</p>
            <p className="text-[11px] text-[#667085]">{details.instructions}</p>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Associate With Client Workspace <span className="text-rose-500">*</span>
            </label>
            {clients.length === 0 ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                Please create at least one client workspace first.
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* OAuth Trigger Button */}
          <div>
            <button
              type="button"
              onClick={handleStartOAuth}
              disabled={isVerifying}
              className="w-full h-10 rounded-xl bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
            >
              <ShieldCheck size={16} className="text-[#9DD52C]" />
              <span>Start Official OAuth Connection</span>
            </button>
            <p className="text-[10px] text-center text-[#9CA3AF] mt-1">
              Redirects to official authorization screen with required scopes
            </p>
          </div>

          <div className="flex items-center gap-2 my-2">
            <span className="h-[1px] bg-[#E5E7EB] flex-1"></span>
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
              Or Configure Authorized Credentials Manually
            </span>
            <span className="h-[1px] bg-[#E5E7EB] flex-1"></span>
          </div>

          {/* Account Label */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Account / Property Label
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Athletics US Ad Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          {/* External Account ID */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              {details.accountIdLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. act_1092837465928"
              value={externalAccountId}
              onChange={(e) => setExternalAccountId(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          {/* API Access Token */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Authorized API Access Token (Optional for direct verification)
            </label>
            <input
              type="password"
              placeholder="EAABw..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          {/* Footer CTAs */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#F7F8FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="h-9 px-4 rounded-xl bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Save Integration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
