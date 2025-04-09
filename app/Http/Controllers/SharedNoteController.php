<?php

namespace App\Http\Controllers;

use App\Models\SharedNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SharedNoteController extends Controller
{
    /**
     * 共有ノート一覧を取得
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $notes = SharedNote::with('creator')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($notes);
        } catch (\Exception $error) {
            \Log::error("共有ノート取得エラー: " . $error->getMessage());
            return response()->json(
                ['error' => '共有ノートの取得に失敗しました'],
                500
            );
        }
    }

    /**
     * 共有ノートを作成
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:2000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => $validator->errors()->first()
                ], 400);
            }

            $note = SharedNote::create([
                'content' => $request->input('content'),
                'created_by' => $user->id,
            ]);

            // リレーションを読み込む
            $note->load('creator');

            return response()->json($note, 201);
        } catch (\Exception $error) {
            \Log::error("共有ノート作成エラー: " . $error->getMessage());
            return response()->json(
                ['error' => '共有ノートの作成に失敗しました'],
                500
            );
        }
    }

    /**
     * 共有ノートを削除
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $user = $request->user();
            
            $id = $request->query('id');
            
            if (!$id) {
                return response()->json(
                    ['error' => 'ノートIDが指定されていません'],
                    400
                );
            }

            // 共有ノートの存在確認
            $note = SharedNote::find($id);

            if (!$note) {
                return response()->json(
                    ['error' => '指定されたノートが見つかりません'],
                    404
                );
            }

            // 管理者または作成者のみ共有ノート削除可能
            if ($user->role !== 'admin' && $note->created_by !== $user->id) {
                return response()->json(
                    ['error' => 'このノートを削除する権限がありません'],
                    403
                );
            }

            // ノートを削除
            $note->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $error) {
            \Log::error("共有ノート削除エラー: " . $error->getMessage());
            return response()->json(
                ['error' => '共有ノートの削除に失敗しました'],
                500
            );
        }
    }
}