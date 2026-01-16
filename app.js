const DATA_URL = "data/seoul-subway-hourly-data.json";
const SVG_URL = "assets/seoul_metro_map_with_ids.svg";

const levelColor = {
  low: "var(--low)",
  medium: "var(--medium)",
  high: "var(--high)",
};

const mapContainer = document.getElementById("mapContainer");
const hourSelect = document.getElementById("hourSelect");
const summary = document.getElementById("summary");

let congestionData = [];
let svgRoot = null;

function buildHourOptions() {
  for (let hour = 0; hour < 24; hour += 1) {
    const option = document.createElement("option");
    option.value = String(hour);
    option.textContent = `${hour}시`;
    hourSelect.appendChild(option);
  }
  hourSelect.value = "8";
}

function normalizeLevel(value) {
  if (value <= 33) return "low";
  if (value <= 66) return "medium";
  return "high";
}

function applyColors(hour) {
  if (!svgRoot) return;
  const hourData = congestionData.filter((item) => item.hour === hour);
  const coloredStations = [];

  hourData.forEach((item) => {
    const station = svgRoot.querySelector(`[data-station-id="${item.stationId}"]`);
    if (!station) return;

    const level = normalizeLevel(item.congestion);
    station.setAttribute("fill", levelColor[level]);
    station.classList.add("map-station");
    station.setAttribute("data-level", level);
    coloredStations.push(item.stationName);
  });

  summary.textContent = `${hour}시 기준으로 ${coloredStations.length}개 역이 표시되었습니다.`;
}

async function loadSvg() {
  const response = await fetch(SVG_URL);
  const svgText = await response.text();
  mapContainer.innerHTML = svgText;
  svgRoot = mapContainer.querySelector("svg");
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const json = await response.json();
  congestionData = json.records;
}

async function init() {
  buildHourOptions();
  await Promise.all([loadSvg(), loadData()]);
  applyColors(Number(hourSelect.value));

  hourSelect.addEventListener("change", (event) => {
    const hour = Number(event.target.value);
    applyColors(hour);
  });
}

init();
