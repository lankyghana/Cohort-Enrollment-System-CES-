<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\StudentDashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentGatewayController;
use App\Http\Controllers\Api\AdminMetricsController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CurriculumController;
use App\Http\Controllers\Api\PlatformSettingsController;
use App\Http\Controllers\Api\StudentCoursesController;
use App\Http\Controllers\Api\CourseResourcesController;
use App\Http\Controllers\Api\CourseSessionsController;
use App\Http\Controllers\Api\SessionsController;
use App\Http\Controllers\Api\EnrollmentPricingController;
use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Api\StudentAssignmentController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/admin/check', [AuthController::class, 'checkAdmin']);
Route::post('/password/reset-request', [AuthController::class, 'requestPasswordReset']);

// Public course listing
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/featured', [CourseController::class, 'featured']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/courses/{id}/curriculum', [CurriculumController::class, 'show']);

// Public platform settings (safe subset)
Route::get('/platform-settings', [PlatformSettingsController::class, 'show']);

// Onboarding payments
Route::post('/enrollment/quote', [EnrollmentPricingController::class, 'quote']);
Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
Route::post('/payments/verify', [PaymentController::class, 'verify']);

// Protected routes
Route::middleware(['auth:sanctum', 'active.enrollment'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/profile', [UserProfileController::class, 'update']);

    Route::middleware(['role:student'])->group(function () {
        // Dashboards
        Route::get('/student/dashboard', StudentDashboardController::class);

        // Assignments (student access)
        Route::get('/student/assignments', [StudentAssignmentController::class, 'index']);
        Route::get('/student/assignments/{id}', [StudentAssignmentController::class, 'show']);
        Route::post('/student/assignments/{assignmentId}/submissions', [SubmissionController::class, 'store']);

        // Student courses
        Route::get('/student/courses', [StudentCoursesController::class, 'index']);
        Route::get('/student/courses/{courseId}/dashboard', [StudentCoursesController::class, 'dashboard'])->middleware('course.started:courseId');

        // Balance summary (for pay-balance screen)
        Route::get('/courses/{courseId}/balance-summary', [BalanceController::class, 'summary']);

        // Course resources (student access)
        Route::get('/courses/{courseId}/resources', [CourseResourcesController::class, 'index'])
            ->middleware('course.started:courseId')
            ->middleware('course.balance:courseId');

        // Course sessions (student access)
        Route::get('/courses/{courseId}/sessions', [CourseSessionsController::class, 'index'])
            ->middleware('course.started:courseId')
            ->middleware('course.balance:courseId');
        Route::get('/sessions/{sessionId}', [SessionsController::class, 'show'])
            ->middleware('session.course.started:sessionId')
            ->middleware('session.course.balance:sessionId');

        // Certificates
        Route::get('/student/certificates', [CertificateController::class, 'studentIndex']);
        Route::get('/student/certificates/{id}/pdf', [CertificateController::class, 'downloadStudent']);
    });

    Route::middleware(['role:instructor,admin'])->group(function () {
        // File uploads (images, attachments)
        Route::post('/uploads', [\App\Http\Controllers\Api\UploadController::class, 'store']);

        // Course management (instructors & admins)
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{id}', [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

        // Assignment routes
        Route::get('/assignments', [AssignmentController::class, 'index']);
        Route::post('/assignments', [AssignmentController::class, 'store']);
        Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
        Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
        Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);
        Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions']);

        // Submission routes
        Route::post('/submissions/{id}/grade', [SubmissionController::class, 'grade']);
    });

    Route::middleware(['role:admin'])->group(function () {
        // Certificates
        Route::get('/admin/certificates', [CertificateController::class, 'adminIndex']);
        Route::post('/admin/certificates/issue', [CertificateController::class, 'issue']);
        Route::get('/admin/certificates/{id}/pdf', [CertificateController::class, 'downloadAdmin']);

        // User management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
        Route::post('/users/bulk-role', [UserController::class, 'bulkRole']);
        Route::get('/users/{id}/enrollments', [UserController::class, 'enrollments']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Admin course views & curriculum upsert
        Route::get('/admin/courses', [CourseController::class, 'adminIndex']);
        Route::get('/admin/courses/{id}', [CourseController::class, 'adminShow']);
        Route::post('/admin/courses/{id}/curriculum', [CurriculumController::class, 'upsert']);

        // Enrollment routes (admin oversight)
        Route::get('/enrollment-status/{courseId}', [EnrollmentController::class, 'status']);
        Route::apiResource('enrollments', EnrollmentController::class);

        // Payments (admin management)
        Route::get('/payments', [PaymentController::class, 'index']);

        // Admin dashboard metrics
        Route::get('/admin/metrics', [AdminMetricsController::class, 'index']);

        // Payment gateway configuration
        Route::get('/payment-gateway', [PaymentGatewayController::class, 'show']);
        Route::put('/payment-gateway', [PaymentGatewayController::class, 'update']);

        // Platform settings
        Route::put('/platform-settings/currency', [PlatformSettingsController::class, 'updateCurrency']);
    });
});
