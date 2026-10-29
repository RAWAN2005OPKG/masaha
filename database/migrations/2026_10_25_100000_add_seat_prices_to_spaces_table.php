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
        Schema::table('spaces', function (Blueprint $table) {
            if (!Schema::hasColumn('spaces', 'price_private')) {
                $table->decimal('price_private', 8, 2)->nullable()->after('price_per_hour');
            }
            if (!Schema::hasColumn('spaces', 'price_room')) {
                $table->decimal('price_room', 8, 2)->nullable()->after('price_private');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            if (Schema::hasColumn('spaces', 'price_room')) {
                $table->dropColumn('price_room');
            }
            if (Schema::hasColumn('spaces', 'price_private')) {
                $table->dropColumn('price_private');
            }
        });
    }
};
