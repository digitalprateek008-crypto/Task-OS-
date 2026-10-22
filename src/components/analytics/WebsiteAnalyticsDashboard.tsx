import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  RefreshCw, 
  Layers, 
  Activity,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Client, WebsiteMetricRecord } from '../../types/database';
import { formatCompactNumber, formatPercent } from '../../types/analytics';
import { WebTrafficTrendChart } from './AnalyticsCharts';

interface WebsiteAnalyticsDashboardProps {
  client: Client;
  metrics: WebsiteMetricRecord[];
  onOpenImporter?: () => void;
  onOpenManualEntry?: () => void;
  onOpenConnect?: () => void;
  onCreateTask?: (taskData: { title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent'; client_id: string }) => void;
}

export const WebsiteAnalyticsDashboard: React.FC<WebsiteAnalyticsDashboardProps> = ({
  client,
  metrics,
  onOpenImporter,
  onOpenManualEntry,
  onOpenConnect,
  onCreateTask
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter metrics for this client
  const clientMetrics = metrics.filter(m => m.client_id === client.id);

  // Compute aggregates
  const totalUsers = clientMetrics.reduce((sum, m) => sum + (m.total_users || m.active_users || 0), 0);
  const totalSessions = clientMetrics.reduce((sum, m) => sum + m.sessions, 0);
  const totalPageviews = clientMetrics.reduce((sum, m) => sum + (m.event_count || 0), 0);
  const totalConversions = clientMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const avgEngagementRate = clientMetrics.length 
    ? (clientMetrics.reduce((sum, m) => sum + m.engagement_rate, 0) / clientMetrics.length) 
    : 0;
  const avgSessionDuration = clientMetrics.length
    ? Math.round(clientMetrics.reduce((sum, m) => sum + (m.avg_engagement_time_sec || 0), 0) / clientMetrics.length)
    : 0;

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Group by channel
  const channelData: Record<string, { sessions: number; conversions: number; users: number }> = {};
  clientMetrics.forEach(m => {
    const ch = m.channel_grouping || 'Direct / Organic';
    if (!channelData[ch]) {
      channelData[ch] = { sessions: 0, conversions: 0, users: 0 };
    }
    channelData[ch].sessions += m.sessions;
    channelData[ch].conversions += m.conversions;
    channelData[ch].users += (m.total_users || m.active_users || 0);
  });

  const channelsList = Object.entries(channelData).sort((a, b) => b[1].sessions - a[1].sessions);

  return (
    <div className="space-y-6">
      {/* Top Header / Integration Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Google Analytics 4</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                clientMetrics.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {clientMetrics.length > 0 ? 'Data Available' : 'No Data Connected'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Web traffic, sessions, engagement metrics, and conversion paths for {client.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as any)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          {onOpenManualEntry && (
            <button 
              onClick={onOpenManualEntry}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition"
            >
              Enter GA4 Data
            </button>
          )}
          {onOpenImporter && (
            <button 
              onClick={onOpenImporter}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition"
            >
              Import CSV/Excel
            </button>
          )}
          {onOpenConnect && (
            <button 
              onClick={onOpenConnect}
              className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-medium transition"
            >
              Connect GA4 Property
            </button>
          )}
        </div>
      </div>

      {clientMetrics.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No Google Analytics 4 Data Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Connect {client.name}'s Google Analytics 4 property, import an exported GA4 CSV/Excel report, or log manual visitor metrics to track web performance.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onOpenConnect && (
              <button
                onClick={onOpenConnect}
                className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg text-xs font-semibold hover:bg-[#122b4e] transition"
              >
                Connect GA4 Property
              </button>
            )}
            {onOpenImporter && (
              <button
                onClick={onOpenImporter}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
              >
                Import GA4 Report (.xlsx/.csv)
              </button>
            )}
            {onOpenManualEntry && (
              <button
                onClick={onOpenManualEntry}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
              >
                Enter Metrics Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Total Users</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCompactNumber(totalUsers)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Unique visitors</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Total Sessions</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCompactNumber(totalSessions)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Browsing sessions</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Pageviews</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCompactNumber(totalPageviews)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Screen / page views</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Engagement Rate</span>
              <p className="text-xl font-bold text-[#0B1F3A] mt-1">{avgEngagementRate.toFixed(1)}%</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Sessions &gt; 10s or 2+ pages</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Avg Session Time</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatSeconds(avgSessionDuration)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Active duration</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Key Conversions</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">{formatCompactNumber(totalConversions)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Goals & events</span>
            </div>
          </div>

          {/* Web Traffic Trend Chart */}
          {clientMetrics.filter(m => m.date).length > 1 && (
            <WebTrafficTrendChart
              data={clientMetrics
                .filter(m => m.date)
                .map(m => ({ date: m.date, sessions: m.sessions, conversions: m.conversions }))}
            />
          )}

          {/* Acquisition Channels Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Traffic Acquisition by Default Channel</h3>
                <p className="text-xs text-gray-500">Breakdown of website visits, users, and goal conversions by acquisition source</p>
              </div>
              {onCreateTask && (
                <button
                  onClick={() => onCreateTask({
                    title: `Analyze GA4 Conversion Dropoffs for ${client.name}`,
                    description: `Review GA4 channel conversion rates and investigate low-converting traffic sources.`,
                    priority: 'high',
                    client_id: client.id
                  })}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                  Create Analytics Task
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase tracking-wider font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Channel Grouping</th>
                    <th className="py-2.5 px-4 text-right">Users</th>
                    <th className="py-2.5 px-4 text-right">Sessions</th>
                    <th className="py-2.5 px-4 text-right">Conversions</th>
                    <th className="py-2.5 px-4 text-right">Conversion Rate</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {channelsList.map(([channel, stats], i) => {
                    const convRate = stats.sessions > 0 ? (stats.conversions / stats.sessions) * 100 : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {channel}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {formatCompactNumber(stats.users)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {formatCompactNumber(stats.sessions)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600 font-mono">
                          {formatCompactNumber(stats.conversions)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {convRate.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          {onCreateTask && (
                            <button
                              onClick={() => onCreateTask({
                                title: `Optimize ${channel} Funnel for ${client.name}`,
                                description: `Review landing pages and lead paths driven by ${channel} traffic (Currently ${stats.conversions} conversions from ${stats.sessions} sessions).`,
                                priority: 'medium',
                                client_id: client.id
                              })}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                            >
                              + Task
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
