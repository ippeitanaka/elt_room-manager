-- トランザクション開始
BEGIN;

-- 現在の制約を確認
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'classroom_assignments'::regclass
AND contype = 'c';

-- 既存のチェック制約を削除（先に制約を削除してからデータを移行）
ALTER TABLE classroom_assignments
DROP CONSTRAINT IF EXISTS classroom_assignments_time_slot_check;

-- 既存のデータを新しい時限に移行
UPDATE classroom_assignments
SET time_slot = 'マイスタ（午前）'
WHERE time_slot = '自　習';

UPDATE classroom_assignments
SET time_slot = '補習（午前）'
WHERE time_slot = '補　習';

-- 新しいチェック制約を追加（現在のコードで使用されている値に合わせる）
ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_time_slot_check
CHECK (time_slot IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', 'マイスタ（午前）', 'マイスタ（午後）', '補習（午前）', '補習（午後）', '再試験'));

-- テーブルの現在のデータを確認
SELECT DISTINCT time_slot FROM classroom_assignments ORDER BY time_slot;

-- 不正なデータがある場合は削除（念のため）
DELETE FROM classroom_assignments
WHERE time_slot NOT IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', 'マイスタ（午前）', 'マイスタ（午後）', '補習（午前）', '補習（午後）', '再試験');

-- コミット
COMMIT;

-- RLSを無効化（認証なしでアクセス可能にする）
ALTER TABLE classroom_assignments DISABLE ROW LEVEL SECURITY;
