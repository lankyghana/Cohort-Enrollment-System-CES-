<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseSessionsController extends Controller
{
    public function index(Request $request, string $courseId)
    {
        $user = $request->user();

        $canAccess = $user->isAdmin() || $user->isInstructor() || DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();

        if (! $canAccess) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $sessions = DB::table('course_sessions')
            ->where('course_id', $courseId)
            ->orderBy('scheduled_at')
            ->get([
                'id',
                'title',
                'description',
                'meeting_link',
                'scheduled_at',
                'duration_minutes',
                'status',
                'recording_url',
            ])
            ->map(function ($row) {
                return [
                    'id' => (string) $row->id,
                    'title' => $row->title,
                    'description' => $row->description,
                    'meeting_link' => $row->meeting_link,
                    'scheduled_at' => (string) $row->scheduled_at,
                    'duration_minutes' => (int) $row->duration_minutes,
                    'status' => $row->status,
                    'recording_url' => $row->recording_url,
                ];
            })
            ->values();

        return response()->json($sessions);
    }
}
