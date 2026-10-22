import React, { useState } from 'react';
import { formatCurrency, formatCompactNumber, formatPercent, formatRoas } from '../../types/analytics';

interface SpendTrendPoint {
  date: string;
  spend: number;
  leads: number;
  roas: number | null;
  clicks: number;
}

interface SpendTrendChartProps {
  data: SpendTrendPoint[];
  title?: string;
}

export const SpendTrendChart: React.FC<SpendTrendChartProps> = ({
  data,
  title = 'Performance Over Time'
}) => {
  const [activeMetric, setActiveMetric] = useState<'spend' | 'leads' | 'roas'>('spend');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Sort chronological
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  // Determine max value for scaling
  const values = sorted.map((d) => {
    if (activeMetric === 'spend') return d.spend;
    if (activeMetric === 'leads') return d.leads;
    return d.roas || 0;
  });

  const maxValue = Math.max(...values, 1);
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 24;
  const chartWidth = 600;

  // Build points for SVG polyline / path
  const points = sorted.map((d, i) => {
    const x = paddingX + (i / Math.max(sorted.length - 1, 1)) * (chartWidth - paddingX * 2);
    const val = activeMetric === 'spend' ? d.spend : activeMetric === 'leads' ? d.leads : (d.roas || 0);
    const y = chartHeight - paddingY - (val / maxValue) * (chartHeight - paddingY * 2);
    return { x, y, data: d, val };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${chartHeight - paddingY} L ${points[0].x.toFixed(1)},${chartHeight - paddingY} Z`
    : '';

  const metricLabel = activeMetric === 'spend' ? 'Spend' : activeMetric === 'leads' ? 'Results' : 'ROAS';
  const metricColor = activeMetric === 'spend' ? '#0B1F3A' : activeMetric === 'leads' ? '#2563EB' : '#16A34A';

  return (
    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <h4 className="text-xs font-bold text-[#0B1F3A]">{title}</h4>
          <p className="text-[10px] text-[#667085]">Daily trajectory across reported periods</p>
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveMetric('spend')}
            className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
              activeMetric === 'spend' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            Spend ($)
          </button>
          <button
            onClick={() => setActiveMetric('leads')}
            className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
              activeMetric === 'leads' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            Results / Leads
          </button>
          <button
            onClick={() => setActiveMetric('roas')}
            className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
              activeMetric === 'roas' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            ROAS
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={metricColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="#F1F5F9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="#F1F5F9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#E2E8F0"
          />

          {/* Y Axis Labels */}
          <text
            x={paddingX - 6}
            y={paddingY + 4}
            textAnchor="end"
            fontSize="9"
            fill="#94A3B8"
            fontFamily="monospace"
          >
            {activeMetric === 'spend' ? `$${formatCompactNumber(maxValue)}` : activeMetric === 'leads' ? formatCompactNumber(maxValue) : `${maxValue.toFixed(1)}x`}
          </text>
          <text
            x={paddingX - 6}
            y={chartHeight - paddingY}
            textAnchor="end"
            fontSize="9"
            fill="#94A3B8"
            fontFamily="monospace"
          >
            0
          </text>

          {/* Shaded Area & Line */}
          {areaD && <path d={areaD} fill="url(#metricGradient)" />}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={metricColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? '5' : '3.5'}
                fill="#FFFFFF"
                stroke={metricColor}
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* X Axis Labels */}
              {(i === 0 || i === points.length - 1 || (points.length > 4 && i === Math.floor(points.length / 2))) && (
                <text
                  x={p.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748B"
                  fontFamily="sans-serif"
                >
                  {p.data.date.substring(5)}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute pointer-events-none p-2 bg-[#0B1F3A] text-white rounded-lg shadow-lg text-[10px] transform -translate-x-1/2 -translate-y-full mb-2 z-10 font-mono"
            style={{
              left: `${(points[hoverIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoverIndex].y / chartHeight) * 100}%`,
            }}
          >
            <p className="font-sans font-bold text-gray-200">{points[hoverIndex].data.date}</p>
            <p className="text-[#9DD52C] font-bold">
              {activeMetric === 'spend'
                ? formatCurrency(points[hoverIndex].data.spend)
                : activeMetric === 'leads'
                ? `${points[hoverIndex].data.leads} leads`
                : formatRoas(points[hoverIndex].data.roas)}
            </p>
            <p className="text-gray-300 text-[9px]">
              Spend: {formatCurrency(points[hoverIndex].data.spend)} · Clicks: {points[hoverIndex].data.clicks}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface WebTrafficPoint {
  date: string;
  sessions: number;
  conversions: number;
}

interface WebTrafficChartProps {
  data: WebTrafficPoint[];
}

export const WebTrafficTrendChart: React.FC<WebTrafficChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const maxSessions = Math.max(...sorted.map(d => d.sessions), 1);
  const chartHeight = 140;
  const chartWidth = 550;
  const paddingX = 35;
  const paddingY = 20;

  const points = sorted.map((d, i) => {
    const x = paddingX + (i / Math.max(sorted.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.sessions / maxSessions) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '');

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-900">Traffic Sessions Over Time</h4>
        <span className="text-[11px] font-mono text-gray-500">Max: {formatCompactNumber(maxSessions)} sessions/day</span>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
        <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#E2E8F0" />
        <path d={pathD} fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
};
