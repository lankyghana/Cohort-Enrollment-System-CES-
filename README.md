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
- **student** - Default role for registered users
- **admin** - Platform administrators
- **instructor** - Course instructors

## 🗄️ Database Schema

Key tables:
- `users` - User profiles and roles
- `courses` - Course information
- `course_modules` - Course modules/lessons
- `course_sessions` - Live session scheduling
- `enrollments` - Student course enrollments
- `payments` - Payment transactions
- `resources` - Course materials
- `certificates` - Completion certificates
- `announcements` - Platform announcements
- `messages` - User messaging

All tables have Row-Level Security (RLS) policies enabled for data protection.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
npm run build
```

The `dist` folder contains the production build.

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling (design system colors defined in `tailwind.config.js`)
- Implement RLS policies for all database operations
- Follow the component structure in `src/components`
- Use React Hook Form for form handling
- Implement proper error handling and loading states

## 🔒 Security

- All database operations use Row-Level Security (RLS)
- Environment variables are used for sensitive data
- Authentication is handled by Supabase Auth
- Payment verification is done server-side via Edge Functions

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md) - Complete setup instructions
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture and design
- [Development Guidelines](./docs/DEVELOPMENT.md) - Coding standards and best practices
- [PRD](./knowledge/PRD.txt) - Product Requirements Document
- [Implementation Plan](./knowledge/PRD%202.txt) - Detailed implementation plan

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please contact [support email] or create an issue in the repository.

