import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage'
import { CourseCatalog } from '@/pages/public/CourseCatalog'
import { CourseDetails } from '@/pages/public/CourseDetails'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { VerifyEmail } from '@/pages/auth/VerifyEmail'
import { ResetPassword } from '@/pages/auth/ResetPassword'

// Student Dashboard Pages
import { StudentDashboard } from '@/pages/student/Dashboard'
import { MyCourses } from '@/pages/student/MyCourses'
import { CourseDashboard } from '@/pages/student/CourseDashboard'
import { LiveSession } from '@/pages/student/LiveSession'
import { Resources } from '@/pages/student/Resources'
import { Certificates } from '@/pages/student/Certificates'
import { ProfileSettings } from '@/pages/student/ProfileSettings'

// Admin Dashboard Pages
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { CourseManagement } from '@/pages/admin/CourseManagement'
import { CreateEditCourse } from '@/pages/admin/CreateEditCourse'
import { StudentManagement } from '@/pages/admin/StudentManagement'
import { PaymentManagement } from '@/pages/admin/PaymentManagement'
import { ScheduleManagement } from '@/pages/admin/ScheduleManagement'
import { CertificateManagement } from '@/pages/admin/CertificateManagement'

// Error Pages
import { NotFound } from '@/pages/errors/NotFound'

function App() {
  // `user` is intentionally not referenced in this file. Keep `loading`.
  const { loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/dashboard/courses" element={<MyCourses />} />
          <Route path="/dashboard/courses/:id" element={<CourseDashboard />} />
          <Route path="/dashboard/courses/:id/session/:sessionId" element={<LiveSession />} />
          <Route path="/dashboard/courses/:id/resources" element={<Resources />} />
          <Route path="/dashboard/certificates" element={<Certificates />} />
          <Route path="/dashboard/profile" element={<ProfileSettings />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/courses/new" element={<CreateEditCourse />} />
          <Route path="/admin/courses/:id/edit" element={<CreateEditCourse />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/payments" element={<PaymentManagement />} />
          <Route path="/admin/schedule" element={<ScheduleManagement />} />
          <Route path="/admin/certificates" element={<CertificateManagement />} />
        </Route>

        {/* Error Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  )
}

export default App

