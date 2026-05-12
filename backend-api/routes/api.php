<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/dashboard-stats', [DashboardController::class, 'index']);
Route::apiResource('products', ProductController::class);


Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::post('/categories', [App\Http\Controllers\Api\CategoryController::class, 'store']);

Route::post('/transactions', [App\Http\Controllers\Api\TransactionController::class, 'store']);
Route::get('/transactions', [App\Http\Controllers\Api\TransactionController::class, 'index']);

