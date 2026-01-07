<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('module_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->unsignedInteger('order_index')->default(0);
            $table->json('topics')->nullable();
            $table->json('learning_outcomes')->nullable();
            $table->timestamps();

            $table->foreign('module_id')->references('id')->on('course_modules')->onDelete('cascade');
            $table->index(['module_id', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_lessons');
    }
};
