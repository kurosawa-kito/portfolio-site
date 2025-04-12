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
    
    // ファイルの存在確認
    const scriptExists = fs.existsSync(scriptPath);
    if (!scriptExists) {
      console.error('Pythonスクリプトが見つかりません:', scriptPath);
      return NextResponse.json(
        { success: false, message: 'AIエンジンの実行ファイルが見つかりません' },
        { status: 500 }
      );
    }

    // 入力ファイルの内容をデバッグ表示
    console.log('入力データ:', JSON.stringify({ user, tasks }).substring(0, 100) + '...');

    // Python実行コマンドの選択肢
    const commands = [
      `/usr/bin/python3 "${scriptPath}" "${tempInputFile}"`, // システムPython
      `/usr/local/bin/python3 "${scriptPath}" "${tempInputFile}"`, // Homebrewなどでインストールしたpython
      `python3 "${scriptPath}" "${tempInputFile}"`, // PATHにあるpython
      `python "${scriptPath}" "${tempInputFile}"`, // 代替コマンド
    ];

    let stdout = '';
    let stderr = '';
    let success = false;

    // 各コマンドを順番に試す
    for (const command of commands) {
      try {
        console.log('実行コマンド:', command);
        const result = await execPromise(command);
        stdout = result.stdout;
        stderr = result.stderr;
        
        // デバッグ出力
        console.log('Python stdout:', stdout);
        if (stderr) {
          console.error('Python stderr:', stderr);
        }
        
        success = true;
        break; // 成功したらループを抜ける
      } catch (execError) {
        console.error(`コマンド ${command} の実行に失敗:`, execError);
        stderr = (execError as any).stderr || (execError as Error).message;
      }
    }

    // 一時ファイルを削除
    try {
      fs.unlinkSync(tempInputFile);
    } catch (error) {
      console.warn('一時ファイルの削除に失敗:', error);
    }

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'AIエンジンの実行に失敗しました: ' + stderr },
        { status: 500 }
      );
    }

    if (stderr && !stdout) {
      return NextResponse.json(
        { success: false, message: 'AIエンジンの実行中にエラーが発生しました: ' + stderr },
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
      { success: false, message: 'サーバーエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 