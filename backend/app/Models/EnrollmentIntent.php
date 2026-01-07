<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EnrollmentIntent extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'enrollment_intents';

    protected $fillable = [
        'user_id',
        'state',
        'course_id',
        'payment_id',
        'reference',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];
}
