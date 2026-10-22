import {
  Profile,
  Client,
  Project,
  Task,
  TaskChecklist,
  TaskComment,
  Attachment,
  Approval,
  NotificationItem,
  ActivityLog,
  ClientIntegration,
  IntegrationAsset,
  IntegrationSyncLog,
  DailyMetricRecord,
  SocialContentMetric,
  WebsiteMetricRecord,
  SearchConsoleMetricRecord,
  ImportedFileRecord,
  ManualMetricEntry,
  IntegrationPlatform,
  IntegrationStatus,
  TaskStatus,
  TaskPriority,
} from '../types/database';

const STORAGE_KEYS = {
  PROFILES: 'agency_os_real_profiles_v2',
  CLIENTS: 'agency_os_real_clients_v2',
  PROJECTS: 'agency_os_real_projects_v2',
  TASKS: 'agency_os_real_tasks_v2',
  CHECKLISTS: 'agency_os_real_checklists_v2',
  COMMENTS: 'agency_os_real_comments_v2',
  ATTACHMENTS: 'agency_os_real_attachments_v2',
  APPROVALS: 'agency_os_real_approvals_v2',
  NOTIFICATIONS: 'agency_os_real_notifications_v2',
  ACTIVITY: 'agency_os_real_activity_v2',
  CURRENT_USER_ID: 'agency_os_real_current_user_id_v2',
  INTEGRATIONS: 'agency_os_real_integrations_v2',
  INTEGRATION_ASSETS: 'agency_os_real_assets_v2',
  SYNC_LOGS: 'agency_os_real_sync_logs_v2',
  DAILY_METRICS: 'agency_os_real_daily_metrics_v2',
  SOCIAL_METRICS: 'agency_os_real_social_metrics_v2',
  WEBSITE_METRICS: 'agency_os_real_website_metrics_v2',
  SEARCH_METRICS: 'agency_os_real_search_metrics_v2',
  IMPORTED_FILES: 'agency_os_real_imported_files_v2',
  MANUAL_ENTRIES: 'agency_os_real_manual_entries_v2',
};

// Safe LocalStorage helpers
function loadLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('agency_os_data_change'));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Initial Admin / Agency Owner Profile
const INITIAL_OWNER_PROFILE: Profile = {
  id: 'owner-1',
  email: 'digitalprateek008@gmail.com',
  full_name: 'Agency Principal',
  title: 'Managing Director & Administrator',
  department: 'Leadership',
  role: 'admin',
  status: 'active',
  initials: 'AP',
};

class DataService {
  private profiles: Profile[] = loadLocal(STORAGE_KEYS.PROFILES, [INITIAL_OWNER_PROFILE]);
  private clients: Client[] = loadLocal(STORAGE_KEYS.CLIENTS, []);
  private projects: Project[] = loadLocal(STORAGE_KEYS.PROJECTS, []);
  private tasks: Task[] = loadLocal(STORAGE_KEYS.TASKS, []);
  private checklists: TaskChecklist[] = loadLocal(STORAGE_KEYS.CHECKLISTS, []);
  private comments: TaskComment[] = loadLocal(STORAGE_KEYS.COMMENTS, []);
  private attachments: Attachment[] = loadLocal(STORAGE_KEYS.ATTACHMENTS, []);
  private approvals: Approval[] = loadLocal(STORAGE_KEYS.APPROVALS, []);
  private notifications: NotificationItem[] = loadLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  private activities: ActivityLog[] = loadLocal(STORAGE_KEYS.ACTIVITY, []);
  private currentUserId: string = loadLocal(STORAGE_KEYS.CURRENT_USER_ID, 'owner-1');

  // Integrations & Analytics state
  private integrations: ClientIntegration[] = loadLocal(STORAGE_KEYS.INTEGRATIONS, []);
  private integrationAssets: IntegrationAsset[] = loadLocal(STORAGE_KEYS.INTEGRATION_ASSETS, []);
  private syncLogs: IntegrationSyncLog[] = loadLocal(STORAGE_KEYS.SYNC_LOGS, []);
  private dailyMetrics: DailyMetricRecord[] = loadLocal(STORAGE_KEYS.DAILY_METRICS, []);
  private socialMetrics: SocialContentMetric[] = loadLocal(STORAGE_KEYS.SOCIAL_METRICS, []);
  private websiteMetrics: WebsiteMetricRecord[] = loadLocal(STORAGE_KEYS.WEBSITE_METRICS, []);
  private searchMetrics: SearchConsoleMetricRecord[] = loadLocal(STORAGE_KEYS.SEARCH_METRICS, []);
  private importedFiles: ImportedFileRecord[] = loadLocal(STORAGE_KEYS.IMPORTED_FILES, []);
  private manualEntries: ManualMetricEntry[] = loadLocal(STORAGE_KEYS.MANUAL_ENTRIES, []);

