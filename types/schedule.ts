export interface DayScheduleItem {
  date: string;
  time_slot: string;
  class_group: string;
  subject?: string;
  instructor?: string;
  room_name?: string;
  classroom?: string;
  classroom_updated_at?: string;
  comment?: string;
}
