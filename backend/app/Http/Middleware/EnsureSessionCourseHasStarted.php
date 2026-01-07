<?php

namespace App\Http\Middleware;

use App\Models\CourseSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSessionCourseHasStarted
{
    /**
     * Block student access to session endpoints until the session's course start_date.
     * Admins and the course instructor are always allowed.
     */
    public function handle(Request $request, Closure $next, string $sessionParam = 'sessionId'): Response
    {
        $user = $request->user();

        $sessionId = (string) $request->route($sessionParam);
        if ($sessionId === '') {
            return $next($request);
        }

        $session = CourseSession::query()->find($sessionId);
        if (! $session) {
            return $next($request);
        }

        $course = $session->course()->first();
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

        if ($course->start_date && now()->lt($course->start_date)) {
            return response()->json([
                'message' => 'Course has not started yet.',
                'code' => 'COURSE_NOT_STARTED',
                'course_id' => (string) $course->id,
                'start_date' => $course->start_date->toISOString(),
            ], 403);
        }

        return $next($request);
    }
}
