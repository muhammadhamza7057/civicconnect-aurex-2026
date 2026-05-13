-- seed_demo_data.sql
-- Demo departments, users, tickets, permits, announcements, events

-- Departments
INSERT INTO departments (id, name, slug, contact_email)
VALUES
  ('00000000-0000-0000-0000-000000000011', 'Infrastructure', 'infrastructure', 'infra@civicconnect.test'),
  ('00000000-0000-0000-0000-000000000012', 'Public Works', 'public-works', 'pw@civicconnect.test'),
  ('00000000-0000-0000-0000-000000000013', 'Parks & Rec', 'parks-rec', 'parks@civicconnect.test')
ON CONFLICT (id) DO NOTHING;

-- Users (demo auth_uid values should match your Supabase Auth users if you create them)
INSERT INTO users (id, auth_uid, email, full_name, role, department_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice.resident@example.com', 'Alice Resident', 'resident', NULL),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob.staff@example.com', 'Bob Staff', 'staff', '00000000-0000-0000-0000-000000000011'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'carol.deptadmin@example.com', 'Carol DeptAdmin', 'department_admin', '00000000-0000-0000-0000-000000000011'),
  ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dave.super@example.com', 'Dave Super', 'super_admin', NULL)
ON CONFLICT (id) DO NOTHING;

-- SLA rules
INSERT INTO sla_rules (id, name, department_id, priority, response_hours, resolution_hours)
VALUES
  (gen_random_uuid(), 'Infra - Emergency', '00000000-0000-0000-0000-000000000011', 'emergency', 1, 4),
  (gen_random_uuid(), 'Infra - High', '00000000-0000-0000-0000-000000000011', 'high', 4, 24)
ON CONFLICT DO NOTHING;

-- Sample Ticket: Burst water pipe in Sector G-11 (demo requested flow)
INSERT INTO tickets (id, ticket_code, title, description, reporter_id, reporter_auth_uid, department_id, priority, status, ai_category, ai_priority, attachments, sla_due_at, created_at)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'INF-2026-00412', 'Burst water pipe in Sector G-11', 'There is a major burst water pipe next to the community center in Sector G-11. Water flooding the street and affecting nearby homes. Immediate assistance needed.', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000011', 'emergency', 'submitted', 'Infrastructure', 'emergency', '[{"url":"/storage/default/burst1.jpg","name":"burst1.jpg"}]', now() + interval '2 hours', now())
ON CONFLICT (id) DO NOTHING;

-- sample comment
INSERT INTO ticket_comments (id, ticket_id, author_id, body, public)
VALUES (gen_random_uuid(), 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Submitting with photo. Please advise next steps.', true)
ON CONFLICT DO NOTHING;

-- notification for staff
INSERT INTO notifications (id, user_id, payload)
VALUES (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '{"title":"New Emergency: INF-2026-00412","ticket_id":"aaaaaaaa-0000-0000-0000-000000000001"}')
ON CONFLICT DO NOTHING;

-- Announcement
INSERT INTO announcements (id, title, body, author_id, is_public, starts_at)
VALUES (gen_random_uuid(), 'Water Advisory', 'Due to emergency repairs, water pressure may be affected in some sectors.', '33333333-3333-3333-3333-333333333333', true, now())
ON CONFLICT DO NOTHING;

-- Event
INSERT INTO events (id, title, description, organizer_id, capacity, status, starts_at)
VALUES (gen_random_uuid(), 'Community Meeting - Water Safety', 'Public meeting to discuss water safety measures and emergency response.', '33333333-3333-3333-3333-333333333333', 200, 'published', now() + interval '3 days')
ON CONFLICT DO NOTHING;

-- Analytics snapshot (simple example)
INSERT INTO analytics_snapshots (id, snapshot_date, payload)
VALUES (gen_random_uuid(), now()::date, '{"open_tickets": 12, "sla_breaches": 1}')
ON CONFLICT DO NOTHING;

-- End of seed
