import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileNav } from './MobileNav';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { DatabaseSetupModal } from '../modals/DatabaseSetupModal';

import { DashboardPage } from '../../pages/DashboardPage';
import { MyTasksPage } from '../../pages/MyTasksPage';
import { AllTasksPage } from '../../pages/AllTasksPage';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { ClientsPage } from '../../pages/ClientsPage';
import { TeamPage } from '../../pages/TeamPage';
import { CalendarPage } from '../../pages/CalendarPage';
import { ApprovalsPage } from '../../pages/ApprovalsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { ClientWorkspacePage } from '../../pages/ClientWorkspacePage';

import { IntegrationsHub } from '../integrations/IntegrationsHub';
import { ReportsGenerator } from '../reports/ReportsGenerator';
import { DataImporterModal } from '../imports/DataImporterModal';
import { ManualMetricsModal } from '../modals/ManualMetricsModal';
import { useAgencyData } from '../../hooks/useAgencyData';
import { TaskStatus } from '../../types/database';
import { UploadCloud, FileSpreadsheet, Plus, ExternalLink, Calendar, CheckCircle2, Download } from 'lucide-react';
import { SAMPLE_MARKETING_TEMPLATES, triggerDownloadSampleCSV } from '../imports/sampleTemplates';

export const AppLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeWorkspaceClientId, setActiveWorkspaceClientId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { clients, importedFiles, dailyMetrics, socialMetrics, websiteMetrics, searchConsoleMetrics } = useAgencyData();

  const handleOpenCreateTask = (status?: TaskStatus) => {
    setDefaultTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleOpenWorkspace = (clientId: string) => {
    setActiveWorkspaceClientId(clientId);
    setCurrentTab('client-workspace');
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onSelectTask={(id) => setSelectedTaskId(id)}
            onNavigateToTasks={() => setCurrentTab('my-tasks')}
            onOpenCreateTask={() => handleOpenCreateTask()}
          />
        );
      case 'my-tasks':
        return (
          <MyTasksPage
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCreateTask={handleOpenCreateTask}
          />
        );
      case 'all-tasks':
        return (
          <AllTasksPage
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCreateTask={handleOpenCreateTask}
          />
        );
      case 'projects':
        return (
          <ProjectsPage
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCreateTask={handleOpenCreateTask}
          />
        );
      case 'clients':
        return (
          <ClientsPage 
            onSelectTask={(id) => setSelectedTaskId(id)} 
            onOpenWorkspace={handleOpenWorkspace}
          />
        );
      case 'client-workspace':
        return (
          <ClientWorkspacePage
            clientId={activeWorkspaceClientId || clients[0]?.id || ''}
            onBack={() => setCurrentTab('clients')}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        );
      case 'integrations':
        return (
          <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
            <IntegrationsHub 
              onOpenImporter={() => setIsImporterOpen(true)}
              onOpenManualEntry={() => setIsManualEntryOpen(true)}
            />
          </div>
        );
      case 'reports':
        return (
          <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
            <ReportsGenerator
              clients={clients}
              adMetrics={dailyMetrics}
              socialMetrics={socialMetrics}
              websiteMetrics={websiteMetrics}
              seoMetrics={searchConsoleMetrics}
            />
          </div>
        );
      case 'data-imports':
        return (
          <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Data Imports & File Ingestion</h1>
                <p className="text-xs text-gray-500">
                  Import official marketing spreadsheets (.xlsx, .xls, .csv) with sheet selection and column mapping
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsManualEntryOpen(true)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition"
                >
                  Manual Metrics
                </button>
                <button
                  onClick={() => setIsImporterOpen(true)}
                  className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#122b4e] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition"
                >
                  <UploadCloud className="w-4 h-4 text-[#9DD52C]" />
                  <span>Import Excel / CSV</span>
                </button>
              </div>
            </div>

            {importedFiles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-800">No Export Files Uploaded</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                  Upload an advertising export from Meta Ads Manager, Google Ads, or Google Analytics to automatically populate live marketing dashboards with zero fake data.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                  <button
                    onClick={() => setIsImporterOpen(true)}
                    className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition shadow-xs"
                  >
                    Upload Marketing File (.xlsx / .csv)
                  </button>
                </div>
                <div className="pt-3 border-t border-gray-100 max-w-lg mx-auto">
                  <span className="text-[11px] font-bold text-gray-600 block mb-2">
                    Or download sample marketing spreadsheet templates:
                  </span>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {SAMPLE_MARKETING_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => triggerDownloadSampleCSV(tmpl)}
                        className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-700 flex items-center gap-1 transition"
                      >
                        <Download size={11} className="text-gray-400" />
                        <span>{tmpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Ingested Spreadsheets ({importedFiles.length})
                  </h3>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Filename</th>
                      <th className="py-2.5 px-4">Client</th>
                      <th className="py-2.5 px-4">Platform</th>
                      <th className="py-2.5 px-4 text-right">Rows</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Imported At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importedFiles.map(file => {
                      const client = clients.find(c => c.id === file.client_id);
                      return (
                        <tr key={file.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-xs">{file.file_name}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">
                            {client ? client.name : 'Unknown Client'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">
                            {file.platform.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-800">
                            {file.rows_imported}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {file.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(file.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'team':
        return <TeamPage />;
      case 'calendar':
        return <CalendarPage onSelectTask={(id) => setSelectedTaskId(id)} />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'settings':
        return <SettingsPage onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)} />;
      default:
        return (
          <DashboardPage
            onSelectTask={(id) => setSelectedTaskId(id)}
            onNavigateToTasks={() => setCurrentTab('my-tasks')}
            onOpenCreateTask={() => handleOpenCreateTask()}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F7F8FA] text-[#182230] overflow-hidden">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openDatabaseModal={() => setIsDatabaseModalOpen(true)}
      />

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-[#0B1F3A]/40 backdrop-blur-[2px]"
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={(t) => {
                setCurrentTab(t);
                setIsMobileNavOpen(false);
              }}
              openDatabaseModal={() => {
                setIsDatabaseModalOpen(true);
                setIsMobileNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onOpenCreateTask={() => handleOpenCreateTask()}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          onSelectTask={(id) => setSelectedTaskId(id)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
          {renderActivePage()}
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      {/* Database Setup & Supabase Modal */}
      <DatabaseSetupModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      {/* Global Data Importer Modal */}
      <DataImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportComplete={() => setCurrentTab('data-imports')}
      />

      {/* Global Manual Metrics Entry Modal */}
      <ManualMetricsModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        clients={clients}
        onSuccess={() => setCurrentTab('dashboard')}
      />
    </div>
  );
};
