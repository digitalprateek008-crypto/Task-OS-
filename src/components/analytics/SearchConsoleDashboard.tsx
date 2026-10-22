import React, { useState } from 'react';
import { 
  Search, 
  MousePointer, 
  Eye, 
  TrendingUp, 
  Hash, 
  ArrowUpRight, 
  Plus, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { Client, SearchConsoleMetricRecord } from '../../types/database';
import { formatCompactNumber, formatPercent } from '../../types/analytics';

interface SearchConsoleDashboardProps {
  client: Client;
  metrics: SearchConsoleMetricRecord[];
  onOpenImporter?: () => void;
  onOpenManualEntry?: () => void;
  onOpenConnect?: () => void;
  onCreateTask?: (taskData: { title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent'; client_id: string }) => void;
}

export const SearchConsoleDashboard: React.FC<SearchConsoleDashboardProps> = ({
  client,
  metrics,
  onOpenImporter,
  onOpenManualEntry,
  onOpenConnect,
  onCreateTask
}) => {
  const [activeTab, setActiveTab] = useState<'queries' | 'pages'>('queries');

  // Filter metrics for this client
  const clientMetrics = metrics.filter(m => m.client_id === client.id);

  // Compute aggregates
  const totalClicks = clientMetrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalImpressions = clientMetrics.reduce((sum, m) => sum + m.impressions, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = clientMetrics.length 
    ? (clientMetrics.reduce((sum, m) => sum + m.position, 0) / clientMetrics.length) 
    : 0;

  // Separate query and page metrics
  const queryRows = clientMetrics.filter(m => m.query && m.query.trim() !== '');
  const pageRows = clientMetrics.filter(m => m.page && m.page.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Google Search Console & SEO</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                clientMetrics.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {clientMetrics.length > 0 ? 'Data Available' : 'No Data Connected'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Organic search performance, keyword queries, CTR, and search rankings for {client.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenManualEntry && (
            <button 
              onClick={onOpenManualEntry}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition"
            >
              Enter GSC Metrics
            </button>
          )}
          {onOpenImporter && (
            <button 
              onClick={onOpenImporter}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition"
            >
              Import GSC Report (.xlsx/.csv)
            </button>
          )}
          {onOpenConnect && (
            <button 
              onClick={onOpenConnect}
              className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-medium transition"
            >
              Connect Search Console
            </button>
          )}
        </div>
      </div>

      {clientMetrics.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No Search Console Data Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Connect Google Search Console via OAuth, or upload standard Search Console query/page export files (.csv or .xlsx) to analyze organic keyword traffic and ranking positions.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onOpenConnect && (
              <button
                onClick={onOpenConnect}
                className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg text-xs font-semibold hover:bg-[#122b4e] transition"
              >
                Connect GSC Property
              </button>
            )}
            {onOpenImporter && (
              <button
                onClick={onOpenImporter}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
              >
                Import Search Console Export
              </button>
            )}
            {onOpenManualEntry && (
              <button
                onClick={onOpenManualEntry}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
              >
                Enter SEO Numbers Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Total Organic Clicks</span>
                <MousePointer className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCompactNumber(totalClicks)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Search engine visits</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Total Impressions</span>
                <Eye className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCompactNumber(totalImpressions)}</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Times seen in SERP</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Average CTR</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{avgCtr.toFixed(2)}%</p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Click-through rate</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Average Position</span>
                <Hash className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-[#0B1F3A] mt-2">
                {avgPosition > 0 ? avgPosition.toFixed(1) : '-'}
              </p>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Average SERP ranking</span>
            </div>
          </div>

          {/* Table Breakdown (Queries vs Landing Pages) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('queries')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'queries'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Top Search Queries ({queryRows.length})
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'pages'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Top Landing Pages ({pageRows.length})
                </button>
              </div>

              {onCreateTask && (
                <button
                  onClick={() => onCreateTask({
                    title: `SEO Content & Keyword Optimization for ${client.name}`,
                    description: `Optimize title tags, meta descriptions, and on-page content for top queries with high impressions but low CTR.`,
                    priority: 'high',
                    client_id: client.id
                  })}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                  Create SEO Task
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase tracking-wider font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">{activeTab === 'queries' ? 'Query' : 'Page URL'}</th>
                    <th className="py-2.5 px-4 text-right">Clicks</th>
                    <th className="py-2.5 px-4 text-right">Impressions</th>
                    <th className="py-2.5 px-4 text-right">CTR</th>
                    <th className="py-2.5 px-4 text-right">Position</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeTab === 'queries' ? queryRows : pageRows).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-md truncate">
                        {activeTab === 'queries' ? row.query : row.page}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 font-mono">
                        {formatCompactNumber(row.clicks)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 font-mono">
                        {formatCompactNumber(row.impressions)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-mono font-medium">
                        {row.ctr.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 font-mono">
                        {row.position.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onCreateTask && (
                          <button
                            onClick={() => onCreateTask({
                              title: `Optimize keyword "${row.query || row.page}" for ${client.name}`,
                              description: `Targeting position ${row.position.toFixed(1)} (CTR ${row.ctr.toFixed(2)}%, ${row.clicks} clicks).`,
                              priority: row.position <= 10 ? 'high' : 'medium',
                              client_id: client.id
                            })}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                          >
                            + SEO Task
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(activeTab === 'queries' ? queryRows : pageRows).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                        No {activeTab} records found. Upload an export file to populate this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
