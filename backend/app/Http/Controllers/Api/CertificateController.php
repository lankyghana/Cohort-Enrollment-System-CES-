<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Enrollment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    private function canManage(Request $request): bool
    {
        $user = $request->user();
        if (! $user) return false;

        if (method_exists($user, 'isAdmin') && $user->isAdmin()) return true;
        if (method_exists($user, 'isInstructor') && $user->isInstructor()) return true;

        return false;
    }

    public function studentIndex(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certs = Certificate::query()
            ->where('student_id', $user->id)
            ->with(['course:id,title'])
            ->orderByDesc('issued_at')
            ->get();

        return response()->json($certs->map(function (Certificate $c) {
            return [
                'id' => (string) $c->id,
                'course_id' => (string) $c->course_id,
                'course_title' => $c->course?->title,
                'issued_at' => optional($c->issued_at)->toISOString(),
                // Backwards compatible field name: the frontend already expects `certificate_url`.
                'certificate_url' => url("/api/student/certificates/{$c->id}/pdf"),
            ];
        })->values());
    }

    public function adminIndex(Request $request)
    {
        if (! $this->canManage($request)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certs = Certificate::query()
            ->with([
                'course:id,title',
                'student:id,name,email',
            ])
            ->orderByDesc('issued_at')
            ->get();

        return response()->json($certs->map(function (Certificate $c) {
            return [
                'id' => (string) $c->id,
                'course_id' => (string) $c->course_id,
                'course_title' => $c->course?->title,
                'student_id' => (string) $c->student_id,
                'student_name' => $c->student?->name,
                'student_email' => $c->student?->email,
                'issued_at' => optional($c->issued_at)->toISOString(),
                'certificate_url' => url("/api/admin/certificates/{$c->id}/pdf"),
            ];
        })->values());
    }

    public function issue(Request $request)
    {
        if (! $this->canManage($request)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'course_id' => 'required|uuid|exists:courses,id',
        ]);

        $hasPaidEnrollment = Enrollment::query()
            ->where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('payment_status', 'paid')
            ->exists();

        if (! $hasPaidEnrollment) {
            return response()->json(['message' => 'Student is not enrolled (paid) for this course.'], 422);
        }

        $certificate = Certificate::query()->firstOrCreate(
            [
                'student_id' => $validated['student_id'],
                'course_id' => $validated['course_id'],
            ],
            [
                'id' => (string) Str::uuid(),
                'certificate_url' => null,
                'issued_at' => now(),
            ]
        );

        return response()->json([
            'id' => (string) $certificate->id,
            'course_id' => (string) $certificate->course_id,
            'student_id' => (string) $certificate->student_id,
            'issued_at' => optional($certificate->issued_at)->toISOString(),
            'certificate_url' => url("/api/admin/certificates/{$certificate->id}/pdf"),
        ], 201);
    }

    public function downloadStudent(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate = Certificate::query()
            ->with(['course', 'student'])
            ->findOrFail($id);

        if ((string) $certificate->student_id !== (string) $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $this->renderPdf($certificate);
    }

    public function downloadAdmin(Request $request, string $id)
    {
        if (! $this->canManage($request)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate = Certificate::query()
            ->with(['course', 'student'])
            ->findOrFail($id);

        return $this->renderPdf($certificate);
    }

    private function renderPdf(Certificate $certificate)
    {
        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate,
            'student' => $certificate->student,
            'course' => $certificate->course,
        ])->setPaper('a4', 'landscape');

        $safeCourse = preg_replace('/[^a-z0-9\-]+/i', '-', (string) ($certificate->course?->title ?? 'course'));
        $safeCourse = trim($safeCourse, '-') ?: 'course';

        $filename = "certificate-{$safeCourse}-{$certificate->id}.pdf";

        return $pdf->download($filename);
    }
}
