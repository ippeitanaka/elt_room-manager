-- カリキュラムテーブルの作成
CREATE TABLE curriculum (
    id SERIAL PRIMARY KEY,
    class_group VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher VARCHAR(100) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_curriculum_class_group ON curriculum(class_group);
CREATE INDEX idx_curriculum_semester ON curriculum(semester);

-- 更新日時を自動更新するトリガーの作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_curriculum_updated_at
    BEFORE UPDATE ON curriculum
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシーの設定
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーの読み取りポリシー
CREATE POLICY "Enable read access for authenticated users"
ON curriculum FOR SELECT
TO authenticated
USING (true);

-- 管理者ユーザーの更新ポリシー
CREATE POLICY "Enable insert/update/delete for admin users"
ON curriculum FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
