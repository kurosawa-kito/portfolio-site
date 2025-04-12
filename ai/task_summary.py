import os
import json
import sys
import traceback
from datetime import datetime

def analyze_tasks(user_info, tasks):
    """
    ユーザーとそのタスク情報に基づいて分析を行う（シンプル版）
    
    Args:
        user_info (dict): ユーザー情報を含む辞書
        tasks (list): タスク情報のリスト
    
    Returns:
        str: 生成された分析テキスト
    """
    try:
        # ユーザー名を取得
        username = user_info.get('username', '担当者')
        
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
                report.append(f"{i}. {task.get('title')} （優先度: {priority_jp}）")
            
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
                report.append(f"{i}. {task.get('title')} （期限: {due_date}, 優先度: {priority_jp}）")
            
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
                report.append(f"{i}. {task.get('title')}")
            
            if len(completed_tasks) > 3:
                report.append(f"...他 {len(completed_tasks) - 3}件")
        
        return "\n".join(report)
    except Exception as e:
        error_trace = traceback.format_exc()
        error_msg = f"タスク分析エラー: {str(e)}\n{error_trace}"
        print(error_msg, file=sys.stderr)
        return f"タスク分析中にエラーが発生しました: {str(e)}"

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
            with open(input_file, 'r', encoding='utf-8') as f:
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
            print("タスク分析中にJSONパースエラーが発生しました。")
            sys.exit(1)
        except Exception as e:
            print(f"予期せぬエラー: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
            print("タスク分析中に予期せぬエラーが発生しました。")
            sys.exit(1)
    except Exception as e:
        print(f"クリティカルエラー: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
        print("タスク分析の実行に失敗しました。")
        sys.exit(1)

if __name__ == "__main__":
    main()