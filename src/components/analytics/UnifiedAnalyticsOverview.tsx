import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Globe, 
  Share2, 
  Search, 
  ArrowUpRight,
  Database,
  UploadCloud,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { 
  Client, 
  DailyMetricRecord, 
  SocialContentMetric, 
  WebsiteMetricRecord, 
  SearchConsoleMetricRecord,
  ClientIntegration 
} from '../../types/database';
import { formatCurrency, formatCompactNumber, formatRoas } from '../../types/analytics';

interface UnifiedAnalyticsOverviewProps {
  client: Client;
  adMetrics: DailyMetricRecord[];
  socialMetrics: SocialContentMetric[];
  websiteMetrics: WebsiteMetricRecord[];
  seoMetrics: SearchConsoleMetricRecord[];
  integrations: ClientIntegration[];
  onSelectTab: (tab: string) => void;
  onOpenImporter?: () => void;
  onOpenConnect?: () => void;
  onOpenManualEntry?: () => void;
}

export const UnifiedAnalyticsOverview: React.FC<UnifiedAnalyticsOverviewProps> = ({
  client,
  adMetrics,
  socialMetrics,
  websiteMetrics,
  seoMetrics,
  integrations,
  onSelectTab,
  onOpenImporter,
  onOpenConnect,
  onOpenManualEntry
}) => {
  const clientAdMetrics = adMetrics.filter(m => m.client_id === client.id);
  const clientSocialMetrics = socialMetrics.filter(m => m.client_id === client.id);
  const clientWebsiteMetrics = websiteMetrics.filter(m => m.client_id === client.id);
  const clientSeoMetrics = seoMetrics.filter(m => m.client_id === client.id);

  // Totals
  const totalSpend = clientAdMetrics.reduce((sum, m) => sum + m.spend, 0);
  const totalRevenue = clientAdMetrics.reduce((sum, m) => sum + m.conversion_value, 0);
  const totalBlendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const totalAdConversions = clientAdMetrics.reduce((sum, m) => sum + (m.leads || 0), 0);

  const totalSocialReach = clientSocialMetrics.reduce((sum, m) => sum + m.reach, 0);
  const totalSocialEngagements = clientSocialMetrics.reduce((sum, m) => sum + (m.likes + m.comments + m.shares + m.saves), 0);

  const totalWebSessions = clientWebsiteMetrics.reduce((sum, m) => sum + m.sessions, 0);
  const totalWebConversions = clientWebsiteMetrics.reduce((sum, m) => sum + m.conversions, 0);

  const totalSeoClicks = clientSeoMetrics.reduce((sum, m) => sum + m.clicks, 0);

  // Check data sources
  const getSourceBadge = (records: { source_type?: string }[]) => {
    if (!records || records.length === 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
          Not Connected
        </span>
      );
    }
    const hasLive = records.some(r => r.source_type === 'api');
    const hasImport = records.some(r => r.source_type === 'csv' || r.source_type === 'excel');
    const hasManual = records.some(r => r.source_type === 'manual');

    if (hasLive) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Database className="w-2.5 h-2.5" /> Live API
        </span>
      );
    }
    if (hasImport) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <FileSpreadsheet className="w-2.5 h-2.5" /> Imported Report
        </span>
      );
    }
    if (hasManual) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
          Manual Entry
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
        Active Data
      </span>
    );
  };

  const hasAnyData = clientAdMetrics.length > 0 || clientSocialMetrics.length > 0 || clientWebsiteMetrics.length > 0 || clientSeoMetrics.length > 0;

  return (
    <div className="space-y-6">
      {/* Overview Top Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Multi-Channel Marketing Overview</h2>
          <p className="text-xs text-gray-500">
            Real-time omnichannel performance across paid ads, social media, web traffic, and search engine optimization.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenManualEntry && (
            <button
              onClick={onOpenManualEntry}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
            >
              Manual Metrics
            </button>
          )}
          {onOpenImporter && (
            <button
              onClick={onOpenImporter}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-gray-500" />
              Import Excel / CSV
            </button>
          )}
          {onOpenConnect && (
            <button
              onClick={onOpenConnect}
              className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-semibold transition"
            >
              + Connect Marketing Channel
            </button>
          )}
        </div>
      </div>

      {!hasAnyData ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No Marketing Data Connected Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            In accordance with zero-fake-data policy, no marketing numbers will appear until you connect live APIs (Meta, Google), import CSV/Excel spreadsheets, or enter manual metrics for {client.name}.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {onOpenConnect && (
              <button
                onClick={onOpenConnect}
                className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg text-xs font-semibold hover:bg-[#122b4e] transition"
              >
                Connect Platforms (Meta / Google)
              </button>
            )}
            {onOpenImporter && (
              <button
                onClick={onOpenImporter}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
              >
                Import Advertising Reports (.xlsx/.csv)
              </button>
            )}
            {onOpenManualEntry && (
              <button
                onClick={onOpenManualEntry}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
              >
                Log Metrics Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Executive Blended KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Total Paid Ad Spend</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpend)}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Meta & Google Ads</span>
                <span className="font-medium text-gray-700">{formatCompactNumber(totalAdConversions)} leads</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Blended ROAS</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatRoas(totalBlendedRoas)}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Tracked Revenue</span>
                <span className="font-medium text-emerald-600">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Organic Reach & Social</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatCompactNumber(totalSocialReach)}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">FB & IG Engagements</span>
                <span className="font-medium text-purple-700">{formatCompactNumber(totalSocialEngagements)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Web & SEO Traffic</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCompactNumber(totalWebSessions)}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Search Clicks</span>
                <span className="font-medium text-blue-700">{formatCompactNumber(totalSeoClicks)}</span>
              </div>
            </div>
          </div>

          {/* Marketing Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meta Ads Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
                      f
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Meta Ads Manager</h3>
                      <p className="text-[11px] text-gray-500">Facebook & Instagram Campaigns</p>
                    </div>
                  </div>
                  {getSourceBadge(clientAdMetrics)}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px]">Spend</span>
                    <p className="font-semibold text-gray-900">{formatCurrency(totalSpend)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Conversions</span>
                    <p className="font-semibold text-gray-900">{formatCompactNumber(totalAdConversions)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">ROAS</span>
                    <p className="font-semibold text-emerald-600">{formatRoas(totalBlendedRoas)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {clientAdMetrics.length} recorded daily data points
                </span>
                <button
                  onClick={() => onSelectTab('meta-ads')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Meta Ads Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Social Media Channels</h3>
                      <p className="text-[11px] text-gray-500">Facebook Pages & Instagram Pro</p>
                    </div>
                  </div>
                  {getSourceBadge(clientSocialMetrics)}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px]">Total Reach</span>
                    <p className="font-semibold text-gray-900">{formatCompactNumber(totalSocialReach)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Engagements</span>
                    <p className="font-semibold text-gray-900">{formatCompactNumber(totalSocialEngagements)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Posts / Reels</span>
                    <p className="font-semibold text-purple-600">{clientSocialMetrics.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {clientSocialMetrics.length} posts and content records
                </span>
                <button
                  onClick={() => onSelectTab('social-media')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Social Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Analytics 4 Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Google Analytics 4</h3>
                      <p className="text-[11px] text-gray-500">Website Traffic & Conversions</p>
                    </div>
                  </div>
                  {getSourceBadge(clientWebsiteMetrics)}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px]">Sessions</span>
                    <p className="font-semibold text-gray-900">{formatCompactNumber(totalWebSessions)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Web Conversions</span>
                    <p className="font-semibold text-emerald-600">{formatCompactNumber(totalWebConversions)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Channels</span>
                    <p className="font-semibold text-gray-900">{new Set(clientWebsiteMetrics.map(m => m.channel_grouping)).size}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {clientWebsiteMetrics.length} traffic records
                </span>
                <button
                  onClick={() => onSelectTab('website')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Web Traffic <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Search Console Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Google Search Console</h3>
                      <p className="text-[11px] text-gray-500">Organic SEO Keywords & Rankings</p>
                    </div>
                  </div>
                  {getSourceBadge(clientSeoMetrics)}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px]">Organic Clicks</span>
                    <p className="font-semibold text-gray-900">{formatCompactNumber(totalSeoClicks)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Ranked Queries</span>
                    <p className="font-semibold text-gray-900">{clientSeoMetrics.filter(m => m.query).length}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Top Pages</span>
                    <p className="font-semibold text-gray-900">{clientSeoMetrics.filter(m => m.page).length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {clientSeoMetrics.length} keyword/page records
                </span>
                <button
                  onClick={() => onSelectTab('seo')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View SEO Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
