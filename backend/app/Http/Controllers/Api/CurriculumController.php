<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseLesson;
use App\Models\CourseModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CurriculumController extends Controller
{
    public function show(Request $request, string $id)
    {
        $course = Course::query()
            ->with(['modules.lessons'])
            ->where('slug', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $user = $request->user();
        $isAdmin = $user && method_exists($user, 'isAdmin') && $user->isAdmin();
        if (! $isAdmin && ! $course->published) {
            abort(404);
        }

        return response()->json([
            'course_id' => (string) $course->id,
            'duration_value' => $course->duration_value,
            'duration_unit' => $course->duration_unit,
            'modules' => $course->modules->map(function (CourseModule $m) {
                return [
                    'id' => (string) $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'order_index' => $m->order_index,
                    'lessons' => $m->lessons->map(function (CourseLesson $l) {
                        return [
                            'id' => (string) $l->id,
                            'title' => $l->title,
                            'description' => $l->description,
                            'content' => $l->content,
                            'order_index' => $l->order_index,
                            'topics' => $l->topics ?? [],
                            'learning_outcomes' => $l->learning_outcomes ?? [],
                        ];
                    })->values()->all(),
                ];
            })->values()->all(),
        ]);
    }

    public function upsert(Request $request, string $id)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course = Course::query()->findOrFail($id);

        $validated = $request->validate([
            'duration_value' => 'nullable|integer|min:1',
            'duration_unit' => 'nullable|string|in:weeks,months',
            'modules' => 'required|array',
            'modules.*.title' => 'required|string|max:255',
            'modules.*.description' => 'nullable|string',
            'modules.*.order_index' => 'nullable|integer|min:0',
            'modules.*.lessons' => 'nullable|array',
            'modules.*.lessons.*.title' => 'required|string|max:255',
            'modules.*.lessons.*.description' => 'nullable|string',
            'modules.*.lessons.*.content' => 'nullable|string',
            'modules.*.lessons.*.order_index' => 'nullable|integer|min:0',
            'modules.*.lessons.*.topics' => 'nullable|array',
            'modules.*.lessons.*.topics.*' => 'string',
            'modules.*.lessons.*.learning_outcomes' => 'nullable|array',
            'modules.*.lessons.*.learning_outcomes.*' => 'string',
        ]);

        DB::transaction(function () use ($course, $validated) {
            // Update duration.
            $durationValue = $validated['duration_value'] ?? null;
            $durationUnit = $validated['duration_unit'] ?? null;
            $course->duration_value = $durationValue;
            $course->duration_unit = $durationUnit;
            if ($durationValue && $durationUnit) {
                $course->duration_weeks = $durationUnit === 'months'
                    ? ((int) $durationValue) * 4
                    : (int) $durationValue;
            }
            $course->save();

            // Replace curriculum in a single transaction.
            $course->modules()->delete();

            $modules = $validated['modules'] ?? [];
            foreach (array_values($modules) as $moduleIndex => $m) {
                $module = new CourseModule();
                $module->id = (string) Str::uuid();
                $module->course_id = (string) $course->id;
                $module->title = $m['title'];
                $module->description = $m['description'] ?? null;
                $module->order_index = array_key_exists('order_index', $m) ? (int) $m['order_index'] : $moduleIndex;
                $module->save();

                $lessons = $m['lessons'] ?? [];
                foreach (array_values($lessons) as $lessonIndex => $l) {
                    $lesson = new CourseLesson();
                    $lesson->id = (string) Str::uuid();
                    $lesson->module_id = (string) $module->id;
                    $lesson->title = $l['title'];
                    $lesson->description = $l['description'] ?? null;
                    $lesson->content = $l['content'] ?? null;
                    $lesson->order_index = array_key_exists('order_index', $l) ? (int) $l['order_index'] : $lessonIndex;
                    $lesson->topics = $l['topics'] ?? [];
                    $lesson->learning_outcomes = $l['learning_outcomes'] ?? [];
                    $lesson->save();
                }
            }
        });

        return $this->show($request, $id);
    }
}
