-- RLSを無効にするSQL
-- 対象テーブル: classroom_assignments_rows, classroom_comments_rows, "スケジュール"

ALTER TABLE classroom_assignments_rows DISABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_comments_rows DISABLE ROW LEVEL SECURITY;
ALTER TABLE "スケジュール" DISABLE ROW LEVEL SECURITY;