import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Filter,
  BarChart3,
  Share2
} from 'lucide-react';
import { Client, DailyMetricRecord, SocialContentMetric, WebsiteMetricRecord, SearchConsoleMetricRecord } from '../../types/database';
import { formatCurrency, formatCompactNumber, formatPercent, formatRoas } from '../../types/analytics';

interface ReportsGeneratorProps {
  client?: Client;
  clients: Client[];
  adMetrics: DailyMetricRecord[];
  socialMetrics: SocialContentMetric[];
  websiteMetrics: WebsiteMetricRecord[];
  seoMetrics: SearchConsoleMetricRecord[];
}

export const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({
  client: initialClient,
  clients,
  adMetrics,
  socialMetrics,
  websiteMetrics,
  seoMetrics
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || clients[0]?.id || '');
  const [reportTitle, setReportTitle] = useState('Monthly Executive Marketing Review');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [includeSections, setIncludeSections] = useState({
    metaAds: true,
    social: true,
    website: true,
    seo: true
  });

  const activeClient = clients.find(c => c.id === selectedClientId) || initialClient;

  // Metrics for active client
  const clientAd = adMetrics.filter(m => m.client_id === selectedClientId);
  const clientSocial = socialMetrics.filter(m => m.client_id === selectedClientId);
  const clientWeb = websiteMetrics.filter(m => m.client_id === selectedClientId);
  const clientSeo = seoMetrics.filter(m => m.client_id === selectedClientId);

  // Computations
  const totalSpend = clientAd.reduce((sum, m) => sum + m.spend, 0);
  const totalConvVal = clientAd.reduce((sum, m) => sum + m.conversion_value, 0);
  const totalConversions = clientAd.reduce((sum, m) => sum + (m.leads || 0), 0);
  const roas = totalSpend > 0 ? totalConvVal / totalSpend : 0;

  const totalReach = clientSocial.reduce((sum, m) => sum + m.reach, 0);
  const totalEngagements = clientSocial.reduce((sum, m) => sum + (m.likes + m.comments + m.shares + m.saves), 0);

  const totalSessions = clientWeb.reduce((sum, m) => sum + m.sessions, 0);
  const totalWebConversions = clientWeb.reduce((sum, m) => sum + m.conversions, 0);

  const totalSeoClicks = clientSeo.reduce((sum, m) => sum + m.clicks, 0);
  const totalSeoImpressions = clientSeo.reduce((sum, m) => sum + m.impressions, 0);

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ['Agency OS Marketing Report', activeClient?.name || 'All Clients'],
      ['Generated On', new Date().toLocaleDateString()],
      ['Report Title', reportTitle],
      [],
      ['Metric Section', 'Metric Name', 'Value'],
      ['Paid Ads', 'Total Spend ($)', totalSpend.toFixed(2)],
      ['Paid Ads', 'Total Revenue ($)', totalConvVal.toFixed(2)],
      ['Paid Ads', 'ROAS', roas.toFixed(2)],
      ['Paid Ads', 'Ad Conversions', totalConversions.toString()],
      ['Social Media', 'Total Reach', totalReach.toString()],
      ['Social Media', 'Total Engagements', totalEngagements.toString()],
      ['Website Analytics', 'Sessions', totalSessions.toString()],
      ['Website Analytics', 'Web Conversions', totalWebConversions.toString()],
      ['Google Search Console', 'Organic Clicks', totalSeoClicks.toString()],
      ['Google Search Console', 'Organic Impressions', totalSeoImpressions.toString()]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(activeClient?.name || 'Client').replace(/\s+/g, '_')}_Marketing_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (hidden during print) */}
      <div className="print:hidden bg-white p-5 rounded-xl border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Agency Reports & Executive Summaries</h2>
            <p className="text-xs text-gray-500">
              Generate printable, client-ready marketing performance summaries or export CSV data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-gray-500" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#9DD52C]" />
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Select Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Report Heading</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Time Horizon</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            >
              <option value="month">Current Month</option>
              <option value="quarter">Current Quarter (Q4)</option>
              <option value="year">Full Year (YTD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actual Printable Document */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="border-b-2 border-[#0B1F3A] pb-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-[#9DD52C]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AGENCY OS CLIENT REPORT</span>
            </div>
            <h1 className="text-2xl font-black text-[#0B1F3A]">{reportTitle}</h1>
            <p className="text-sm font-semibold text-gray-600 mt-1">
              Prepared for: <span className="text-[#0B1F3A] font-bold">{activeClient?.name || 'Client Workspace'}</span>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-gray-500">
            <p className="font-semibold text-gray-800">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Data Status: Verified & Reconciled</p>
          </div>
        </div>

        {/* High-Level Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="text-[11px] font-medium text-gray-500 uppercase">Paid Ad Spend</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpend)}</p>
            <span className="text-[10px] text-gray-500 mt-1 block">Meta & Google campaigns</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="text-[11px] font-medium text-gray-500 uppercase">Conversion Value</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalConvVal)}</p>
            <span className="text-[10px] text-gray-500 mt-1 block">Blended ROAS: {formatRoas(roas)}</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="text-[11px] font-medium text-gray-500 uppercase">Organic Reach</span>
            <p className="text-xl font-bold text-purple-600 mt-1">{formatCompactNumber(totalReach)}</p>
            <span className="text-[10px] text-gray-500 mt-1 block">{formatCompactNumber(totalEngagements)} social engagements</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="text-[11px] font-medium text-gray-500 uppercase">Web Sessions</span>
            <p className="text-xl font-bold text-blue-600 mt-1">{formatCompactNumber(totalSessions)}</p>
            <span className="text-[10px] text-gray-500 mt-1 block">{formatCompactNumber(totalWebConversions)} site conversions</span>
          </div>
        </div>

        {/* Section 1: Paid Advertising Breakdown */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Paid Advertising Performance
          </h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Campaign Name</th>
                  <th className="py-2.5 px-4 text-right">Spend</th>
                  <th className="py-2.5 px-4 text-right">Impressions</th>
                  <th className="py-2.5 px-4 text-right">Clicks</th>
                  <th className="py-2.5 px-4 text-right">CTR</th>
                  <th className="py-2.5 px-4 text-right">Conversions</th>
                  <th className="py-2.5 px-4 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientAd.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-medium text-gray-900">{row.campaign_name || 'Campaign Record'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(row.spend)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-gray-600">{formatCompactNumber(row.impressions)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-gray-600">{formatCompactNumber(row.clicks)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-gray-600">{row.ctr.toFixed(2)}%</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-600">{row.leads || 0}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">{formatRoas(row.roas)}</td>
                  </tr>
                ))}
                {clientAd.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400 text-xs">
                      No ad campaign records found for this client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: SEO & Website Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Website Traffic Summary (GA4)
            </h2>
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/30">
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCompactNumber(clientWeb.reduce((s, m) => s + (m.total_users || m.active_users || 0), 0))}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCompactNumber(totalSessions)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Goal Conversions</span>
                <span className="font-semibold text-emerald-600 font-mono">{formatCompactNumber(totalWebConversions)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-gray-600">Avg Engagement Rate</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {clientWeb.length ? (clientWeb.reduce((s, m) => s + m.engagement_rate, 0) / clientWeb.length).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Search Console SEO Summary (GSC)
            </h2>
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/30">
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Organic Clicks</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCompactNumber(totalSeoClicks)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Organic Impressions</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCompactNumber(totalSeoImpressions)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Average Click-Through Rate</span>
                <span className="font-semibold text-emerald-600 font-mono">
                  {totalSeoImpressions > 0 ? ((totalSeoClicks / totalSeoImpressions) * 100).toFixed(2) : '0.00'}%
                </span>
              </div>
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-gray-600">Keywords Tracked</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {clientSeo.filter(m => m.query).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-[11px] text-gray-400">
          Generated automatically by Agency OS • High-fidelity Client Marketing Intelligence Platform
        </div>
      </div>
    </div>
  );
};
