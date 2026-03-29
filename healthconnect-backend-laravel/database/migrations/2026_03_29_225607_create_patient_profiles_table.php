<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('blood_group')->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('current_treatment')->nullable();
            $table->text('medical_history')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_profiles');
    }
};
