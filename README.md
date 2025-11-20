# Cohort Enrollment Platform

A comprehensive web application for managing cohort-based learning programs, built with React, TypeScript, and Supabase.

## 🚀 Features

### Student Features
- Course discovery and search
- User registration and authentication
- Course enrollment with secure payments (Paystack)
- Personalized student dashboard
- Live session access
- Resource library
- Progress tracking
- Certificate download
- Communication hub

### Admin Features
- Comprehensive admin dashboard
- Course management (create, edit, publish)
- Student management
- Payment tracking and reporting
- Class scheduling
- Certificate generation and management
- Bulk communications
- Analytics and reporting

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **jsPDF** - Certificate generation

### Backend
- **Supabase** - Database, Authentication, Storage, Realtime
- **Row-Level Security (RLS)** - Data protection
- **Supabase Edge Functions** - Serverless functions

### Integrations
- **Paystack** - Payment processing
- **Email Service** - Notifications via Supabase Edge Functions

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Paystack account (for payment integration)

## 🏗️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cohort-enrollment-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Cohort Enrollment Platform
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase/schema.sql` to create all tables, indexes, and RLS policies

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚠️ TypeScript note

This project currently uses `baseUrl` path mapping in `tsconfig.json`. TypeScript has flagged `baseUrl` as deprecated for future major versions. To keep the current configuration working and suppress the deprecation warning, `tsconfig.json` includes the compiler option `"ignoreDeprecations": "6.0"`.

When upgrading to TypeScript 7+, review the migration guidance at https://aka.ms/ts6 and update path handling accordingly.

## 📁 Project Structure

```
cohort-enrollment-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, Card, etc.)
│   │   ├── layouts/        # Layout components (Header, Sidebar, Footer)
│   │   └── auth/           # Authentication components
│   ├── pages/              # Page components
│   │   ├── public/         # Public pages
│   │   ├── auth/           # Authentication pages
│   │   ├── student/        # Student dashboard pages
│   │   ├── admin/          # Admin dashboard pages
│   │   └── errors/         # Error pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services (Supabase client)
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── supabase/
│   └── schema.sql          # Database schema and RLS policies
├── .github/
│   └── workflows/          # CI/CD workflows
└── README.md
```

## 🔐 Authentication

The platform uses Supabase Auth for authentication. User roles are managed through the `users` table:
 # Cohort Enrollment Platform

A polished, open-source platform for running cohort-based online courses. This repository implements a full-stack learning platform using React + TypeScript on the frontend and Supabase (Postgres) for backend services, authentication, and storage.

---

## Overview

The Cohort Enrollment Platform provides course discovery, enrollment, payment handling, live session scheduling, resource distribution, and completion certificates. It supports three main roles: students, instructors, and administrators.

Key goals:
- Fast developer experience with Vite + TypeScript
- Safe, typed access to Supabase with RLS
- Simple payment integration via Paystack
- Extensible components and APIs for custom features

---

## Features

- Course catalog and search
- Instructor-managed course creation and curriculum builder
- Live session scheduling and notifications
- Student enrollment, progress tracking, and certificates
- Payments via Paystack with server-side verification
- Admin dashboards: user, payments, sessions, analytics
- RLS-protected API surface via Supabase

---

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions)
- Payments: Paystack (client-side widget + server verification)
- State: Zustand; Forms: React Hook Form
- Tests / Tooling: Vitest, ESLint, Prettier

---

## Quickstart (local)

Prerequisites:
- Node.js 18+ and npm
- A Supabase project (see `supabase/schema.sql`)
- Optional: Paystack account and public key

1. Clone the repo

```bash
git clone https://github.com/lankyghana/Cohort-Enrollment-System-CES-.git
cd Cohort-Enrollment-System-CES-
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` in project root (example)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_SUPABASE_FUNCTIONS_URL=https://<your-functions-url>
```

4. Initialize the database (run on Supabase SQL editor)

```sql
-- run the contents of `supabase/schema.sql` in your Supabase project
```

5. Start dev server

```bash
npm run dev
```

Open http://localhost:5173

---

## Usage guide

- Sign up (or provision a test user) via Supabase Auth.
- As an instructor, create courses, add modules and lessons, then publish.
- Students browse and enroll in published courses.
- Instructors schedule sessions via the session UI — notifications are sent to enrolled students.
- Payments are handled client-side via Paystack; server-side verification is implemented in `supabase/functions/verify-paystack`.

---

## Roles and functionality

- Student:
	- Browse catalog, enroll in courses
	- Access course materials and live sessions
	- Track progress and download certificates

- Instructor:
	- Create and edit courses, modules, lessons
	- Schedule live sessions and notify students
	- Manage enrolled students and view analytics

- Admin:
	- Full access: user management, payments, site analytics
	- Run final-save operations and enforce platform policies

---

## Session creation & notifications

- Sessions are stored in `course_sessions`.
- Creating a session inserts a row and (optionally) creates notifications for students in the corresponding `enrollments` rows.
- The client uses the Create Session modal (`src/components/sessions/CreateSessionModal.tsx`) and the service helpers in `src/services/sessions.ts`.

---

## Payment workflow (Paystack)

1. Client initiates Paystack widget using `VITE_PAYSTACK_PUBLIC_KEY` and a generated `reference`.
2. On successful payment, the client calls the server-side verification Edge Function (`supabase/functions/verify-paystack`) sending the transaction reference.
3. The Edge Function verifies the transaction with Paystack, creates a `payments` record and (if applicable) an `enrollments` row, and notifies the client.
4. All sensitive verification logic executes server-side to prevent client-side spoofing.

---

## Folder structure (high level)

```
.
├── src/
│   ├── components/         # UI components, modals, page fragments
│   ├── pages/              # Route-level pages
│   ├── services/           # Supabase helpers, API wrappers
│   ├── hooks/              # Reusable hooks
│   ├── types/              # Shared TypeScript types (generated DB types)
│   └── main.tsx            # App entry
├── supabase/
│   ├── functions/          # Edge Functions (verify-paystack, final-save...)
│   └── schema.sql          # DB schema and policies
├── scripts/                # Developer scripts and checks
├── docs/                   # Supporting documentation
├── package.json
└── README.md
```

---

## Contributing

See `CONTRIBUTING.md` for development workflow, code style, commit conventions, and how to open issues and pull requests.

---

## License

This project is released under the MIT License — see `LICENSE` for details.

---

## Support

If you find a bug or want to request a feature, please open an issue using the templates in the repository. For urgent questions, contact the maintainer listed in the repository.

---

© 2025 lankyghana

