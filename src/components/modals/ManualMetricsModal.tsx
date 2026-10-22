import React, { useState } from 'react';
import { X, Calendar, DollarSign, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Client } from '../../types/database';
import { dataService } from '../../services/dataService';

interface ManualMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string;
  onSuccess?: () => void;
}

export const ManualMetricsModal: React.FC<ManualMetricsModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId,
  onSuccess
}) => {
  const [clientId, setClientId] = useState(initialClientId || (clients[0]?.id || ''));
  const [platform, setPlatform] = useState('meta_ads');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [metricType, setMetricType] = useState('campaign_performance');
  const [spend, setSpend] = useState<string>('');
  const [impressions, setImpressions] = useState<string>('');
  const [clicks, setClicks] = useState<string>('');
  const [conversions, setConversions] = useState<string>('');
  const [conversionValue, setConversionValue] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client.');
      return;
    }
    if (!date) {
      setError('Please enter a date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const numSpend = spend ? parseFloat(spend) : 0;
      const numImpressions = impressions ? parseInt(impressions, 10) : 0;
      const numClicks = clicks ? parseInt(clicks, 10) : 0;
      const numConversions = conversions ? parseInt(conversions, 10) : 0;
      const numConvValue = conversionValue ? parseFloat(conversionValue) : 0;

      dataService.addManualMetrics({
        client_id: clientId,
        platform,
        period_start: date,
        period_end: date,
        campaign_name: campaignName || `${platform} Campaign`,
        spend: numSpend,
        impressions: numImpressions,
        clicks: numClicks,
        conversions: numConversions,
        revenue: numConvValue,
        notes: notes || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record metrics.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">Manual Metrics Entry</h2>
            <p className="text-xs text-gray-500">Log verified marketing results for offline or unintegrated sources</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Platform *</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              >
                <option value="meta_ads">Meta Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="ga4">Google Analytics 4</option>
                <option value="gsc">Google Search Console</option>
                <option value="generic">Offline / Direct Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign / Label</label>
              <input
                type="text"
                placeholder="e.g. Q4 Brand Awareness"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Spend ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Impressions</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Clicks</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={clicks}
                onChange={(e) => setClicks(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Conversions</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={conversions}
                onChange={(e) => setConversions(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Value ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={conversionValue}
                onChange={(e) => setConversionValue(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Verification Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Exported from offline call center log / reconciled invoice."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1F3A] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record Metrics'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
