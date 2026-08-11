# Brides Beloved Wedding Workflow

Wedding Organizer management system built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Included

- Premium public landing page with downloadable pricelist and consultation form.
- Admin dashboard with wedding overview, clients, team, projects, leads, files, and settings.
- Timeline/Gantt-style workflow inspired by the supplied reference, including search and task detail drawer.
- Client portal with progress, milestones, countdown, upcoming meeting, documents, and assigned team.
- Supabase email/password login with role-based redirect.
- Supabase SQL schema with roles, projects, tasks, project members, files, leads, and baseline RLS policies.
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
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Put the Project URL and anon/public key in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. Create users through Supabase Auth and add matching rows to `public.profiles` with one of these roles: `super_admin`, `admin`, `team`, or `client`.
5. For a client account, connect `clients.profile_id` to that profile. Project RLS then scopes client-visible data to their own project.

The consultation form posts to `/api/leads`. When Supabase variables are configured, submissions are inserted into `public.leads`. Without variables, it safely runs as UI demo mode.

## Storage

For production, create buckets named `avatars`, `project-files`, and `pricelists`. Keep project files private and expose client files through authorization/signed URLs. The bundled `public/pricelist.pdf` is the supplied PDF used for the current prototype; replace the landing-page download with the active Supabase Storage pricelist when storage management is enabled.

## Important routes

- `/` — landing page
- `/login` — login + demo access
- `/dashboard` — admin overview
- `/dashboard/timeline` — timeline workflow
- `/dashboard/clients` — client management
- `/dashboard/projects` — wedding projects
- `/dashboard/team` — team management
- `/dashboard/leads` — lead pipeline
- `/portal` — client portal

## Validation

`npx tsc --noEmit` and `npm run lint` are the primary static checks.
