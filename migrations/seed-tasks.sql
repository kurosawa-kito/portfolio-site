-- サンプルタスクの追加
INSERT INTO tasks (
  title,
  description,
  status,
  priority,
  due_date,
  assigned_to,
  project_id,
  created_by,
  is_shared
) VALUES 
(
  'ポートフォリオサイトの作成',
  'Next.jsを使用してポートフォリオサイトを作成する',
  'in_progress',
  'high',
  '2024-04-30',
  1,
  1,
  1,
  false
),
(
  'タスク管理機能の実装',
  'タスクの作成、編集、削除機能を実装する',
  'pending',
  'medium',
  '2024-04-25',
  1,
  1,
  1,
  false
); 