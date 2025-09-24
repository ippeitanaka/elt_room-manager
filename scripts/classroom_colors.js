// 教室名ごとの色（hsl値）一覧を出力するスクリプト
const classroomNames = [
  "---", "1F実習室", "2F実習室", "3F実習室", "3F小教室", "4F小教室", "4F大教室", "5F大教室", "7F大教室", "パソコン室", "DT3階小教室", "DT4階小教室"
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getClassroomColorHSL(classroom) {
  if (!classroom || classroom === "---") return "(色なし)";
  const hash = hashString(classroom);
  const hue = hash % 360;
  const saturation = 70;
  const lightness = 85;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

console.log("教室名ごとの色一覧:");
classroomNames.forEach(name => {
  console.log(`${name}: ${getClassroomColorHSL(name)}`);
});
