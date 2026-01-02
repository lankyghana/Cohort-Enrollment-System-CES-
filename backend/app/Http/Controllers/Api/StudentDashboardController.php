<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $enrollments = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->get(['id', 'course_id'])
            ->map(function ($row) {
                return [
                    'id' => (string) $row->id,
                    'course_id' => (string) $row->course_id,
                    // The current schema does not store progress/completion yet.
                    // Return safe defaults so the UI can render.
                    'progress_percentage' => 0,
                    'completed_at' => null,
                ];
            })
            ->values();

        $courseIds = $enrollments->pluck('course_id')->unique()->values()->all();

        $sessions = empty($courseIds)
            ? collect()
            : DB::table('course_sessions')
                ->whereIn('course_id', $courseIds)
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at')
                ->limit(10)
                ->get(['id', 'title', 'scheduled_at', 'course_id'])
                ->map(function ($row) {
                    return [
                        'id' => (string) $row->id,
                        'title' => $row->title,
                        'scheduled_at' => $row->scheduled_at,
                        'course_id' => (string) $row->course_id,
                    ];
                })
                ->values();

        $resources = empty($courseIds)
            ? collect()
            : DB::table('resources')
                ->whereIn('course_id', $courseIds)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id', 'title', 'type', 'created_at'])
                ->map(function ($row) {
                    return [
                        'id' => (string) $row->id,
                        'title' => $row->title,
                        'file_type' => $row->type,
                        'created_at' => $row->created_at,
                    ];
                })
                ->values();

        return response()->json([
            'enrollments' => $enrollments,
            'sessions' => $sessions,
            'resources' => $resources,
        ]);
    }
}
