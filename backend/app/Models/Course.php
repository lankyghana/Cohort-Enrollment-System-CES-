<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'instructor_id',
        'price',
        'price_minor',
        'currency',
        'duration_weeks',
        'duration_value',
        'duration_unit',
        'thumbnail_url',
        'banner_url',
        'thumbnail_path',
        'banner_path',
        'status',
        'published',
        'enrollment_count',
        'max_students',
        'start_date',
        'end_date',
    ];

    /**
     * Route binding: allow lookup by slug or UUID.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        if ($field === null) {
            // Try slug first, then fallback to id (UUID)
            return $this->where('slug', $value)->orWhere('id', $value)->firstOrFail();
        }
        return parent::resolveRouteBinding($value, $field);
    }

    protected $casts = [
        'price' => 'decimal:2',
        'price_minor' => 'integer',
        'published' => 'boolean',
        'duration_value' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function getThumbnailUrlAttribute($value): ?string
    {
        $path = (string) ($this->attributes['thumbnail_path'] ?? '');
        if ($path !== '') {
            return asset('storage/' . ltrim($path, '/'));
        }

        return $this->normalizeLegacyMediaUrl($value);
    }

    public function getBannerUrlAttribute($value): ?string
    {
        $path = (string) ($this->attributes['banner_path'] ?? '');
        if ($path !== '') {
            return asset('storage/' . ltrim($path, '/'));
        }

        return $this->normalizeLegacyMediaUrl($value);
    }

    private function normalizeLegacyMediaUrl($value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $raw = trim($value);
        if ($raw === '') {
            return null;
        }

        if (Str::startsWith($raw, ['http://', 'https://', 'data:', 'blob:'])) {
            return $raw;
        }

        $raw = ltrim($raw, '/');

        if (Str::startsWith($raw, ['storage/', 'app/'])) {
            return asset($raw);
        }

        if (Str::startsWith($raw, 'uploads/')) {
            return asset('storage/' . $raw);
        }

        // Fall back to treating it as a public/ relative asset.
        return asset($raw);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($course) {
            if (!$course->slug) {
                $course->slug = Str::slug($course->title);
            }
        });
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function modules()
    {
        return $this->hasMany(CourseModule::class)->orderBy('order_index');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}