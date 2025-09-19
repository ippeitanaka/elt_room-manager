-- time_slot列のデータ型を修正（必要な場合）
ALTER TABLE classroom_assignments
ALTER COLUMN time_slot TYPE VARCHAR(20);

-- 制約を再設定（必要な場合）
ALTER TABLE classroom_assignments
DROP CONSTRAINT IF EXISTS classroom_assignments_time_slot_check;

ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_time_slot_check
CHECK (time_slot IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', 'マイスタディ', '補　習', '再試験'));

-- コメントを更新（必要な場合）
COMMENT ON COLUMN classroom_assignments.time_slot IS '授業の時間枠（1限目、2限目、昼食、3限目、4限目、5限目、6限目、自　習、補　習、再試験）';

-- 不正なデータを削除（必要な場合）
DELETE FROM classroom_assignments
WHERE time_slot NOT IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', 'マイスタディ', '補　習', '再試験');
