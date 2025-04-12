import google.generativeai as genai
import os
import json
import sys
from dotenv import load_dotenv

# 環境変数から設定を読み込む
load_dotenv()

# APIキーを設定
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDOFONEB_t5Mf42k2MFmEy2ZxtI-tL4bBw")
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
    # モデルを初期化
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
    
    try:
        # テキスト生成を実行
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"エラーが発生しました: {str(e)}"

def main():
    """
    メイン関数：コマンドラインから実行される
    """
    if len(sys.argv) != 2:
        print("使用方法: python task_summary.py <入力JSONファイルパス>")
        sys.exit(1)
    
    # JSONファイルを読み込む
    try:
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        user_info = data.get('user', {})
        tasks = data.get('tasks', [])
        
        # タスク分析を実行して結果を標準出力に出力
        result = analyze_tasks(user_info, tasks)
        print(result)
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 