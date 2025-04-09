<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ユーザー認証（ログイン）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'login_id' => 'required|string',
                'password' => 'required|string',
            ]);

            // login_idが英数字のみかチェック
            if (!preg_match('/^[a-zA-Z0-9]+$/', $validated['login_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'ログインIDは英数字のみ使用できます'
                ], 400);
            }

            // データベースからユーザーを検索
            $user = User::where('login_id', $validated['login_id'])->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'ログインIDまたはパスワードが正しくありません'
                ], 401);
            }

            // パスワードの検証
            $isPasswordMatch = false;

            // bcryptハッシュを使用している場合
            if (str_starts_with($user->password, '$2y$') || 
                str_starts_with($user->password, '$2a$') || 
                str_starts_with($user->password, '$2b$')) {
                $isPasswordMatch = Hash::check($validated['password'], $user->password);
            } else {
                // 移行期間中の互換性のため、プレーンテキストでの比較も許可（一時的な対応）
                $isPasswordMatch = $user->password === $validated['password'];
            }

            if (!$isPasswordMatch) {
                return response()->json([
                    'success' => false,
                    'message' => 'ログインIDまたはパスワードが正しくありません'
                ], 401);
            }

            // ログイン成功
            // 本番環境ではここでトークンを発行する

            return response()->json([
                'success' => true,
                'userId' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'サーバーエラーが発生しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ログアウト処理
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // 実際のアプリケーションでは、ここでセッションの削除などの処理を行う
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error'
            ], 500);
        }
    }
}
