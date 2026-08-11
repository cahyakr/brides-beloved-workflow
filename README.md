# Brides Beloved Wedding Workflow

Wedding Organizer management system built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Included

- Premium public landing page with downloadable pricelist and consultation form.
- Admin dashboard with wedding overview, clients, team, projects, leads, files, and settings.
- Timeline/Gantt-style workflow inspired by the supplied reference, including search and task detail drawer.
- Client wedding planner with phase filters, interactive checklist, progress, countdown, activity feed, and assigned team.
- Client modules for budget tracking, secure project documents, guest RSVP management, and vendor directory.
- Admin client-progress detail with live task totals and progress per wedding phase.
- Supabase email/password login with role-based redirect.
- Complete Supabase SQL schema with planner modules, progress reporting, secure RPCs, and RLS policies.
- Demo access works without Supabase credentials for UI review.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. For a new/empty database, run `supabase/schema.sql`. For a database that already has the previous Brides Beloved schema, run `supabase/migrations/20260811_wedding_planner_upgrade.sql` instead. Do not run both.
3. Optional for local/demo data: run `supabase/seed.sql` after the schema.
4. Put the Project URL and anon/public key in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

5. Create users through Supabase Auth. A client profile is created automatically; promote internal users to `super_admin`, `admin`, or `team` from a trusted admin workflow or the SQL editor.
6. For a client account, connect `clients.profile_id` to that profile. Project RLS then scopes client-visible data to their own project.

The consultation form posts to `/api/leads`. When Supabase variables are configured, submissions are inserted into `public.leads`. Without variables, it safely runs as UI demo mode.

## Storage

The schema creates buckets named `avatars`, `project-files`, and `pricelists`. Keep project files private and expose client files through authorization/signed URLs. The bundled `public/pricelist.pdf` is the supplied PDF used for the current prototype; replace the landing-page download with the active Supabase Storage pricelist when storage management is enabled.

## Important routes

- `/` — landing page
- `/login` — login + demo access
- `/dashboard` — admin overview
- `/dashboard/timeline` — timeline workflow
- `/dashboard/clients` — client management
- `/dashboard/clients/[id]` — admin view of a client's progress by phase
- `/dashboard/projects` — wedding projects
- `/dashboard/team` — team management
- `/dashboard/leads` — lead pipeline
- `/portal` — client portal
- `/portal/timeline` — interactive client wedding planner
- `/portal/budget` — budget, payments, and outstanding balance
- `/portal/documents` — private project document upload and download
- `/portal/guests` — guest list, pax, groups, tables, and RSVP status
- `/portal/vendors` — client-visible vendor directory and contract summary

## Validation

`npx tsc --noEmit` and `npm run lint` are the primary static checks.
