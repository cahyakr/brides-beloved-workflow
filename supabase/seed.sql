-- Seed Data for Brides Beloved Wedding Workflow
-- WARNING: This script inserts dummy data into auth.users. It is meant for local development/testing.

-- 1. Create Dummy Auth Users
-- We use static UUIDs for easy referencing
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'adminbb@bridesbeloved.com', crypt('adminbb2026', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Super"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya@bridesbeloved.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Maya Putri"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dimas@bridesbeloved.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dimas Ardi"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sarah Klien"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
INSERT INTO public.profiles (id, full_name, email, role)
VALUES
('00000000-0000-0000-0000-000000000001', 'Admin Super', 'adminbb@bridesbeloved.com', 'super_admin'),
('00000000-0000-0000-0000-000000000002', 'Maya Putri', 'maya@bridesbeloved.com', 'team'),
('00000000-0000-0000-0000-000000000003', 'Dimas Ardi', 'dimas@bridesbeloved.com', 'team'),
('00000000-0000-0000-0000-000000000011', 'Sarah Klien', 'client@example.com', 'client')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 3. Create Client Record
INSERT INTO public.clients (id, profile_id, bride_name, groom_name, display_name, email, phone, wedding_date, venue, package_name)
VALUES
('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Sarah', 'Daniel', 'Sarah & Daniel', 'client@example.com', '08123456789', '2026-12-24', 'The Apurva Bali', 'Signature Package')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Project
INSERT INTO public.projects (id, client_id, name, description, event_date, venue, start_date, status)
VALUES
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Wedding Sarah & Daniel', 'Project pernikahan utama', '2026-12-24', 'The Apurva Bali', '2026-06-01', 'preparation')
ON CONFLICT (id) DO NOTHING;

-- 5. Project Members
INSERT INTO public.project_members (project_id, user_id, project_role)
VALUES
('22222222-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Project Manager'),
('22222222-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Event Coordinator')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 6. Insert Tasks (5 Phases)
INSERT INTO public.tasks (id, project_id, title, description, category, start_date, due_date, priority, status, visible_to_client)
VALUES
-- Fase 1
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Meeting Brainstorming (Fase 1)', 'Mendapatkan detail Wedding Information, Visualisasi Rundown Acara, Timeline, dll.', 'Fase 1 - Wedding Direction', '2026-06-01', '2026-06-15', 'high', 'completed', true),
-- Fase 2
('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Pilih Vendor & Visit Venue (Fase 2)', 'Memilih Vendor Utama dan Support, serta kunjungan ke lokasi acara.', 'Fase 2 - Vendor Selection', '2026-06-16', '2026-07-30', 'high', 'completed', true),
('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'Pilih Attire, Makeup, Food Test (Fase 2)', 'Pemilihan baju, test makeup, dan food testing tahap 1.', 'Fase 2 - Vendor Selection', '2026-07-01', '2026-08-15', 'medium', 'in_progress', true),
-- Fase 3
('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 'Meeting Rundown Acara (Fase 3)', 'Menentukan Konsep acara dan Event Development.', 'Fase 3 - Wedding Detail Planning', '2026-08-16', '2026-08-30', 'high', 'in_progress', true),
('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', 'Fiting Attire & Concept Decoration (Fase 3)', 'Fiting 1-3 Attire Pengantin & Orangtua, serta Meeting Concept Decoration.', 'Fase 3 - Wedding Detail Planning', '2026-09-01', '2026-09-30', 'medium', 'not_started', true),
-- Fase 4
('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', 'Final Technical Meeting (Fase 4)', 'Finalisasi Konsep Pernikahan, Rundown Acara, dan Briefing Vendor.', 'Fase 4 - Wedding Finalization', '2026-11-01', '2026-11-15', 'high', 'not_started', true),
('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', 'Produksi Kebutuhan Acara (Fase 4)', 'Memastikan produksi semua kebutuhan acara selesai sebelum hari H.', 'Fase 4 - Wedding Finalization', '2026-11-15', '2026-12-10', 'high', 'not_started', false),
-- Fase 5
('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', 'Wedding Day Execution (Fase 5)', 'Menjalankan seluruh rangkaian acara sesuai rencana yang disusun.', 'Fase 5 - Wedding Day Execution', '2026-12-24', '2026-12-24', 'urgent', 'not_started', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Task Assignees
INSERT INTO public.task_assignees (task_id, user_id)
VALUES
('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003'),
('33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (task_id, user_id) DO NOTHING;
