<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentAssignmentController extends Controller
{
    /**
     * List assignments for the authenticated student (enrolled courses only).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $courseIds = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->pluck('course_id')
            ->filter()
            ->values();

        if ($courseIds->isEmpty()) {
            return response()->json([]);
        }

        $assignments = Assignment::query()
            ->with(['creator:id,name,email', 'course:id,title'])
            ->whereIn('course_id', $courseIds->all())
            ->latest()
            ->get();

        return response()->json($assignments);
    }

    /**
     * Show an assignment (only if it belongs to an enrolled course).
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        $assignment = Assignment::with(['creator:id,name,email', 'course:id,title'])
            ->findOrFail($id);

        $enrolled = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->exists();

        if (!$enrolled && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($assignment);
    }
}
