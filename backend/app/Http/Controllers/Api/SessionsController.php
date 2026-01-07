<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionsController extends Controller
{
    public function show(Request $request, string $sessionId)
    {
        $user = $request->user();

        $row = DB::table('course_sessions')->where('id', $sessionId)->first([
            'id',
            'course_id',
            'title',
            'description',
            'meeting_link',
            'scheduled_at',
            'duration_minutes',
            'status',
            'recording_url',
        ]);

        if (! $row) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        $canAccess = $user->isAdmin() || $user->isInstructor() || DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', (string) $row->course_id)
            ->exists();

        if (! $canAccess) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'id' => (string) $row->id,
            'title' => $row->title,
            'description' => $row->description,
            'meeting_link' => $row->meeting_link,
            'scheduled_at' => (string) $row->scheduled_at,
            'duration_minutes' => (int) $row->duration_minutes,
            'status' => $row->status,
            'recording_url' => $row->recording_url,
        ]);
    }
}
