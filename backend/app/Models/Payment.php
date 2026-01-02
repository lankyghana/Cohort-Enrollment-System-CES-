<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'amount' => 'float',
        'paystack_response' => 'array',
    ];
}
