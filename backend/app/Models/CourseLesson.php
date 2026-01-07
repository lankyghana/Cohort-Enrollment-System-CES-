<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseLesson extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'course_lessons';

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'content',
        'order_index',
        'topics',
        'learning_outcomes',
    ];

    protected $casts = [
        'order_index' => 'integer',
        'topics' => 'array',
        'learning_outcomes' => 'array',
    ];

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }
}
