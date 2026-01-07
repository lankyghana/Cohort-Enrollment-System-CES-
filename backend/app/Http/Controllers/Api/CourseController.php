<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Support\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('instructor:id,name,email');

        // Public and non-admin users should only ever see published courses.
        $user = $request->user();
        $isAdmin = $user && method_exists($user, 'isAdmin') && $user->isAdmin();
        if (! $isAdmin) {
            $query->published();
        }

        if ($request->boolean('enrollable')) {
            $query->published();
        }

        if ($isAdmin && $request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('search')) {
            $term = trim((string) $request->query('search'));
            if ($term !== '') {
                $query->where(function ($q) use ($term) {
                    $q->where('title', 'like', '%' . $term . '%')
                        ->orWhere('short_description', 'like', '%' . $term . '%');
                });
            }
        }

        if ($request->filled('ids')) {
            $ids = $request->query('ids');
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $parts = array_filter(array_map('trim', explode(',', (string) $ids)));
                if (! empty($parts)) {
                    $query->whereIn('id', $parts);
                }
            }
        }

        $pageSize = (int) ($request->query('pageSize') ?? $request->query('per_page') ?? 0);
        if ($pageSize > 0) {
            $pageSize = max(1, min($pageSize, 100));
            return response()->json($query->latest()->paginate($pageSize));
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Admin-only: list all courses (including draft/archived).
     */
    public function adminIndex(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $this->index($request);
    }

    public function featured()
    {
        $featuredCourses = Course::where('is_featured', true)
            ->with('instructor:id,name,email')
            ->published()
            ->latest()
            ->take(3)
            ->get();

        return response()->json($featuredCourses);
    }

    public function store(Request $request)
    {
        // Only instructors or admins can create courses.
        if (!$request->user()->isInstructor() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'price_minor' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'duration_weeks' => 'nullable|integer|min:1',
            'status' => 'nullable|in:draft,published,archived',
            'published' => 'nullable|boolean',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'max_students' => 'nullable|integer|min:1',
            'thumbnail_path' => 'nullable|string',
        ]);

        $validated['start_date'] = Carbon::parse((string) $validated['start_date'])->utc();
        if (! empty($validated['end_date'])) {
            $validated['end_date'] = Carbon::parse((string) $validated['end_date'])->utc();
        }

        $defaultCurrency = Currency::platform();
        $currency = Currency::normalize((string) ($validated['currency'] ?? $defaultCurrency)) ?: $defaultCurrency;

        $priceMinor = array_key_exists('price_minor', $validated) ? $validated['price_minor'] : null;
        if ($priceMinor === null && array_key_exists('price', $validated)) {
            // Legacy major-unit pricing support (for backward compatibility).
            $priceMinor = (int) round(((float) $validated['price']) * 100);
        }

        // Non-admins should not be able to create hidden courses.
        $published = (bool) ($validated['published'] ?? false);
        if (! $request->user()->isAdmin()) {
            $published = true;
        }

        // Keep legacy status in sync.
        $status = $published ? 'published' : 'draft';
        if ($request->user()->isAdmin() && array_key_exists('status', $validated)) {
            $status = (string) $validated['status'];
            $published = ($status === 'published');
        }

        $thumbnailPath = $validated['thumbnail_path'] ?? null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('uploads', 'public');
        }

        $course = Course::create([
            'id' => Str::uuid(),
            'instructor_id' => $request->user()->id,
            ...$validated,
            'currency' => $currency,
            'price_minor' => $priceMinor,
            'price' => (array_key_exists('price', $validated) && $validated['price'] !== null)
                ? $validated['price']
                : ($priceMinor !== null ? ((float) $priceMinor) / 100 : 0),
            'published' => $published,
            'status' => $status,
            'thumbnail_path' => $thumbnailPath,
            'thumbnail_url' => $thumbnailPath,
        ]);

        return response()->json($course->load('instructor'), 201);
    }

    public function show(Request $request, string $id)
    {
        $course = Course::with(['instructor:id,name,email,avatar_url,bio'])
            ->findOrFail($id);

        $user = $request->user();
        $isAdmin = $user && method_exists($user, 'isAdmin') && $user->isAdmin();
        if (! $isAdmin && ! $course->published) {
            // Hide unpublished courses from non-admins.
            abort(404);
        }

        return response()->json($course);
    }

    /**
     * Admin-only: access a course regardless of status.
     */
    public function adminShow(Request $request, string $id)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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

        if (! $request->user()->isAdmin() && ! $course->published) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'price_minor' => 'nullable|integer|min:0',
            'duration_weeks' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:draft,published,archived',
            'published' => 'nullable|boolean',
            'start_date' => 'sometimes|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'thumbnail_url' => 'nullable|string',
            'thumbnail_path' => 'nullable|string',
            'currency' => 'nullable|string|size:3',
        ]);

        if (array_key_exists('start_date', $validated) && $validated['start_date'] !== null) {
            // Do not allow changing start_date after the course has started.
            if ($course->start_date && $course->start_date->lte(now())) {
                return response()->json([
                    'message' => 'Course start date can no longer be modified after the course has started.',
                ], 422);
            }

            $validated['start_date'] = Carbon::parse((string) $validated['start_date'])->utc();
        }

        if (array_key_exists('end_date', $validated) && $validated['end_date'] !== null) {
            $validated['end_date'] = Carbon::parse((string) $validated['end_date'])->utc();
        }

        if (array_key_exists('currency', $validated)) {
            $normalized = Currency::normalize((string) ($validated['currency'] ?? ''));
            if ($normalized) {
                $validated['currency'] = $normalized;
            } else {
                unset($validated['currency']);
            }
        }

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('uploads', 'public');
            $validated['thumbnail_url'] = $validated['thumbnail_path'];
        }

        if (! $request->user()->isAdmin()) {
            // Non-admins should not be able to hide courses.
            unset($validated['status'], $validated['published']);
        }

        // Keep status/published consistent for admins.
        if ($request->user()->isAdmin()) {
            if (array_key_exists('published', $validated)) {
                $validated['published'] = (bool) $validated['published'];
                $validated['status'] = $validated['published'] ? 'published' : 'draft';
            }
            if (array_key_exists('status', $validated)) {
                $validated['published'] = ((string) $validated['status']) === 'published';
            }
        }

        if (array_key_exists('price_minor', $validated)) {
            // Prefer minor-unit pricing when provided.
            if ($validated['price_minor'] !== null) {
                $validated['price'] = ((float) $validated['price_minor']) / 100;
            }
        } elseif (array_key_exists('price', $validated)) {
            $validated['price_minor'] = (int) round(((float) $validated['price']) * 100);
        }

        $course->update($validated);

        return response()->json($course->fresh('instructor'));
    }

    public function destroy(string $id)
    {
        $course = Course::findOrFail($id);

        if ($course->instructor_id !== request()->user()->id && !request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! request()->user()->isAdmin() && ! $course->published) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
