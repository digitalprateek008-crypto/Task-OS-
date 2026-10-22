import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  MousePointer,
  Eye,
  Percent,
  Download,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DailyMetricRecord } from '../../types/database';
import { dataService } from '../../services/dataService';
import {
  formatCurrency,
  formatCompactNumber,
  formatPercent,
  formatRoas,
} from '../../types/analytics';
import { SpendTrendChart } from './AnalyticsCharts';

interface MetaAdsDashboardProps {
  clientId: string;
  onOpenImporter?: () => void;
  onOpenConnectMeta?: () => void;
  onCreateOptimizationTask?: (campaignName: string, spend: number, roas: number | null) => void;
}

export const MetaAdsDashboard: React.FC<MetaAdsDashboardProps> = ({
  clientId,
  onOpenImporter,
  onOpenConnectMeta,
  onCreateOptimizationTask,
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'spend' | 'impressions' | 'leads' | 'roas'>('spend');
  const [sortAsc, setSortAsc] = useState(false);

  // Calculate start date based on range
  const now = new Date();
  let startDate: string | undefined = undefined;
  if (dateRange === '7d') {
    const d = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    startDate = d.toISOString().split('T')[0];
  } else if (dateRange === '30d') {
    const d = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    startDate = d.toISOString().split('T')[0];
  }

  // Get metrics for this client (Meta Ads or Imported Meta reports)
  const allMetrics = dataService.getDailyMetrics(clientId, { startDate });
  const metaMetrics = allMetrics.filter(
    (m) => m.platform === 'meta_ads' || (m.platform === 'imported' && !m.campaign_name.toLowerCase().includes('google'))
  );

  // Group by campaign name for the table
  const campaignMap = new Map<string, {
    name: string;
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    linkClicks: number;
    leads: number;
    conversionValue: number;
    sourceType: string;
    latestDate: string;
  }>();

  metaMetrics.forEach((m) => {
    const existing = campaignMap.get(m.campaign_name) || {
      name: m.campaign_name,
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      linkClicks: 0,
      leads: 0,
      conversionValue: 0,
      sourceType: m.source_type,
      latestDate: m.date,
    };

    existing.spend += m.spend || 0;
    existing.impressions += m.impressions || 0;
    existing.reach = Math.max(existing.reach, m.reach || 0);
    existing.clicks += m.clicks || 0;
    existing.linkClicks += m.link_clicks || 0;
    existing.leads += m.leads || 0;
    existing.conversionValue += m.conversion_value || 0;
    if (m.date > existing.latestDate) existing.latestDate = m.date;

    campaignMap.set(m.campaign_name, existing);
  });

  let campaignRows = Array.from(campaignMap.values());

  if (search.trim()) {
    campaignRows = campaignRows.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  campaignRows.sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    if (sortField === 'roas') {
      aVal = a.spend > 0 && a.conversionValue > 0 ? a.conversionValue / a.spend : 0;
      bVal = b.spend > 0 && b.conversionValue > 0 ? b.conversionValue / b.spend : 0;
    } else {
      aVal = (a as any)[sortField] || 0;
      bVal = (b as any)[sortField] || 0;
    }
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  // Aggregate Totals
  const totalSpend = metaMetrics.reduce((sum, m) => sum + (m.spend || 0), 0);
  const totalImpressions = metaMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = metaMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalLeads = metaMetrics.reduce((sum, m) => sum + (m.leads || 0), 0);
  const totalConvValue = metaMetrics.reduce((sum, m) => sum + (m.conversion_value || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const blendedRoas = totalSpend > 0 && totalConvValue > 0 ? totalConvValue / totalSpend : null;

  // Daily trajectory for charts
  const dateMap = new Map<string, { date: string; spend: number; leads: number; roas: number | null; clicks: number; conversionValue: number }>();
  metaMetrics.forEach((m) => {
    const existing = dateMap.get(m.date) || {
      date: m.date,
      spend: 0,
      leads: 0,
      roas: null,
      clicks: 0,
      conversionValue: 0,
    };
    existing.spend += m.spend || 0;
    existing.leads += m.leads || 0;
    existing.clicks += m.clicks || 0;
    existing.conversionValue += m.conversion_value || 0;
    existing.roas = existing.spend > 0 && existing.conversionValue > 0 ? existing.conversionValue / existing.spend : null;
    dateMap.set(m.date, existing);
  });
  const dailyTrajectory = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Export Table to CSV
  const handleExportCSV = () => {
    if (campaignRows.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Campaign Name,Spend,Impressions,Clicks,CTR,CPC,Leads,Cost Per Lead,Conv Value,ROAS,Source',
        ...campaignRows.map((c) => {
          const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0';
          const cpc = c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : '0';
          const cpl = c.leads > 0 ? (c.spend / c.leads).toFixed(2) : '0';
          const roas = c.spend > 0 && c.conversionValue > 0 ? (c.conversionValue / c.spend).toFixed(2) : 'N/A';
          return `"${c.name.replace(/"/g, '""')}",${c.spend},${c.impressions},${c.clicks},${ctr}%,$${cpc},${c.leads},$${cpl},$${c.conversionValue},${roas},${c.sourceType}`;
        }),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meta_ads_performance_${clientId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg p-0.5">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              dateRange === '7d' ? 'bg-[#0B1F3A] text-white' : 'text-[#667085]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              dateRange === '30d' ? 'bg-[#0B1F3A] text-white' : 'text-[#667085]'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              dateRange === 'all' ? 'bg-[#0B1F3A] text-white' : 'text-[#667085]'
            }`}
          >
            All Time
          </button>
        </div>

        <div className="flex items-center gap-2">
          {campaignRows.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0B1F3A] hover:bg-[#F7F8FA] flex items-center gap-1"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onOpenImporter}
            className="h-8 px-3 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#18345C] flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <FileSpreadsheet size={13} className="text-[#9DD52C]" />
            <span>Upload Excel/CSV Report</span>
          </button>
        </div>
      </div>

      {/* Empty State when no Meta data exists */}
      {metaMetrics.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center mx-auto">
            <DollarSign size={26} />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1F3A]">No Meta Ads Data Available</h3>
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
              Connect this client's Meta Ad Account via official OAuth, or upload an Excel / CSV advertising report to view live campaign metrics, spend trends, and ROAS.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenConnectMeta}
              className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#18345C] text-white text-xs font-bold active:scale-95 transition-all"
            >
              Connect Meta Ad Account
            </button>
            <button
              onClick={onOpenImporter}
              className="h-9 px-4 rounded-xl bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold active:scale-95 transition-all"
            >
              Upload Spreadsheet
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Amount Spent */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Amount Spent
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCurrency(totalSpend)}
              </p>
              <span className="text-[10px] text-[#667085] font-mono mt-0.5 block">
                CPM: {formatCurrency(avgCpm)}
              </span>
            </div>

            {/* Results / Leads */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Results / Leads
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCompactNumber(totalLeads)}
              </p>
              <span className="text-[10px] text-[#667085] font-mono mt-0.5 block">
                Cost/Result: {totalLeads > 0 ? formatCurrency(avgCostPerLead) : 'N/A'}
              </span>
            </div>

            {/* Clicks & CTR */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Link Clicks
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCompactNumber(totalClicks)}
              </p>
              <span className="text-[10px] text-[#667085] font-mono mt-0.5 block">
                CTR: {formatPercent(avgCtr)} · CPC: {formatCurrency(avgCpc)}
              </span>
            </div>

            {/* ROAS & Conversion Value */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Return on Ad Spend (ROAS)
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatRoas(blendedRoas)}
              </p>
              <span className="text-[10px] text-[#667085] font-mono mt-0.5 block">
                Revenue: {formatCurrency(totalConvValue)}
              </span>
            </div>
          </div>

          {/* Spend & Performance Over Time Chart */}
          {dailyTrajectory.length > 0 && (
            <SpendTrendChart
              data={dailyTrajectory}
              title="Meta Advertising Spend & Results Trajectory"
            />
          )}

          {/* Campaign Performance Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#0B1F3A]">Campaign Performance Breakdown</h4>
                <span className="text-[11px] font-mono bg-[#EFF3FF] text-[#0B1F3A] px-2 py-0.5 rounded-full font-semibold">
                  {campaignRows.length} Campaigns
                </span>
              </div>

              <div className="relative w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Filter campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-7 pl-8 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F7F8FA] font-bold text-[#667085]">
                  <tr>
                    <th className="p-3">Campaign Name</th>
                    <th
                      onClick={() => {
                        setSortField('spend');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 text-right cursor-pointer hover:text-[#0B1F3A]"
                    >
                      <span className="inline-flex items-center gap-1">
                        Spend <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="p-3 text-right">Impressions</th>
                    <th className="p-3 text-right">Clicks</th>
                    <th className="p-3 text-right">CTR</th>
                    <th className="p-3 text-right">CPC</th>
                    <th
                      onClick={() => {
                        setSortField('leads');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 text-right cursor-pointer hover:text-[#0B1F3A]"
                    >
                      <span className="inline-flex items-center gap-1">
                        Results <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="p-3 text-right">Cost / Result</th>
                    <th
                      onClick={() => {
                        setSortField('roas');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 text-right cursor-pointer hover:text-[#0B1F3A]"
                    >
                      <span className="inline-flex items-center gap-1">
                        ROAS <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] font-mono text-xs">
                  {campaignRows.map((camp, idx) => {
                    const ctr = camp.impressions > 0 ? (camp.clicks / camp.impressions) * 100 : 0;
                    const cpc = camp.clicks > 0 ? camp.spend / camp.clicks : 0;
                    const cpl = camp.leads > 0 ? camp.spend / camp.leads : 0;
                    const roas = camp.spend > 0 && camp.conversionValue > 0 ? camp.conversionValue / camp.spend : null;

                    return (
                      <tr key={idx} className="hover:bg-[#F9FAFC] transition-colors">
                        <td className="p-3 font-sans font-medium text-[#182230]">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F3A] shrink-0"></span>
                            <span className="truncate max-w-xs" title={camp.name}>
                              {camp.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-[#0B1F3A]">
                          {formatCurrency(camp.spend)}
                        </td>
                        <td className="p-3 text-right text-[#667085]">
                          {formatCompactNumber(camp.impressions)}
                        </td>
                        <td className="p-3 text-right text-[#667085]">
                          {formatCompactNumber(camp.clicks)}
                        </td>
                        <td className="p-3 text-right text-[#667085]">
                          {formatPercent(ctr)}
                        </td>
                        <td className="p-3 text-right text-[#667085]">
                          {formatCurrency(cpc)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#0B1F3A]">
                          {camp.leads > 0 ? camp.leads : '—'}
                        </td>
                        <td className="p-3 text-right text-[#667085]">
                          {camp.leads > 0 ? formatCurrency(cpl) : '—'}
                        </td>
                        <td className="p-3 text-right font-bold text-[#486800]">
                          {formatRoas(roas)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (onCreateOptimizationTask) {
                                onCreateOptimizationTask(camp.name, camp.spend, roas);
                              } else {
                                dataService.createTaskFromReport({
                                  client_id: clientId,
                                  campaign_name: camp.name,
                                  title: `Optimize Campaign: ${camp.name}`,
                                  description: `Review performance: $${camp.spend.toFixed(0)} spent, ${camp.leads} conversions, ROAS: ${formatRoas(roas)}. Adjust ad set budgets and refresh ad creative.`,
                                });
                                alert(`Task created for "${camp.name}"!`);
                              }
                            }}
                            className="px-2 py-1 rounded bg-[#F7F8FA] hover:bg-[#EFF3FF] text-[10px] font-semibold text-[#0B1F3A] border border-[#E5E7EB] transition-colors whitespace-nowrap"
                            title="Create agency optimization task from this report"
                          >
                            + Create Task
                          </button>
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
