
-- 既存ビューが型違いで残っている場合は、先に下記で削除してください:
drop view if exists view_day_schedule;

create view view_day_schedule as
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
  ca.classroom as classroom,      -- 既存互換
  ca.updated_at as classroom_updated_at,
  cc.comment
from cur
left join classroom_assignments_rows ca
  on ca.date::date = cur.date
 and ca.time_slot = cur.time_slot
 and ca.class_group = cur.class_group
left join classroom_comments_rows cc
  on cc.date::date = cur.date
 and cc.time_slot = cur.time_slot
 and cc.class_group = cur.class_group
where cur.class_group is not null;
