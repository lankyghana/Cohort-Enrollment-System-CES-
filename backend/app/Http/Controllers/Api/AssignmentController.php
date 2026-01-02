<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AssignmentController extends Controller
{
    /**
     * Display a listing of assignments.
     */
    public function index(Request $request)
    {
        $query = Assignment::with(['creator:id,name,email', 'course:id,title']);

        // Filter by mine_only for instructors
        if ($request->has('mine_only') && $request->mine_only) {
            $query->where('created_by', $request->user()->id);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        $assignments = $query->latest()->get();

        return response()->json($assignments);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request)
    {
        // Only instructors or admins can create assignments.
        if (!$request->user()->isInstructor() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'due_at' => 'nullable|date',
            'course_id' => 'nullable|uuid|exists:courses,id',
        ]);

        $assignment = Assignment::create([
            'id' => Str::uuid(),
            'created_by' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json($assignment->load(['creator', 'course']), 201);
    }

    /**
     * Display the specified assignment.
     */
    public function show(string $id)
    {
        $assignment = Assignment::with(['creator:id,name,email', 'course:id,title'])
            ->findOrFail($id);

        return response()->json($assignment);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, string $id)
    {
        $assignment = Assignment::findOrFail($id);

        // Only instructors or admins can update assignments.
        if (!$request->user()->isInstructor() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only creator or admin can update
        if ($assignment->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'instructions' => 'nullable|string',
            'due_at' => 'nullable|date',
            'course_id' => 'nullable|uuid|exists:courses,id',
        ]);

        $assignment->update($validated);

        return response()->json($assignment->fresh(['creator', 'course']));
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(Request $request, string $id)
    {
        $assignment = Assignment::findOrFail($id);

        // Only instructors or admins can delete assignments.
        if (!$request->user()->isInstructor() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only creator or admin can delete
        if ($assignment->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }

    /**
     * Get all submissions for a specific assignment.
     */
    public function submissions(string $id)
    {
        $assignment = Assignment::findOrFail($id);

        // Only instructors or admins can view submissions.
        if (!request()->user()->isInstructor() && !request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = $assignment->submissions()
            ->with(['user:id,name,email', 'grade'])
            ->latest('submitted_at')
            ->get();

        return response()->json($submissions);
    }
}
