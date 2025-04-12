import os
import json
import sys
import traceback
from datetime import datetime

# Gemini API をインポート
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    print("警告: google.generativeai モジュールが見つかりません。ローカル分析を使用します。", file=sys.stderr)
    GEMINI_AVAILABLE = False

# APIキーを設定
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDOFONEB_t5Mf42k2MFmEy2ZxtI-tL4bBw")

# APIを初期化
if GEMINI_AVAILABLE:
    try:
        genai.configure(api_key=API_KEY)
        print(f"Gemini APIを設定しました", file=sys.stderr)
    except Exception as e:
        print(f"Gemini API初期化エラー: {str(e)}", file=sys.stderr)
        GEMINI_AVAILABLE = False

def analyze_tasks_with_gemini(user_info, tasks):
    """
    Gemini APIを使用してタスク分析を行う
    """
    try:
        # ユーザー名を取得
        username = user_info.get('username', '担当者')
        
        # タスク情報をテキストフォーマットに変換
        tasks_text = ""
        for task in tasks:
            priority = {"high": "高", "medium": "中", "low": "低"}.get(task.get('priority', ''), '')
            due_date = task.get('due_date', '不明')
            status = "完了" if task.get('status') == 'completed' else "未完了"
            
            task_line = (
                f"{task.get('title', 'タイトルなし')} {priority} "
                f"{task.get('description', '')} "
                f"期限: {due_date} "
                f"作成者: {task.get('created_by_username', '不明')} "
                f"状態: {status}"
            )
            tasks_text += task_line + "\n"
        
        # プロンプトの構築
        prompt = f"以下は{username}さんのタスクです。これらからこの人のタスク状況を分析して、チーム管理者にわかりやすく、あまり長くならないように視覚的に見やすい形で出力して。「{username}さんのタスク状況」という始まりから出力。\n\n{tasks_text}"
        
        print("Gemini APIにリクエスト送信中...", file=sys.stderr)
        
        # モデルを初期化
        model = genai.GenerativeModel('models/gemini-2.0-pro-exp')
        
        # テキスト生成を実行
        response = model.generate_content(prompt)
        
        print("Gemini APIからレスポンスを受信", file=sys.stderr)
        return response.text
    
    except Exception as e:
        error_trace = traceback.format_exc()
        error_msg = f"Gemini API エラー: {str(e)}\n{error_trace}"
        print(error_msg, file=sys.stderr)
        # API失敗時はローカル分析にフォールバック
        print("ローカル分析にフォールバックします", file=sys.stderr)
        return None

