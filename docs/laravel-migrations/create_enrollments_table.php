<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->uuid('course_id');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->unique(['student_id', 'course_id']);
            $table->index('student_id');
            $table->index('course_id');
            $table->index(['course_id', 'student_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
