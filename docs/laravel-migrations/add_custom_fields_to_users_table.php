<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('email');
            $table->string('avatar_url')->nullable();
            $table->enum('role', ['student', 'admin', 'instructor'])->default('student');
            $table->string('phone')->nullable();
            $table->text('bio')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'avatar_url', 'role', 'phone', 'bio']);
        });
    }
};
