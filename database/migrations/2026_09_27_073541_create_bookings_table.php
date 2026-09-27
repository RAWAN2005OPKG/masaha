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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('space_id')->constrained('spaces')->onDelete('cascade');
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('seat_type')->default('مقعد عادي');
            $table->string('seat_number')->nullable();
            $table->integer('hours')->default(1);
            $table->decimal('price_per_hour', 8, 2)->default(0);
            $table->decimal('total_price', 8, 2)->default(0);
            $table->string('receipt_url')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, rejected, completed, cancelled
            $table->string('wifi_username')->nullable();
            $table->string('wifi_password')->nullable();
            $table->text('services')->nullable();
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('check_out_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
