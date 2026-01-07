<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Support\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BalanceController extends Controller
{
    public function summary(Request $request, string $courseId)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $course = Course::query()->find($courseId);
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $enrollment = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', (string) $course->id)
            ->first(['total_price', 'amount_paid', 'balance_due', 'payment_deadline', 'access_locked']);

        if (! $enrollment) {
            return response()->json(['message' => 'Enrollment not found.'], 404);
        }

        $defaultCurrency = Currency::platform();
        $currency = Currency::normalize((string) ($course->currency ?: $defaultCurrency)) ?: $defaultCurrency;

        return response()->json([
            'course' => [
                'id' => (string) $course->id,
                'title' => (string) $course->title,
            ],
            'currency' => $currency,
            'total_price' => (float) ($enrollment->total_price ?? (float) $course->price),
            'amount_paid' => (float) ($enrollment->amount_paid ?? 0),
            'balance_due' => (float) ($enrollment->balance_due ?? 0),
            'payment_deadline' => $enrollment->payment_deadline ? (string) $enrollment->payment_deadline : null,
            'access_locked' => (bool) ($enrollment->access_locked ?? false),
        ]);
    }
}
