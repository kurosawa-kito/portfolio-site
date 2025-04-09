<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\User;

class TaskController extends Controller
{
    /**
     * タスク一覧を取得
     */
    public function index(Request $request)
    {
        try {
            // ユーザー認証（本番環境ではミドルウェアで処理する）
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // データベースからユーザーに割り当てられたタスクを取得
            $tasks = DB::table('tasks as t')
                ->select(
                    't.*',
                    'u.username as assigned_to_username',
                    'c.username as created_by_username'
                )
                ->leftJoin('users as u', 't.assigned_to', '=', 'u.id')
                ->leftJoin('users as c', 't.created_by', '=', 'c.id')
                ->where('t.assigned_to', $user->id)
                ->orderBy('t.due_date', 'asc')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの取得に失敗しました'], 500);
        }
    }

    /**
     * 新しいタスクを作成
     */
    public function store(Request $request)
    {
        try {
            // リクエストデータのバリデーション
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'priority' => 'required|in:low,medium,high',
                'project_id' => 'nullable|integer',
                'is_all_day' => 'boolean',
            ]);

            // ユーザー認証
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // 新しいタスクを作成
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => 'pending',
                'due_date' => $validated['due_date'] ?? null,
                'priority' => $validated['priority'],
                'assigned_to' => $user->id,
                'project_id' => $validated['project_id'] ?? null,
                'created_by' => $user->id,
                'is_shared' => false,
                'is_all_day' => $validated['is_all_day'] ?? false,
            ]);

            return response()->json(['success' => true, 'task' => $task]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの作成に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスクのステータスを更新
     */
    public function updateStatus(Request $request)
    {
        try {
            // リクエストデータのバリデーション
            $validated = $request->validate([
                'id' => 'required|integer',
                'status' => 'required|in:pending,in_progress,completed',
            ]);

            // ユーザー認証
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // タスクを更新
            $task = Task::where('id', $validated['id'])
                ->where('assigned_to', $user->id)
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、アクセス権がありません'], 404);
            }

            $task->status = $validated['status'];
            $task->save();

            return response()->json(['success' => true, 'task' => $task]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの更新に失敗しました'], 500);
        }
    }
}