  constructor() {
    // Ensure owner is present
    if (this.profiles.length === 0) {
      this.profiles = [INITIAL_OWNER_PROFILE];
      saveLocal(STORAGE_KEYS.PROFILES, this.profiles);
    }
  }

  public clearAllData() {
    this.profiles = [INITIAL_OWNER_PROFILE];
    this.clients = [];
    this.projects = [];
    this.tasks = [];
    this.checklists = [];
    this.comments = [];
    this.attachments = [];
    this.approvals = [];
    this.notifications = [];
    this.activities = [];
    this.currentUserId = 'owner-1';
    this.integrations = [];
    this.integrationAssets = [];
    this.syncLogs = [];
    this.dailyMetrics = [];
    this.socialMetrics = [];
    this.websiteMetrics = [];
    this.searchMetrics = [];
    this.importedFiles = [];
    this.manualEntries = [];

    saveLocal(STORAGE_KEYS.PROFILES, this.profiles);
    saveLocal(STORAGE_KEYS.CLIENTS, this.clients);
    saveLocal(STORAGE_KEYS.PROJECTS, this.projects);
    saveLocal(STORAGE_KEYS.TASKS, this.tasks);
    saveLocal(STORAGE_KEYS.CHECKLISTS, this.checklists);
    saveLocal(STORAGE_KEYS.COMMENTS, this.comments);
    saveLocal(STORAGE_KEYS.ATTACHMENTS, this.attachments);
    saveLocal(STORAGE_KEYS.APPROVALS, this.approvals);
    saveLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveLocal(STORAGE_KEYS.ACTIVITY, this.activities);
    saveLocal(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    saveLocal(STORAGE_KEYS.INTEGRATIONS, this.integrations);
    saveLocal(STORAGE_KEYS.INTEGRATION_ASSETS, this.integrationAssets);
    saveLocal(STORAGE_KEYS.SYNC_LOGS, this.syncLogs);
    saveLocal(STORAGE_KEYS.DAILY_METRICS, this.dailyMetrics);
    saveLocal(STORAGE_KEYS.SOCIAL_METRICS, this.socialMetrics);
    saveLocal(STORAGE_KEYS.WEBSITE_METRICS, this.websiteMetrics);
    saveLocal(STORAGE_KEYS.SEARCH_METRICS, this.searchMetrics);
    saveLocal(STORAGE_KEYS.IMPORTED_FILES, this.importedFiles);
    saveLocal(STORAGE_KEYS.MANUAL_ENTRIES, this.manualEntries);
  }

  // --- Session & Profiles ---
  public getCurrentUser(): Profile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    return user || this.profiles[0] || INITIAL_OWNER_PROFILE;
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    saveLocal(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public getProfiles(): Profile[] {
    return this.profiles;
  }

  public addTeamMember(data: Omit<Profile, 'id' | 'status'> & { status?: Profile['status'] }): Profile {
    const newMember: Profile = {
      id: `member-${Date.now()}`,
      status: data.status || 'active',
      initials: data.initials || data.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      ...data,
      created_at: new Date().toISOString(),
    };
    this.profiles = [...this.profiles, newMember];
    saveLocal(STORAGE_KEYS.PROFILES, this.profiles);

    this.logActivity({
      action: 'created_task',
      target_type: 'client',
      target_id: newMember.id,
      target_title: `Added team member: ${newMember.full_name} (${newMember.title})`,
    });

    return newMember;
  }

  // --- Clients CRUD ---
  public getClients(): Client[] {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'client') {
      return this.clients.filter((c) => !currentUser.client_id || c.id === currentUser.client_id);
    }
    return this.clients;
  }

  public getClientById(clientId: string): Client | undefined {
    return this.clients.find((c) => c.id === clientId);
  }

  public createClient(data: {
    name: string;
    company: string;
    contact_email: string;
    contact_phone?: string;
    services: string[];
    account_manager_id?: string;
    website?: string;
    monthly_budget?: number;
  }): Client {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      org_id: 'org-1',
      name: data.name,
      company: data.company,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      services: data.services.length > 0 ? data.services : ['Digital Marketing'],
      account_manager_id: data.account_manager_id || this.currentUserId,
      status: 'active',
      website: data.website || '',
      monthly_budget: data.monthly_budget || 0,
      created_at: new Date().toISOString(),
    };

    this.clients = [newClient, ...this.clients];
    saveLocal(STORAGE_KEYS.CLIENTS, this.clients);

    this.logActivity({
      action: 'created_client',
      target_type: 'client',
      target_id: newClient.id,
      target_title: `Created client workspace: ${newClient.company}`,
    });

    return newClient;
  }

