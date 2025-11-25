# PRD Ingestion (Cohort Enrollment)

Saved: 2025-11-15

Source files:
- `knowledge/PRD.txt`
- `knowledge/PRD 2.txt`

Note: I have read both source PRD documents and stored a concise structured summary below for quick reference and future instructions. The original full texts remain in the `knowledge/` folder.

## Overview

Cohort Enrollment is a full-stack web application for managing cohort-based learning programs from discovery and enrollment through live sessions, progress tracking, certificates, and admin management.

## Core Features (high level)

- Public course discovery, catalog, and course detail views
- User authentication, email verification, password reset
- Course enrollment with Paystack payment integration and verification
- Student dashboard: enrolled courses, progress, resources, live sessions, certificates
- Admin dashboard: course/student/payment management, scheduling, certificate templates, analytics
- Messaging/announcements and notifications (email + realtime)
- Certificate generation (PDF)
- Resource storage and file uploads

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, React Router, React Hook Form, Zustand/Context
- Backend: Laravel (PHP), Eloquent ORM, Sanctum
- Integrations: Paystack, Laravel Mail, a PDF generation library
- Deployment: Vercel/Netlify (frontend), Server (e.g., DigitalOcean) for backend; monitoring via Sentry/Uptime

## System Architecture

- SPA client handles UI, routing, validation
- Server-based backend on Laravel with API endpoints for payment verification, cert gen, notifications
- Storage in Laravel's file system
- Security: role-based permissions and Laravel Policies

## Major Pages & Flows

- Public: Landing `/`, Courses `/courses`, Course details `/courses/:id`, Login `/login`, Register `/register`
- Student: Dashboard `/dashboard`, My Courses `/dashboard/courses`, Course Dashboard `/dashboard/courses/:id`, Resources, Live Session, Certificates, Profile
- Admin: Admin dashboard `/admin`, Course Management `/admin/courses`, Student Management `/admin/students`, Payments `/admin/payments`, Schedule `/admin/schedule`, Certificate Management `/admin/certificates`
- Key user flows: Registration -> Course selection -> Enrollment -> Payment -> Access -> Completion -> Certificate download

## Implementation Phases (8-phase plan)

1. Project setup & architecture
2. Public website & course discovery
3. Student dashboard
4. Enrollment & payment integration
5. Admin dashboard
6. Communication & notifications
7. Testing, QA, optimization
8. Deployment, monitoring, launch

## Deliverables & Success Criteria

- Users can browse, enroll, complete courses, and download certificates
- Admins can manage courses, students, payments, and scheduling
- Payment, session access, certificate download paths function without errors
- Deployed app with monitoring and backups

## Design Guidelines

- Mobile-first, responsive, accessibility-conscious design
- Color palette and typography guidance included in original PRD

## Key Considerations

- Strong authorization policies and role-based access
- Paystack verification and secure payment handling (backend endpoint/webhook)
- Certificate generation and storage
- Email delivery and realtime notifications
- Performance: lazy loading, caching, CDN for static assets

## Ambiguities / Follow-ups (suggested next clarifying items)

1. Data model/schema: exact tables, fields, relationships (courses, sessions, enrollments, payments, certificates, users, roles)
2. Roles & permissions matrix (Admin, Instructor, Student, maybe Guest)
3. Payment flow specifics: webhook vs polling; test/live keys, refunds, partial payments
4. Certificate template details and verification (design, dynamic fields, verification codes)
5. Email provider choice and transactional email templates
2. Exact authorization policies required per model/controller.
7. Storage organization and retention policies for uploaded resources and certificates
8. Third-party credentials and secrets management process
9. Which pages require SSR/SSG vs SPA-only (SEO-sensitive pages like landing and courses)

## Recommended immediate next tasks



If you'd like, I can now:

## Assistant usage rules (persisted)

Saved instruction (2025-11-15):

- When generating or modifying code in this repository, use all information from `knowledge/PRD.txt`, `knowledge/PRD 2.txt`, and this `knowledge/PRD_ingested.md` as the authoritative project knowledge base.
- Always follow the architecture, implementation phases, and constraints described in the PRD documents (notably the "8-phase" plan, Laravel-first backend, API endpoints for payment verification/certificate generation, and strict authorization/role-based access patterns).
- If any existing file or requirement conflicts with the PRD, follow the guidance in `knowledge/PRD 2.txt` (PRD 2) over other sources.
- Before making breaking changes to key architecture files (database schema, auth rules, major routing, deployment config), state the intended change, list assumptions, and get confirmation when the change might alter production behavior.
- When implementing features that interact with external services (Paystack, email provider, storage), include environment configuration placeholders and a short note on required secrets and test/live modes.
- For code or config edits, include a short rationale and list of acceptance criteria that map to the PRD success criteria.

If you want these rules stored elsewhere (for example, a JSON config file, `.assistant_rules.json`, or a top-level `CONTRIBUTING.md`), tell me and I will create that file now.

I have also created a machine-readable rules file at the repository root: `.assistant_rules.json`. It contains folder-structure and naming conventions that I will follow when generating or modifying code. Key points:

- React components: PascalCase filenames with `.tsx` and default export (e.g., `MyComponent.tsx`).
- Utility modules and hooks: kebab-case or camelCase for hooks like `useAuth.ts`.
- Folders: kebab-case names consistent with existing layout (`components`, `pages`, `services`, `store`, etc.).
- Tests: `.test.ts`/`.spec.ts` or `__tests__` folders colocated with implementation.
- Any generated code that requires secrets must include environment placeholders and a short note on required secrets.
Tell me which of the above next steps you want me to take and I will start it immediately.