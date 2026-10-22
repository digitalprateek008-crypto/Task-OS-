import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import {
  Task,
  Project,
  Client,
  Profile,
  Approval,
  NotificationItem,
  ActivityLog,
  ClientIntegration,
  ImportedFileRecord,
  DailyMetricRecord,
} from '../types/database';

export function useAgencyData() {
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('agency_os_data_change', refresh);
    return () => {
      window.removeEventListener('agency_os_data_change', refresh);
    };
  }, [refresh]);

  const currentUser = dataService.getCurrentUser();
  const profiles = dataService.getProfiles();
  const tasks = dataService.getTasks();
  const projects = dataService.getProjects();
  const clients = dataService.getClients();
  const approvals = dataService.getApprovals();
  const notifications = dataService.getNotifications();
  const activities = dataService.getActivityLogs();
  const stats = dataService.getDashboardStats();
  const integrations = dataService.getClientIntegrations();
  const importedFiles = dataService.getImportedFiles();
  const dailyMetrics = dataService.getAllDailyMetrics();
  const socialMetrics = dataService.getAllSocialMetrics();
  const websiteMetrics = dataService.getAllWebsiteMetrics();
  const searchConsoleMetrics = dataService.getAllSearchConsoleMetrics();
  const syncLogs = dataService.getSyncLogs();

  return {
    currentUser,
    profiles,
    tasks,
    projects,
    clients,
    approvals,
    notifications,
    activities,
    stats,
    integrations,
    importedFiles,
    dailyMetrics,
    socialMetrics,
    websiteMetrics,
    searchConsoleMetrics,
    syncLogs,
    setCurrentUser: (userId: string) => {
      dataService.setCurrentUser(userId);
      refresh();
    },
    refresh,
  };
}
