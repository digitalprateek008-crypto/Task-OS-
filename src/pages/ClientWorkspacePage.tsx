import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Users, 
  Radio, 
  BarChart3, 
  Share2, 
  Globe, 
  Search, 
  FileText, 
  UploadCloud, 
  Activity, 
  Plus, 
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { dataService } from '../services/dataService';
import { Client, Task, Project } from '../types/database';
import { UnifiedAnalyticsOverview } from '../components/analytics/UnifiedAnalyticsOverview';
import { MetaAdsDashboard } from '../components/analytics/MetaAdsDashboard';
import { SocialMediaDashboard } from '../components/analytics/SocialMediaDashboard';
import { WebsiteAnalyticsDashboard } from '../components/analytics/WebsiteAnalyticsDashboard';
import { SearchConsoleDashboard } from '../components/analytics/SearchConsoleDashboard';
import { IntegrationsHub } from '../components/integrations/IntegrationsHub';
import { ReportsGenerator } from '../components/reports/ReportsGenerator';
import { DataImporterModal } from '../components/imports/DataImporterModal';
import { ConnectPlatformModal } from '../components/integrations/ConnectPlatformModal';
import { ManualMetricsModal } from '../components/modals/ManualMetricsModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';

interface ClientWorkspacePageProps {
  clientId: string;
  onBack: () => void;
  onSelectTask: (taskId: string) => void;
}

