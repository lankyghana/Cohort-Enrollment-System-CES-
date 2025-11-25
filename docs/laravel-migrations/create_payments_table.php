<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->uuid('course_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'successful', 'failed'])->default('pending');
            $table->string('payment_method')->default('paystack');
            $table->string('paystack_reference')->unique();
            $table->json('paystack_response')->nullable();
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->index('student_id');
            $table->index('course_id');
            $table->index('paystack_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
