<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string|max:2000',
            'remove_avatar' => 'nullable|in:true,false,1,0',
            'avatar' => 'nullable|file|max:5120|mimes:png,jpg,jpeg,webp',
        ]);

        if (array_key_exists('full_name', $validated)) {
            $fullName = trim((string) ($validated['full_name'] ?? ''));
            $user->full_name = $fullName;
            // Keep legacy `name` in sync for places that still use it.
            $user->name = $fullName;
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = (string) ($validated['phone'] ?? '');
        }

        if (array_key_exists('bio', $validated)) {
            $user->bio = (string) ($validated['bio'] ?? '');
        }

        $removeAvatar = false;
        if (array_key_exists('remove_avatar', $validated)) {
            $raw = (string) ($validated['remove_avatar'] ?? '');
            $removeAvatar = in_array(strtolower($raw), ['true', '1'], true);
        }

        if ($removeAvatar) {
            $this->deleteAvatarIfStoredLocally($user->avatar_url);
            $user->avatar_url = null;
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');
            $user->avatar_url = asset('storage/' . $path);
        }

        $user->save();

        return response()->json($user->fresh());
    }

    private function deleteAvatarIfStoredLocally(?string $avatarUrl): void
    {
        if (!$avatarUrl) return;

        // Expected format: https://host/storage/<path>
        $pos = strpos($avatarUrl, '/storage/');
        if ($pos === false) return;

        $relative = substr($avatarUrl, $pos + strlen('/storage/'));
        if (!$relative) return;

        // Only delete files in our avatars folder.
        if (!str_starts_with($relative, 'avatars/')) return;

        try {
            Storage::disk('public')->delete($relative);
        } catch (\Throwable $e) {
            // best-effort cleanup
        }
    }
}
