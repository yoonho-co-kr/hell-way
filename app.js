const DATA_URL = "data/seoul-subway-hourly-data.json";
const SVG_URL = "assets/subway.svg";

const DEFAULT_FILL = "#E2E8F0";

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

function resetStations() {
  const stations = svgRoot.querySelectorAll("circle[data-side]");
  stations.forEach((station) => {
    station.setAttribute("fill", DEFAULT_FILL);
    station.classList.remove("map-station");
    station.removeAttribute("data-level");
  });
}

function findStationNodes({ stationId, stationName }) {
  const selectors = [];
  if (stationName) {
    selectors.push(`[data-name="${CSS.escape(stationName)}"]`);
  }
  if (stationId) {
    selectors.push(`#${CSS.escape(String(stationId))}`);
  }
  if (selectors.length === 0) return null;

  const baseNodes = Array.from(svgRoot.querySelectorAll(selectors.join(", ")));
  if (baseNodes.length === 0) return null;

  const nodes = new Set();
  baseNodes.forEach((node) => {
    if (node.tagName?.toLowerCase() === "circle") {
      nodes.add(node);
    } else {
      node.querySelectorAll("circle").forEach((circle) => nodes.add(circle));
    }
  });
  if (nodes.size === 0) return null;

  const nodeList = Array.from(nodes);
  const explicitRide = nodeList.find((node) =>
    ["ride", "boarding", "left"].includes(node.getAttribute("data-side"))
  );
  const explicitAlight = nodeList.find((node) =>
    ["alight", "alighting", "right"].includes(node.getAttribute("data-side"))
  );

  if (explicitRide || explicitAlight) {
    return {
      rideNode: explicitRide ?? explicitAlight,
      alightNode: explicitAlight ?? explicitRide,
    };
  }

  if (nodeList.length === 1) {
    return { rideNode: nodeList[0], alightNode: nodeList[0] };
  }

  const sorted = [...nodeList].sort((a, b) => {
    const ax = Number(a.getAttribute("cx")) || 0;
    const bx = Number(b.getAttribute("cx")) || 0;
    return ax - bx;
  });

  return { rideNode: sorted[0], alightNode: sorted[sorted.length - 1] };
}

function applyColors(hour) {
  if (!svgRoot) return;
  resetStations();
  const hourData = congestionData.filter((item) => item.hour === hour);
  const coloredStations = [];

  hourData.forEach((item) => {
    const nodes = findStationNodes(item);
    if (!nodes) return;

    const rideValue = Number(item.ride ?? item.boarding ?? item.in ?? 0);
    const alightValue = Number(item.alight ?? item.alighting ?? item.out ?? 0);
    const rideLevel = normalizeLevel(rideValue);
    const alightLevel = normalizeLevel(alightValue);

    nodes.rideNode.setAttribute("fill", levelColor[rideLevel]);
    nodes.rideNode.classList.add("map-station");
    nodes.rideNode.setAttribute("data-level", rideLevel);

    nodes.alightNode.setAttribute("fill", levelColor[alightLevel]);
    nodes.alightNode.classList.add("map-station");
    nodes.alightNode.setAttribute("data-level", alightLevel);
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
