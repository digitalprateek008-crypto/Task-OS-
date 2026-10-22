-- Agency OS Seed Data
-- 1. Organization
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Kinetic Digital Agency', 'kinetic-digital')
ON CONFLICT (id) DO NOTHING;

-- 2. Team Profiles (15+ team members + client contacts)
-- Passwords in Supabase Auth can be set up per user; these profiles represent the agency roster
INSERT INTO public.profiles (id, email, full_name, avatar_url, title, department, role, status) VALUES
('11111111-1111-1111-1111-111111110001', 'alex.morgan@kineticagency.com', 'Alex Morgan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Senior Media Buyer', 'Media Buying', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110002', 'jessica.chen@kineticagency.com', 'Jessica Chen', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Creative Director', 'Creative Studio', 'admin', 'active'),
('11111111-1111-1111-1111-111111110003', 'marcus.vance@kineticagency.com', 'Marcus Vance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Account Director', 'Account Management', 'project_manager', 'active'),
('11111111-1111-1111-1111-111111110004', 'sarah.k@kineticagency.com', 'Sarah Kowalski', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Social Strategy Lead', 'Media Buying', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110005', 'elena.rostova@kineticagency.com', 'Elena Rostova', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Senior Motion & Video Designer', 'Creative Studio', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110006', 'david.lee@kineticagency.com', 'David Lee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Lead Technical SEO', 'Organic & SEO', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110007', 'clara.w@kineticagency.com', 'Clara Wright', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'UI/UX & Brand Designer', 'Creative Studio', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110008', 'rachel.adams@kineticagency.com', 'Rachel Adams', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Lead Copywriter', 'Creative Studio', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110009', 'samuel.t@kineticagency.com', 'Samuel Taylor', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'PPC & Search Specialist', 'Media Buying', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110010', 'priya.patel@kineticagency.com', 'Priya Patel', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'Content & Editorial Manager', 'Organic & SEO', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110011', 'jordan.bell@kineticagency.com', 'Jordan Bell', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Operations & Project Manager', 'Account Management', 'project_manager', 'active'),
('11111111-1111-1111-1111-111111110012', 'maya.lin@kineticagency.com', 'Maya Lin', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'Graphic Designer', 'Creative Studio', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110013', 'lucas.gomez@kineticagency.com', 'Lucas Gomez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Analytics & Attribution Engineer', 'Media Buying', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110014', 'amara.okafor@kineticagency.com', 'Amara Okafor', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', 'Email & Lifecycle Specialist', 'Media Buying', 'team_member', 'active'),
('11111111-1111-1111-1111-111111110015', 'oliver.f@kineticagency.com', 'Oliver Finch', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150', 'Managing Partner & Founder', 'Leadership', 'admin', 'active'),
-- Client Profiles for Client Portal
('11111111-1111-1111-1111-111111110016', 'c.daniels@apexathletics.com', 'Chloe Daniels', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'VP of Marketing', 'Client', 'client', 'active'),
('11111111-1111-1111-1111-111111110017', 'n.ross@luminaskincare.com', 'Nathan Ross', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Head of Growth', 'Client', 'client', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Clients
INSERT INTO public.clients (id, org_id, name, company, contact_email, services, account_manager_id, status, website, monthly_budget) VALUES
('22222222-2222-2222-2222-222222220001', '00000000-0000-0000-0000-000000000001', 'Chloe Daniels', 'Apex Athletics', 'c.daniels@apexathletics.com', ARRAY['Meta Ads', 'UGC Video', 'TikTok Ads'], '11111111-1111-1111-1111-111111110003', 'active', 'https://apexathletics.com', 45000.00),
('22222222-2222-2222-2222-222222220002', '00000000-0000-0000-0000-000000000001', 'Nathan Ross', 'Lumina Skincare', 'n.ross@luminaskincare.com', ARRAY['Creative Design', 'Google Ads', 'Email Lifecycle'], '11111111-1111-1111-1111-111111110003', 'active', 'https://luminaskincare.com', 32000.00),
('22222222-2222-2222-2222-222222220003', '00000000-0000-0000-0000-000000000001', 'Astrid Lind', 'Nordic Roast Coffee', 'astrid@nordicroast.com', ARRAY['Social Media', 'TikTok UGC', 'Influencer'], '11111111-1111-1111-1111-111111110011', 'active', 'https://nordicroast.com', 20000.00),
('22222222-2222-2222-2222-222222220004', '00000000-0000-0000-0000-000000000001', 'Evan Brody', 'Horizon SaaS', 'evan.b@horizonsaas.io', ARRAY['Google Search', 'LinkedIn Ads', 'SEO Content'], '11111111-1111-1111-1111-111111110011', 'active', 'https://horizonsaas.io', 38000.00),
('22222222-2222-2222-2222-222222220005', '00000000-0000-0000-0000-000000000001', 'Matteo Rossi', 'Veloce Mobility', 'matteo@velocemobility.eu', ARRAY['Technical SEO', 'Performance Max', 'Local Ads'], '11111111-1111-1111-1111-111111110003', 'active', 'https://velocemobility.eu', 18000.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Client Memberships
INSERT INTO public.client_memberships (client_id, user_id, role) VALUES
('22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110016', 'client_admin'),
('22222222-2222-2222-2222-222222220002', '11111111-1111-1111-1111-111111110017', 'client_admin')
ON CONFLICT DO NOTHING;

-- 5. Projects
INSERT INTO public.projects (id, org_id, client_id, name, code, description, project_manager_id, status, start_date, due_date, budget, spend) VALUES
('33333333-3333-3333-3333-333333330001', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222220001', 'Q4 Peak Ads & Scaling', 'APEX-Q4', 'Q4 Black Friday & Cyber Week Meta Ads and TikTok acquisition sprints with Advantage+ scaling.', '11111111-1111-1111-1111-111111110003', 'active', '2026-10-01', '2026-11-30', 45000.00, 31200.00),
('33333333-3333-3333-3333-333333330002', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222220002', 'Holiday Creative Refresh', 'LUMINA-HOL', 'End-of-year brand creative rollout, high-converting Instagram carousel ads and Google retargeting.', '11111111-1111-1111-1111-111111110003', 'active', '2026-10-10', '2026-12-15', 32000.00, 18500.00),
('33333333-3333-3333-3333-333333330003', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222220003', 'Nordic UGC & Viral Hooks', 'NORDIC-UGC', 'TikTok viral product discovery sprint, creator outreach, organic to paid boosting.', '11111111-1111-1111-1111-111111110011', 'active', '2026-10-05', '2026-11-20', 20000.00, 17000.00),
('33333333-3333-3333-3333-333333330004', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222220004', 'Google Search & PMax Scaling', 'HORIZON-PMAX', 'Search query audit, negative keyword harvesting, and Performance Max budget allocation.', '11111111-1111-1111-1111-111111110011', 'active', '2026-09-15', '2026-12-31', 38000.00, 24000.00),
('33333333-3333-3333-3333-333333330005', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222220005', 'Technical SEO & Page Speed Migration', 'VELOCE-SEO', 'Core Web Vitals remediation, broken links sweep, schema markup for electric bike landing pages.', '11111111-1111-1111-1111-111111110003', 'active', '2026-10-12', '2026-11-15', 18000.00, 9500.00)
ON CONFLICT (id) DO NOTHING;

-- 6. Tasks (Matching Stitch design anchors)
INSERT INTO public.tasks (id, task_number, org_id, project_id, client_id, title, description, status, priority, assignee_id, reviewer_id, sprint, due_date, is_client_visible) VALUES
('44444444-4444-4444-4444-444444440001', 'AG-1048', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 'Scale Advantage+ Shopping Campaign budget & refresh creative angles', 'Increase daily spend from **$1,200** to **$1,500** following the verified 3.8x ROAS benchmark. Introduce 3 new hook variations tested in UGC batch #2 across top-performing lifestyle segments.', 'in_progress', 'urgent', '11111111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111110002', 'Sprint W43', NOW() + INTERVAL '4 hours', TRUE),
('44444444-4444-4444-4444-444444440002', 'AG-1049', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 'Review Q4 Black Friday Meta Ad creatives', 'Final QA on video aspect ratios (9:16 and 4:5), hook retention benchmarks, and copy variations before client sign-off.', 'todo', 'high', '11111111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111110002', 'Sprint W43', NOW() + INTERVAL '2 hours', TRUE),
('44444444-4444-4444-4444-444444440003', 'AG-1050', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330004', '22222222-2222-2222-2222-222222220004', 'Audit negative keyword list for Search campaigns', 'Sweep high-cost search queries with zero conversion attribution over the last 30 days and apply exact match negative lists.', 'in_progress', 'medium', '11111111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111110009', 'Sprint W43', NOW() + INTERVAL '6 hours', FALSE),
('44444444-4444-4444-4444-444444440004', 'AG-1051', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330003', '22222222-2222-2222-2222-222222220003', 'Approve TikTok UGC video cuts & copy hooks', 'Review 3 creator submissions for Nordic Roast, ensure brand disclaimer is present and sound sync is on-beat.', 'in_review', 'urgent', '11111111-1111-1111-1111-111111110004', '11111111-1111-1111-1111-111111110002', 'Sprint W43', NOW() + INTERVAL '5 hours', TRUE),
('44444444-4444-4444-4444-444444440005', 'AG-1052', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330002', '22222222-2222-2222-2222-222222220002', 'Design 5 static retargeting ad creatives for Instagram Stories', 'Create luxury high-aesthetic cosmetic carousel cards featuring holiday bundle and free gift packaging.', 'in_progress', 'high', '11111111-1111-1111-1111-111111110007', '11111111-1111-1111-1111-111111110002', 'Sprint W43', NOW() + INTERVAL '1 day', TRUE),
('44444444-4444-4444-4444-444444440006', 'AG-1053', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330005', '22222222-2222-2222-2222-222222220005', 'Weekly technical SEO crawl & broken links audit', 'Run full Screaming Frog crawl across 2,400 pages, verify redirect chains and canonical headers.', 'todo', 'low', '11111111-1111-1111-1111-111111110006', '11111111-1111-1111-1111-111111110011', 'Sprint W43', NOW() + INTERVAL '8 hours', FALSE),
('44444444-4444-4444-4444-444444440007', 'AG-1054', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 'Refine Meta Ads lookalike audiences 1-3%', 'Generate fresh high-value customer LAL seed lists from Shopify Q3 top 10% spenders.', 'done', 'high', '11111111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111110003', 'Sprint W43', NOW() - INTERVAL '1 day', FALSE),
('44444444-4444-4444-4444-444444440008', 'AG-1055', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330004', '22222222-2222-2222-2222-222222220004', 'Upload responsive display ads & copy variants', 'Deploy 15 headlines and 4 landscape images into Google Ads responsive display ad group.', 'in_progress', 'medium', '11111111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111110009', 'Sprint W43', NOW() + INTERVAL '3 hours', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Task Checklists
INSERT INTO public.task_checklists (task_id, title, is_completed, tag, order_index) VALUES
('44444444-4444-4444-4444-444444440001', 'Check ROAS threshold in Meta Ads Manager', TRUE, '3.82x', 1),
('44444444-4444-4444-4444-444444440001', 'Duplicate winning ad sets with new budget cap', TRUE, '$1.5k', 2),
('44444444-4444-4444-4444-444444440001', 'Swap carousel card 3 with lifestyle variant', FALSE, 'Creative', 3),
('44444444-4444-4444-4444-444444440001', 'Notify client account manager on Slack', FALSE, '#apex-q4', 4)
ON CONFLICT DO NOTHING;

-- 8. Comments
INSERT INTO public.task_comments (task_id, author_id, content, is_internal) VALUES
('44444444-4444-4444-4444-444444440001', '11111111-1111-1111-1111-111111110002', 'Creative looks ready to scale! Make sure we monitor hook retain rate closely in the first 4 hours of the increased cap.', TRUE),
('44444444-4444-4444-4444-444444440001', '11111111-1111-1111-1111-111111110001', 'Agreed. Caps updated and ad sets published. Will check at 4 PM.', TRUE)
ON CONFLICT DO NOTHING;

-- 9. Attachments
INSERT INTO public.attachments (id, task_id, project_id, client_id, uploader_id, file_name, file_url, file_size_bytes, file_type, is_deliverable, is_client_visible) VALUES
('55555555-5555-5555-5555-555555550001', '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110002', 'Figma_Hooks_v2.png', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', 2516582, 'image/png', TRUE, TRUE),
('55555555-5555-5555-5555-555555550002', '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110001', 'ROAS_Sheet.xlsx', '#', 491520, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', FALSE, FALSE),
('55555555-5555-5555-5555-555555550003', '44444444-4444-4444-4444-444444440004', '33333333-3333-3333-3333-333333330003', '22222222-2222-2222-2222-222222220003', '11111111-1111-1111-1111-111111110005', 'v2.4_final_hook_edit.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 18454937, 'video/mp4', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. Approvals
INSERT INTO public.approvals (id, task_id, attachment_id, project_id, client_id, title, description, deliverable_type, status, requested_by, version_tag) VALUES
('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440001', '55555555-5555-5555-5555-555555550001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 'Apex Black Friday Advantage+ Creative Batch #2', 'Set of 3 high-impact lifestyle hook variations optimized for mobile 9:16 format with Black Friday promotional badge.', 'ad_creative', 'pending', '11111111-1111-1111-1111-111111110002', 'v2.1'),
('66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444440005', NULL, '33333333-3333-3333-3333-333333330002', '22222222-2222-2222-2222-222222220002', 'Lumina Holiday Instagram Carousel Stories', 'Holiday bundle promotion cards highlighting botanical ingredients and limited edition gift box.', 'ad_creative', 'approved', '11111111-1111-1111-1111-111111110007', 'v1.4')
ON CONFLICT (id) DO NOTHING;

-- 11. Activity Logs
INSERT INTO public.activity_logs (org_id, user_id, action, target_type, target_id, target_title, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110005', 'uploaded_deliverable', 'approval', '66666666-6666-6666-6666-666666660001', 'Apex Black Friday Advantage+ Creative Batch #2', NOW() - INTERVAL '12 minutes'),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110003', 'approved_deliverable', 'approval', '66666666-6666-6666-6666-666666660002', 'Lumina Holiday Instagram Carousel Stories', NOW() - INTERVAL '44 minutes'),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110015', 'created_task', 'task', '44444444-4444-4444-4444-444444440001', 'Scale Advantage+ Shopping Campaign budget', NOW() - INTERVAL '2 hours');

-- 12. Notifications
INSERT INTO public.notifications (user_id, type, title, message, task_id, is_read) VALUES
('11111111-1111-1111-1111-111111110001', 'assignment', 'New Task Assigned', 'You were assigned to Scale Advantage+ Shopping Campaign budget & refresh', '44444444-4444-4444-4444-444444440001', FALSE),
('11111111-1111-1111-1111-111111110001', 'deadline', 'Upcoming Deadline Today', 'Review Q4 Black Friday Meta Ad creatives due at 2:00 PM', '44444444-4444-4444-4444-444444440002', FALSE),
('11111111-1111-1111-1111-111111110002', 'approval_request', 'Deliverable Sign-Off Ready', 'Apex Athletics batch #2 creative ready for director review', '44444444-4444-4444-4444-444444440001', TRUE);
