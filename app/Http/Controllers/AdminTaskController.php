<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminTaskController extends Controller
{
    /**
     * 全タスクを取得
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // 全タスクを取得
            $tasks = Task::join('users as u1', 'tasks.assigned_to', '=', 'u1.id')
                ->leftJoin('users as u2', 'tasks.created_by', '=', 'u2.id')
                ->select(
                    'tasks.*',
                    'u1.username as assigned_to_username',
                    'u2.username as created_by_username'
                )
                ->orderBy('tasks.due_date', 'asc')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスク一覧の取得に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスク情報を更新
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // タスクの存在確認
            $task = Task::find($id);
            if (!$task) {
                return response()->json(['error' => 'タスクが見つかりません'], 404);
            }

            // バリデーション
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|required|in:pending,in_progress,completed',
                'priority' => 'sometimes|required|in:low,medium,high',
                'due_date' => 'nullable|date',
                'assigned_to' => 'nullable|exists:users,id',
                'is_all_day' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 400);
            }

            // 更新するフィールドを設定
            if ($request->has('title')) {
                $task->title = $request->input('title');
            }
            if ($request->has('description')) {
                $task->description = $request->input('description');
            }
            if ($request->has('status')) {
                $task->status = $request->input('status');
            }
            if ($request->has('priority')) {
                $task->priority = $request->input('priority');
            }
            if ($request->has('due_date')) {
                $task->due_date = $request->input('due_date');
            }
            if ($request->has('assigned_to')) {
                $task->assigned_to = $request->input('assigned_to');
            }
            if ($request->has('is_all_day')) {
                $task->is_all_day = $request->input('is_all_day');
            }

            $task->save();

            // 更新後のタスク情報（関連データ含め）を取得
            $updatedTask = Task::join('users as u1', 'tasks.assigned_to', '=', 'u1.id')
                ->leftJoin('users as u2', 'tasks.created_by', '=', 'u2.id')
                ->select(
                    'tasks.*',
                    'u1.username as assigned_to_username',
                    'u2.username as created_by_username'
                )
                ->where('tasks.id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'task' => $updatedTask
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの更新に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスクを削除
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // タスクの存在確認
            $task = Task::find($id);
            if (!$task) {
                return response()->json(['error' => 'タスクが見つかりません'], 404);
            }

            // タスクを削除
            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'タスクを削除しました'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの削除に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * 特定ユーザーのタスク一覧取得
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserTasks(Request $request)
    {
        try {
            $user = $request->user();

            // 管理者のみアクセス可能
            if ($user->role !== 'admin') {
                return response()->json(
                    ['error' => 'この操作には管理者権限が必要です'],
                    403
                );
            }

            // URLからユーザーIDを取得
            $userId = $request->query('userId');

            if (!$userId) {
                return response()->json(
                    ['success' => false, 'message' => 'ユーザーIDが指定されていません'],
                    400
                );
            }

            // 数値に変換
            $userIdNum = (int)$userId;

            // ユーザーの存在を確認
            $targetUser = User::find($userIdNum);
            if (!$targetUser) {
                return response()->json(
                    ['success' => false, 'message' => '指定されたユーザーが存在しません'],
                    404
                );
            }

            // データベースから指定されたユーザーのタスクを取得
            $userTasks = Task::with(['assignedUser', 'creator'])
                ->where('assigned_to', $userIdNum)
                ->orderBy('due_date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'tasks' => $userTasks,
                'user' => [
                    'id' => $targetUser->id,
                    'username' => $targetUser->username,
                    'role' => $targetUser->role
                ]
            ]);
        } catch (\Exception $error) {
            \Log::error("管理者タスク取得エラー: " . $error->getMessage());
            return response()->json(
                ['success' => false, 'message' => 'タスク情報の取得に失敗しました'],
                500
            );
        }
    }

    /**
     * AIクエリ処理
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleQuery(Request $request)
    {
        try {
            $query = $request->input('query');
            
            // 簡易的なAI処理（実際にはNLPを活用）
            if (strpos($query, '進捗') !== false) {
                $tasks = Task::where('status', '!=', 'completed')->get();
                $result = $tasks->map(function($task) {
                    return "{$task->title}: {$task->status}";
                })->join("\n");
                
                return response()->json(['result' => $result]);
            }
            
            return response()->json(['result' => '未実装のクエリです']);
        } catch (\Exception $error) {
            \Log::error("AI処理エラー: " . $error->getMessage());
            return response()->json(
                ['error' => 'クエリの処理に失敗しました'],
                500
            );
        }
    }
}