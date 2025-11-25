<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Assignment;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubmissionController extends Controller
{
    /**
     * Submit an assignment (student).
     */
    public function store(Request $request, string $assignmentId)
    {
        $assignment = Assignment::findOrFail($assignmentId);

        $validated = $request->validate([
            'body' => 'nullable|string',
            'file_url' => 'nullable|string',
        ]);

        // Check if submission already exists (allow resubmission by updating)
        $submission = Submission::updateOrCreate(
            [
                'assignment_id' => $assignmentId,
                'user_id' => $request->user()->id,
            ],
            [
                'id' => Str::uuid(),
                'body' => $validated['body'] ?? null,
                'file_url' => $validated['file_url'] ?? null,
                'submitted_at' => now(),
            ]
        );

        return response()->json($submission->load('user'), 201);
    }

    /**
     * Grade a submission (instructor).
     */
    public function grade(Request $request, string $submissionId)
    {
        $submission = Submission::findOrFail($submissionId);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'max_score' => 'nullable|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        // Create or update grade
        $grade = Grade::updateOrCreate(
            ['submission_id' => $submissionId],
            [
                'id' => Str::uuid(),
                'score' => $validated['score'],
                'max_score' => $validated['max_score'] ?? 100,
                'feedback' => $validated['feedback'] ?? null,
                'graded_by' => $request->user()->id,
            ]
        );

        return response()->json($grade->load(['submission', 'grader']), 200);
    }

    /**
     * Get a specific submission.
     */
    public function show(string $id)
    {
        $submission = Submission::with(['assignment', 'user:id,name,email', 'grade'])
            ->findOrFail($id);

        return response()->json($submission);
    }
}