  public updateClient(clientId: string, updates: Partial<Client>): Client | null {
    const index = this.clients.findIndex((c) => c.id === clientId);
    if (index === -1) return null;

    const updated = { ...this.clients[index], ...updates };
    this.clients[index] = updated;
    saveLocal(STORAGE_KEYS.CLIENTS, this.clients);
    return updated;
  }

  public archiveClient(clientId: string): boolean {
    return this.updateClient(clientId, { status: 'archived' }) !== null;
  }

  // --- Projects CRUD ---
  public getProjects(clientId?: string): Project[] {
    const currentUser = this.getCurrentUser();
    let list = [...this.projects];

    if (currentUser.role === 'client') {
      const allowedClientId = currentUser.client_id;
      list = list.filter((p) => !allowedClientId || p.client_id === allowedClientId);
    } else if (clientId) {
      list = list.filter((p) => p.client_id === clientId);
    }

    return list;
  }

  public getProjectById(projectId: string): Project | undefined {
    return this.projects.find((p) => p.id === projectId);
  }

  public createProject(data: {
    name: string;
    code: string;
    client_id: string;
    description?: string;
    project_manager_id?: string;
    team_member_ids?: string[];
    start_date?: string;
    due_date?: string;
    budget?: number;
  }): Project {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      org_id: 'org-1',
      client_id: data.client_id,
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
      project_manager_id: data.project_manager_id || this.currentUserId,
      team_member_ids: data.team_member_ids || [this.currentUserId],
      status: 'active',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      budget: data.budget || 0,
      spend: 0,
      created_at: new Date().toISOString(),
    };

