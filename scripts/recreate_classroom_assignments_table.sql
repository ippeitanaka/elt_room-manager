-- 既存のテーブルをバックアップ（必要に応じて）
CREATE TABLE IF NOT EXISTS classroom_assignments_backup AS 
SELECT * FROM classroom_assignments;

-- 既存のテーブルを削除
DROP TABLE IF EXISTS classroom_assignments CASCADE;

-- 新しいテーブルを作成
CREATE TABLE classroom_assignments (
    id SERIAL PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    class_group VARCHAR(10) NOT NULL,
    classroom VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time_slot, class_group)
);

-- チェック制約を追加
ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_time_slot_check
CHECK (time_slot IN ('1限目', '2限目', '昼食', '3限目', '4限目', '5限目', '6限目', 'マイスタ（午前）', 'マイスタ（午後）', '補習（午前）', '補習（午後）', '再試験'));

ALTER TABLE classroom_assignments
ADD CONSTRAINT classroom_assignments_classroom_check
CHECK (classroom IN ('1F実習室', '2F実習室', '3F実習室', '3F小教室', '4F小教室', '4F大教室', '5F大教室', '7F大教室', 'パソコン室', 'DT3階小教室', 'DT4階小教室'));

-- インデックスを作成
CREATE INDEX idx_classroom_assignments_date ON classroom_assignments(date);
CREATE INDEX idx_classroom_assignments_lookup ON classroom_assignments(date, time_slot, class_group);

-- 更新日時を自動更新するトリガーの作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classroom_assignments_updated_at
    BEFORE UPDATE ON classroom_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシーの設定
ALTER TABLE classroom_assignments DISABLE ROW LEVEL SECURITY;

-- コメントを追加
COMMENT ON TABLE classroom_assignments IS '教室割り当てテーブル';
COMMENT ON COLUMN classroom_assignments.date IS '日付（YYYY-MM-DD形式）';
COMMENT ON COLUMN classroom_assignments.time_slot IS '授業の時間枠';
COMMENT ON COLUMN classroom_assignments.class_group IS 'クラスグループ（例：1-A, 2-B, 3-N）';
COMMENT ON COLUMN classroom_assignments.classroom IS '割り当てられた教室';
