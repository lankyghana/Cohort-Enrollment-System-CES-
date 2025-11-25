# Cohort Enrollment Platform

A polished, open-source platform for running cohort-based online courses. This repository implements a full-stack learning platform using React + TypeScript on the frontend and Laravel for backend services, authentication, and storage.

---

## Overview

The Cohort Enrollment Platform provides course discovery, enrollment, payment handling, live session scheduling, resource distribution, and completion certificates. It supports three main roles: students, instructors, and administrators.

Key goals:
- Fast developer experience with Vite + TypeScript
- Safe, typed access to the Laravel API
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
- API surface via Laravel

---

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Laravel (API), MySQL/PostgreSQL
- Payments: Paystack (client-side widget + server verification)
- State: Zustand; Forms: React Hook Form
- Tests / Tooling: Vitest, ESLint, Prettier

---

## Quickstart (local)

Prerequisites:
- Node.js 18+ and npm
- A Laravel backend project (see `backend` directory)
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
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

4. Initialize the database by running the Laravel migrations. See the `backend/README.md` for instructions.

5. Start dev server

```bash
npm run dev
```

Open http://localhost:5173

---

## Usage guide

- Sign up (or provision a test user) via the application.
- As an instructor, create courses, add modules and lessons, then publish.
- Students browse and enroll in published courses.
- Instructors schedule sessions via the session UI — notifications are sent to enrolled students.
- Payments are handled client-side via Paystack; server-side verification is implemented in the Laravel backend.

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
2. On successful payment, the client calls the server-side verification endpoint in the Laravel backend, sending the transaction reference.
3. The backend verifies the transaction with Paystack, creates a `payments` record and (if applicable) an `enrollments` row, and notifies the client.
4. All sensitive verification logic executes server-side to prevent client-side spoofing.

---

## Folder structure (high level)

```
.
├── backend/                # Laravel backend application
├── src/
│   ├── components/         # UI components, modals, page fragments
│   ├── pages/              # Route-level pages
│   ├── services/           # API client and service modules
│   ├── hooks/              # Reusable hooks
│   ├── types/              # Shared TypeScript types
│   └── main.tsx            # App entry
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

