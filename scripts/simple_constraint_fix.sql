-- シンプルな制約修正（段階的実行用）

-- ステップ1: 既存制約の削除
ALTER TABLE classroom_assignments 
DROP CONSTRAINT IF EXISTS classroom_assignments_time_slot_check;

-- ステップ2: 現在のデータ確認
SELECT 'Current time_slot values:' as info;
SELECT DISTINCT time_slot, COUNT(*) as count 
FROM classroom_assignments 
GROUP BY time_slot 
ORDER BY time_slot;

-- ステップ3: 不正データの削除
DELETE FROM classroom_assignments
WHERE time_slot NOT IN ('1限目', '2限目', '昼食', '3限目', '4限目', '自　習', '補　習', '再試験');

-- ステップ4: 新しい制約の追加
ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_time_slot_check
CHECK (time_slot IN ('1限目', '2限目', '昼食', '3限目', '4限目', '自　習', '補　習', '再試験'));

-- ステップ5: 制約が正しく追加されたか確認
SELECT 'Constraint added successfully' as result;
