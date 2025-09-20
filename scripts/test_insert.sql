-- テスト用の挿入を実行して制約が正しく動作するか確認

-- 正常なデータの挿入テスト
INSERT INTO classroom_assignments (date, time_slot, class_group, classroom)
VALUES ('2024-01-15', '1限目', 'TEST-A', '1F実習室')
ON CONFLICT (date, time_slot, class_group) 
DO UPDATE SET classroom = EXCLUDED.classroom;

-- 挿入されたテストデータを確認
SELECT * FROM classroom_assignments WHERE date = '2024-01-15' AND class_group = 'TEST-A';

-- テストデータを削除
DELETE FROM classroom_assignments WHERE date = '2024-01-15' AND class_group = 'TEST-A';

-- 結果確認
SELECT 'Test completed successfully' as result;
