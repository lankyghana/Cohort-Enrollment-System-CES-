<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseResourcesController extends Controller
{
    public function index(Request $request, string $courseId)
    {
        $user = $request->user();

        $canAccess = $user->isAdmin() || $user->isInstructor() || DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();

        if (!$canAccess) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $resources = DB::table('resources')
            ->where('course_id', $courseId)
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'description', 'type', 'url', 'storage_path'])
            ->map(function ($row) {
                $fileUrl = null;

                if (!empty($row->url)) {
                    $fileUrl = $row->url;
                } elseif (!empty($row->storage_path)) {
                    $fileUrl = asset('storage/' . ltrim((string) $row->storage_path, '/'));
                }

                return [
                    'id' => (string) $row->id,
                    'title' => $row->title,
                    'description' => $row->description,
                    'file_type' => $row->type,
                    'file_url' => $fileUrl,
                ];
            })
            ->values();

        return response()->json($resources);
    }
}