def analyze_tasks_local(user_info, tasks):
    """
    ローカルでタスク分析を行う（シンプル版）
    """
    try:
        # 入力データの検証
        if not user_info:
            return "エラー: ユーザー情報が空です"
        
        if not tasks:
            return f"{user_info.get('username', '担当者')}さんのタスク状況\n\n現在タスクは登録されていません。"
        
        # ユーザー名を取得
        username = user_info.get('username', '担当者')
        print(f"分析するユーザー: {username}", file=sys.stderr)
        print(f"タスク数: {len(tasks)}", file=sys.stderr)
        
        # タスク分析のためのデータ集計
        total_tasks = len(tasks)
        if total_tasks == 0:
            return f"{username}さんのタスク状況\n\n現在タスクは登録されていません。"
        
        # 完了したタスクと未完了タスクを分類
        completed_tasks = [t for t in tasks if t.get('status') == 'completed']
        pending_tasks = [t for t in tasks if t.get('status') != 'completed']
        
        # 優先度別のタスク数
        high_priority = len([t for t in tasks if t.get('priority') == 'high'])
        medium_priority = len([t for t in tasks if t.get('priority') == 'medium'])
        low_priority = len([t for t in tasks if t.get('priority') == 'low'])
        
        # 期限切れタスクの確認
        today = datetime.now()
        overdue_tasks = []
        for task in pending_tasks:
            due_date_str = task.get('due_date', '')
            if due_date_str:
                try:
                    # ISO形式の日付文字列をパース（T区切りに対応）
                    if 'T' in due_date_str:
                        due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    else:
                        # 日付のみの場合
                        due_date = datetime.strptime(due_date_str, '%Y/%m/%d')
                    if due_date < today:
                        overdue_tasks.append(task)
                except ValueError:
                    # 日付パースエラーは無視
                    pass
        
        # タスク分析テキストの構築
        report = [f"{username}さんのタスク状況"]
        report.append("")
        report.append(f"■ 概要")
        report.append(f"・全タスク数: {total_tasks}件")
        report.append(f"・完了タスク: {len(completed_tasks)}件")
        report.append(f"・未完了タスク: {len(pending_tasks)}件")
        report.append(f"・期限切れタスク: {len(overdue_tasks)}件")
        report.append("")
        
        report.append(f"■ 優先度内訳")
        report.append(f"・高優先度: {high_priority}件")
        report.append(f"・中優先度: {medium_priority}件")
        report.append(f"・低優先度: {low_priority}件")
        report.append("")
        
        if len(pending_tasks) > 0:
            report.append(f"■ 対応が必要なタスク")
            for i, task in enumerate(pending_tasks[:5], 1):  # 最大5件まで表示
                priority_jp = {"high": "高", "medium": "中", "low": "低"}.get(task.get('priority', ''), '')
                report.append(f"{i}. {task.get('title', 'タイトルなし')} （優先度: {priority_jp}）")
            
            if len(pending_tasks) > 5:
                report.append(f"...他 {len(pending_tasks) - 5}件")
            report.append("")
        
        if len(overdue_tasks) > 0:
            report.append(f"■ 期限切れタスク")
            for i, task in enumerate(overdue_tasks[:3], 1):  # 最大3件まで表示
                priority_jp = {"high": "高", "medium": "中", "low": "低"}.get(task.get('priority', ''), '')
                due_date = task.get('due_date', '不明')
                if 'T' in due_date:
                    due_date = due_date.split('T')[0]  # 日付部分のみ取得
                report.append(f"{i}. {task.get('title', 'タイトルなし')} （期限: {due_date}, 優先度: {priority_jp}）")
            
            if len(overdue_tasks) > 3:
                report.append(f"...他 {len(overdue_tasks) - 3}件")
            report.append("")
        
        if len(completed_tasks) > 0:
            report.append(f"■ 最近完了したタスク")
            # 作成日時でソート（最新順）
            sorted_completed = sorted(
                completed_tasks,
                key=lambda x: x.get('updated_at', ''),
                reverse=True
            )
            
            for i, task in enumerate(sorted_completed[:3], 1):  # 最大3件まで表示
                report.append(f"{i}. {task.get('title', 'タイトルなし')}")
            
            if len(completed_tasks) > 3:
                report.append(f"...他 {len(completed_tasks) - 3}件")
        
        return "\n".join(report)
    except Exception as e:
        error_trace = traceback.format_exc()
        error_msg = f"ローカル分析エラー: {str(e)}\n{error_trace}"
        print(error_msg, file=sys.stderr)
        return f"タスク分析中にエラーが発生しました: {str(e)}"

def analyze_tasks(user_info, tasks):
    """
    ユーザーとそのタスク情報に基づいて分析を行う
    Gemini APIが利用可能ならそれを使い、失敗したらローカル分析にフォールバック
    
    Args:
        user_info (dict): ユーザー情報を含む辞書
        tasks (list): タスク情報のリスト
    
    Returns:
        str: 生成された分析テキスト
    """
    # まずGemini APIで試す
    if GEMINI_AVAILABLE:
        print("Gemini APIを使用して分析を開始します", file=sys.stderr)
        result = analyze_tasks_with_gemini(user_info, tasks)
        if result:
            return result
    
    # APIが利用できないか失敗した場合はローカル分析を使用
    print("ローカル分析を使用します", file=sys.stderr)
    return analyze_tasks_local(user_info, tasks)

