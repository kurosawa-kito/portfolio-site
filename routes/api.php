<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskDetailController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SharedTaskController;
use App\Http\Controllers\AdminTaskController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\SharedNoteController;
use App\Http\Controllers\DatabaseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// 認証関連のルート
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/auth/register', [AuthController::class, 'register']);

// タスク関連のルート
Route::middleware('auth:sanctum')->group(function () {
    // タスク一覧
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::patch('/tasks', [TaskController::class, 'updateStatus']);
    
    // 個別タスク
    Route::get('/tasks/{id}', [TaskDetailController::class, 'show']);
    Route::put('/tasks/{id}', [TaskDetailController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskDetailController::class, 'destroy']);
    
    // 共有タスク・アイテム
    Route::get('/shared-items', [SharedTaskController::class, 'index']);
    Route::post('/shared-items', [SharedTaskController::class, 'store']);
    Route::delete('/shared-items/{id}', [SharedTaskController::class, 'destroy']);
    
    // データベース操作（管理者のみ）
    Route::post('/seed', [DatabaseController::class, 'seed']);
    Route::post('/migrate', [DatabaseController::class, 'migrate']);
    
    // 管理者用ルート
    Route::middleware('admin')->group(function () {
        // 管理者タスク
        Route::get('/admin/tasks', [AdminTaskController::class, 'index']);
        Route::put('/admin/tasks/{id}', [AdminTaskController::class, 'update']);
        Route::delete('/admin/tasks/{id}', [AdminTaskController::class, 'destroy']);
        
        // 管理者ユーザー
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::post('/admin/users', [AdminUserController::class, 'store']);
        Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
        
        // クエリ実行
        Route::post('/admin/query', [DatabaseController::class, 'executeQuery']);
    });
});
