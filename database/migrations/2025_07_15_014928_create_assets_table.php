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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('name');
            $table->string('frequency');
            $table->string('environment');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('location')->nullable();
            $table->string('memo')->nullable();
            $table->timestamps();
        });

        Schema::create('controls', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('limit');
            $table->string('brand')->nullable();
            $table->string('lot')->nullable();
            $table->datetime('expired')->nullable();
            $table->string('memo')->nullable();
            $table->timestamps();
        });

        Schema::create('procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->foreignId('control_id')->constrained('controls')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procedure_id')->constrained('assets')->onDelete('cascade');
            $table->string('value');
            $table->string('result')->nullable();
            $table->string('verified_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('records');
        Schema::dropIfExists('procedures');
        Schema::dropIfExists('controls');
        Schema::dropIfExists('assets');
    }
};
