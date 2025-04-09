<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class DatabaseController extends Controller
{
    /**
     * データベースのシードを実行
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function seed(Request $request)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // シード実行
            $exitCode = Artisan::call('db:seed', [
                '--force' => true
            ]);

            if ($exitCode !== 0) {
                $output = Artisan::output();
                throw new \Exception("シード実行に失敗しました。出力: " . $output);
            }

            return response()->json([
                'success' => true,
                'message' => 'データベースのシードが完了しました。',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'データベースのシードに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * マイグレーションを実行
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function migrate(Request $request)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // マイグレーション実行
            $exitCode = Artisan::call('migrate', [
                '--force' => true
            ]);

            if ($exitCode !== 0) {
                $output = Artisan::output();
                throw new \Exception("マイグレーション実行に失敗しました。出力: " . $output);
            }

            return response()->json([
                'success' => true,
                'message' => 'マイグレーションが完了しました。',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'マイグレーションに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * SQL クエリを実行（管理者用）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function executeQuery(Request $request)
    {
        try {
            // 管理者権限チェック
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['error' => '管理者権限が必要です'], 403);
            }

            // クエリ取得とバリデーション
            $query = $request->input('query');
            if (empty($query)) {
                return response()->json(['error' => 'クエリが指定されていません'], 400);
            }

            // 危険なクエリを禁止
            $dangerousCommands = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE'];
            foreach ($dangerousCommands as $command) {
                if (stripos($query, $command) !== false) {
                    return response()->json([
                        'error' => '危険なクエリは実行できません: ' . $command
                    ], 400);
                }
            }

            // クエリ実行（読み取り専用）
            $results = DB::select($query);

            return response()->json([
                'success' => true,
                'results' => $results,
                'count' => count($results),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'クエリの実行に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
} 