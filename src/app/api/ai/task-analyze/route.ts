import { NextRequest, NextResponse } from 'next/server';
import { validateUserBase64 } from '@/utils/authUtils';
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
    try {
      const requestData = await request.json();
      const { user, tasks } = requestData;
      
      console.log("リクエストデータ:", JSON.stringify(requestData, null, 2).substring(0, 300) + '...');
      console.log("user:", user ? "存在します" : "存在しません");
      console.log("tasks:", tasks ? `${Array.isArray(tasks) ? tasks.length : 'オブジェクト'}件` : "存在しません");
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: '無効なリクエストデータ: userフィールドがありません' },
          { status: 400 }
        );
      }
      
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return NextResponse.json(
          { success: false, message: '無効なリクエストデータ: tasksフィールドが不正です' },
          { status: 400 }
        );
      }

      try {
        // 一時ファイルではなく、コマンドラインから直接JSONデータを渡す
        const jsonData = JSON.stringify({ user, tasks });
        
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

        // 入力データの内容をデバッグ表示
        console.log('入力データ:', jsonData.substring(0, 100) + '...');

        // Python実行コマンドの選択肢 - 標準入力でデータを渡す
        const commands = [
          `/usr/bin/python3 "${scriptPath}" -`, // システムPython
          `/usr/local/bin/python3 "${scriptPath}" -`, // Homebrewなどでインストールしたpython
          `python3 "${scriptPath}" -`, // PATHにあるpython
          `python "${scriptPath}" -`, // 代替コマンド
        ];

        let stdout = '';
        let stderr = '';
        let success = false;

        // 各コマンドを順番に試す
        for (const command of commands) {
          try {
            console.log('実行コマンド:', command);
            // 標準入力からではなく、環境変数でデータを渡す方式に変更
            const result = await execPromise(command, { 
              env: { 
                ...process.env, 
                TASK_DATA: jsonData 
              } 
            });
            stdout = result.stdout;
            stderr = result.stderr;
            
            // デバッグ出力
            console.log('Python stdout:', stdout);
            if (stderr) {
              console.error('Python stderr:', stderr);
            }
            
            // stdoutが空でなければ成功とみなす
            if (stdout.trim()) {
              success = true;
              break; // 成功したらループを抜ける
            }
          } catch (execError) {
            console.error(`コマンド ${command} の実行に失敗:`, execError);
            stderr = (execError as any).stderr || (execError as Error).message;
          }
        }

        if (!success) {
          if (stderr) {
            console.error('Python実行エラー:', stderr);
            return NextResponse.json(
              { success: false, message: 'AIエンジンの実行に失敗しました: ' + stderr },
              { status: 500 }
            );
          } else {
            // stdoutもstderrも空の場合
            return NextResponse.json(
              { success: false, message: 'AIエンジンから応答がありませんでした' },
              { status: 500 }
            );
          }
        }

        // 結果が空でないことを確認
        const trimmedOutput = stdout.trim();
        if (!trimmedOutput) {
          return NextResponse.json(
            { success: false, message: 'AIエンジンからの出力が空でした' },
            { status: 500 }
          );
        }

        // 結果を返す
        return NextResponse.json({
          success: true,
          analysis: trimmedOutput
        });
      } catch (innerError) {
        console.error('Python処理エラー:', innerError);
        return NextResponse.json(
          { success: false, message: 'AIエンジン処理中にエラーが発生しました: ' + (innerError as Error).message },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('リクエストJSONのパースに失敗:', parseError);
      return NextResponse.json(
        { success: false, message: 'リクエストデータのJSONパースに失敗しました' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error during task analysis:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 