export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'client';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'planning' | 'active' | 'in_review' | 'completed' | 'archived';
export type ClientStatus = 'active' | 'lead' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

export type IntegrationPlatform =
  | 'meta_ads'
  | 'meta_business'
  | 'facebook_pages'
  | 'instagram_business'
  | 'google_ads'
  | 'ga4'
  | 'google_search_console'
  | 'google_tag_manager'
  | 'excel_csv'
  | 'manual_entry'
  | 'generic';

export type IntegrationStatus =
  | 'not_connected'
  | 'setup_required'
  | 'connected'
  | 'syncing'
  | 'sync_error'
  | 'disconnected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  title: string;
  department: 'Media Buying' | 'Creative Studio' | 'Organic & SEO' | 'Account Management' | 'Leadership' | 'Client';
  role: UserRole;
  phone?: string;
  status: 'active' | 'away' | 'offline';
  initials?: string;
  client_id?: string; // If role is 'client', bound to this specific client
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string; // Contact person
  company: string; // Brand name
  contact_email: string;
  contact_phone?: string;
  services: string[];
  account_manager_id?: string;
  status: ClientStatus;
  website?: string;
  monthly_budget: number;
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  client_id: string;
  name: string;
  code: string; // e.g. 'APEX-Q4'
  description?: string;
  project_manager_id?: string;
  team_member_ids: string[];
  status: ProjectStatus;
  start_date?: string;
  due_date?: string;
  budget: number;
  spend: number;
  created_at: string;
}

export interface TaskChecklist {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  tag?: string;
  order_index?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Attachment {
  id: string;
  task_id?: string;
  project_id?: string;
  client_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
  is_deliverable: boolean;
  is_client_visible: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  task_number: string;
  org_id: string;
  project_id: string;
  client_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  reviewer_id?: string;
  sprint?: string;
  due_date: string;
  time_spent_hours?: number;
  is_client_visible: boolean;
  order_index?: number;
  linked_campaign_id?: string;
  source_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  task_id?: string;
  attachment_id?: string;
  project_id: string;
  client_id: string;
  title: string;
  description?: string;
  deliverable_type: 'ad_creative' | 'copy_deck' | 'seo_audit' | 'video_cut' | 'monthly_report';
  status: ApprovalStatus;
  requested_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback_notes?: string;
  version_tag: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'assignment' | 'deadline' | 'overdue' | 'approval_request' | 'client_feedback' | 'integration_sync' | 'import_complete';
  title: string;
  message: string;
  task_id?: string;
  project_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  org_id: string;
  user_id: string;
  action:
    | 'created_task'
    | 'completed_task'
    | 'uploaded_deliverable'
    | 'approved_deliverable'
    | 'requested_changes'
    | 'commented'
    | 'updated_status'
    | 'connected_integration'
    | 'synced_integration'
    | 'imported_report'
    | 'manual_metric_logged'
    | 'created_client';
  target_type: 'task' | 'project' | 'approval' | 'client' | 'integration' | 'import';
  target_id: string;
  target_title: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Integrations Schema
export interface ClientIntegration {
  id: string;
  client_id: string;
  platform: IntegrationPlatform;
  status: IntegrationStatus;
  account_name?: string;
  external_account_id?: string;
  last_synced_at?: string;
  error_message?: string;
  available_data_types?: string[];
  config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationAsset {
  id: string;
  client_id: string;
  integration_id: string;
  asset_type: 'ad_account' | 'business_portfolio' | 'page' | 'instagram_account' | 'ga4_property' | 'gsc_site' | 'google_ads_customer';
  external_id: string;
  name: string;
  is_selected: boolean;
  metadata?: Record<string, unknown>;
}

export interface IntegrationSyncLog {
  id: string;
  client_id: string;
  platform: IntegrationPlatform;
  status: 'success' | 'failed' | 'running';
  records_synced: number;
  message: string;
  started_at: string;
  completed_at?: string;
}

// Normalized Daily Metrics for Paid Ads & Imported/Manual Data
export interface DailyMetricRecord {
  id: string;
  client_id: string;
  date: string; // YYYY-MM-DD
  platform: 'meta_ads' | 'google_ads' | 'imported' | 'manual';
  campaign_id?: string;
  campaign_name: string;
  ad_set_id?: string;
  ad_set_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  link_clicks: number;
  ctr: number; // percentage e.g. 2.45
  cpc: number;
  cpm: number;
  leads: number;
  cost_per_lead: number;
  conversion_value: number;
  roas: number | null; // calculated only when spend > 0 and conversion_value > 0
  source_type: 'api' | 'imported' | 'manual';
  source_file_id?: string;
  source_notes?: string;
  created_at: string;
}

// Social Media Metrics (Facebook Pages & Instagram Professional)
export interface SocialContentMetric {
  id: string;
  client_id: string;
  platform: 'facebook' | 'instagram';
  post_id: string;
  caption: string;
  media_type: 'image' | 'video' | 'carousel' | 'reel' | 'post';
  media_url?: string;
  published_at: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number | null; // (likes + comments + shares + saves) / reach * 100
  source_type: 'api' | 'manual';
}

// Website Analytics (GA4)
export interface WebsiteMetricRecord {
  id: string;
  client_id: string;
  date: string;
  active_users: number;
  total_users: number;
  sessions: number;
  engaged_sessions: number;
  engagement_rate: number; // percentage
  avg_engagement_time_sec: number;
  event_count: number;
  conversions: number;
  channel_grouping: string;
  source_medium: string;
  source_type: 'api' | 'manual';
}

// Search Console Metrics (GSC)
export interface SearchConsoleMetricRecord {
  id: string;
  client_id: string;
  date: string;
  query: string;
  page: string;
  country: string;
  device: string;
  clicks: number;
  impressions: number;
  ctr: number; // percentage
  position: number;
  source_type: 'api' | 'manual';
}

// Imported File History
export interface ImportedFileRecord {
  id: string;
  client_id: string;
  uploader_id: string;
  file_name: string;
  file_type: 'xlsx' | 'xls' | 'csv';
  platform: string;
  reporting_start?: string;
  reporting_end?: string;
  rows_total: number;
  rows_imported: number;
  rows_rejected: number;
  status: 'completed' | 'failed' | 'partial';
  column_mapping: Record<string, string>;
  error_log?: string[];
  created_at: string;
}

// Manual Metric Entry Log
export interface ManualMetricEntry {
  id: string;
  client_id: string;
  platform: string;
  period_start: string;
  period_end: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  notes: string;
  created_by: string;
  created_at: string;
}
