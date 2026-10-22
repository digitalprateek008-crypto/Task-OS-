/**
 * Sample marketing spreadsheet templates for testing Excel/CSV import
 * and data ingestion locally without synthetic demo data polluting the database.
 */

export interface SampleTemplate {
  id: string;
  name: string;
  fileName: string;
  description: string;
  platform: string;
  csvContent: string;
}

export const SAMPLE_MARKETING_TEMPLATES: SampleTemplate[] = [
  {
    id: 'meta-ads',
    name: 'Meta Ads Manager Export',
    fileName: 'Meta_Ads_Performance_Sample.csv',
    platform: 'Meta Ads',
    description: 'Standard Meta Ads Manager campaign breakdown with spend, link clicks, impressions, CPM, and purchase conversions.',
    csvContent: [
      'Campaign Name,Reporting Starts,Reporting Ends,Amount Spent (USD),Impressions,Reach,Frequency,Link Clicks,CTR (All),CPC (Cost per Link Click),Purchases,Purchase Conversion Value',
      'Apex - Prospecting - Broad Video,2026-10-01,2026-10-07,1420.50,118500,89200,1.33,1840,1.55,0.77,54,4860.00',
      'Apex - Prospecting - Broad Video,2026-10-08,2026-10-14,1680.00,141200,98400,1.43,2190,1.55,0.77,68,6120.00',
      'Apex - Retargeting - MOFU Engaged,2026-10-01,2026-10-07,640.00,32400,18900,1.71,980,3.02,0.65,39,3900.00',
      'Apex - Retargeting - MOFU Engaged,2026-10-08,2026-10-14,790.25,41100,22300,1.84,1240,3.02,0.64,48,4800.00',
      'Apex - Retargeting - BOFU Cart Abandoners,2026-10-01,2026-10-07,450.00,14200,6800,2.09,610,4.30,0.74,31,3720.00',
      'Apex - Retargeting - BOFU Cart Abandoners,2026-10-08,2026-10-14,520.00,16900,7400,2.28,730,4.32,0.71,36,4320.00',
      'Apex - Creative Sandbox - Advantage+,2026-10-01,2026-10-07,890.00,82000,61000,1.34,1320,1.61,0.67,28,2520.00',
      'Apex - Creative Sandbox - Advantage+,2026-10-08,2026-10-14,940.00,88500,64200,1.38,1410,1.59,0.67,31,2790.00'
    ].join('\n'),
  },
  {
    id: 'google-ads',
    name: 'Google Ads Search & PMax Report',
    fileName: 'Google_Ads_Search_PMax_Sample.csv',
    platform: 'Google Ads',
    description: 'Standard Google Ads campaign report with search impressions, clicks, CPC, conversions, and conversion value.',
    csvContent: [
      'Campaign,Day,Cost,Impressions,Clicks,Ctr,Avg. CPC,Conversions,Conv. value',
      'Brand Search - Exact Match,2026-10-01,180.50,4200,640,15.24%,0.28,42,2940.00',
      'Brand Search - Exact Match,2026-10-02,195.00,4450,685,15.39%,0.28,45,3150.00',
      'Performance Max - High Intent Products,2026-10-01,420.00,24800,910,3.67%,0.46,31,2790.00',
      'Performance Max - High Intent Products,2026-10-02,460.00,27300,995,3.64%,0.46,35,3150.00',
      'Non-Brand Search - Category Footwear,2026-10-01,310.00,18400,420,2.28%,0.74,18,1440.00',
      'Non-Brand Search - Category Footwear,2026-10-02,340.00,19900,460,2.31%,0.74,21,1680.00'
    ].join('\n'),
  },
  {
    id: 'ga4-traffic',
    name: 'Google Analytics 4 Channel Traffic',
    fileName: 'GA4_Traffic_Acquisition_Sample.csv',
    platform: 'Google Analytics 4',
    description: 'GA4 session, user engagement, and key event report exported by primary channel grouping.',
    csvContent: [
      'Session default channel group,Users,Sessions,Engaged sessions,Engagement rate,Average engagement time,Key events',
      'Paid Social,3420,4190,2980,71.1%,58,184',
      'Direct,2890,3450,2240,64.9%,45,122',
      'Paid Search,1980,2420,1850,76.4%,72,138',
      'Organic Search,4210,5180,3810,73.6%,89,210',
      'Email Newsletter,920,1140,890,78.1%,104,82',
      'Referral,640,780,510,65.4%,41,29'
    ].join('\n'),
  },
  {
    id: 'gsc-queries',
    name: 'Google Search Console Queries & Pages',
    fileName: 'GSC_Search_Performance_Sample.csv',
    platform: 'Google Search Console',
    description: 'GSC search performance export with queries, landing pages, organic clicks, impressions, and ranking positions.',
    csvContent: [
      'Top queries,Clicks,Impressions,CTR,Position',
      'performance running shoes,1420,28400,5.0%,3.2',
      'breathable trail runner,890,14900,6.0%,4.1',
      'kinetic digital athletic wear,740,4100,18.0%,1.1',
      'best marathon trainers 2026,620,19800,3.1%,5.8',
      'ultra lightweight workout gear,480,12300,3.9%,6.4',
      'carbon plate racing shoes review,390,9800,4.0%,7.2'
    ].join('\n'),
  },
];

export const triggerDownloadSampleCSV = (template: SampleTemplate) => {
  const blob = new Blob([template.csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', template.fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
