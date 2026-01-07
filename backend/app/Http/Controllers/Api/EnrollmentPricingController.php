<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\EnrollmentIntent;
use App\Models\Setting;
use App\Support\Currency;
use Illuminate\Http\Request;

class EnrollmentPricingController extends Controller
{
    public function quote(Request $request)
    {
        $validated = $request->validate([
            'enrollment_intent_id' => 'required|uuid|exists:enrollment_intents,id',
            'course_id' => 'required|uuid|exists:courses,id',
        ]);

        /** @var EnrollmentIntent $intent */
        $intent = EnrollmentIntent::query()->findOrFail($validated['enrollment_intent_id']);

        /** @var Course $course */
        $course = Course::query()->findOrFail($validated['course_id']);

        $defaultCurrency = Currency::platform();
        $currency = Currency::normalize((string) ($course->currency ?: $defaultCurrency)) ?: $defaultCurrency;

        $totalPrice = (float) $course->price;

        $enrollmentFeeRaw = Setting::getValue('enrollment_fee', '0');
        $enrollmentFee = max(0.0, (float) $enrollmentFeeRaw);
        $enrollmentFee = min($enrollmentFee, $totalPrice);

        $balanceDue = max(0.0, $totalPrice - $enrollmentFee);

        return response()->json([
            'enrollment_intent_id' => (string) $intent->id,
            'course_id' => (string) $course->id,
            'currency' => $currency,
            'total_price' => $totalPrice,
            'enrollment_fee' => $enrollmentFee,
            'balance_due' => $balanceDue,
            'start_date' => $course->start_date ? $course->start_date->toISOString() : null,
        ]);
    }
}
