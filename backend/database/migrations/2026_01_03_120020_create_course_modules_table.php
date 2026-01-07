<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('course_modules')) {
            // Safety: older workspaces already have this table.
            Schema::create('course_modules', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('course_id');
                $table->string('title');
                $table->text('description')->nullable();
                $table->unsignedInteger('order_index')->default(0);
                $table->timestamps();

                $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
                $table->index(['course_id', 'order_index'], 'course_modules_course_order_index');
            });

            return;
        }

        // Table exists: ensure a composite index for stable ordering queries.
        Schema::table('course_modules', function (Blueprint $table) {
            $table->index(['course_id', 'order_index'], 'course_modules_course_order_index');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('course_modules')) {
            Schema::table('course_modules', function (Blueprint $table) {
                $table->dropIndex('course_modules_course_order_index');
            });
        }
    }
};
