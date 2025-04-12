import { NextRequest, NextResponse } from 'next/server';
import { validateUserBase64 } from '../../../src/utils/authUtils';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // ユーザー情報の検証
    const userBase64 = request.headers.get('x-user-base64');
    const userData = await validateUserBase64(userBase64);
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '権限がありません' },
        { status: 403 }
      );
    }

    // リクエストボディを取得
    const requestData = await request.json();
    const { user, tasks } = requestData;

    if (!user || !tasks) {
      return NextResponse.json(
        { success: false, message: '無効なリクエストデータ' },
        { status: 400 }
      );
    }

    // 一時ファイルに入力データを書き込む
    const tempInputFile = path.join(process.cwd(), 'tmp_input.json');
    fs.writeFileSync(tempInputFile, JSON.stringify({ user, tasks }));

    // Pythonスクリプトのパス
    const scriptPath = path.join(process.cwd(), 'ai', 'task_summary.py');
    
    // Pythonスクリプトの実行コマンド
    const command = `python3 "${scriptPath}" "${tempInputFile}"`;
    
    // Pythonスクリプトを実行
    const { stdout, stderr } = await execPromise(command);
    
    // 一時ファイルを削除
    try {
      fs.unlinkSync(tempInputFile);
    } catch (error) {
      console.warn('一時ファイルの削除に失敗:', error);
    }

    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json(
        { success: false, message: 'AIエンジンの実行中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 結果を返す
    return NextResponse.json({
      success: true,
      analysis: stdout.trim()
    });

  } catch (error) {
    console.error('Error during task analysis:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 