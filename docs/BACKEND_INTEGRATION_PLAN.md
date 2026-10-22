# Agency OS — Backend Integration & Production Architecture Plan
**Target Runtime:** Node.js Express + Supabase PostgreSQL + Meta Graph Marketing API + Google Cloud Platform

---

## Executive Summary
This architecture plan provides the complete technical specification for transitioning Agency OS from its current **Frontend Prototype / Offline Engine** to a secure, enterprise-grade production platform.

All client secrets, OAuth private keys, refresh tokens, and rate-limiting queues remain **strictly server-side** in a trusted Node.js environment. No private secrets or credentials will ever be bundled into client-side JavaScript or exposed via `VITE_` variables.

---

## 1. Database Architecture: Supabase PostgreSQL & Multi-Tenant Isolation

### 1.1 Tenant & Workspace Separation
Every client in Agency OS is treated as an isolated tenant (`client_id`). The system enforces client boundary integrity at the PostgreSQL engine level via **Row-Level Security (RLS)**.

```sql
-- Enforce tenant isolation for daily ad metrics
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members access to their agency metrics"
ON public.daily_metrics
FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM public.client_memberships
    WHERE profile_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);
```

### 1.2 Table Schema Overview
- **`clients`**: Master agency client records (legal name, domain, monthly retainers, status).
- **`client_integrations`**: Client-specific platform connection state (`platform`, `status`, `external_account_id`, encrypted token reference, `last_synced_at`).
- **`daily_metrics`**: Normalized ad campaign metrics (`spend`, `impressions`, `clicks`, `leads`, `conversion_value`, `roas`).
- **`social_content_metrics`**: Facebook page & Instagram media metrics (`reach`, `likes`, `comments`, `shares`, `saves`).
- **`website_metrics`**: GA4 traffic sessions, active users, engagement rates, and key conversion events.
- **`search_console_metrics`**: GSC search query positions, clicks, impressions, and CTR.
- **`imported_files`**: Audit trail of parsed Excel/CSV uploads with original column mappings and ingestion logs.

---

## 2. Meta Marketing API & OAuth Flow

### 2.1 Authorized Scopes
To access Meta Business Portfolios, Ad Accounts, Pages, and Instagram accounts, the following official permissions must be requested from Meta App Review:
- `ads_read`: Read ad campaigns, ad sets, ads, budgets, and delivery status.
- `read_insights`: Read aggregated advertising insights, spend, link clicks, CPM, and ROAS.
- `pages_show_list`: Enumerate Facebook pages managed by the authenticated business user.
- `instagram_basic`: Enumerate Instagram Professional Accounts connected to verified pages.
- `instagram_manage_insights`: Retrieve media impressions, reach, story analytics, and reels engagement.
- `business_management`: Read partner ad accounts and business assets within the Meta Business Portfolio.

### 2.2 Server-Side Token Exchange & Lifecycle
1. **Initiation:** User clicks "Start Official OAuth Connection" in Agency OS.
   - Front-end requests `/api/auth/meta/url?clientId={clientId}`.
   - Server validates session and generates CSRF state token containing `clientId` and nonce.
   - Browser redirects to `https://www.facebook.com/v19.0/dialog/oauth`.

2. **Server-Side Authorization Callback:**
   - Meta redirects to `/api/auth/meta/callback?code={code}&state={state}`.
   - Server verifies state token to prevent CSRF.
   - Server exchanges authorization code for short-lived user token:
     ```http
     GET https://graph.facebook.com/v19.0/oauth/access_token
       ?client_id={META_APP_ID}
       &client_secret={META_APP_SECRET}
       &redirect_uri={REDIRECT_URI}
       &code={code}
     ```
   - Server immediately exchanges short-lived token for a **60-day Long-Lived User Access Token**:
     ```http
     GET https://graph.facebook.com/v19.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={META_APP_ID}
       &client_secret={META_APP_SECRET}
       &fb_exchange_token={short_lived_token}
     ```

3. **Secure Vault Storage:**
   - Long-lived token is encrypted using AES-256-GCM before storage in database or Supabase Vault.
   - The plain token is **never** sent to the client browser.

4. **Asset Selection Workflow:**
   - Server fetches user's accessible ad accounts (`/v19.0/me/adaccounts`) and pages (`/v19.0/me/accounts`).
   - Agency operator selects the specific ad account or Instagram page corresponding to Client A.
   - Connection record is saved with `status = 'connected'`.

---

## 3. Google Cloud Platform (GA4, GSC, Google Ads) Integration

### 3.1 Google OAuth 2.0 Scopes
- `https://www.googleapis.com/auth/analytics.readonly`: Google Analytics 4 report queries.
- `https://www.googleapis.com/auth/webmasters.readonly`: Google Search Console search performance data.
- `https://www.googleapis.com/auth/adwords`: Google Ads search and Performance Max metrics.

### 3.2 Token Refresh & Server Proxy
- Offline access (`access_type=offline`, `prompt=consent`) is requested to receive a long-term **Refresh Token**.
- Server stores encrypted `refresh_token`.
- Background worker requests fresh 1-hour `access_token` automatically during scheduled sync jobs.

---

## 4. Excel & CSV Ingestion Engine

### 4.1 Local Prototyping Mode (Current)
- Utilizes browser-side SheetJS (`xlsx`) and PapaParse (`papaparse`) to read `.xlsx`, `.xls`, and `.csv` files up to 25 MB.
- Auto-detects standard platform column aliases (`Amount Spent`, `Spend`, `Cost`, `Link Clicks`, `Purchases`, `ROAS`).
- Allows visual column re-mapping and immediate data ingestion into `DailyMetricRecord`.
- Pre-built downloadable official templates allow immediate testing with zero fake database records.

### 4.2 Production Server Pipeline
- Files uploaded via `multipart/form-data` to `/api/imports/upload`.
- Node.js stream-based parser validates file checksum, schema, and malicious macro payloads.
- Row-level transactions insert batches into `daily_metrics` table with audit log in `imported_files`.

---

## 5. Security & Secret Management

| Environment Variable | Storage Location | Exposure Level |
|---|---|---|
| `META_APP_ID` | Server `.env` | Private (Server only) |
| `META_APP_SECRET` | Server `.env` | Private (Server only, Never client) |
| `GOOGLE_CLIENT_ID` | Server `.env` | Private (Server only) |
| `GOOGLE_CLIENT_SECRET` | Server `.env` | Private (Server only, Never client) |
| `GOOGLE_ADS_DEV_TOKEN` | Server `.env` | Private (Server only) |
| `ENCRYPTION_KEY_AES256` | Server `.env` | Master key for token encryption |
| `VITE_SUPABASE_URL` | Client / Server | Public URL |
| `VITE_SUPABASE_ANON_KEY` | Client / Server | Public Anon Key (Protected by RLS) |

---

## 6. Migration Checklist

- [ ] **Step 1:** Provision Supabase PostgreSQL instance. Run `supabase/migrations/20261022000000_agency_os_schema.sql`.
- [ ] **Step 2:** Register Facebook Developer App at `developers.facebook.com`. Add Marketing API. Configure OAuth Redirect URI to `https://your-domain.com/api/auth/meta/callback`.
- [ ] **Step 3:** Register Google Cloud Project at `console.cloud.google.com`. Enable GA4 Data API and Google Search Console API.
- [ ] **Step 4:** Populate server environment variables in `.env`.
- [ ] **Step 5:** Deploy backend using `server.ts` Express container on Google Cloud Run, Railway, or Vercel Serverless.
