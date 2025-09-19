-- RLSを有効にするSQL
-- 対象テーブル: classroom_assignments, classroom_comments, "スケジュール" (ビューではなく実際のテーブル)

-- RLSを有効化
ALTER TABLE classroom_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE "スケジュール" ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーがあれば削除
DROP POLICY IF EXISTS "Enable read access for all users" ON classroom_assignments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON classroom_assignments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON classroom_assignments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON classroom_assignments;

-- ポリシーを設定（例: 全てのユーザーに読み取り許可、認証済みユーザーに書き込み許可）
CREATE POLICY "Enable read access for all users" ON classroom_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON classroom_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON classroom_assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON classroom_assignments FOR DELETE USING (auth.role() = 'authenticated');

-- classroom_comments の既存ポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON classroom_comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON classroom_comments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON classroom_comments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON classroom_comments;

CREATE POLICY "Enable read access for all users" ON classroom_comments FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Enable insert for authenticated users only" ON classroom_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON classroom_comments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON classroom_comments FOR DELETE USING (auth.role() = 'authenticated');

-- "スケジュール" の既存ポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON "スケジュール";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "スケジュール";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "スケジュール";
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "スケジュール";

CREATE POLICY "Enable read access for all users" ON "スケジュール" FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Enable insert for authenticated users only" ON "スケジュール" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON "スケジュール" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON "スケジュール" FOR DELETE USING (auth.role() = 'authenticated');