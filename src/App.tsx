import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { InstructorLayout } from '@/components/layouts/InstructorLayout'
import { ProtectedInstructorRoute } from '@/components/auth/ProtectedInstructorRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'

// Instructor course-management pages
const CoursesList = lazy(() => import('@/pages/instructor/CoursesList'))
const CourseCreate = lazy(() => import('@/pages/instructor/CourseCreate'))
const CourseEdit = lazy(() => import('@/pages/instructor/CourseEdit'))
const CurriculumEditor = lazy(() => import('@/components/instructor/CurriculumEditor'))

// Public Pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const CourseCatalog = lazy(() => import('@/pages/public/CourseCatalog').then((m) => ({ default: m.CourseCatalog })))
const CourseDetails = lazy(() => import('@/pages/public/CourseDetails').then((m) => ({ default: m.CourseDetails })))
const Creator = lazy(() => import('@/pages/creator/Creator').then((m) => ({ default: m.Creator })))
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.Register })))
const AdminLogin = lazy(() => import('@/pages/auth/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const InstructorLogin = lazy(() => import('@/pages/auth/InstructorLogin').then((m) => ({ default: m.InstructorLogin })))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail').then((m) => ({ default: m.VerifyEmail })))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword })))
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })))
const About = lazy(() => import('@/pages/public/About').then((m) => ({ default: m.About })))
const HelpCenter = lazy(() => import('@/pages/public/HelpCenter').then((m) => ({ default: m.HelpCenter })))

// Onboarding Pages
const SelectCourse = lazy(() => import('@/pages/onboarding/SelectCourse').then((m) => ({ default: m.SelectCourse })))
const EnrollmentSuccess = lazy(() => import('@/pages/onboarding/EnrollmentSuccess').then((m) => ({ default: m.EnrollmentSuccess })))

// Student Dashboard Pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard').then((m) => ({ default: m.StudentDashboard })))
const MyCourses = lazy(() => import('@/pages/student/MyCourses').then((m) => ({ default: m.MyCourses })))
const CourseDashboard = lazy(() => import('@/pages/student/CourseDashboard').then((m) => ({ default: m.CourseDashboard })))
const LiveSession = lazy(() => import('@/pages/student/LiveSession').then((m) => ({ default: m.LiveSession })))
const Resources = lazy(() => import('@/pages/student/Resources').then((m) => ({ default: m.Resources })))
const Certificates = lazy(() => import('@/pages/student/Certificates').then((m) => ({ default: m.Certificates })))
const ProfileSettings = lazy(() => import('@/pages/student/ProfileSettings').then((m) => ({ default: m.ProfileSettings })))
const StudentAssignments = lazy(() => import('@/pages/student/Assignments'))
const AssignmentView = lazy(() => import('@/pages/student/AssignmentView'))
const CourseStartsSoon = lazy(() => import('@/pages/student/CourseStartsSoon').then((m) => ({ default: m.CourseStartsSoon })))
const PayBalance = lazy(() => import('@/pages/student/PayBalance').then((m) => ({ default: m.PayBalance })))

// Admin Dashboard Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })))
const InstructorDashboard = lazy(() => import('@/pages/instructor/Dashboard').then((m) => ({ default: m.InstructorDashboard })))
const CourseManagement = lazy(() => import('@/pages/admin/CourseManagement').then((m) => ({ default: m.CourseManagement })))
const CreateEditCourse = lazy(() => import('@/pages/admin/CreateEditCourse').then((m) => ({ default: m.CreateEditCourse })))
const CourseCurriculum = lazy(() => import('@/pages/admin/CourseCurriculum').then((m) => ({ default: m.CourseCurriculum })))
const StudentManagement = lazy(() => import('@/pages/admin/StudentManagement').then((m) => ({ default: m.StudentManagement })))
const PaymentManagement = lazy(() => import('@/pages/admin/PaymentManagement').then((m) => ({ default: m.PaymentManagement })))
const PaymentGatewaySettings = lazy(() => import('@/pages/admin/PaymentGatewaySettings').then((m) => ({ default: m.PaymentGatewaySettings })))
const ScheduleManagement = lazy(() => import('@/pages/admin/ScheduleManagement').then((m) => ({ default: m.ScheduleManagement })))
const CertificateManagement = lazy(() => import('@/pages/admin/CertificateManagement').then((m) => ({ default: m.CertificateManagement })))
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'))
const InstructorAssignments = lazy(() => import('@/pages/instructor/Assignments'))
const NewAssignment = lazy(() => import('@/pages/instructor/NewAssignment'))
const AssignmentSubmissions = lazy(() => import('@/pages/instructor/AssignmentSubmissions'))

// Error Pages
const NotFound = lazy(() => import('@/pages/errors/NotFound').then((m) => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className={cn("min-h-screen flex items-center justify-center")}>
      <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 border-primary")}></div>
    </div>
  )
}

function App() {
  // `user` is intentionally not referenced in this file. Keep `loading`.
  const { loading } = useAuthStore()

  if (loading) {
    return <PageLoader />
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CourseCatalog />} />
              {/* Canonical slug-based route */}
              <Route path="/courses/:slug" element={<CourseDetails />} />
              {/* Legacy UUID route for redirect (handled by backend) */}
              <Route path="/courses/:id([0-9a-fA-F\-]{36})" element={<CourseDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/instructor-login" element={<InstructorLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/select-course" element={<SelectCourse />} />
              <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
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
              <Route path="/course-starts-soon/:courseId" element={<CourseStartsSoon />} />
              <Route path="/pay-balance/:courseId" element={<PayBalance />} />
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
              <Route path="/admin/courses/:id/curriculum" element={<CourseCurriculum />} />
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
        </Suspense>
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
