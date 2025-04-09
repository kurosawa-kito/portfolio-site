<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TaskDetailController extends Controller
{
    /**
     * 指定されたタスクを取得
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id, Request $request)
    {
        try {
            // ユーザー認証
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証エラー'], 401);
            }

            // タスクの取得と権限チェック
            $task = Task::where('id', $id)
                ->where('assigned_to', $user->id)
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、参照権限がありません'], 404);
            }

            return response()->json($task);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの取得に失敗しました'], 500);
        }
    }

    /**
     * タスクを更新
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update($id, Request $request)
    {
        try {
            // リクエストデータのバリデーション
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'priority' => 'required|in:low,medium,high',
                'is_all_day' => 'boolean',
            ]);

            // ユーザー認証
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証エラー'], 401);
            }

            // タスクの取得と権限チェック
            $task = Task::where('id', $id)
                ->where('assigned_to', $user->id)
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、更新権限がありません'], 404);
            }

            // タスクを更新
            $task->title = $validated['title'];
            $task->description = $validated['description'] ?? null;
            $task->due_date = $validated['due_date'] ?? null;
            $task->priority = $validated['priority'];
            $task->is_all_day = $validated['is_all_day'] ?? false;
            $task->save();

            return response()->json($task, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの更新に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスクを削除
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id, Request $request)
    {
        try {
            // ユーザー認証
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証エラー'], 401);
            }

            // タスクの取得と権限チェック
            $task = Task::where('id', $id)
                ->where('assigned_to', $user->id)
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、削除権限がありません'], 404);
            }

            // タスクを保存して削除結果を返す
            $deletedTask = $task->toArray();
            $task->delete();

            return response()->json([
                'message' => 'タスクを削除しました',
                'deletedTask' => $deletedTask
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの削除に失敗しました'], 500);
        }
    }
}
