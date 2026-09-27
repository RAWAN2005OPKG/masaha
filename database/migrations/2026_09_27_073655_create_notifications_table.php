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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('target_role')->nullable(); // user, receptionist, owner, admin, all
            $table->foreignId('space_id')->nullable()->constrained('spaces')->onDelete('cascade');
            $table->string('type')->default('general'); // booking, payment, emergency, offer, system, check-in, cancelled
            $table->string('title');
            $table->text('desc');
            $table->boolean('is_read')->default(false);
            $table->json('data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
