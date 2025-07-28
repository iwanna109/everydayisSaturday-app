const nameInput = document.getElementById("nameInput");
const dateInput = document.getElementById("dateInput");
const usernameSpan = document.getElementById("username");
const canvas = document.getElementById("scheduleCanvas");
const ctx = canvas.getContext("2d");

const taskInputs = document.getElementById("taskInputs");
const addTaskBtn = document.getElementById("addTask");
const generateBtn = document.getElementById("generateImage");
const resetBtn = document.getElementById("resetAll");
const bgColor = document.getElementById("bgColor");
const textColor = document.getElementById("textColor");
const fontSelect = document.getElementById("fontSelect");

let tasks = [];

// 初期化：過去の入力を読み込む
window.onload = () => {
  const savedName = localStorage.getItem("username");
  const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  if (savedName) {
    nameInput.value = savedName;
    usernameSpan.textContent = savedName;
  }

  savedTasks.forEach(task => createTaskInput(task.start, task.end, task.label));
};

// 名前・日付の自動反映
nameInput.addEventListener("input", () => {
  usernameSpan.textContent = nameInput.value || "Your";
});

addTaskBtn.addEventListener("click", () => createTaskInput());

resetBtn.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

generateBtn.addEventListener("click", () => {
  drawSchedule();
  saveImage();
  // キャッシュ保存
  localStorage.setItem("username", nameInput.value);
  localStorage.setItem("tasks", JSON.stringify(tasks));
});

function createTaskInput(start = "", end = "", label = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <label>From: <input type="time" class="startTime" value="${start}" /></label>
    <label>To: <input type="time" class="endTime" value="${end}" /></label>
    <label>Label: <input type="text" class="labelText" value="${label}" /></label>
    <hr />
  `;
  taskInputs.appendChild(wrapper);
}

// 円グラフを描画（簡易版）※時間帯ごとの角度に変換して扇形描画する
function drawSchedule() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 400;
  let colors = ["#FFC0CB", "#ADD8E6", "#90EE90", "#FFFFE0", "#FFB6C1", "#D3D3D3", "#FFA07A"];

  tasks = [];
  const taskDivs = taskInputs.querySelectorAll("div");
  taskDivs.forEach((div, i) => {
    const start = div.querySelector(".startTime").value;
    const end = div.querySelector(".endTime").value;
    const label = div.querySelector(".labelText").value;

    if (!start || !end || !label) return;

    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    const angleStart = (startMin / 1440) * 2 * Math.PI;
    const angleEnd = (endMin / 1440) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.fillStyle = colors[i % colors.length];
    ctx.arc(centerX, centerY, radius, angleStart, angleEnd);
    ctx.fill();

    // ラベル
    const midAngle = (angleStart + angleEnd) / 2;
    const labelX = centerX + Math.cos(midAngle) * (radius + 40);
    const labelY = centerY + Math.sin(midAngle) * (radius + 40);
    ctx.fillStyle = textColor.value;
    ctx.font = `24px ${fontSelect.value}`;
    ctx.textAlign = "center";
    ctx.fillText(label, labelX, labelY);

    tasks.push({ start, end, label });
  });

  // タイトル
  ctx.fillStyle = textColor.value;
  ctx.font = `bold 36px ${fontSelect.value}`;
  ctx.fillText(`${nameInput.value}'s Schedule`, centerX, 80);
}

// ユーティリティ
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// 出力
function saveImage() {
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = nameInput.value || "your";
  a.download = `${name}'s schedule_${dateStr}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}
