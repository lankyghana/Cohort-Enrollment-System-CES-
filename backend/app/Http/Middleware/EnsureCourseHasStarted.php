<?php

namespace App\Http\Middleware;

use App\Models\Course;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCourseHasStarted
{
    /**
     * Block student access to course-scoped endpoints until start_date.
     * Admins and the course instructor are always allowed.
     */
    public function handle(Request $request, Closure $next, string $courseParam = 'courseId'): Response
    {
        $user = $request->user();

        // If we can't resolve a course id, don't block here.
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

        // Student access: enforce the lock.
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
