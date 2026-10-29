<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('phone');
            }
        });

        Schema::table('spaces', function (Blueprint $table) {
            if (!Schema::hasColumn('spaces', 'sub_duration_unit')) {
                $table->string('sub_duration_unit')->default('months')->after('sub_duration_months');
            }
            if (!Schema::hasColumn('spaces', 'sub_duration_value')) {
                $table->integer('sub_duration_value')->default(1)->after('sub_duration_unit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'last_activity_at')) {
                $table->dropColumn('last_activity_at');
            }
            if (Schema::hasColumn('users', 'birth_date')) {
                $table->dropColumn('birth_date');
            }
        });

        Schema::table('spaces', function (Blueprint $table) {
            if (Schema::hasColumn('spaces', 'sub_duration_unit')) {
                $table->dropColumn('sub_duration_unit');
            }
            if (Schema::hasColumn('spaces', 'sub_duration_value')) {
                $table->dropColumn('sub_duration_value');
            }
        });
    }
};
