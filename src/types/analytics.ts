export interface ColumnMappingConfig {
  sourceColumn: string;
  targetField: StandardMetricField;
}

export type StandardMetricField =
  | 'campaign_name'
  | 'ad_set_name'
  | 'ad_name'
  | 'date'
  | 'spend'
  | 'impressions'
  | 'reach'
  | 'clicks'
  | 'link_clicks'
  | 'ctr'
  | 'cpc'
  | 'cpm'
  | 'leads'
  | 'cost_per_lead'
  | 'conversion_value'
  | 'roas'
  | 'ignore';

export const STANDARD_COLUMN_ALIASES: Record<StandardMetricField, string[]> = {
  campaign_name: ['campaign name', 'campaign', 'campaign_name', 'camp name', 'ad campaign'],
  ad_set_name: ['ad set name', 'adset name', 'ad set', 'adset_name', 'ad group', 'adgroup'],
  ad_name: ['ad name', 'ad', 'creative', 'ad_name', 'creative name'],
  date: ['date', 'day', 'reporting starts', 'reporting date', 'time', 'period'],
  spend: ['amount spent (usd)', 'amount spent', 'spend', 'cost', 'total cost', 'investment'],
  impressions: ['impressions', 'impr', 'views', 'total impressions'],
  reach: ['reach', 'unique users', 'people reached'],
  clicks: ['clicks', 'clicks (all)', 'total clicks', 'interactions'],
  link_clicks: ['link clicks', 'website clicks', 'url clicks', 'outbound clicks'],
  ctr: ['ctr (link click-through rate)', 'ctr', 'ctr (all)', 'click through rate', 'click-through rate'],
  cpc: ['cpc (cost per link click)', 'cpc', 'cost per click', 'avg. cpc', 'average cpc'],
  cpm: ['cpm (cost per 1,000 impressions)', 'cpm', 'cost per 1000 impressions'],
  leads: ['results', 'leads', 'conversions', 'purchases', 'registrations', 'key events'],
  cost_per_lead: ['cost per result', 'cost per lead', 'cost / result', 'cpa', 'cost per acquisition'],
  conversion_value: ['purchases conversion value', 'conversion value', 'revenue', 'total conversion value', 'sales value'],
  roas: ['purchase roas (return on ad spend)', 'roas', 'return on ad spend', 'purchase roas'],
  ignore: ['ignore', 'skip'],
};

// Formatter utilities
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(num: number): string {
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toLocaleString();
}

export function formatPercent(rate: number): string {
  if (isNaN(rate)) return '0.00%';
  return `${rate.toFixed(2)}%`;
}

export function formatRoas(roas: number | null): string {
  if (roas === null || isNaN(roas) || roas <= 0) return 'N/A';
  return `${roas.toFixed(2)}x`;
}