def main():
    """
    メイン関数：コマンドラインから実行される
    """
    print(f"Python実行ディレクトリ: {os.getcwd()}", file=sys.stderr)
    print(f"スクリプトパス: {__file__}", file=sys.stderr)
    print(f"コマンドライン引数: {sys.argv}", file=sys.stderr)
    
    try:
        # 環境変数からJSONデータを取得
        task_data = os.environ.get('TASK_DATA')
        if task_data:
            print("環境変数TASK_DATAからデータを読み込みます", file=sys.stderr)
            try:
                data = json.loads(task_data)
                print(f"環境変数から読み込んだデータのプレビュー: {task_data[:200]}...", file=sys.stderr)
            except json.JSONDecodeError as je:
                print(f"環境変数のJSONパースエラー: {str(je)}", file=sys.stderr)
                print("タスク分析中にJSONパースエラーが発生しました。")
                sys.exit(1)
        # コマンドライン引数からファイルパスを取得
        elif len(sys.argv) == 2 and sys.argv[1] != '-':
            input_file = sys.argv[1]
            print(f"入力ファイル: {input_file}", file=sys.stderr)
            
            # JSONファイルが存在するか確認
            if not os.path.exists(input_file):
                print(f"エラー: 入力ファイルが見つかりません: {input_file}", file=sys.stderr)
                print("タスク分析エラー: 入力ファイルが見つかりません")
                sys.exit(1)
            
            # JSONファイルを読み込む
            try:
                with open(input_file, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                    print(f"ファイル内容のプレビュー: {file_content[:200]}...", file=sys.stderr)
                    data = json.loads(file_content)
            except json.JSONDecodeError as je:
                print(f"JSONパースエラー: {str(je)}", file=sys.stderr)
                print("タスク分析中にJSONパースエラーが発生しました。")
                sys.exit(1)
        # 標準入力からデータを読み込む
        elif len(sys.argv) == 2 and sys.argv[1] == '-':
            print("標準入力からデータを読み込みます", file=sys.stderr)
            try:
                stdin_data = sys.stdin.read()
                print(f"標準入力から読み込んだデータのプレビュー: {stdin_data[:200]}...", file=sys.stderr)
                data = json.loads(stdin_data)
            except json.JSONDecodeError as je:
                print(f"標準入力のJSONパースエラー: {str(je)}", file=sys.stderr)
                print("タスク分析中にJSONパースエラーが発生しました。")
                sys.exit(1)
        else:
            print("使用方法: python task_summary.py <入力JSONファイルパス | - | 環境変数TASK_DATA>", file=sys.stderr)
            print("タスク分析エラー: 入力データがありません")
            sys.exit(1)
        
        # データの検証
        if not isinstance(data, dict):
            print(f"エラー: 無効なJSONデータ形式です（オブジェクトではありません）", file=sys.stderr)
            print("タスク分析エラー: 無効なJSONデータ形式です")
            sys.exit(1)
                
        user_info = data.get('user', {})
        tasks = data.get('tasks', [])
        
        if not user_info:
            print(f"警告: ユーザー情報が空または存在しません", file=sys.stderr)
        
        if not tasks:
            print(f"警告: タスク情報が空または存在しません", file=sys.stderr)
        
        print(f"ユーザー: {user_info.get('username', '不明')}", file=sys.stderr)
        print(f"タスク数: {len(tasks)}", file=sys.stderr)
        
        # タスク分析を実行して結果を標準出力に出力
        result = analyze_tasks(user_info, tasks)
        print(result)
        sys.stdout.flush()  # 確実に出力をフラッシュ
    except Exception as e:
        print(f"予期せぬエラー: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
        print("タスク分析中に予期せぬエラーが発生しました。")
        sys.exit(1)

if __name__ == "__main__":
    main()