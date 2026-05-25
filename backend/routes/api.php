<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LeadNoteController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/stats', [LeadController::class, 'dashboard']);
    Route::apiResource('/leads', LeadController::class);
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus']);

    Route::get('/leads/{lead}/notes', [LeadNoteController::class, 'index']);
    Route::post('/leads/{lead}/notes', [LeadNoteController::class, 'store']);
    Route::delete('/lead-notes/{note}', [LeadNoteController::class, 'destroy']);

    Route::apiResource('users', UserController::class);
    Route::get('/sales-users', [UserController::class, 'salesUsers']);
    Route::patch('/leads/{lead}/assign', [LeadController::class, 'assignLead']);


    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
