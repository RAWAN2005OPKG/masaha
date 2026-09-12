<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // The owner
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('region');
            $table->string('internet_speed')->nullable();
            $table->integer('total_seats')->default(0);
            $table->string('electricity')->nullable();
            $table->decimal('price_per_hour', 8, 2)->default(0);
            $table->text('services')->nullable();
            
            // Subscription details
            $table->date('sub_start_date')->nullable();
            $table->integer('sub_duration_months')->nullable();
            $table->date('sub_end_date')->nullable();
            $table->decimal('sub_price', 10, 2)->default(0);
            $table->boolean('is_manual_disabled')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spaces');
    }
};
