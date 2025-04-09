<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\AdminTaskController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\SharedTaskController;
use App\Http\Controllers\SharedNoteController;

// 認証関連のルート（認証不要）
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    // ログアウト
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // タスク関連のルート
    Route::get('/tasks', [TasksController::class, 'index']);
    Route::post('/tasks', [TasksController::class, 'store']);
    Route::patch('/tasks', [TasksController::class, 'updateStatus']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    
    // 共有タスク関連のルート
    Route::get('/shared/tasks', [SharedTaskController::class, 'index']);
    Route::post('/shared/tasks', [SharedTaskController::class, 'store']);
    Route::put('/shared/tasks/{id}', [SharedTaskController::class, 'update']);
    Route::delete('/shared/tasks/{id}', [SharedTaskController::class, 'destroy']);
    Route::patch('/shared/tasks', [SharedTaskController::class, 'updateStatus']);
    Route::post('/shared/tasks/{id}/add', [SharedTaskController::class, 'addTask']);
    
    // 共有ノート関連のルート
    Route::get('/shared/notes', [SharedNoteController::class, 'index']);
    Route::post('/shared/notes', [SharedNoteController::class, 'store']);
    Route::delete('/shared/notes', [SharedNoteController::class, 'destroy']);
    
    // 管理者用ルート
    Route::middleware('admin')->prefix('admin')->group(function () {
        // 管理者用タスク一覧
        Route::get('/tasks', [AdminTaskController::class, 'getUserTasks']);
        
        // 管理者用AIクエリ
        Route::post('/query', [AdminTaskController::class, 'handleQuery']);
        
        // 管理者用ユーザー管理
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users', [AdminUserController::class, 'update']);
        Route::delete('/users', [AdminUserController::class, 'destroy']);
    });
});

