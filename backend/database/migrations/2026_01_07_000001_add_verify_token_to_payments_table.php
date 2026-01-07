<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'verify_token_hash')) {
                $table->string('verify_token_hash', 64)->nullable()->index()->after('payment_url');
            }

            if (! Schema::hasColumn('payments', 'verify_token_used_at')) {
                $table->timestamp('verify_token_used_at')->nullable()->index()->after('verify_token_hash');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'verify_token_used_at')) {
                $table->dropColumn('verify_token_used_at');
            }

            if (Schema::hasColumn('payments', 'verify_token_hash')) {
                $table->dropColumn('verify_token_hash');
            }
        });
    }
};
