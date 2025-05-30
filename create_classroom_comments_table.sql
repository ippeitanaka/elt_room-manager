-- 教室コメントテーブルの作成
CREATE TABLE classroom_comments (
    id SERIAL PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    class_group VARCHAR(10) NOT NULL,
    classroom VARCHAR(50) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time_slot, class_group)
);

-- インデックスの作成
CREATE INDEX idx_classroom_comments_date ON classroom_comments(date);
CREATE INDEX idx_classroom_comments_lookup ON classroom_comments(date, time_slot, class_group);

-- 更新日時を自動更新するトリガーの作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classroom_comments_updated_at
    BEFORE UPDATE ON classroom_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシーの設定
ALTER TABLE classroom_comments ENABLE ROW LEVEL SECURITY;

-- 全ユーザーの読み取りポリシー
CREATE POLICY "Enable read access for all users"
ON classroom_comments FOR SELECT
USING (true);

-- 認証済みユーザーの更新ポリシー
CREATE POLICY "Enable insert/update/delete for authenticated users"
ON classroom_comments FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
