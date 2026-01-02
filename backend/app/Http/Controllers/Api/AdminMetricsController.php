<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminMetricsController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $months = (int) $request->query('months', 6);
        $months = max(1, min($months, 24));

        $totalStudents = (int) DB::table('users')->where('role', 'student')->count();
        $totalCourses = (int) DB::table('courses')->where('status', 'published')->count();

        // "Active" enrollments: anything except failed.
        $totalEnrollments = (int) DB::table('enrollments')->where('payment_status', '!=', 'failed')->count();

        // Revenue is sum of successful payments.
        $totalRevenue = (float) (DB::table('payments')->where('status', 'successful')->sum('amount') ?? 0);

        $now = Carbon::now();
        $start = $now->copy()->startOfMonth()->subMonths($months - 1);

        // Pre-fill month buckets so UI always renders a stable chart.
        $trend = [];
        for ($i = 0; $i < $months; $i++) {
            $cursor = $start->copy()->addMonths($i);
            $trendKey = $cursor->format('Y-m');
            $trend[$trendKey] = [
                'year' => (int) $cursor->year,
                'month_index' => (int) $cursor->month,
                'month' => $cursor->format('M'),
                'enrollments' => 0,
            ];
        }

        $rawTrend = DB::table('enrollments')
            ->selectRaw("strftime('%Y-%m', enrolled_at) as ym, COUNT(*) as c")
            ->where('enrolled_at', '>=', $start->copy()->startOfMonth()->toDateTimeString())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Note: project uses SQLite locally; strftime works there.
        foreach ($rawTrend as $row) {
            $ym = (string) $row->ym;
            if (isset($trend[$ym])) {
                $trend[$ym]['enrollments'] = (int) $row->c;
            }
        }

        $topCourses = DB::table('enrollments')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->select('courses.id', 'courses.title', DB::raw('COUNT(enrollments.id) as enrollment_count'))
            ->groupBy('courses.id', 'courses.title')
            ->orderByDesc('enrollment_count')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'title' => (string) $r->title,
                'enrollment_count' => (int) $r->enrollment_count,
            ])
            ->values();

        $recentEnrollments = DB::table('enrollments')
            ->join('users', 'users.id', '=', 'enrollments.student_id')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->select([
                'enrollments.id',
                'enrollments.student_id',
                DB::raw("COALESCE(users.full_name, users.name) as student_name"),
                'users.email as student_email',
                'enrollments.course_id',
                'courses.title as course_title',
                'enrollments.payment_status',
                'enrollments.enrolled_at',
            ])
            ->orderByDesc('enrollments.enrolled_at')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'student_id' => (string) $r->student_id,
                'student_name' => (string) ($r->student_name ?? ''),
                'student_email' => (string) ($r->student_email ?? ''),
                'course_id' => (string) $r->course_id,
                'course_title' => (string) ($r->course_title ?? ''),
                'payment_status' => (string) $r->payment_status,
                'enrolled_at' => Carbon::parse($r->enrolled_at)->toISOString(),
            ])
            ->values();

        return response()->json([
            'metrics' => [
                'total_students' => $totalStudents,
                'total_courses' => $totalCourses,
                'total_enrollments' => $totalEnrollments,
                'total_revenue' => $totalRevenue,
            ],
            'trend' => array_values($trend),
            'top_courses' => $topCourses,
            'recent_enrollments' => $recentEnrollments,
        ]);
    }
}
