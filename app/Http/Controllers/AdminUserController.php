<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * 全ユーザーを取得
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

            // 全ユーザーを取得
            $users = User::select('id', 'username', 'login_id', 'email', 'role', 'created_at')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ユーザー一覧の取得に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * 新規ユーザーを作成
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // バリデーション
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:50',
                'login_id' => 'required|string|max:50|unique:users',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6',
                'role' => 'required|in:user,admin',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 400);
            }

            // ユーザー作成
            $newUser = User::create([
                'username' => $request->input('username'),
                'login_id' => $request->input('login_id'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'role' => $request->input('role'),
            ]);

            return response()->json([
                'success' => true,
                'user' => $newUser
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ユーザーの作成に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ユーザー情報を更新
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

            // 更新対象のユーザーを取得
            $targetUser = User::find($id);
            if (!$targetUser) {
                return response()->json(['error' => 'ユーザーが見つかりません'], 404);
            }

            // バリデーション
            $validator = Validator::make($request->all(), [
                'username' => 'sometimes|required|string|max:50',
                'login_id' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('users')->ignore($id),
                ],
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('users')->ignore($id),
                ],
                'password' => 'sometimes|required|string|min:6',
                'role' => 'sometimes|required|in:user,admin',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 400);
            }

            // 更新するフィールドを設定
            if ($request->has('username')) {
                $targetUser->username = $request->input('username');
            }
            if ($request->has('login_id')) {
                $targetUser->login_id = $request->input('login_id');
            }
            if ($request->has('email')) {
                $targetUser->email = $request->input('email');
            }
            if ($request->has('password')) {
                $targetUser->password = Hash::make($request->input('password'));
            }
            if ($request->has('role')) {
                $targetUser->role = $request->input('role');
            }

            $targetUser->save();

            return response()->json([
                'success' => true,
                'user' => $targetUser
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ユーザーの更新に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ユーザーを削除
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

            // 自分自身は削除できないようにする
            if ((int)$id === $user->id) {
                return response()->json(['error' => '自分自身は削除できません'], 400);
            }

            // 削除対象のユーザーを取得
            $targetUser = User::find($id);
            if (!$targetUser) {
                return response()->json(['error' => 'ユーザーが見つかりません'], 404);
            }

            // ユーザーを削除
            $targetUser->delete();

            return response()->json([
                'success' => true,
                'message' => 'ユーザーを削除しました'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ユーザーの削除に失敗しました: ' . $e->getMessage()], 500);
        }
    }
}
