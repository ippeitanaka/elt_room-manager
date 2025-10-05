-- トランザクション開始
BEGIN;

-- 現在の制約を確認
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'classroom_assignments'::regclass
AND contype = 'c';

-- 既存のチェック制約を削除
ALTER TABLE classroom_assignments
DROP CONSTRAINT IF EXISTS classroom_assignments_time_slot_check;

-- 新しいチェック制約を追加（昼間部は自習・補習のまま、夜間部は分割）
ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_time_slot_check
CHECK (time_slot IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', '自　習', '補　習', 'マイスタ（午前）', 'マイスタ（午後）', '補習（午前）', '補習（午後）', '再試験'));

-- テーブルの現在のデータを確認
SELECT DISTINCT time_slot FROM classroom_assignments ORDER BY time_slot;

-- 不正なデータがある場合は削除（念のため）
DELETE FROM classroom_assignments
WHERE time_slot NOT IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', '自　習', '補　習', 'マイスタ（午前）', 'マイスタ（午後）', '補習（午前）', '補習（午後）', '再試験');

-- コミット
COMMIT;

-- RLSを無効化（認証なしでアクセス可能にする）
ALTER TABLE classroom_assignments DISABLE ROW LEVEL SECURITY;
