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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboards
    Route::get('/student/dashboard', StudentDashboardController::class);

    // User management (admins)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Course management (instructors & admins)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

    // File uploads (images, attachments)
    Route::post('/uploads', [\App\Http\Controllers\Api\UploadController::class, 'store']);

    // Assignment routes
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store']);
    Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
    Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
    Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);
    Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions']);

    // Submission routes
    Route::post('/assignments/{assignmentId}/submissions', [SubmissionController::class, 'store']);
    Route::get('/submissions/{id}', [SubmissionController::class, 'show']);
    Route::post('/submissions/{id}/grade', [SubmissionController::class, 'grade']);

    // Enrollment routes
    Route::get('/enrollment-status/{courseId}', [EnrollmentController::class, 'status']);
    Route::apiResource('enrollments', EnrollmentController::class);

    // Payments (admin management)
    Route::get('/payments', [PaymentController::class, 'index']);

    // Admin dashboard metrics
    Route::get('/admin/metrics', [AdminMetricsController::class, 'index']);

    // Payment gateway configuration (admin-only)
    Route::get('/payment-gateway', [PaymentGatewayController::class, 'show']);
    Route::put('/payment-gateway', [PaymentGatewayController::class, 'update']);
});
