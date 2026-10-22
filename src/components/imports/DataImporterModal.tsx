import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  FileText,
  HelpCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useAgencyData } from '../../hooks/useAgencyData';
import { dataService } from '../../services/dataService';
import {
  STANDARD_COLUMN_ALIASES,
  StandardMetricField,
  formatCurrency,
  formatCompactNumber,
} from '../../types/analytics';
import {
  SAMPLE_MARKETING_TEMPLATES,
  triggerDownloadSampleCSV,
  SampleTemplate,
} from './sampleTemplates';

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  onImportComplete?: () => void;
}

export const DataImporterModal: React.FC<DataImporterModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  onImportComplete,
}) => {
  const { clients } = useAgencyData();

  // Wizard Steps: 1: Upload, 2: Column Mapping & Preview, 3: Validation & Complete
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    defaultClientId || clients[0]?.id || ''
  );
  const [platform, setPlatform] = useState<string>('Meta Ads');
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, StandardMetricField>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    rejected: number;
    fileName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto-detect mappings for column headers
  const autoDetectMapping = (colHeaders: string[]) => {
    const mapping: Record<string, StandardMetricField> = {};
    colHeaders.forEach((header) => {
      const clean = header.toLowerCase().trim();
      let matchedField: StandardMetricField = 'ignore';

      for (const [field, aliases] of Object.entries(STANDARD_COLUMN_ALIASES)) {
        if (aliases.some((alias) => clean === alias || clean.includes(alias))) {
          matchedField = field as StandardMetricField;
          break;
        }
      }
      mapping[header] = matchedField;
    });
    return mapping;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setErrorMsg(null);
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setErrorMsg('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    if (uploadedFile.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum allowed limit (25 MB).');
      return;
    }

    setFile(uploadedFile);
    parseFile(uploadedFile);
  };

  const parseFile = (fileToParse: File) => {
    setIsProcessing(true);
    const ext = fileToParse.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(fileToParse, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsProcessing(false);
          if (results.data.length === 0) {
            setErrorMsg('The CSV file contains no readable data rows.');
            return;
          }
          const colHeaders = Object.keys(results.data[0] as object);
          setHeaders(colHeaders);
          setRawRows(results.data);
          setColumnMapping(autoDetectMapping(colHeaders));
          setStep(2);
        },
        error: (err) => {
          setIsProcessing(false);
          setErrorMsg(`Failed to parse CSV: ${err.message}`);
        },
      });
    } else {
      // Excel parse (.xlsx, .xls)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          const firstSheet = wb.SheetNames[0];
          setSelectedSheet(firstSheet);

          const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '' });
          setIsProcessing(false);

          if (sheetData.length === 0) {
            setErrorMsg('Selected worksheet contains no rows.');
            return;
          }

          const colHeaders = Object.keys(sheetData[0] as object);
          setHeaders(colHeaders);
          setRawRows(sheetData);
          setColumnMapping(autoDetectMapping(colHeaders));
          setStep(2);
        } catch (err: any) {
          setIsProcessing(false);
          setErrorMsg(`Failed to read Excel workbook: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(fileToParse);
    }
  };

  const handleLoadSampleDirectly = (template: SampleTemplate) => {
    setIsProcessing(true);
    setPlatform(template.platform);
    Papa.parse(template.csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);
        if (results.data.length === 0) return;
        const colHeaders = Object.keys(results.data[0] as object);
        setHeaders(colHeaders);
        setRawRows(results.data);
        setColumnMapping(autoDetectMapping(colHeaders));
        setFile(new File([template.csvContent], template.fileName, { type: 'text/csv' }));
        setStep(2);
      },
      error: (err: any) => {
        setIsProcessing(false);
        setErrorMsg(`Failed to parse sample CSV: ${err.message}`);
      },
    });
  };

  const handleSheetChange = (sheetName: string) => {
    if (!workbook) return;
    setSelectedSheet(sheetName);
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (sheetData.length > 0) {
      const colHeaders = Object.keys(sheetData[0] as object);
      setHeaders(colHeaders);
      setRawRows(sheetData);
      setColumnMapping(autoDetectMapping(colHeaders));
    }
  };

  const handleExecuteImport = () => {
    if (!selectedClientId) {
      setErrorMsg('Please select a client workspace for this report.');
      return;
    }

    setIsProcessing(true);

    // Transform raw rows into normalized metrics based on user mapping
    const mappedRows = rawRows.map((raw) => {
      const normalized: Record<string, any> = {};
      Object.entries(columnMapping).forEach(([sourceCol, targetField]) => {
        if (targetField !== 'ignore') {
          normalized[targetField] = raw[sourceCol];
        }
      });
      return normalized;
    });

    const fileExt = (file?.name.split('.').pop()?.toLowerCase() || 'csv') as 'xlsx' | 'xls' | 'csv';

    const result = dataService.importReportRows(
      selectedClientId,
      {
        fileName: file?.name || 'Ad_Report.csv',
        fileType: fileExt,
        platform,
        columnMapping: columnMapping as Record<string, string>,
      },
      mappedRows
    );

    setIsProcessing(false);
    setImportSummary({
      imported: result.importedCount,
      rejected: result.rejectedCount,
      fileName: file?.name || 'Report',
    });
    setStep(3);

    if (onImportComplete) {
      onImportComplete();
    }
  };

  const resetImporter = () => {
    setStep(1);
    setFile(null);
    setRawRows([]);
    setHeaders([]);
    setColumnMapping({});
    setErrorMsg(null);
    setImportSummary(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center">
              <FileSpreadsheet size={17} className="text-[#9DD52C]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B1F3A]">
                Excel & CSV Ad Report Importer
              </h3>
              <p className="text-[11px] text-[#667085]">
                Parse spreadsheets, map campaign metrics, and update client analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2 bg-white border-b border-[#E5E7EB] flex items-center gap-4 text-xs font-semibold text-[#667085] shrink-0">
          <span className={`flex items-center gap-1 ${step === 1 ? 'text-[#0B1F3A] font-bold' : ''}`}>
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${step === 1 ? 'bg-[#0B1F3A] text-white' : 'bg-[#EFF3FF] text-[#0B1F3A]'}`}>1</span>
            Upload File
          </span>
          <ArrowRight size={12} className="text-[#D1D5DB]" />
          <span className={`flex items-center gap-1 ${step === 2 ? 'text-[#0B1F3A] font-bold' : ''}`}>
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${step === 2 ? 'bg-[#0B1F3A] text-white' : 'bg-[#EFF3FF] text-[#0B1F3A]'}`}>2</span>
            Column Mapping & Preview
          </span>
          <ArrowRight size={12} className="text-[#D1D5DB]" />
          <span className={`flex items-center gap-1 ${step === 3 ? 'text-[#0B1F3A] font-bold' : ''}`}>
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${step === 3 ? 'bg-[#0B1F3A] text-white' : 'bg-[#EFF3FF] text-[#0B1F3A]'}`}>3</span>
            Import Summary
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD & CLIENT SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Target Client Workspace <span className="text-rose-500">*</span>
                  </label>
                  {clients.length === 0 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                      No clients found. Please create a client first from the Clients tab.
                    </div>
                  ) : (
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Ad Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full text-xs p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                  >
                    <option value="Meta Ads">Meta Ads (Facebook & Instagram)</option>
                    <option value="Google Ads">Google Ads (Search & PMax)</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Campaign Manager</option>
                    <option value="Generic Export">Generic Ad Report Export</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D1D5DB] hover:border-[#0B1F3A] hover:bg-[#F9FAFC] rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#EFF3FF] group-hover:bg-[#DFE9FC] text-[#0B1F3A] flex items-center justify-center transition-colors">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B1F3A]">
                    Click or drag advertising report here
                  </p>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Supports .xlsx, .xls, and .csv exports from Meta, Google, or agency templates (up to 25 MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
              </div>

              {/* Sample Templates Download / Test Cards */}
              <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E5E7EB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F3A]">
                    Test with Pre-Formatted Marketing Report Templates
                  </span>
                  <span className="text-[10px] text-[#667085]">
                    No external files needed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_MARKETING_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#0B1F3A] transition-all flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#0B1F3A] text-[11px] truncate">{tmpl.name}</span>
                          <span className="text-[9px] font-mono text-[#667085] bg-[#F7F8FA] px-1.5 py-0.2 rounded border border-[#E5E7EB]">
                            CSV
                          </span>
                        </div>
                        <p className="text-[10px] text-[#667085] leading-snug line-clamp-2 mb-2">
                          {tmpl.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => handleLoadSampleDirectly(tmpl)}
                          className="flex-1 py-1 px-2 rounded bg-[#0B1F3A] hover:bg-[#18345C] text-white text-[10px] font-bold text-center transition-all"
                        >
                          Load & Map
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDownloadSampleCSV(tmpl)}
                          className="py-1 px-2 rounded bg-[#F7F8FA] hover:bg-[#EFF3FF] text-[#0B1F3A] border border-[#E5E7EB] text-[10px] font-semibold transition-all"
                          title="Download sample CSV file"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isProcessing && (
                <div className="p-4 text-center text-xs text-[#0B1F3A] font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9DD52C] animate-ping"></span>
                  <span>Parsing spreadsheet headers and data rows...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING & PREVIEW */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Sheet selector if Excel */}
              {sheetNames.length > 1 && (
                <div className="flex items-center gap-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="font-semibold text-[#0B1F3A]">Select Worksheet:</span>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="p-1 bg-white border border-[#E5E7EB] rounded font-mono text-xs focus:outline-none"
                  >
                    {sheetNames.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#0B1F3A]">Map Spreadsheet Columns to Standard Metrics</h4>
                  <span className="text-[11px] font-mono text-[#667085]">
                    {rawRows.length} rows detected
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] mb-3">
                  Agency OS automatically mapped matching headers. You can adjust any column mapping below:
                </p>

                {/* Mapping Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-[#E5E7EB] rounded-xl bg-[#F7F8FA] custom-scrollbar">
                  {headers.map((col) => (
                    <div
                      key={col}
                      className="p-2 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-between gap-2 shadow-xs"
                    >
                      <span className="text-xs font-medium text-[#182230] truncate" title={col}>
                        {col}
                      </span>
                      <select
                        value={columnMapping[col] || 'ignore'}
                        onChange={(e) =>
                          setColumnMapping({
                            ...columnMapping,
                            [col]: e.target.value as StandardMetricField,
                          })
                        }
                        className="text-[11px] h-7 bg-[#F7F8FA] border border-[#E5E7EB] rounded px-1.5 focus:outline-none focus:border-[#0B1F3A] font-semibold text-[#0B1F3A] shrink-0"
                      >
                        <option value="campaign_name">Campaign Name</option>
                        <option value="ad_set_name">Ad Set / Group</option>
                        <option value="ad_name">Ad / Creative</option>
                        <option value="date">Date</option>
                        <option value="spend">Amount Spent / Spend ($)</option>
                        <option value="impressions">Impressions</option>
                        <option value="reach">Reach</option>
                        <option value="clicks">Clicks</option>
                        <option value="link_clicks">Link Clicks</option>
                        <option value="ctr">CTR (%)</option>
                        <option value="cpc">CPC ($)</option>
                        <option value="cpm">CPM ($)</option>
                        <option value="leads">Leads / Results</option>
                        <option value="cost_per_lead">Cost Per Lead / Result</option>
                        <option value="conversion_value">Conversion Value ($)</option>
                        <option value="roas">ROAS</option>
                        <option value="ignore">— Ignore Column —</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <h4 className="text-xs font-bold text-[#0B1F3A] mb-1.5">First 3 Rows Preview</h4>
                <div className="border border-[#E5E7EB] rounded-xl overflow-x-auto bg-white max-h-36 custom-scrollbar">
                  <table className="w-full text-left text-[11px] divide-y divide-[#E5E7EB]">
                    <thead className="bg-[#F7F8FA] font-bold text-[#667085]">
                      <tr>
                        {headers.slice(0, 6).map((h) => (
                          <th key={h} className="p-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] font-mono">
                      {rawRows.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F9FAFC]">
                          {headers.slice(0, 6).map((h) => (
                            <td key={h} className="p-2 whitespace-nowrap text-[#182230]">
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY */}
          {step === 3 && importSummary && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Report Successfully Imported</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Data from <span className="font-semibold text-[#0B1F3A]">{importSummary.fileName}</span> is now active in the client workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs">
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[#667085] block text-[11px]">Rows Imported</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">
                    {importSummary.imported}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[#667085] block text-[11px]">Duplicates/Rejected</span>
                  <span className="text-lg font-mono font-bold text-[#667085]">
                    {importSummary.rejected}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-[#667085] hover:text-[#0B1F3A]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 3 ? (
              <button
                onClick={onClose}
                className="h-9 px-4 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#18345C]"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] hover:bg-white"
                >
                  Cancel
                </button>
                {step === 2 && (
                  <button
                    onClick={handleExecuteImport}
                    disabled={isProcessing}
                    className="h-9 px-4 rounded-xl bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <span>Import {rawRows.length} Rows</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