    this.projects = [newProj, ...this.projects];
    saveLocal(STORAGE_KEYS.PROJECTS, this.projects);
    return newProj;
  }

  public updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return null;

    const updated = { ...this.projects[index], ...updates };
    this.projects[index] = updated;
    saveLocal(STORAGE_KEYS.PROJECTS, this.projects);
    return updated;
  }

  public archiveProject(projectId: string): boolean {
    return this.updateProject(projectId, { status: 'archived' }) !== null;
  }

  public getProjectProgress(projectId: string): { totalTasks: number; completedTasks: number; percentage: number } {
    const projectTasks = this.tasks.filter((t) => t.project_id === projectId);
    const totalTasks = projectTasks.length;
    if (totalTasks === 0) return { totalTasks: 0, completedTasks: 0, percentage: 0 };
    const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    return { totalTasks, completedTasks, percentage };
  }

  // --- Tasks CRUD ---
  public getTasks(projectId?: string, clientId?: string): Task[] {
    const currentUser = this.getCurrentUser();
    let result = [...this.tasks];

    if (currentUser.role === 'client') {
      const allowedClientId = currentUser.client_id;
      result = result.filter(
        (t) => t.is_client_visible && (!allowedClientId || t.client_id === allowedClientId)
      );
    }

    if (projectId) {
      result = result.filter((t) => t.project_id === projectId);
    }
    if (clientId) {
      result = result.filter((t) => t.client_id === clientId);
    }

    return result;
  }

  public getTaskById(taskId: string): Task | undefined {
    return this.tasks.find((t) => t.id === taskId);
  }

  public createTask(data: {
    title: string;
    description: string;
    project_id: string;
    client_id: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string;
    reviewer_id?: string;
    due_date?: string;
    is_client_visible?: boolean;
    sprint?: string;
    linked_campaign_id?: string;
    source_note?: string;
  }): Task {
    const taskNum = `AG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      task_number: taskNum,
      org_id: 'org-1',
      project_id: data.project_id,
      client_id: data.client_id,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assignee_id: data.assignee_id,
      reviewer_id: data.reviewer_id,
      due_date: data.due_date || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      is_client_visible: data.is_client_visible ?? true,
      sprint: data.sprint || 'Sprint W43',
      time_spent_hours: 0,
      linked_campaign_id: data.linked_campaign_id,
      source_note: data.source_note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.tasks = [newTask, ...this.tasks];
    saveLocal(STORAGE_KEYS.TASKS, this.tasks);

    this.logActivity({
      action: 'created_task',
      target_type: 'task',
      target_id: newTask.id,
      target_title: newTask.title,
    });

    return newTask;
  }

  public updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = this.tasks[index];
    const updatedTask: Task = {
      ...oldTask,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.tasks[index] = updatedTask;
    saveLocal(STORAGE_KEYS.TASKS, this.tasks);
    return updatedTask;
  }

  public deleteTask(taskId: string): boolean {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.checklists = this.checklists.filter((c) => c.task_id !== taskId);
    this.comments = this.comments.filter((c) => c.task_id !== taskId);
    this.attachments = this.attachments.filter((a) => a.task_id !== taskId);

    saveLocal(STORAGE_KEYS.TASKS, this.tasks);
    saveLocal(STORAGE_KEYS.CHECKLISTS, this.checklists);
    saveLocal(STORAGE_KEYS.COMMENTS, this.comments);
    saveLocal(STORAGE_KEYS.ATTACHMENTS, this.attachments);
    return true;
  }

  // --- Checklists & Comments ---
  public getChecklists(taskId: string): TaskChecklist[] {
    return this.checklists.filter((c) => c.task_id === taskId);
  }

  public addChecklist(taskId: string, title: string, tag?: string): TaskChecklist {
    const item: TaskChecklist = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: taskId,
      title,
      is_completed: false,
      tag,
      order_index: this.checklists.filter((c) => c.task_id === taskId).length + 1,
    };
    this.checklists = [...this.checklists, item];
    saveLocal(STORAGE_KEYS.CHECKLISTS, this.checklists);
    return item;
  }

  public toggleChecklist(checklistId: string): TaskChecklist | null {
    const item = this.checklists.find((c) => c.id === checklistId);
    if (!item) return null;
    item.is_completed = !item.is_completed;
    saveLocal(STORAGE_KEYS.CHECKLISTS, this.checklists);
    return item;
  }

  public getComments(taskId: string): TaskComment[] {
    const currentUser = this.getCurrentUser();
    let list = this.comments.filter((c) => c.task_id === taskId);
    if (currentUser.role === 'client') {
      list = list.filter((c) => !c.is_internal);
    }
    return list;
  }

  public addComment(taskId: string, content: string, is_internal: boolean = true): TaskComment {
    const currentUser = this.getCurrentUser();
    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      task_id: taskId,
      author_id: currentUser.id,
      content,
      is_internal: currentUser.role === 'client' ? false : is_internal,
      created_at: new Date().toISOString(),
    };
    this.comments = [...this.comments, newComment];
    saveLocal(STORAGE_KEYS.COMMENTS, this.comments);
    return newComment;
  }

  // --- Attachments & Approvals ---
  public getAttachments(taskId?: string, projectId?: string, clientId?: string): Attachment[] {
    let list = [...this.attachments];
    if (taskId) list = list.filter((a) => a.task_id === taskId);
    if (projectId) list = list.filter((a) => a.project_id === projectId);
    if (clientId) list = list.filter((a) => a.client_id === clientId);
    return list;
  }

  public addAttachment(data: {
    task_id?: string;
    project_id?: string;
    client_id: string;
    file_name: string;
    file_url: string;
    file_size_bytes: number;
    file_type: string;
    is_deliverable?: boolean;
    is_client_visible?: boolean;
  }): Attachment {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      task_id: data.task_id,
      project_id: data.project_id,
      client_id: data.client_id,
      uploader_id: this.currentUserId,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size_bytes: data.file_size_bytes,
      file_type: data.file_type,
      is_deliverable: data.is_deliverable ?? false,
      is_client_visible: data.is_client_visible ?? true,
      created_at: new Date().toISOString(),
    };
    this.attachments = [...this.attachments, newAtt];
    saveLocal(STORAGE_KEYS.ATTACHMENTS, this.attachments);
    return newAtt;
  }

  public getApprovals(clientId?: string): Approval[] {
    if (clientId) return this.approvals.filter((a) => a.client_id === clientId);
    return this.approvals;
  }

  public createApproval(data: {
    task_id?: string;
    attachment_id?: string;
    project_id: string;
    client_id: string;
    title: string;
    description?: string;
    deliverable_type?: 'ad_creative' | 'copy_deck' | 'seo_audit' | 'video_cut' | 'monthly_report';
    version_tag?: string;
  }): Approval {
    const newApproval: Approval = {
      id: `appr-${Date.now()}`,
      task_id: data.task_id,
      attachment_id: data.attachment_id,
      project_id: data.project_id,
      client_id: data.client_id,
      title: data.title,
      description: data.description,
      deliverable_type: data.deliverable_type || 'ad_creative',
      status: 'pending',
      requested_by: this.currentUserId,
      version_tag: data.version_tag || 'v1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.approvals = [newApproval, ...this.approvals];
    saveLocal(STORAGE_KEYS.APPROVALS, this.approvals);
    return newApproval;
  }

  public submitApprovalDecision(
    approvalId: string,
    decision: 'approved' | 'changes_requested',
    feedbackNotes?: string
  ): Approval | null {
    const index = this.approvals.findIndex((a) => a.id === approvalId);
    if (index === -1) return null;

    const updated: Approval = {
      ...this.approvals[index],
      status: decision,
      reviewed_by: this.currentUserId,
      reviewed_at: new Date().toISOString(),
      feedback_notes: feedbackNotes,
      updated_at: new Date().toISOString(),
    };
    this.approvals[index] = updated;
    saveLocal(STORAGE_KEYS.APPROVALS, this.approvals);
    return updated;
  }

  // --- Notifications & Activity ---
  public getNotifications(): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === this.currentUserId);
  }

  public markNotificationRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.is_read = true;
      saveLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  public markAllNotificationsRead() {
    this.notifications.forEach((n) => {
      if (n.user_id === this.currentUserId) n.is_read = true;
    });
    saveLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public addNotification(data: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>) {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.notifications = [item, ...this.notifications];
    saveLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    return item;
  }

  public getActivityLogs(clientId?: string, limit: number = 20): ActivityLog[] {
    let list = this.activities;
    if (clientId) {
      list = list.filter((a) => a.target_id === clientId || a.metadata?.client_id === clientId);
    }
    return list.slice(0, limit);
  }

  public logActivity(data: {
    action: ActivityLog['action'];
    target_type: ActivityLog['target_type'];
    target_id: string;
    target_title: string;
    metadata?: Record<string, unknown>;
  }) {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      org_id: 'org-1',
      user_id: this.currentUserId,
      action: data.action,
      target_type: data.target_type,
      target_id: data.target_id,
      target_title: data.target_title,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    };
    this.activities = [newAct, ...this.activities];
    saveLocal(STORAGE_KEYS.ACTIVITY, this.activities);
  }

  // --- Client Integrations Hub ---
  public getClientIntegrations(clientId?: string): ClientIntegration[] {
    if (clientId) {
      return this.integrations.filter((i) => i.client_id === clientId);
    }
    return this.integrations;
  }

  public getIntegration(clientId: string, platform: IntegrationPlatform): ClientIntegration | undefined {
    return this.integrations.find((i) => i.client_id === clientId && i.platform === platform);
  }

  public saveIntegration(data: {
    client_id: string;
    platform: IntegrationPlatform;
    status: IntegrationStatus;
    account_name?: string;
    external_account_id?: string;
    config?: Record<string, unknown>;
    available_data_types?: string[];
    error_message?: string;
  }): ClientIntegration {
    const existingIndex = this.integrations.findIndex(
      (i) => i.client_id === data.client_id && i.platform === data.platform
    );

    const now = new Date().toISOString();
    let record: ClientIntegration;

    if (existingIndex >= 0) {
      record = {
        ...this.integrations[existingIndex],
        ...data,
        updated_at: now,
      };
      this.integrations[existingIndex] = record;
    } else {
      record = {
        id: `int-${Date.now()}`,
        client_id: data.client_id,
        platform: data.platform,
        status: data.status,
        account_name: data.account_name,
        external_account_id: data.external_account_id,
        config: data.config,
        available_data_types: data.available_data_types || ['Campaign Performance', 'Daily Metrics'],
        error_message: data.error_message,
        created_at: now,
        updated_at: now,
      };
      this.integrations = [...this.integrations, record];
    }

    saveLocal(STORAGE_KEYS.INTEGRATIONS, this.integrations);

    this.logActivity({
      action: 'connected_integration',
      target_type: 'integration',
      target_id: record.id,
      target_title: `Configured ${data.platform.replace('_', ' ')} integration`,
      metadata: { client_id: data.client_id, platform: data.platform, status: data.status },
    });

    return record;
  }

  public disconnectIntegration(integrationId: string) {
    const integration = this.integrations.find((i) => i.id === integrationId);
    if (!integration) return;

    integration.status = 'disconnected';
    integration.updated_at = new Date().toISOString();
    saveLocal(STORAGE_KEYS.INTEGRATIONS, this.integrations);

    this.logActivity({
      action: 'connected_integration',
      target_type: 'integration',
      target_id: integrationId,
      target_title: `Disconnected ${integration.platform.replace('_', ' ')}`,
      metadata: { client_id: integration.client_id },
    });
  }

  public resetToDefaults(): void {
    this.clearAllData();
  }

  public getAllDailyMetrics(): DailyMetricRecord[] {
    return this.dailyMetrics;
  }

  public getAllSocialMetrics(): SocialContentMetric[] {
    return this.socialMetrics;
  }

  public getAllWebsiteMetrics(): WebsiteMetricRecord[] {
    return this.websiteMetrics;
  }

  public getAllSearchConsoleMetrics(): SearchConsoleMetricRecord[] {
    return this.searchMetrics;
  }

  public getSyncLogs(): IntegrationSyncLog[] {
    return this.syncLogs;
  }

  // --- Analytics & Daily Metrics ---
  public getDailyMetrics(
    clientId: string,
    filters?: {
      platform?: string;
      startDate?: string;
      endDate?: string;
      campaignId?: string;
    }
  ): DailyMetricRecord[] {
    let records = this.dailyMetrics.filter((m) => m.client_id === clientId);

    if (filters?.platform && filters.platform !== 'all') {
      records = records.filter((m) => m.platform === filters.platform);
    }
    if (filters?.startDate) {
      records = records.filter((m) => m.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      records = records.filter((m) => m.date <= filters.endDate!);
    }
    if (filters?.campaignId && filters.campaignId !== 'all') {
      records = records.filter((m) => m.campaign_id === filters.campaignId || m.campaign_name === filters.campaignId);
    }

    return records.sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  public getSocialMetrics(
    clientId: string,
    platform?: 'facebook' | 'instagram'
  ): SocialContentMetric[] {
    let records = this.socialMetrics.filter((m) => m.client_id === clientId);
    if (platform) {
      records = records.filter((m) => m.platform === platform);
    }
    return records.sort((a, b) => (a.published_at > b.published_at ? -1 : 1));
  }

  public getWebsiteMetrics(clientId: string): WebsiteMetricRecord[] {
    return this.websiteMetrics
      .filter((m) => m.client_id === clientId)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  public getSearchConsoleMetrics(clientId: string): SearchConsoleMetricRecord[] {
    return this.searchMetrics
      .filter((m) => m.client_id === clientId)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  // --- Excel & CSV Report Importer ---
  public getImportedFiles(clientId?: string): ImportedFileRecord[] {
    if (clientId) {
      return this.importedFiles.filter((f) => f.client_id === clientId);
    }
    return this.importedFiles;
  }

  public importReportRows(
    clientId: string,
    fileInfo: {
      fileName: string;
      fileType: 'xlsx' | 'xls' | 'csv';
      platform: string;
      columnMapping: Record<string, string>;
    },
    rawRows: Record<string, any>[]
  ): { fileRecord: ImportedFileRecord; importedCount: number; rejectedCount: number } {
    const fileId = `file-${Date.now()}`;
    const importedRecords: DailyMetricRecord[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, index) => {
      try {
        const campaign = String(row.campaign_name || 'General Campaign').trim();
        const spend = parseFloat(String(row.spend || 0).replace(/[^0-9.-]+/g, '')) || 0;
        const impressions = parseInt(String(row.impressions || 0).replace(/[^0-9]/g, ''), 10) || 0;
        const clicks = parseInt(String(row.clicks || 0).replace(/[^0-9]/g, ''), 10) || 0;
        const reach = parseInt(String(row.reach || impressions), 10) || impressions;
        const linkClicks = parseInt(String(row.link_clicks || clicks), 10) || clicks;
        const leads = parseInt(String(row.leads || 0), 10) || 0;
        const convValue = parseFloat(String(row.conversion_value || 0).replace(/[^0-9.-]+/g, '')) || 0;

        let dateStr = row.date ? String(row.date).trim() : new Date().toISOString().split('T')[0];
        // Normalize date to YYYY-MM-DD
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          dateStr = parsedDate.toISOString().split('T')[0];
        } else {
          dateStr = new Date().toISOString().split('T')[0];
        }

        // Calculated metrics
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const costPerLead = leads > 0 ? spend / leads : 0;
        const roas = spend > 0 && convValue > 0 ? convValue / spend : null;
        const freq = reach > 0 ? impressions / reach : 1.0;

        // Deduplication check: check if same client, platform, campaign, and date already exists
        const isDuplicate = this.dailyMetrics.some(
          (m) =>
            m.client_id === clientId &&
            m.platform === 'imported' &&
            m.campaign_name === campaign &&
            m.date === dateStr
        );

        if (!isDuplicate) {
          const metricRecord: DailyMetricRecord = {
            id: `metric-${Date.now()}-${index}`,
            client_id: clientId,
            date: dateStr,
            platform: 'imported',
            campaign_name: campaign,
            ad_set_name: row.ad_set_name ? String(row.ad_set_name).trim() : undefined,
            ad_name: row.ad_name ? String(row.ad_name).trim() : undefined,
            spend,
            impressions,
            reach,
            frequency: parseFloat(freq.toFixed(2)),
            clicks,
            link_clicks: linkClicks,
            ctr: parseFloat(ctr.toFixed(2)),
            cpc: parseFloat(cpc.toFixed(2)),
            cpm: parseFloat(cpm.toFixed(2)),
            leads,
            cost_per_lead: parseFloat(costPerLead.toFixed(2)),
            conversion_value: convValue,
            roas: roas !== null ? parseFloat(roas.toFixed(2)) : null,
            source_type: 'imported',
            source_file_id: fileId,
            created_at: new Date().toISOString(),
          };

          importedRecords.push(metricRecord);
        } else {
          errors.push(`Row ${index + 1}: Duplicate entry for "${campaign}" on date ${dateStr} skipped.`);
        }
      } catch (err: any) {
        errors.push(`Row ${index + 1}: ${err.message || 'Validation error'}`);
      }
    });

    // Save records
    this.dailyMetrics = [...importedRecords, ...this.dailyMetrics];
    saveLocal(STORAGE_KEYS.DAILY_METRICS, this.dailyMetrics);

    const dates = importedRecords.map((r) => r.date).sort();

    const fileRecord: ImportedFileRecord = {
      id: fileId,
      client_id: clientId,
      uploader_id: this.currentUserId,
      file_name: fileInfo.fileName,
      file_type: fileInfo.fileType,
      platform: fileInfo.platform,
      reporting_start: dates[0] || new Date().toISOString().split('T')[0],
      reporting_end: dates[dates.length - 1] || new Date().toISOString().split('T')[0],
      rows_total: rawRows.length,
      rows_imported: importedRecords.length,
      rows_rejected: rawRows.length - importedRecords.length,
      status: importedRecords.length > 0 ? (errors.length > 0 ? 'partial' : 'completed') : 'failed',
      column_mapping: fileInfo.columnMapping,
      error_log: errors.length > 0 ? errors.slice(0, 10) : undefined,
      created_at: new Date().toISOString(),
    };

    this.importedFiles = [fileRecord, ...this.importedFiles];
    saveLocal(STORAGE_KEYS.IMPORTED_FILES, this.importedFiles);

    // Also mark Excel/CSV integration as connected for this client
    this.saveIntegration({
      client_id: clientId,
      platform: 'excel_csv',
      status: 'connected',
      account_name: fileInfo.fileName,
      external_account_id: fileId,
      available_data_types: ['Ad Spend', 'Impressions', 'Clicks', 'Conversions'],
    });

    this.logActivity({
      action: 'imported_report',
      target_type: 'import',
      target_id: fileId,
      target_title: `Imported ${importedRecords.length} rows from ${fileInfo.fileName}`,
      metadata: { client_id: clientId, file_name: fileInfo.fileName },
    });

    return {
      fileRecord,
      importedCount: importedRecords.length,
      rejectedCount: rawRows.length - importedRecords.length,
    };
  }

  // --- Manual Metrics Entry ---
  public addManualMetrics(data: {
    client_id: string;
    platform: string;
    period_start: string;
    period_end: string;
    campaign_name: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    notes?: string;
  }): DailyMetricRecord {
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
    const cpm = data.impressions > 0 ? (data.spend / data.impressions) * 1000 : 0;
    const roas = data.spend > 0 && data.revenue > 0 ? data.revenue / data.spend : null;
    const costPerLead = data.conversions > 0 ? data.spend / data.conversions : 0;

    const metric: DailyMetricRecord = {
      id: `manual-${Date.now()}`,
      client_id: data.client_id,
      date: data.period_end || new Date().toISOString().split('T')[0],
      platform: 'manual',
      campaign_name: data.campaign_name || `${data.platform} Campaign`,
      spend: data.spend,
      impressions: data.impressions,
      reach: data.impressions,
      frequency: 1.0,
      clicks: data.clicks,
      link_clicks: data.clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpm: parseFloat(cpm.toFixed(2)),
      leads: data.conversions,
      cost_per_lead: parseFloat(costPerLead.toFixed(2)),
      conversion_value: data.revenue,
      roas: roas !== null ? parseFloat(roas.toFixed(2)) : null,
      source_type: 'manual',
      source_notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.dailyMetrics = [metric, ...this.dailyMetrics];
    saveLocal(STORAGE_KEYS.DAILY_METRICS, this.dailyMetrics);

    const manualEntry: ManualMetricEntry = {
      id: `m-entry-${Date.now()}`,
      client_id: data.client_id,
      platform: data.platform,
      period_start: data.period_start,
      period_end: data.period_end,
      spend: data.spend,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      revenue: data.revenue,
      notes: data.notes || '',
      created_by: this.currentUserId,
      created_at: new Date().toISOString(),
    };

    this.manualEntries = [manualEntry, ...this.manualEntries];
    saveLocal(STORAGE_KEYS.MANUAL_ENTRIES, this.manualEntries);

    this.saveIntegration({
      client_id: data.client_id,
      platform: 'manual_entry',
      status: 'connected',
      account_name: `Manual (${data.platform})`,
      available_data_types: ['Manual KPI Entry'],
    });

    this.logActivity({
      action: 'manual_metric_logged',
      target_type: 'client',
      target_id: data.client_id,
      target_title: `Logged manual metrics for ${data.platform}: $${data.spend} spend`,
      metadata: { client_id: data.client_id },
    });

    return metric;
  }

  // --- Task creation from analytics report ---
  public createTaskFromReport(data: {
    client_id: string;
    campaign_name: string;
    title: string;
    description: string;
    priority?: TaskPriority;
  }): Task {
    // Find or create general project for this client
    let project = this.projects.find((p) => p.client_id === data.client_id);
    if (!project) {
      project = this.createProject({
        client_id: data.client_id,
        name: 'Marketing Campaigns & Optimizations',
        code: 'MKTG-1',
      });
    }

    return this.createTask({
      client_id: data.client_id,
      project_id: project.id,
      title: data.title,
      description: data.description,
      priority: data.priority || 'high',
      linked_campaign_id: data.campaign_name,
      source_note: `Created from campaign report: ${data.campaign_name}`,
    });
  }

  // --- Statistics for Dashboard (Based ONLY on real records) ---
  public getDashboardStats() {
    const tasks = this.getTasks();
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review').length;
    const completed = tasks.filter((t) => t.status === 'done').length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueToday = tasks.filter((t) => {
      if (t.status === 'done') return false;
      const d = new Date(t.due_date);
      return d >= startOfToday && d <= endOfToday;
    }).length;

    const overdue = tasks.filter((t) => {
      if (t.status === 'done') return false;
      const d = new Date(t.due_date);
      return d < startOfToday;
    }).length;

    // Total tracked advertising spend across all client integrations
    const totalAdSpend = this.dailyMetrics.reduce((acc, curr) => acc + (curr.spend || 0), 0);
    const totalConversions = this.dailyMetrics.reduce((acc, curr) => acc + (curr.leads || 0), 0);
    const connectedIntegrationsCount = this.integrations.filter((i) => i.status === 'connected').length;

    return {
      total,
      todo,
      inProgress,
      inReview,
      completed,
      dueToday,
      overdue,
      clientsCount: this.clients.length,
      projectsCount: this.projects.length,
      teamCount: this.profiles.length,
      totalAdSpend,
      totalConversions,
      connectedIntegrationsCount,
    };
  }
}

export const dataService = new DataService();
