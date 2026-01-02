<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        // Payments are admin-only for this management view.
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $limit = (int) $request->query('limit', 100);
        $limit = max(1, min($limit, 500));

        $query = Payment::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $payments = $query->limit($limit)->get();

        return response()->json([
            'data' => $payments,
        ]);
    }
}
