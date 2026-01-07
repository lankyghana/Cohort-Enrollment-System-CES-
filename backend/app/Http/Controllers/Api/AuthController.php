<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentIntent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function syncEnvAdmin(User $user): void
    {
        if (! $user->isEnvAdmin()) {
            return;
        }

        // Env admins must always be active admins.
        $dirty = false;
        if ($user->role !== 'admin') {
            $user->role = 'admin';
            $dirty = true;
        }
        if (($user->status ?? null) !== 'active') {
            $user->status = 'active';
            $dirty = true;
        }
        if (($user->has_active_enrollment ?? null) !== true) {
            $user->has_active_enrollment = true;
            $dirty = true;
        }

        if ($dirty) {
            $user->save();
        }
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:30',
            'password' => ['required', 'string', 'min:8', 'regex:/[A-Za-z]/', 'regex:/\d/'],
        ]);

        $fullName = $validated['full_name'] ?? $validated['name'] ?? null;
        if (! $fullName) {
            throw ValidationException::withMessages([
                'full_name' => ['Full name is required.'],
            ]);
        }

        // Public registration always creates student accounts.
        // Instructor/admin roles must be assigned by an admin (or via env-admin allowlist).
        $role = 'student';
        $isStudent = true;

        $user = User::create([
            'name' => $fullName,
            'full_name' => $fullName,
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'status' => $isStudent ? 'pending' : 'active',
            'has_active_enrollment' => $isStudent ? false : true,
        ]);

        $this->syncEnvAdmin($user);

        $nextStep = $user->isStudent() ? 'select-course' : 'login';

        $intent = null;
        if ($user->isStudent()) {
            $intent = EnrollmentIntent::create([
                'user_id' => $user->id,
                'state' => 'awaiting_course',
            ]);
        }

        // Authoritative flow: account is incomplete until course selection + verified payment.
        // Do not issue auth tokens on registration.
        return response()->json([
            'enrollment_intent_id' => $intent ? (string) $intent->id : null,
            'next_step' => $nextStep,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'login_as' => 'required|string|in:student,instructor,admin',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Ensure env-admin identity is enforced.
        $this->syncEnvAdmin($user);

        // HARD STOP ON ROLE MISMATCH (before any token issuance)
        if ((string) $request->login_as !== (string) $user->role) {
            return response()->json([
                'code' => 'ROLE_MISMATCH',
                'message' => 'This account is not registered as a ' . (string) $request->login_as,
                'login_as' => (string) $request->login_as,
                'actual_role' => (string) $user->role,
            ], 403);
        }

        if ($user->isStudent()) {
            $status = (string) ($user->status ?? 'active');
            $hasActiveEnrollment = (bool) ($user->has_active_enrollment ?? false);

            if ($status === 'pending' || ! $hasActiveEnrollment) {
                $intent = EnrollmentIntent::query()
                    ->where('user_id', $user->id)
                    ->whereIn('state', ['awaiting_course', 'awaiting_payment'])
                    ->latest('created_at')
                    ->first();

                if (! $intent) {
                    $intent = EnrollmentIntent::create([
                        'user_id' => $user->id,
                        'state' => 'awaiting_course',
                    ]);
                }

                return response()->json([
                    'message' => 'Continue enrollment to activate your account',
                    'next_step' => 'select-course',
                    'enrollment_intent_id' => (string) $intent->id,
                ], 200);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function checkAdmin()
    {
        $adminEmails = User::adminEmailAllowlist();
        $adminExists = User::where('role', 'admin')->exists()
            || (! empty($adminEmails) && User::whereIn('email', $adminEmails)->exists());
        
        return response()->json(['exists' => $adminExists]);
    }

    public function requestPasswordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        return response()->json([
            'message' => 'Password reset link sent to your email'
        ]);
    }
}