// PolkaLend Frontend - Demo Dashboard
// In production, connects to deployed contracts on Moonbeam
// Note: This is a demo-only dashboard with hardcoded data. No user input is rendered as HTML.

const DEMO_DATA = {
  tvl: "2,450,000",
  totalBorrowed: "1,230,000",
  totalUsers: "847",
  flashLoans24h: "156",
  markets: [
    {
      token: "GLMR",
      price: "$0.28",
      totalDeposits: "$1,200,000",
      totalBorrows: "$450,000",
      utilization: "37.5%",
      utilizationNum: 37.5,
      supplyAPY: "3.2%",
      borrowAPY: "5.8%",
      collateralFactor: "75%",
    },
    {
      token: "USDC",
      price: "$1.00",
      totalDeposits: "$800,000",
      totalBorrows: "$520,000",
      utilization: "65.0%",
      utilizationNum: 65.0,
      supplyAPY: "6.1%",
      borrowAPY: "8.4%",
      collateralFactor: "85%",
    },
    {
      token: "WETH",
      price: "$3,450",
      totalDeposits: "$350,000",
      totalBorrows: "$180,000",
      utilization: "51.4%",
      utilizationNum: 51.4,
      supplyAPY: "4.5%",
      borrowAPY: "7.2%",
      collateralFactor: "80%",
    },
    {
      token: "PLEND",
      price: "$0.12",
      totalDeposits: "$100,000",
      totalBorrows: "$80,000",
      utilization: "80.0%",
      utilizationNum: 80.0,
      supplyAPY: "12.4%",
      borrowAPY: "15.6%",
      collateralFactor: "60%",
    },
  ],
  recentActivity: [
    { type: "Deposit", user: "0x1a2b...3c4d", token: "GLMR", amount: "5,000", time: "2 min ago" },
    { type: "Borrow", user: "0x5e6f...7a8b", token: "USDC", amount: "10,000", time: "5 min ago" },
    { type: "Flash Loan", user: "0x9c0d...1e2f", token: "WETH", amount: "50,000", time: "8 min ago" },
    { type: "Repay", user: "0x3a4b...5c6d", token: "USDC", amount: "2,500", time: "12 min ago" },
    { type: "Liquidate", user: "0x7e8f...9a0b", token: "GLMR", amount: "15,000", time: "15 min ago" },
    { type: "Deposit", user: "0x1c2d...3e4f", token: "PLEND", amount: "100,000", time: "20 min ago" },
  ],
};

function createTextEl(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

function initDashboard() {
  // Stats
  document.getElementById("tvl").textContent = "$" + DEMO_DATA.tvl;
  document.getElementById("total-borrowed").textContent = "$" + DEMO_DATA.totalBorrowed;
  document.getElementById("total-users").textContent = DEMO_DATA.totalUsers;
  document.getElementById("flash-loans").textContent = DEMO_DATA.flashLoans24h;

  // Markets table -- using safe DOM methods (no innerHTML with user data)
  const tbody = document.getElementById("markets-body");
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  for (const m of DEMO_DATA.markets) {
    const row = document.createElement("tr");

    const tdToken = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = m.token;
    tdToken.appendChild(strong);
    row.appendChild(tdToken);

    row.appendChild(createTextEl("td", m.price));
    row.appendChild(createTextEl("td", m.totalDeposits));
    row.appendChild(createTextEl("td", m.totalBorrows));

    // Utilization bar
    const tdUtil = document.createElement("td");
    const barBg = document.createElement("div");
    barBg.className = "util-bar-bg";
    const bar = document.createElement("div");
    bar.className = "util-bar";
    bar.style.width = m.utilization;
    bar.style.background = m.utilizationNum > 80 ? "#e74c3c" : m.utilizationNum > 60 ? "#f39c12" : "#2ecc71";
    barBg.appendChild(bar);
    tdUtil.appendChild(barBg);
    const small = document.createElement("small");
    small.textContent = m.utilization;
    tdUtil.appendChild(small);
    row.appendChild(tdUtil);

    row.appendChild(createTextEl("td", m.supplyAPY, "apy-green"));
    row.appendChild(createTextEl("td", m.borrowAPY, "apy-orange"));
    row.appendChild(createTextEl("td", m.collateralFactor));

    tbody.appendChild(row);
  }

  // Activity feed -- using safe DOM methods
  const feed = document.getElementById("activity-feed");
  while (feed.firstChild) feed.removeChild(feed.firstChild);

  for (const a of DEMO_DATA.recentActivity) {
    const li = document.createElement("li");
    const typeClass = a.type.toLowerCase().replace(" ", "-");

    li.appendChild(createTextEl("span", a.type, "activity-type " + typeClass));
    li.appendChild(createTextEl("span", a.user + " \u2014 " + a.amount + " " + a.token, "activity-detail"));
    li.appendChild(createTextEl("span", a.time, "activity-time"));

    feed.appendChild(li);
  }

  // Interest rate chart (canvas)
  drawInterestRateChart();
}

function drawInterestRateChart() {
  const canvas = document.getElementById("rate-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Parameters matching our InterestRateModel
  const baseRate = 2;
  const slope1 = 10;
  const slope2 = 100;
  const kink = 80;

  function borrowRate(u) {
    if (u <= kink) return baseRate + (u / 100) * slope1;
    const normalRate = baseRate + (kink / 100) * slope1;
    return normalRate + ((u - kink) / 100) * slope2;
  }

  // Grid
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    const y = (i / 10) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Borrow rate curve
  ctx.strokeStyle = "#e74c3c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  const maxRate = 35;
  for (let px = 0; px <= W; px++) {
    const u = (px / W) * 100;
    const r = borrowRate(u);
    const y = H - (r / maxRate) * H;
    if (px === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  // Supply rate curve (approx)
  ctx.strokeStyle = "#2ecc71";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = 0; px <= W; px++) {
    const u = (px / W) * 100;
    const br = borrowRate(u);
    const sr = br * (u / 100) * 0.9; // 10% reserve
    const y = H - (sr / maxRate) * H;
    if (px === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  // Kink line
  ctx.strokeStyle = "#f39c12";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  const kinkX = (kink / 100) * W;
  ctx.beginPath(); ctx.moveTo(kinkX, 0); ctx.lineTo(kinkX, H); ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  ctx.fillStyle = "#aaa";
  ctx.font = "12px monospace";
  ctx.fillText("0%", 4, H - 4);
  ctx.fillText("100%", W - 40, H - 4);
  ctx.fillText("Utilization \u2192", W / 2 - 40, H - 4);

  ctx.fillStyle = "#e74c3c";
  ctx.fillText("Borrow APY", W - 100, 20);
  ctx.fillStyle = "#2ecc71";
  ctx.fillText("Supply APY", W - 100, 36);
  ctx.fillStyle = "#f39c12";
  ctx.fillText("Kink: " + kink + "%", kinkX + 4, 20);
}

// Wallet connect simulation
function connectWallet() {
  const btn = document.getElementById("connect-btn");
  btn.textContent = "0x1a2b...3c4d";
  btn.classList.add("connected");
  btn.onclick = null;
}

document.addEventListener("DOMContentLoaded", initDashboard);
