import google.generativeai as genai
import os
import json
import sys
import traceback
from pathlib import Path

# 環境変数の読み込み試行
try:
    from dotenv import load_dotenv
    # 複数のパスを試す
    potential_env_paths = [
        os.path.join(os.getcwd(), '.env'),
        os.path.join(os.getcwd(), '.env.local'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local'),
    ]
    for env_path in potential_env_paths:
        if os.path.exists(env_path):
            print(f"環境変数ファイルを読み込み: {env_path}", file=sys.stderr)
            load_dotenv(env_path)
            break
except ImportError:
    print("python-dotenvがインストールされていないため、環境変数は直接利用します", file=sys.stderr)

# APIキーを設定
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    API_KEY = "AIzaSyDOFONEB_t5Mf42k2MFmEy2ZxtI-tL4bBw"
    print(f"警告: 環境変数からGEMINI_API_KEYが見つからないため、デフォルト値を使用します", file=sys.stderr)
    
print(f"使用するAPIキー: {API_KEY[:5]}...{API_KEY[-5:]}", file=sys.stderr)
genai.configure(api_key=API_KEY)

def analyze_tasks(user_info, tasks):
    """
    ユーザーとそのタスク情報に基づいて分析を行う
    
    Args:
        user_info (dict): ユーザー情報を含む辞書
        tasks (list): タスク情報のリスト
    
    Returns:
        str: 生成された分析テキスト
    """
    try:
        # モデルを初期化
        print("Geminiモデルを初期化中...", file=sys.stderr)
        model = genai.GenerativeModel('models/gemini-2.0-pro-exp')
        
        # プロンプトを作成
        username = user_info.get('username', '担当者')
        
        # タスク情報をテキストフォーマットに変換
        tasks_text = ""
        for task in tasks:
            priority = {"high": "高", "medium": "中", "low": "低"}.get(task.get('priority', ''), '')
            due_date = task.get('due_date', '不明')
            status = "完了" if task.get('status') == 'completed' else "未完了"
            
            task_line = (
                f"{task.get('title', 'タスク')} {priority} "
                f"{task.get('description', '')} "
                f"期限: {due_date} "
                f"作成者: {task.get('created_by_username', '不明')} "
                f"状態: {status}"
            )
            tasks_text += task_line + "\n"
        
        # プロンプトの構築
        prompt = f"以下は{username}さんのタスクです。これらからこの人のタスク状況を分析して、チーム管理者にわかりやすく、あまり長くならないように視覚的に見やすい形で出力して。「{username}さんのタスク状況」という始まりから出力。\n\n{tasks_text}"
        
        print("Gemini APIにリクエスト送信中...", file=sys.stderr)
        # テキスト生成を実行
        response = model.generate_content(prompt)
        print("Gemini APIからレスポンスを受信", file=sys.stderr)
        return response.text
    except Exception as e:
        error_trace = traceback.format_exc()
        error_msg = f"タスク分析エラー: {str(e)}\n{error_trace}"
        print(error_msg, file=sys.stderr)
        return f"エラーが発生しました: {str(e)}"

def main():
    """
    メイン関数：コマンドラインから実行される
    """
    print(f"Python実行ディレクトリ: {os.getcwd()}", file=sys.stderr)
    print(f"スクリプトパス: {__file__}", file=sys.stderr)
    print(f"コマンドライン引数: {sys.argv}", file=sys.stderr)
    
    try:
        if len(sys.argv) != 2:
            print("使用方法: python task_summary.py <入力JSONファイルパス>", file=sys.stderr)
            sys.exit(1)
        
        input_file = sys.argv[1]
        print(f"入力ファイル: {input_file}", file=sys.stderr)
        
        # JSONファイルが存在するか確認
        if not os.path.exists(input_file):
            print(f"エラー: 入力ファイルが見つかりません: {input_file}", file=sys.stderr)
            sys.exit(1)
        
        # JSONファイルを読み込む
        try:
            with open(input_file, 'r') as f:
                file_content = f.read()
                print(f"ファイル内容のプレビュー: {file_content[:100]}...", file=sys.stderr)
                data = json.loads(file_content)
            
            user_info = data.get('user', {})
            tasks = data.get('tasks', [])
            
            print(f"ユーザー: {user_info.get('username', '不明')}", file=sys.stderr)
            print(f"タスク数: {len(tasks)}", file=sys.stderr)
            
            # タスク分析を実行して結果を標準出力に出力
            result = analyze_tasks(user_info, tasks)
            print(result)
            sys.stdout.flush()  # 確実に出力をフラッシュ
        except json.JSONDecodeError as je:
            print(f"JSONパースエラー: {str(je)}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"予期せぬエラー: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"クリティカルエラー: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()