const STORAGE_KEY = "pulsetrack-sites";

const tableBody = document.getElementById("site-table-body");
const form = document.getElementById("site-form");
const rowTemplate = document.getElementById("row-template");
const avgScoreEl = document.getElementById("avg-score");
const fastSitesEl = document.getElementById("fast-sites");
const alertsEl = document.getElementById("alerts");

function loadSites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveSites(sites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
}

function siteStatus(site) {
  if (site.score >= 90 && site.uptime >= 99.9 && site.responseTime <= 500) {
    return { label: "Healthy", className: "good" };
  }
  if (site.score >= 75 && site.uptime >= 99) {
    return { label: "Watch", className: "watch" };
  }
  return { label: "Critical", className: "bad" };
}

function render() {
  const sites = loadSites();
  tableBody.innerHTML = "";

  let totalScore = 0;
  let fastSites = 0;
  let alerts = 0;

  sites.forEach((site) => {
    const row = rowTemplate.content.cloneNode(true);
    row.querySelector(".site").textContent = site.url;
    row.querySelector(".score").textContent = `${site.score}`;
    row.querySelector(".uptime").textContent = `${site.uptime.toFixed(2)}%`;
    row.querySelector(".response").textContent = `${site.responseTime} ms`;

    const status = siteStatus(site);
    const pill = row.querySelector(".pill");
    pill.textContent = status.label;
    pill.className = `pill ${status.className}`;

    totalScore += site.score;
    if (site.score >= 90) fastSites += 1;
    if (status.label !== "Healthy") alerts += 1;

    tableBody.appendChild(row);
  });

  const avg = sites.length ? Math.round(totalScore / sites.length) : 0;
  avgScoreEl.textContent = String(avg);
  fastSitesEl.textContent = String(fastSites);
  alertsEl.textContent = String(alerts);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const site = {
    url: document.getElementById("url").value.trim(),
    score: Number(document.getElementById("score").value),
    uptime: Number(document.getElementById("uptime").value),
    responseTime: Number(document.getElementById("response-time").value),
  };

  const sites = loadSites();
  sites.unshift(site);
  saveSites(sites);
  form.reset();
  render();
});

document.getElementById("clear-all").addEventListener("click", () => {
  saveSites([]);
  render();
});

document.getElementById("seed-demo").addEventListener("click", () => {
  const demo = [
    { url: "https://shop.example.com", score: 96, uptime: 99.98, responseTime: 320 },
    { url: "https://blog.example.com", score: 87, uptime: 99.5, responseTime: 610 },
    { url: "https://api.example.com", score: 72, uptime: 98.7, responseTime: 1300 },
  ];
  saveSites(demo);
  render();
});

render();
