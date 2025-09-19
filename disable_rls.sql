-- RLSを無効にするSQL
-- 対象テーブル: classroom_assignments, classroom_comments, "スケジュール"

ALTER TABLE classroom_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE "スケジュール" DISABLE ROW LEVEL SECURITY;