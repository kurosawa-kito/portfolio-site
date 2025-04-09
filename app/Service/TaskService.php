<?php

namespace App\Services;

use App\Models\Task;
use App\Models\SharedTask;
use App\Models\UserAddedTask;
use Illuminate\Support\Facades\DB;

class TaskService
{
    /**
     * ユーザーのタスク一覧を取得
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserTasks($userId)
    {
        return Task::with(['assignedUser', 'creator'])
            ->where('assigned_to', $userId)
            ->orderBy('due_date', 'asc')
            ->get();
    }

    /**
     * 全ての共有タスクを取得
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllSharedTasks()
    {
        return SharedTask::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * ユーザーが追加した共有タスクIDの一覧を取得
     *
     * @param int $userId
     * @return array
     */
    public function getUserAddedTaskIds($userId)
    {
        return UserAddedTask::where('user_id', $userId)
            ->pluck('task_id')
            ->toArray();
    }

    /**
     * ユーザーに共有タスクを追加
     *
     * @param int $userId
     * @param int $taskId
     * @return \App\Models\UserAddedTask
     */
    public function addTaskToUser($userId, $taskId)
    {
        // すでに追加済みかチェック
        $existing = UserAddedTask::where('user_id', $userId)
            ->where('task_id', $taskId)
            ->first();
            
        if ($existing) {
            return $existing;
        }
        
        return UserAddedTask::create([
            'user_id' => $userId,
            'task_id' => $taskId
        ]);
    }

    /**
     * 共有タスクをユーザーから削除
     *
     * @param int $userId
     * @param int $taskId
     * @return bool
     */
    public function removeTaskFromUser($userId, $taskId)
    {
        return UserAddedTask::where('user_id', $userId)
            ->where('task_id', $taskId)
            ->delete();
    }

    /**
     * 共有タスクを完全に削除（関連付けも含めて）
     *
     * @param int $taskId
     * @return array 削除されたタスク情報
     */
    public function deleteSharedTask($taskId)
    {
        return DB::transaction(function () use ($taskId) {
            $task = SharedTask::findOrFail($taskId);
            $taskData = $task->toArray();
            
            // 関連レコードを削除
            UserAddedTask::where('task_id', $taskId)->delete();
            
            // タスク自体を削除
            $task->delete();
            
            return $taskData;
        });
    }
}
