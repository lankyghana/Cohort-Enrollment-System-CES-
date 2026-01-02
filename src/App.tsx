import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { InstructorLayout } from '@/components/layouts/InstructorLayout'
import { ProtectedInstructorRoute } from '@/components/auth/ProtectedInstructorRoute'
import CoursesList from '@/pages/instructor/CoursesList'
import CourseCreate from '@/pages/instructor/CourseCreate'
import CourseEdit from '@/pages/instructor/CourseEdit'
import CurriculumEditor from '@/components/instructor/CurriculumEditor'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage'
import { CourseCatalog } from '@/pages/public/CourseCatalog'
import { CourseDetails } from '@/pages/public/CourseDetails'
import { Creator } from '@/pages/creator/Creator'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { AdminLogin } from '@/pages/auth/AdminLogin'
import { InstructorLogin } from '@/pages/auth/InstructorLogin'
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
import StudentAssignments from '@/pages/student/Assignments'
import AssignmentView from '@/pages/student/AssignmentView'

// Admin Dashboard Pages
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { InstructorDashboard } from '@/pages/instructor/Dashboard'
import { CourseManagement } from '@/pages/admin/CourseManagement'
import { CreateEditCourse } from '@/pages/admin/CreateEditCourse'
import { StudentManagement } from '@/pages/admin/StudentManagement'
import { PaymentManagement } from '@/pages/admin/PaymentManagement'
import { PaymentGatewaySettings } from '@/pages/admin/PaymentGatewaySettings'
import { ScheduleManagement } from '@/pages/admin/ScheduleManagement'
import { CertificateManagement } from '@/pages/admin/CertificateManagement'
import UserManagement from '@/pages/admin/UserManagement'
import InstructorAssignments from '@/pages/instructor/Assignments'
import NewAssignment from '@/pages/instructor/NewAssignment'
import AssignmentSubmissions from '@/pages/instructor/AssignmentSubmissions'

// Error Pages
import { NotFound } from '@/pages/errors/NotFound'

function App() {
  // `user` is intentionally not referenced in this file. Keep `loading`.
  const { loading } = useAuthStore()

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center")}>
        <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 border-primary")}></div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/instructor-login" element={<InstructorLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/creator" element={<Creator />} />
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
            <Route path="/dashboard/assignments" element={<StudentAssignments />} />
            <Route path="/dashboard/assignments/:id" element={<AssignmentView />} />
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
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/payments" element={<PaymentManagement />} />
            <Route path="/admin/payment-gateway" element={<PaymentGatewaySettings />} />
            <Route path="/admin/schedule" element={<ScheduleManagement />} />
            <Route path="/admin/certificates" element={<CertificateManagement />} />
          </Route>

          {/* Instructor Dashboard Routes (instructors handle admin duties except payments) */}
          <Route
            element={
              <ProtectedInstructorRoute>
                <InstructorLayout />
              </ProtectedInstructorRoute>
            }
          >
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<CoursesList />} />
            <Route path="/instructor/courses/create" element={<CourseCreate />} />
            <Route path="/instructor/courses/:id/edit" element={<CourseEdit />} />
            <Route path="/instructor/courses/:id/curriculum" element={<CurriculumEditorWrapper />} />
            <Route path="/instructor/students" element={<StudentManagement />} />
            <Route path="/instructor/schedule" element={<ScheduleManagement />} />
            <Route path="/instructor/certificates" element={<CertificateManagement />} />
            <Route path="/instructor/assignments" element={<InstructorAssignments />} />
            <Route path="/instructor/assignments/new" element={<NewAssignment />} />
            <Route path="/instructor/assignments/:id" element={<AssignmentSubmissions />} />
          </Route>

          {/* Error Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  )
}

export default App

function CurriculumEditorWrapper() {
  // read course id from url param and render the editor
  const { id } = useParams()
  if (!id) return <div>Course not found</div>
  return <CurriculumEditor courseId={id} />
}


