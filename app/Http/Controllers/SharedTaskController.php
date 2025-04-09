<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\SharedTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SharedTaskController extends Controller
{
    /**
     * 共有タスク一覧を取得
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // 認証チェック
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // 共有タスク（is_sharedがtrueのタスク）を取得
            $sharedItems = Task::where('is_shared', true)
                ->leftJoin('users', 'tasks.created_by', '=', 'users.id')
                ->select(
                    'tasks.*',
                    'users.username as created_by_username'
                )
                ->orderBy('tasks.due_date', 'asc')
                ->get();

            return response()->json($sharedItems);
        } catch (\Exception $e) {
            return response()->json(['error' => '共有タスクの取得に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスクを共有設定にする
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // 認証チェック
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // バリデーション
            $validator = Validator::make($request->all(), [
                'task_id' => 'required|exists:tasks,id',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 400);
            }

            $taskId = $request->input('task_id');

            // タスクの取得と所有権チェック
            $task = Task::where('id', $taskId)
                ->where('assigned_to', $user->id)
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、共有権限がありません'], 404);
            }

            // 既に共有済みかチェック
            if ($task->is_shared) {
                return response()->json(['error' => 'このタスクは既に共有されています'], 400);
            }

            // タスクを共有状態に更新
            $task->is_shared = true;
            $task->shared_at = now();
            $task->save();

            return response()->json([
                'success' => true,
                'message' => 'タスクを共有しました',
                'task' => $task
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの共有に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * タスクの共有を解除
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        try {
            // 認証チェック
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => '認証が必要です'], 401);
            }

            // タスクの取得と所有権チェック
            $task = Task::where('id', $id)
                ->where(function ($query) use ($user) {
                    $query->where('assigned_to', $user->id)
                        ->orWhere('created_by', $user->id)
                        ->orWhere(function ($query) use ($user) {
                            $query->whereNull('assigned_to')
                                ->where('role', 'admin');
                        });
                })
                ->first();

            if (!$task) {
                return response()->json(['error' => 'タスクが見つからないか、共有解除権限がありません'], 404);
            }

            // 共有状態かチェック
            if (!$task->is_shared) {
                return response()->json(['error' => 'このタスクは共有されていません'], 400);
            }

            // タスクの共有を解除
            $task->is_shared = false;
            $task->shared_at = null;
            $task->save();

            return response()->json([
                'success' => true,
                'message' => 'タスクの共有を解除しました',
                'task' => $task
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タスクの共有解除に失敗しました: ' . $e->getMessage()], 500);
        }
    }
}