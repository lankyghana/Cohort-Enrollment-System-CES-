<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('instructor:id,name,email');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        $courses = $query->latest()->get();

        return response()->json($courses);
    }

    public function featured()
    {
        $featuredCourses = Course::where('is_featured', true)
            ->with('instructor:id,name,email')
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

        return response()->json($featuredCourses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_weeks' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'max_students' => 'nullable|integer|min:1',
        ]);

        $course = Course::create([
            'id' => Str::uuid(),
            'instructor_id' => $request->user()->id,
            ...$validated,
            'status' => 'draft',
        ]);

        return response()->json($course->load('instructor'), 201);
    }

    public function show(string $id)
    {
        $course = Course::with(['instructor:id,name,email,avatar_url,bio'])
            ->findOrFail($id);

        return response()->json($course);
    }

    public function update(Request $request, string $id)
    {
        $course = Course::findOrFail($id);

        if ($course->instructor_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_weeks' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:draft,published,archived',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'thumbnail_url' => 'nullable|string',
        ]);

        $course->update($validated);

        return response()->json($course->fresh('instructor'));
    }

    public function destroy(string $id)
    {
        $course = Course::findOrFail($id);

        if ($course->instructor_id !== request()->user()->id && !request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
