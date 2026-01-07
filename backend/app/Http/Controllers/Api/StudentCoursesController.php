<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentCoursesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rows = DB::table('enrollments')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.student_id', $user->id)
            ->orderByDesc('enrollments.enrolled_at')
            ->get([
                'enrollments.id as enrollment_id',
                'courses.id as course_id',
                'courses.title',
                'courses.short_description',
            ]);

        return response()->json(
            $rows
                ->map(function ($row) {
                    return [
                        'id' => (string) $row->course_id,
                        'title' => (string) $row->title,
                        'short_description' => $row->short_description,
                        'enrollment_id' => (string) $row->enrollment_id,
                        'progress_percentage' => 0,
                    ];
                })
                ->values()
        );
    }

    public function dashboard(Request $request, string $courseId)
    {
        $user = $request->user();

        $enrollment = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (! $enrollment) {
            return response()->json([
                'message' => 'Course not found or you are not enrolled.',
            ], 404);
        }

        $course = DB::table('courses')
            ->where('id', $courseId)
            ->first(['id', 'title', 'description']);

        if (! $course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        $modules = DB::table('course_modules')
            ->where('course_id', $courseId)
            ->orderBy('order_index')
            ->get(['id', 'title', 'description', 'order_index'])
            ->map(function ($row) {
                return [
                    'id' => (string) $row->id,
                    'title' => (string) $row->title,
                    'description' => $row->description,
                    'order_index' => (int) $row->order_index,
                ];
            })
            ->values();

        return response()->json([
            'course' => [
                'id' => (string) $course->id,
                'title' => (string) $course->title,
                'description' => $course->description,
            ],
            'modules' => $modules,
            'enrollment' => [
                'progress_percentage' => 0,
            ],
        ]);
    }
}
