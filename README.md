# Agency OS — Premium Task Management System for Digital Marketing Agencies

Agency OS is a modern, simple task and client project management system tailored for digital marketing agencies with 15+ team members. It merges functional minimalism with operational velocity, anchored in deep navy (`#0B1F3A`) and kinetic lime (`#9DD52C`).

---

## Key Features

- **Operational Dashboard**: Real-time KPI summaries (In Progress, Due Today, Overdue, Completed), cross-department live capacity gauges (Creative Studio, Media Buying, Organic & SEO), and priority queue.
- **My Tasks & All Tasks**: Dual-mode List and Kanban views, subtask checklist progress indicators (`75% done`), urgency tags, and floating bulk action dock (`Defer`, `Mark Done`).
- **Deep Task Inspector**: Slide-over drawer with 2-column meta grid (Assignee, Reviewer, Due date, Client & Project), editable title/description, interactive checklist items, file attachments, and internal discussion feed.
- **Client & Project Management**: Client accounts with services, monthly retainer budgets, project delivery milestones, and budget burn gauges.
- **Agency Team Roster (15+)**: Full directory across departments (Media Buying, Creative Studio, Organic & SEO, Account Management, Leadership) with workload statistics and instant role-switching to test permissions.
- **Delivery Calendar**: Monthly milestone view with interactive task deadline badges.
- **Client Portal & Approvals**: Isolated client view where clients review authorized deliverables, approve campaigns, request changes with feedback, and have internal agency comments hidden.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **Database & Auth**: Supabase PostgreSQL database, Supabase Auth, Row-Level Security (RLS)
- **Deployment**: Compatible with GitHub and Vercel

---

## Environment Variables

Configure these variables in `.env` (refer to `.env.example`):

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

*Note: When Supabase credentials are not provided, Agency OS automatically operates in a persistent in-browser database mode pre-seeded with 15+ team members and sample clients, so the application runs immediately without requiring an external database setup.*

---

## Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the schema migration script located at:
   ```
   supabase/migrations/20261022000000_agency_os_schema.sql
   ```
4. Run the seed data script to populate sample marketing clients and tasks:
   ```
   supabase/seed.sql
   ```
5. Copy your project URL and anon public key into your `.env` or Vercel Environment Variables.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Run build verification
npm run build

# Run TypeScript linter
npm run lint
```

---

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the repository in [vercel.com](https://vercel.com).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Nested routing and client-side transitions work out of the box.
