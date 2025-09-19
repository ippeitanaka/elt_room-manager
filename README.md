# API: /api/day-schedule

## 概要

指定日付の「教室割当」「コメント」「カリキュラム（スケジュール）」を統合した当日ビューを返します。

## エンドポイント

GET /api/day-schedule?date=YYYY-MM-DD

- date: 必須。yyyy-MM-dd 形式の日付。
- レスポンス: { items: DayScheduleItem[] }
- 並び順: class_group 昇順 × 1限目→6限目
- Cache-Control: no-store

### レスポンス例

```
{
  "items": [
    {
      "date": "2025-09-19",
      "time_slot": "1限目",
      "class_group": "1-A",
      "subject": "解剖生理学",
      "instructor": "山田先生",
      "room_name": "第1実習室",
      "comment": "注意事項あり"
    },
    ...
  ]
}
```

### カラム定義
- subject?: string; // 講義名
- instructor?: string; // 講師名
- room_name?: string; // 教室名
- comment?: string; // コメント

## 注意
- "スケジュール_rows" テーブルは日本語名のためSQLでダブルクォート必須
- 昼食やマイスタディ等は講義情報が付かない場合あり
- RLS/権限で読めない場合はSupabase側で許可設定が必要
