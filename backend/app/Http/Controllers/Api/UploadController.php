<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Handle a single file upload and return a public URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $file = $request->file('file');

        // Create a unique filename
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        // Store in the public disk under uploads/
        $path = $file->storeAs('uploads', $filename, 'public');

        // Build public URL. Assumes `php artisan storage:link` has been run.
        $url = asset('storage/' . $path);

        return response()->json([
            'url' => $url,
            'path' => $path,
        ]);
    }
}
