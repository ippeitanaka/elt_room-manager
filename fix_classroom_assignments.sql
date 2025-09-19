-- 依存するビューを削除（依存関係の順序に注意）
DROP VIEW IF EXISTS view_day_schedule CASCADE;
DROP VIEW IF EXISTS classroom_assignments_rows CASCADE;

-- time_slot列のデータ型を修正（必要な場合）
ALTER TABLE classroom_assignments
ALTER COLUMN time_slot TYPE VARCHAR(20);

-- classroom列のデータ型を拡張（念のため）
ALTER TABLE classroom_assignments
ALTER COLUMN classroom TYPE VARCHAR(100);

-- プライマリキーを設定（upsertのonConflict用）
ALTER TABLE classroom_assignments
DROP CONSTRAINT IF EXISTS classroom_assignments_pkey;

ALTER TABLE classroom_assignments
ADD PRIMARY KEY (date, time_slot, class_group);

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

-- ビューを再作成
-- view_day_schedule を再作成（確実に置き換え）
drop view if exists view_day_schedule cascade;
create or replace view view_day_schedule as
with cur as (
  select
    ("日付")::date as date,
    case "時限"
      when '1' then '1限目' when '2' then '2限目' when '3' then '3限目'
      when '4' then '4限目' when '5' then '5限目' when '6' then '6限目'
      else coalesce("時限"::text, '')
    end as time_slot,
    row_number() over (partition by ("日付"), class_group order by "時限")::bigint as period_num,
    class_group,
    subject,
    instructor
  from (
    select *,
      replace(substring('1年Aクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("1年Aクラスの授業内容",''), null) as subject,
      coalesce(nullif("1年Aクラス担当講師名",''), null) as instructor
    from "スケジュール"
    union all
    select *,
      replace(substring('1年Bクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("1年Bクラスの授業内容",''), null),
      coalesce(nullif("1年Bクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('1年Nクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("1年Nクラスの授業内容",''), null),
      coalesce(nullif("1年Nクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('2年Aクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("2年Aクラスの授業内容",''), null),
      coalesce(nullif("2年Aクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('2年Bクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("2年Bクラスの授業内容",''), null),
      coalesce(nullif("2年Bクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('2年Nクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("2年Nクラスの授業内容",''), null),
      coalesce(nullif("2年Nクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('3年Aクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("3年Aクラスの授業内容",''), null),
      coalesce(nullif("3年Aクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('3年Bクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("3年Bクラスの授業内容",''), null),
      coalesce(nullif("3年Bクラス担当講師名",''), null)
    from "スケジュール"
    union all
    select *,
      replace(substring('3年Nクラスの授業内容' from '^[0-9]+年[ABN]'), '年', '-') as class_group,
      coalesce(nullif("3年Nクラスの授業内容",''), null),
      coalesce(nullif("3年Nクラス担当講師名",''), null)
    from "スケジュール"
  ) as t
)
select
  cur.date,
  cur.time_slot,
  cur.period_num,
  cur.class_group,
  cur.subject,
  cur.instructor,
  ca.classroom as room_name,
  ca.classroom as classroom,
  ca.updated_at as classroom_updated_at,
  cc.comment
from cur
left join classroom_assignments ca
  on ca.date = cur.date
 and ca.time_slot = cur.time_slot
 and ca.class_group = cur.class_group
left join classroom_comments cc
  on cc.date::date = cur.date
 and cc.time_slot = cur.time_slot
 and cc.class_group = cur.class_group
where cur.class_group is not null
  and (
    (cur.class_group in ('1-A', '1-B', '2-A', '2-B', '3-A', '3-B') and cur.time_slot in ('1限目','2限目','昼食','3限目','4限目','マイスタディ','補　習','再試験'))
    or
    (cur.class_group in ('1-N', '2-N', '3-N') and cur.time_slot in ('5限目','6限目','マイスタディ','補　習','再試験'))
  );

-- デバッグ: ビューが正しく作成されたか確認
SELECT 'view_day_schedule created successfully' as status, count(*) as record_count FROM view_day_schedule;

-- デバッグ: 最新のデータを確認
SELECT * FROM view_day_schedule
WHERE date = CURRENT_DATE
ORDER BY class_group, time_slot
LIMIT 20;
