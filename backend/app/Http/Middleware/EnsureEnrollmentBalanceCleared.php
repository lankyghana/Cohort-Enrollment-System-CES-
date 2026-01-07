<?php

namespace App\Http\Middleware;

use App\Models\Course;
use App\Support\Currency;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureEnrollmentBalanceCleared
{
    /**
     * Block student access to course-scoped content when the enrollment has an outstanding
     * balance and the payment deadline has been reached/passed.
     *
     * Admins and the course instructor are always allowed.
     */
    public function handle(Request $request, Closure $next, string $courseParam = 'courseId'): Response
    {
        $user = $request->user();

        $courseId = (string) $request->route($courseParam);
        if ($courseId === '') {
            return $next($request);
        }

        $course = Course::query()->find($courseId);
        if (! $course) {
            return $next($request);
        }

        $isAdmin = $user && method_exists($user, 'isAdmin') && $user->isAdmin();
        if ($isAdmin) {
            return $next($request);
        }

        if ($user && (string) $course->instructor_id === (string) $user->id) {
            return $next($request);
        }

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $enrollment = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', (string) $course->id)
            ->first(['balance_due', 'payment_deadline', 'access_locked', 'total_price']);

        if (! $enrollment) {
            return $next($request);
        }

        $balanceDue = (float) ($enrollment->balance_due ?? 0);
        $deadline = $enrollment->payment_deadline ?? null;
        $manualLocked = (bool) ($enrollment->access_locked ?? false);

        $deadlineReached = $deadline ? now()->greaterThanOrEqualTo($deadline) : false;
        $shouldLock = $manualLocked || ($balanceDue > 0 && $deadlineReached);

        if (! $shouldLock) {
            return $next($request);
        }

        $defaultCurrency = Currency::platform();
        $currency = Currency::normalize((string) ($course->currency ?: $defaultCurrency)) ?: $defaultCurrency;

        return response()->json([
            'message' => 'Outstanding balance required before accessing this content.',
            'code' => 'OUTSTANDING_BALANCE',
            'course_id' => (string) $course->id,
            'currency' => $currency,
            'total_price' => (float) ($enrollment->total_price ?? (float) $course->price),
            'balance_due' => $balanceDue,
            'payment_deadline' => $deadline ? (string) $deadline : null,
        ], 403);
    }
}
