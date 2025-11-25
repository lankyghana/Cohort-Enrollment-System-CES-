# Architecture Documentation

## Overview

The Cohort Enrollment Platform is built with a modern architecture using React on the frontend and Laravel as the backend API.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite)                                    │   │
│  │  - React Router (Routing)                            │   │
│  │  - Zustand (State Management)                        │   │
│  │  - Tailwind CSS (Styling)                            │   │
│  │  - React Hook Form (Forms)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Laravel API (PHP)                                   │   │
│  │  - Eloquent ORM (Database)                           │   │
│  │  - Sanctum (Authentication)                          │   │
│  │  - Socialite (OAuth - future)                        │   │
│  │  - API Resources (JSON responses)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Paystack   │  │ Email Service│                        │
│  │              │  │              │                        │
│  │ - Payments   │  │ - Notifications│                      │
│  │ - Webhooks   │  │ - Templates  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Recharts** - Data visualization for dashboards
- **jsPDF** - PDF generation for certificates
- **Lucide React** - Icon library

### Backend

- **Laravel** - Backend Framework
  - **Eloquent** - ORM for database interaction
  - **Sanctum** - API authentication
  - **MySQL/PostgreSQL** - Database

### Integrations

- **Paystack** - Payment processing
- **Email Service** - Transactional emails (via Laravel Mail)

## Database Schema

### Core Tables

1. **users** - User profiles and roles
2. **courses** - Course information
3. **course_modules** - Course modules/lessons
4. **course_sessions** - Live session scheduling
5. **enrollments** - Student course enrollments
6. **payments** - Payment transactions
7. **resources** - Course materials
8. **certificates** - Completion certificates
9. **announcements** - Platform announcements
10. **messages** - User messaging

### Relationships

```
users (1) ──< (many) courses (instructor_id)
users (1) ──< (many) enrollments (student_id)
courses (1) ──< (many) enrollments
courses (1) ──< (many) course_modules
courses (1) ──< (many) course_sessions
courses (1) ──< (many) resources
enrollments (1) ──< (1) payments
enrollments (1) ──< (many) certificates
```

## Security Architecture

Access control is handled by Laravel's middleware and policies.

- **Users** can only view/update their own profile.
- **Admins** have full access via policies.
- **Instructors** can manage their own courses.
- **Enrollments** are only visible to the student, instructor, and admins.
- **Payments** are only visible to the student and admins.
- **Resources** are only accessible to enrolled students.

### Authentication Flow

1. User registers/logs in via the API.
2. Laravel Sanctum creates a session and API token.
3. The API token is stored in the browser's local storage.
4. The token is sent with every API request in the `Authorization` header.
5. Laravel middleware validates the token and authenticates the user.

### Payment Security

1. Payment initiated on client with Paystack.
2. Paystack processes payment.
3. A webhook is sent to a dedicated Laravel route.
4. The backend controller verifies the payment with the Paystack API.
5. Only verified payments update the enrollment status.

## State Management

### Zustand Stores

- **authStore** - Authentication state and user profile
- Future stores for:
  - Course data caching
  - Notification state
  - UI state (modals, sidebars)

### React Context

- Used sparingly for deeply nested component communication
- Prefer Zustand for global state

## Routing Structure

### Public Routes
- `/` - Landing page
- `/courses` - Course catalog
- `/courses/:id` - Course details
- `/login` - Login page
- `/register` - Registration page
- `/verify-email` - Email verification
- `/reset-password` - Password reset

### Protected Routes (Student)
- `/dashboard` - Student dashboard
- `/dashboard/courses` - My courses
- `/dashboard/courses/:id` - Course dashboard
- `/dashboard/courses/:id/session/:sessionId` - Live session
- `/dashboard/courses/:id/resources` - Resources
- `/dashboard/certificates` - Certificates
- `/dashboard/profile` - Profile settings

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/courses` - Course management
- `/admin/courses/new` - Create course
- `/admin/courses/:id/edit` - Edit course
- `/admin/students` - Student management
- `/admin/payments` - Payment management
- `/admin/schedule` - Schedule management
- `/admin/certificates` - Certificate management

## File Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── layouts/        # Layout components
│   └── auth/           # Auth-related components
├── pages/              # Page components
│   ├── public/         # Public pages
│   ├── auth/           # Auth pages
│   ├── student/        # Student dashboard pages
│   ├── admin/          # Admin dashboard pages
│   └── errors/         # Error pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript types
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## API Patterns

### API Client Usage

```typescript
// GET request
const { data } = await apiClient.get('/courses');

// POST request
const { data } = await apiClient.post('/enrollments', { course_id: courseId });
```

### Error Handling

All API client operations should handle errors:

```typescript
try {
  const { data } = await apiClient.get('/some-endpoint');
  // Use data
} catch (error) {
  console.error('Error:', error.response?.data?.message || error.message);
  // Handle error (show toast, etc.)
}
```

## Deployment Architecture

### Frontend Deployment (Vercel)

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+
- **Environment Variables:** Set in Vercel dashboard

### Backend (Laravel)

- Deployed to a server (e.g., DigitalOcean, AWS) with a web server (Nginx, Apache).
- Managed via Forge, Envoyer, or manually.
- Database hosted on the same server or a managed service.

## Performance Optimizations

1. **Code Splitting** - React Router lazy loading
2. **Image Optimization** - Using a service like Cloudinary or optimizing images at build time.
3. **Caching** - React Query for data caching (future)
4. **Lazy Loading** - Components loaded on demand
5. **Database Indexing** - Optimized queries with indexes

## Monitoring & Logging

- **Laravel Logs** - Database and API logs
- **Browser Console** - Client-side errors
- **Vercel Analytics** - Performance metrics (future)
- **Sentry** - Error tracking (future)

## Future Enhancements

- [ ] React Query for data fetching and caching
- [ ] Service Worker for PWA capabilities
- [ ] Advanced analytics dashboard
- [ ] Real-time chat functionality
- [ ] Mobile app (React Native)