export const ClientWorkspacePage: React.FC<ClientWorkspacePageProps> = ({
  clientId,
  onBack,
  onSelectTask
}) => {
  const { 
    clients, 
    tasks, 
    projects, 
    profiles, 
    integrations, 
    dailyMetrics, 
    socialMetrics, 
    websiteMetrics, 
    searchConsoleMetrics, 
    importedFiles, 
    syncLogs 
  } = useAgencyData();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [prefilledTask, setPrefilledTask] = useState<{ title: string; description: string; priority: any } | null>(null);

  const client = clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="flex-1 p-8 text-center bg-[#F7F8FA] overflow-y-auto">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-900">Client Workspace Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">The requested client ID does not exist or was removed.</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition"
          >
            Return to All Clients
          </button>
        </div>
      </div>
    );
  }

  // Filtered collections strictly for this client
  const clientTasks = tasks.filter(t => t.client_id === client.id);
  const clientProjects = projects.filter(p => p.client_id === client.id);
  const clientIntegrations = integrations.filter(i => i.client_id === client.id);
  const clientFiles = importedFiles.filter(f => f.client_id === client.id);
  const clientSyncLogs = (syncLogs as any[]).filter(l => {
    const integ = integrations.find(i => i.id === l.integration_id);
    return integ?.client_id === client.id;
  });

  const clientTeamProfiles = profiles.filter(p => 
    p.id === client.account_manager_id || 
    clientTasks.some(t => t.assignee_id === p.id)
  );

  const handleCreateTaskFromPerformance = (taskData: { title: string; description: string; priority: any; client_id: string }) => {
    setPrefilledTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority
    });
    setIsCreateTaskOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: `Tasks (${clientTasks.length})`, icon: CheckSquare },
    { id: 'projects', label: `Projects (${clientProjects.length})`, icon: FolderKanban },
    { id: 'team', label: `Team (${clientTeamProfiles.length})`, icon: Users },
    { id: 'integrations', label: `Integrations (${clientIntegrations.filter(i => i.status === 'connected').length})`, icon: Radio },
    { id: 'meta-ads', label: 'Meta Ads', icon: BarChart3 },
    { id: 'social-media', label: 'Social Media', icon: Share2 },
    { id: 'website', label: 'Website (GA4)', icon: Globe },
    { id: 'seo', label: 'SEO (GSC)', icon: Search },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'imports', label: `Data Imports (${clientFiles.length})`, icon: UploadCloud },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F8FA] overflow-hidden">
      {/* Client Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition"
              title="Return to Clients"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-base shadow-xs">
              {client.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{client.company}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {client.status}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Client Workspace
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Primary Contact: {client.name} {client.contact_email ? `• ${client.contact_email}` : ''} {client.contact_phone ? `• ${client.contact_phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setPrefilledTask(null);
                setIsCreateTaskOpen(true);
              }}
              className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#122b4e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#9DD52C]" />
              New Task
            </button>
            <button
              onClick={() => setIsImporterOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              Import Data
            </button>
            <button
              onClick={() => setIsConnectOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              Connect Platform
            </button>
          </div>
        </div>

        {/* 12-Tab Client Workspace Navigation */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto scrollbar-none border-t border-gray-100 pt-3 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9DD52C]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <UnifiedAnalyticsOverview
            client={client}
            adMetrics={dailyMetrics}
            socialMetrics={socialMetrics}
            websiteMetrics={websiteMetrics}
            seoMetrics={searchConsoleMetrics}
            integrations={clientIntegrations}
            onSelectTab={setActiveTab}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenConnect={() => setIsConnectOpen(true)}
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
          />
        )}

        {/* 2. TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Tasks for {client.name}</h2>
                <p className="text-xs text-gray-500">All marketing deliverables, reviews, and client actions</p>
              </div>
              <button
                onClick={() => {
                  setPrefilledTask(null);
                  setIsCreateTaskOpen(true);
                }}
                className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#9DD52C]" />
                Create Task
              </button>
            </div>

            {clientTasks.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                <CheckSquare className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">No Tasks Assigned Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                  Keep marketing deliverables on schedule by creating your first task for {client.name}.
                </p>
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition"
                >
                  Create First Task
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Task Name</th>
                      <th className="py-2.5 px-4">Assignee</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Priority</th>
                      <th className="py-2.5 px-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientTasks.map(t => {
                      const assignee = profiles.find(p => p.id === t.assignee_id);
                      return (
                        <tr 
                          key={t.id} 
                          onClick={() => onSelectTask(t.id)}
                          className="hover:bg-gray-50/70 cursor-pointer transition"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">{t.title}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#0B1F3A] text-[#9DD52C] flex items-center justify-center text-[10px] font-bold">
                                  {assignee.full_name.substring(0, 1)}
                                </span>
                                <span>{assignee.full_name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-100 text-gray-700">
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              t.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                              t.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Projects for {client.name}</h2>
                <p className="text-xs text-gray-500">Campaign initiatives, content sprints, and website builds</p>
              </div>
              <button
                onClick={() => setIsCreateProjectOpen(true)}
                className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#9DD52C]" />
                New Project
              </button>
            </div>

            {clientProjects.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                <FolderKanban className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">No Projects Created</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                  Group deliverables and campaigns into organized client projects.
                </p>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition"
                >
                  Create Client Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientProjects.map(proj => {
                  const prog = dataService.getProjectProgress(proj.id).percentage;
                  return (
                    <div key={proj.id} className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {proj.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">{prog}%</span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1">{proj.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{proj.description || 'No description provided.'}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <div className="bg-[#9DD52C] h-1.5 rounded-full" style={{ width: `${prog}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. TEAM TAB */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Assigned Agency Team</h2>
              <p className="text-xs text-gray-500">Team members responsible for {client.name}'s deliverables</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.filter(p => p.role !== 'client').map(p => {
                const isAssigned = p.id === client.account_manager_id || clientTasks.some(t => t.assignee_id === p.id);
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B1F3A] text-[#9DD52C] flex items-center justify-center font-bold text-sm">
                        {p.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{p.full_name}</h4>
                        <p className="text-[11px] text-gray-500">{p.title || p.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isAssigned ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {isAssigned ? 'Assigned' : 'Roster'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <IntegrationsHub 
            clientId={client.id}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
          />
        )}

        {/* 6. META ADS TAB */}
        {activeTab === 'meta-ads' && (
          <MetaAdsDashboard
            clientId={client.id}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenConnectMeta={() => setIsConnectOpen(true)}
            onCreateOptimizationTask={(campaignName, spend, roas) => handleCreateTaskFromPerformance({
              title: `Optimize ${campaignName} (ROAS: ${roas !== null ? roas.toFixed(2) + 'x' : 'N/A'})`,
              description: `Campaign ${campaignName} has spent $${spend.toFixed(2)}. Review targeting, creative fatigue, and bid strategy.`,
              priority: 'high',
              client_id: client.id
            })}
          />
        )}

        {/* 7. SOCIAL MEDIA TAB */}
        {activeTab === 'social-media' && (
          <SocialMediaDashboard
            clientId={client.id}
            onOpenConnectSocial={() => setIsConnectOpen(true)}
          />
        )}

        {/* 8. WEBSITE TAB */}
        {activeTab === 'website' && (
          <WebsiteAnalyticsDashboard
            client={client}
            metrics={websiteMetrics}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
            onOpenConnect={() => setIsConnectOpen(true)}
            onCreateTask={handleCreateTaskFromPerformance}
          />
        )}

        {/* 9. SEO TAB */}
        {activeTab === 'seo' && (
          <SearchConsoleDashboard
            client={client}
            metrics={searchConsoleMetrics}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
            onOpenConnect={() => setIsConnectOpen(true)}
            onCreateTask={handleCreateTaskFromPerformance}
          />
        )}

        {/* 10. REPORTS TAB */}
        {activeTab === 'reports' && (
          <ReportsGenerator
            client={client}
            clients={clients}
            adMetrics={dailyMetrics}
            socialMetrics={socialMetrics}
            websiteMetrics={websiteMetrics}
            seoMetrics={searchConsoleMetrics}
          />
        )}

        {/* 11. DATA IMPORTS TAB */}
        {activeTab === 'imports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Imported Reports & Raw Spreadsheets</h2>
                <p className="text-xs text-gray-500">History of Excel/CSV advertising and analytics reports ingested for {client.name}</p>
              </div>
              <button
                onClick={() => setIsImporterOpen(true)}
                className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#9DD52C]" />
                Import New File
              </button>
            </div>

            {clientFiles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">No Data Files Ingested Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                  Upload Meta Ads, Google Ads, or Google Analytics CSV or XLSX export files with column mapping.
                </p>
                <button
                  onClick={() => setIsImporterOpen(true)}
                  className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#122b4e] transition"
                >
                  Import Excel / CSV File
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Filename</th>
                      <th className="py-2.5 px-4">Platform Type</th>
                      <th className="py-2.5 px-4 text-right">Rows Ingested</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Import Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientFiles.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>{file.file_name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">
                          {file.platform.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-gray-800">
                          {file.rows_imported}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            file.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {file.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(file.created_at).toLocaleDateString()} {new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 12. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Workspace Activity & Sync Logs</h2>
              <p className="text-xs text-gray-500">Audit trail of API synchronizations, file imports, and modifications</p>
            </div>

            {clientSyncLogs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">No Activity Logs Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Activity entries will appear whenever data syncs or file uploads occur for {client.name}.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {clientSyncLogs.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Sync Status: <span className="capitalize">{log.status}</span>
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          {log.records_synced} records updated {log.error_message ? `• Error: ${log.error_message}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(log.sync_started_at || log.started_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DataImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        defaultClientId={client.id}
        onImportComplete={() => setActiveTab('imports')}
      />

      <ConnectPlatformModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        clientId={client.id}
        platform={null}
        onSuccess={() => setActiveTab('integrations')}
      />

      <ManualMetricsModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        clients={clients}
        initialClientId={client.id}
        onSuccess={() => setActiveTab('overview')}
      />

      {isCreateTaskOpen && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => {
            setIsCreateTaskOpen(false);
            setPrefilledTask(null);
          }}
          defaultClientId={client.id}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          defaultClientId={client.id}
        />
      )}
    </div>
  );
};
