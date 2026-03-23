// PolkaLend Frontend - Interactive Dashboard
// Demo data simulating on-chain state. All DOM construction uses safe methods (no innerHTML).

var MARKETS = [
  { token: 'GLMR',  price: 0.28,   deposits: 1200000, borrows: 450000,  cf: 0.75, supplyAPY: 3.2,  borrowAPY: 5.8  },
  { token: 'USDC',  price: 1.00,   deposits: 800000,  borrows: 520000,  cf: 0.85, supplyAPY: 6.1,  borrowAPY: 8.4  },
  { token: 'WETH',  price: 3450,   deposits: 350000,  borrows: 180000,  cf: 0.80, supplyAPY: 4.5,  borrowAPY: 7.2  },
  { token: 'PLEND', price: 0.12,   deposits: 100000,  borrows: 80000,   cf: 0.60, supplyAPY: 12.4, borrowAPY: 15.6 },
];

var WALLET = {
  GLMR:  { balance: 10000, deposited: 5000, borrowed: 0,    interest: 12.50 },
  USDC:  { balance: 5000,  deposited: 2000, borrowed: 3200, interest: 8.30  },
  WETH:  { balance: 0.5,   deposited: 0,    borrowed: 0,    interest: 0     },
  PLEND: { balance: 50000, deposited: 0,    borrowed: 0,    interest: 0     },
};

var ACTIVITY = [
  { type: 'Deposit',    user: '0x1a2b...3c4d', token: 'GLMR',  amount: '5,000',   time: '2 min ago'  },
  { type: 'Borrow',     user: '0x5e6f...7a8b', token: 'USDC',  amount: '10,000',  time: '5 min ago'  },
  { type: 'Flash Loan', user: '0x9c0d...1e2f', token: 'WETH',  amount: '50,000',  time: '8 min ago'  },
  { type: 'Repay',      user: '0x3a4b...5c6d', token: 'USDC',  amount: '2,500',   time: '12 min ago' },
  { type: 'Liquidate',  user: '0x7e8f...9a0b', token: 'GLMR',  amount: '15,000',  time: '15 min ago' },
  { type: 'Deposit',    user: '0x1c2d...3e4f', token: 'PLEND', amount: '100,000', time: '20 min ago' },
  { type: 'Borrow',     user: '0xab12...cd34', token: 'WETH',  amount: '2.5',     time: '25 min ago' },
  { type: 'Flash Loan', user: '0xef56...7890', token: 'USDC',  amount: '200,000', time: '30 min ago' },
];

var FLASH_HISTORY = [
  { time: '2 min ago',  token: 'WETH', amount: 50000,  fee: 45,   tx: '0xa3f1...2b4c' },
  { time: '8 min ago',  token: 'USDC', amount: 25000,  fee: 22.5, tx: '0xb7d2...8e1f' },
  { time: '15 min ago', token: 'GLMR', amount: 100000, fee: 90,   tx: '0xc1a9...3d5e' },
  { time: '32 min ago', token: 'USDC', amount: 500000, fee: 450,  tx: '0xd4e8...6f7a' },
  { time: '1h ago',     token: 'WETH', amount: 10000,  fee: 9,    tx: '0xe5f2...9b0c' },
];

var TOP_DEPOSITORS = [
  { addr: '0x1a2b...3c4d', amount: 125000 },
  { addr: '0x5e6f...7a8b', amount: 98000  },
  { addr: '0x9c0d...1e2f', amount: 76500  },
  { addr: '0x3a4b...5c6d', amount: 54200  },
  { addr: '0x7e8f...9a0b', amount: 42100  },
];

var TOP_BORROWERS = [
  { addr: '0xab12...cd34', amount: 89000  },
  { addr: '0xef56...7890', amount: 67500  },
  { addr: '0x1122...3344', amount: 45200  },
  { addr: '0x5566...7788', amount: 32100  },
  { addr: '0x99aa...bbcc', amount: 21800  },
];

// ==================== ROUTING ====================

function navigateTo(page) {
  var current = document.querySelector('.page.active');
  var target = document.getElementById('page-' + page);
  var nav = document.querySelector('[data-page="' + page + '"]');

  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  if (nav) nav.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');

  if (current && current !== target) {
    current.classList.add('fade-out');
    setTimeout(function() {
      current.classList.remove('active', 'fade-out');
      if (target) {
        showPageSkeleton(target);
        target.classList.add('active');
        setTimeout(function() {
          hidePageSkeleton(target);
          initPage(page);
        }, 150);
      }
    }, 150);
  } else if (target) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    target.classList.add('active');
    initPage(page);
  }
}

function showPageSkeleton(pageEl) {
  var existing = pageEl.querySelector('.page-skeleton');
  if (existing) return;
  var skel = mkEl('div', null, 'page-skeleton');
  var row = mkEl('div', null, 'skel-row');
  for (var i = 0; i < 4; i++) row.appendChild(mkEl('div', null, 'skel-block'));
  skel.appendChild(row);
  skel.appendChild(mkEl('div', null, 'skel-wide'));
  pageEl.prepend(skel);
  var children = pageEl.children;
  for (var j = 1; j < children.length; j++) children[j].style.opacity = '0';
}

function hidePageSkeleton(pageEl) {
  var skel = pageEl.querySelector('.page-skeleton');
  if (skel) skel.remove();
  var children = pageEl.children;
  for (var j = 0; j < children.length; j++) children[j].style.opacity = '';
}

function initPage(page) {
  switch (page) {
    case 'dashboard': initDashboard(); break;
    case 'lending': initLending(); break;
    case 'borrowing': initBorrowing(); break;
    case 'flash-loans': initFlashLoans(); break;
    case 'analytics': initAnalytics(); break;
  }
}

function handleRoute() {
  var hash = window.location.hash.slice(1) || 'dashboard';
  navigateTo(hash);
}

// ==================== UTILITIES ====================

function fmt(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

function fmtNum(n) {
  return n.toLocaleString('en-US');
}

function fmtPrice(n) {
  if (n >= 100) return '$' + fmtNum(n);
  return '$' + n.toFixed(2);
}

function utilColor(pct) {
  if (pct > 80) return '#e74c3c';
  if (pct > 60) return '#f39c12';
  return '#2ecc71';
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function mkEl(tag, text, cls) {
  var el = document.createElement(tag);
  if (text !== undefined && text !== null) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}

function appendTd(row, text, cls) {
  var td = mkEl('td', text, cls);
  row.appendChild(td);
  return td;
}

function showToast(msg, type) {
  type = type || 'info';
  var icons = { success: '\u2713', error: '\u2717', warning: '\u26A0', info: '\u2139' };
  var container = document.getElementById('toast-container');
  var toast = mkEl('div', null, 'toast ' + type);
  var icon = mkEl('span', icons[type] || icons.info, 'toast-icon');
  toast.appendChild(icon);
  toast.appendChild(mkEl('span', msg));
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('fade-out');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 250);
  }, 3000);
}

function staggerRows(tbody) {
  var rows = tbody.querySelectorAll('tr');
  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.add('stagger-in');
    rows[i].style.animationDelay = (i * 50) + 'ms';
  }
}

function animateCount(el, target, prefix, duration) {
  prefix = prefix || '';
  duration = duration || 400;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.floor(eased * target);
    el.textContent = prefix + fmtNum(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ==================== DASHBOARD ====================

function initDashboard() {
  // Animate stat values
  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    animateCount(el, target, prefix, 600);
  });

  // Markets table
  var tbody = document.getElementById('markets-body');
  clearChildren(tbody);
  MARKETS.forEach(function(m) {
    var util = ((m.borrows / m.deposits) * 100).toFixed(1);
    var row = document.createElement('tr');

    var tdToken = document.createElement('td');
    var strong = mkEl('strong', m.token);
    tdToken.appendChild(strong);
    row.appendChild(tdToken);

    appendTd(row, fmtPrice(m.price));
    appendTd(row, fmt(m.deposits));
    appendTd(row, fmt(m.borrows));

    // Utilization bar
    var tdUtil = document.createElement('td');
    var barBg = mkEl('div', null, 'util-bar-bg');
    var bar = mkEl('div', null, 'util-bar');
    bar.style.width = util + '%';
    bar.style.background = utilColor(parseFloat(util));
    barBg.appendChild(bar);
    tdUtil.appendChild(barBg);
    tdUtil.appendChild(mkEl('small', ' ' + util + '%'));
    row.appendChild(tdUtil);

    appendTd(row, m.supplyAPY.toFixed(1) + '%', 'text-green');
    appendTd(row, m.borrowAPY.toFixed(1) + '%', 'text-yellow');
    appendTd(row, (m.cf * 100).toFixed(0) + '%');

    var tdAction = document.createElement('td');
    var btn = mkEl('button', 'Supply', 'btn-accent-sm');
    btn.onclick = function() { window.location.hash = 'lending'; };
    tdAction.appendChild(btn);
    row.appendChild(tdAction);

    tbody.appendChild(row);
  });
  staggerRows(tbody);

  // Activity feed
  var feed = document.getElementById('activity-feed');
  clearChildren(feed);
  ACTIVITY.forEach(function(a, i) {
    var li = mkEl('li', null, 'activity-item');
    li.style.animationDelay = (i * 50) + 'ms';

    var typeClass = 'badge-' + a.type.toLowerCase().replace(' ', '-');
    li.appendChild(mkEl('span', a.type, 'badge ' + typeClass));
    li.appendChild(mkEl('span', a.user + ' \u2014 ' + a.amount + ' ' + a.token, 'activity-detail'));
    li.appendChild(mkEl('span', a.time, 'activity-time'));
    feed.appendChild(li);
  });

  drawRateChart('rate-chart', 480, 300, null, null);
}

// ==================== INTEREST RATE CHART ====================

function calcBorrowRate(u, base, s1, s2, kink) {
  if (u <= kink) return base + (u / 100) * s1;
  return base + (kink / 100) * s1 + ((u - kink) / 100) * s2;
}

function drawRateChart(canvasId, w, h, mouseX, params) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;

  var rect = canvas.getBoundingClientRect();
  var cw = w || rect.width || 480;
  var ch = h || 300;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  ctx.scale(dpr, dpr);

  var base = params ? params.base : 2;
  var s1 = params ? params.slope1 : 10;
  var s2 = params ? params.slope2 : 100;
  var kink = params ? params.kink : 80;
  var maxRate = Math.max(40, base + (kink / 100) * s1 + ((100 - kink) / 100) * s2 + 5);

  var pad = { top: 30, right: 20, bottom: 30, left: 50 };
  var plotW = cw - pad.left - pad.right;
  var plotH = ch - pad.top - pad.bottom;

  ctx.clearRect(0, 0, cw, ch);

  // Grid
  ctx.strokeStyle = '#1e2530';
  ctx.lineWidth = 0.5;
  var gi;
  for (gi = 0; gi <= 10; gi++) {
    var gx = pad.left + (gi / 10) * plotW;
    ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, pad.top + plotH); ctx.stroke();
    var gy = pad.top + (gi / 10) * plotH;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(pad.left + plotW, gy); ctx.stroke();
  }

  // Axes labels
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  var ai;
  for (ai = 0; ai <= 10; ai += 2) {
    ctx.fillText((ai * 10) + '%', pad.left + (ai / 10) * plotW, ch - 8);
  }
  ctx.textAlign = 'right';
  for (ai = 0; ai <= 5; ai++) {
    ctx.fillText(((ai / 5) * maxRate).toFixed(0) + '%', pad.left - 8, pad.top + plotH - (ai / 5) * plotH + 4);
  }
  ctx.textAlign = 'center';
  ctx.fillText('Utilization', pad.left + plotW / 2, ch);

  // Kink line
  var kinkX = pad.left + (kink / 100) * plotW;
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(kinkX, pad.top); ctx.lineTo(kinkX, pad.top + plotH); ctx.stroke();
  ctx.setLineDash([]);

  // Borrow rate curve
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  var px;
  for (px = 0; px <= plotW; px++) {
    var u = (px / plotW) * 100;
    var r = calcBorrowRate(u, base, s1, s2, kink);
    var x = pad.left + px;
    var y = pad.top + plotH - (r / maxRate) * plotH;
    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Supply rate curve
  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (px = 0; px <= plotW; px++) {
    var u2 = (px / plotW) * 100;
    var br = calcBorrowRate(u2, base, s1, s2, kink);
    var sr = br * (u2 / 100) * 0.9;
    var x2 = pad.left + px;
    var y2 = pad.top + plotH - (sr / maxRate) * plotH;
    if (px === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
  }
  ctx.stroke();

  // Market dots (only on interactive chart)
  if (params) {
    MARKETS.forEach(function(m) {
      var mUtil = (m.borrows / m.deposits) * 100;
      var mRate = calcBorrowRate(mUtil, base, s1, s2, kink);
      var dx = pad.left + (mUtil / 100) * plotW;
      var dy = pad.top + plotH - (mRate / maxRate) * plotH;
      ctx.fillStyle = '#e6007a';
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e6edf3';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.token, dx, dy - 10);
    });
  }

  // Legends
  ctx.font = '11px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e74c3c';
  ctx.fillText('Borrow APY', cw - 110, 18);
  ctx.fillStyle = '#2ecc71';
  ctx.fillText('Supply APY', cw - 110, 32);
  ctx.fillStyle = '#f39c12';
  ctx.fillText('Kink: ' + kink + '%', kinkX + 6, pad.top + 14);

  // Hover crosshair
  if (mouseX !== null && mouseX !== undefined) {
    var mxLocal = mouseX - pad.left;
    if (mxLocal >= 0 && mxLocal <= plotW) {
      var mu = (mxLocal / plotW) * 100;
      var br2 = calcBorrowRate(mu, base, s1, s2, kink);
      var sr2 = br2 * (mu / 100) * 0.9;
      var cx2 = pad.left + mxLocal;

      ctx.strokeStyle = 'rgba(230,0,122,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx2, pad.top); ctx.lineTo(cx2, pad.top + plotH); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#161b22';
      var tw = 140;
      var tx = Math.min(cx2 + 10, cw - tw - 10);
      ctx.fillRect(tx, pad.top + 5, tw, 50);
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, pad.top + 5, tw, 50);
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillStyle = '#c9d1d9';
      ctx.textAlign = 'left';
      ctx.fillText('Util: ' + mu.toFixed(1) + '%', tx + 8, pad.top + 22);
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('Borrow: ' + br2.toFixed(2) + '%', tx + 8, pad.top + 36);
      ctx.fillStyle = '#2ecc71';
      ctx.fillText('Supply: ' + sr2.toFixed(2) + '%', tx + 8, pad.top + 50);
    }
  }
}

// ==================== LENDING ====================

function initLending() {
  updateLendingInfo();
  renderPositions();
  updateHealthGauge(2.45);

  document.getElementById('deposit-token').onchange = updateLendingInfo;
  document.getElementById('withdraw-token').onchange = updateWithdrawInfo;
  document.getElementById('deposit-max').onclick = function() {
    var token = document.getElementById('deposit-token').value;
    document.getElementById('deposit-amount').value = WALLET[token].balance;
  };
  document.getElementById('withdraw-max').onclick = function() {
    var token = document.getElementById('withdraw-token').value;
    document.getElementById('withdraw-amount').value = WALLET[token].deposited;
  };
  document.getElementById('deposit-btn').onclick = handleDeposit;
  document.getElementById('withdraw-btn').onclick = handleWithdraw;
}

function updateLendingInfo() {
  var token = document.getElementById('deposit-token').value;
  var m = MARKETS.find(function(x) { return x.token === token; });
  document.getElementById('deposit-balance').textContent = fmtNum(WALLET[token].balance) + ' ' + token;
  document.getElementById('deposit-apy').textContent = m.supplyAPY.toFixed(1) + '%';
}

function updateWithdrawInfo() {
  var token = document.getElementById('withdraw-token').value;
  document.getElementById('withdraw-balance').textContent = fmtNum(WALLET[token].deposited) + ' ' + token;
}

function renderPositions() {
  var tbody = document.getElementById('positions-body');
  clearChildren(tbody);
  Object.keys(WALLET).forEach(function(token) {
    var w = WALLET[token];
    if (w.deposited <= 0) return;
    var m = MARKETS.find(function(x) { return x.token === token; });
    var row = document.createElement('tr');
    appendTd(row, token);
    appendTd(row, fmtNum(w.deposited));
    appendTd(row, '+' + w.interest.toFixed(2), 'text-green');
    appendTd(row, m.supplyAPY.toFixed(1) + '%', 'text-green');
    var tdAction = document.createElement('td');
    var btn = mkEl('button', 'Withdraw', 'btn-sm');
    btn.onclick = (function(t) {
      return function() {
        document.getElementById('withdraw-token').value = t;
        updateWithdrawInfo();
      };
    })(token);
    tdAction.appendChild(btn);
    row.appendChild(tdAction);
    tbody.appendChild(row);
  });
  staggerRows(tbody);
}

function handleDeposit() {
  var token = document.getElementById('deposit-token').value;
  var amount = parseFloat(document.getElementById('deposit-amount').value);
  var errEl = document.getElementById('deposit-error');
  if (!amount || amount <= 0) {
    errEl.textContent = 'Enter a valid amount';
    errEl.style.display = 'block';
    return;
  }
  if (amount > WALLET[token].balance) {
    errEl.textContent = 'Amount exceeds wallet balance';
    errEl.style.display = 'block';
    document.getElementById('deposit-amount').classList.add('error');
    return;
  }
  errEl.style.display = 'none';
  document.getElementById('deposit-amount').classList.remove('error');
  WALLET[token].balance -= amount;
  WALLET[token].deposited += amount;
  document.getElementById('deposit-amount').value = '';
  updateLendingInfo();
  renderPositions();
  showToast('Deposited ' + fmtNum(amount) + ' ' + token, 'success');
}

function handleWithdraw() {
  var token = document.getElementById('withdraw-token').value;
  var amount = parseFloat(document.getElementById('withdraw-amount').value);
  var errEl = document.getElementById('withdraw-error');
  if (!amount || amount <= 0) {
    errEl.textContent = 'Enter a valid amount';
    errEl.style.display = 'block';
    return;
  }
  if (amount > WALLET[token].deposited) {
    errEl.textContent = 'Amount exceeds deposited balance';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  WALLET[token].deposited -= amount;
  WALLET[token].balance += amount;
  document.getElementById('withdraw-amount').value = '';
  updateWithdrawInfo();
  updateLendingInfo();
  renderPositions();
  showToast('Withdrew ' + fmtNum(amount) + ' ' + token, 'success');
}

function updateHealthGauge(value) {
  var gauge = document.getElementById('health-gauge');
  var valEl = document.getElementById('health-value');
  var marker = document.getElementById('health-marker');
  valEl.textContent = value.toFixed(2);

  var color;
  if (value >= 2.0) { color = '#2ecc71'; }
  else if (value >= 1.5) { color = '#f39c12'; }
  else if (value >= 1.0) { color = '#f39c12'; }
  else { color = '#e74c3c'; }

  valEl.style.color = color;

  var pct = Math.min(value / 3, 1) * 270;
  gauge.style.background = 'conic-gradient(' + color + ' 0deg, ' + color + ' ' + pct + 'deg, #30363d ' + pct + 'deg, #30363d 360deg)';
  gauge.style.transform = 'rotate(-135deg)';
  gauge.querySelector('.health-gauge-inner').style.transform = 'rotate(135deg)';

  var markerPct = Math.min(value / 3, 1) * 100;
  marker.style.left = markerPct + '%';

  if (value < 1.0) {
    gauge.classList.add('health-danger');
  } else {
    gauge.classList.remove('health-danger');
  }
}

// ==================== BORROWING ====================

function initBorrowing() {
  renderBorrows();
  renderCollateral();
  initLiqSimulator();

  document.getElementById('borrow-max').onclick = function() {
    document.getElementById('borrow-amount').value = 2350;
  };
  document.getElementById('repay-max').onclick = function() {
    document.getElementById('repay-amount').value = 3245.20;
  };

  document.getElementById('borrow-amount').oninput = function() {
    var val = parseFloat(this.value) || 0;
    var newHf = Math.max(0, 2.45 - (val / 2350) * 1.45);
    var preview = document.getElementById('borrow-hf-preview');
    preview.textContent = newHf.toFixed(2);
    preview.className = newHf >= 1.5 ? 'text-green' : newHf >= 1.0 ? 'text-yellow' : 'text-red';
  };

  document.getElementById('borrow-btn').onclick = function() {
    var amount = parseFloat(document.getElementById('borrow-amount').value);
    if (!amount || amount <= 0) return;
    if (amount > 2350) {
      document.getElementById('borrow-error').style.display = 'block';
      return;
    }
    document.getElementById('borrow-error').style.display = 'none';
    document.getElementById('borrow-amount').value = '';
    showToast('Borrowed $' + fmtNum(amount), 'success');
  };

  document.getElementById('repay-btn').onclick = function() {
    var amount = parseFloat(document.getElementById('repay-amount').value);
    if (!amount || amount <= 0) return;
    document.getElementById('repay-amount').value = '';
    showToast('Repaid $' + amount.toFixed(2), 'success');
  };
}

function renderBorrows() {
  var tbody = document.getElementById('borrows-body');
  clearChildren(tbody);
  Object.keys(WALLET).forEach(function(token) {
    var w = WALLET[token];
    if (w.borrowed <= 0) return;
    var m = MARKETS.find(function(x) { return x.token === token; });
    var interest = w.borrowed * m.borrowAPY / 100 * (30 / 365);
    var row = document.createElement('tr');
    appendTd(row, token);
    appendTd(row, fmtNum(w.borrowed));
    appendTd(row, '+' + interest.toFixed(2), 'text-red');
    appendTd(row, m.borrowAPY.toFixed(1) + '%', 'text-yellow');
    appendTd(row, '$' + fmtNum(Math.round(w.borrowed * m.price + interest)));
    var tdAction = document.createElement('td');
    var btn = mkEl('button', 'Repay', 'btn-sm');
    btn.onclick = (function(t) {
      return function() { document.getElementById('repay-token').value = t; };
    })(token);
    tdAction.appendChild(btn);
    row.appendChild(tdAction);
    tbody.appendChild(row);
  });
  staggerRows(tbody);
}

function renderCollateral() {
  var container = document.getElementById('collateral-list');
  clearChildren(container);
  var collaterals = [
    { token: 'GLMR', amount: 5000, price: 0.28, cf: 0.75 },
    { token: 'USDC', amount: 2000, price: 1.00, cf: 0.85 },
  ];
  collaterals.forEach(function(c) {
    var effective = c.amount * c.price * c.cf;
    var row = mkEl('div', null, 'summary-row');
    row.appendChild(mkEl('span', c.token + ' ' + fmtNum(c.amount) + ' x $' + c.price.toFixed(2) + ' x ' + (c.cf * 100) + '%', 'summary-label'));
    row.appendChild(mkEl('span', '$' + fmtNum(Math.round(effective)), 'summary-value'));
    container.appendChild(row);
  });
}

function initLiqSimulator() {
  var slider = document.getElementById('liq-slider');
  var priceEl = document.getElementById('sim-price');
  var tableBody = document.querySelector('#sim-table tbody');

  function updateSim() {
    var price = parseInt(slider.value, 10) / 100;
    priceEl.textContent = price.toFixed(2);

    var checkpoints = [0.28, 0.22, 0.18, 0.15, price];
    var unique = [];
    checkpoints.forEach(function(v) {
      var found = false;
      for (var i = 0; i < unique.length; i++) {
        if (Math.abs(unique[i] - v) < 0.005) { found = true; break; }
      }
      if (!found) unique.push(v);
    });
    unique.sort(function(a, b) { return b - a; });

    clearChildren(tableBody);
    unique.forEach(function(p) {
      var glmrValue = 5000 * p * 0.75;
      var usdcValue = 2000 * 1.00 * 0.85;
      var totalCollateral = glmrValue + usdcValue;
      var borrowed = 3200;
      var hf = totalCollateral / borrowed;

      var status, statusClass;
      if (hf >= 1.5) { status = 'SAFE'; statusClass = 'badge-deposit'; }
      else if (hf >= 1.0) { status = 'WARNING'; statusClass = 'badge-borrow'; }
      else { status = 'LIQUIDATABLE'; statusClass = 'badge-liquidate'; }

      var row = document.createElement('tr');
      appendTd(row, '$' + p.toFixed(2));
      var hfTd = mkEl('td', hf.toFixed(2), hf >= 1.5 ? 'text-green' : hf >= 1.0 ? 'text-yellow' : 'text-red');
      row.appendChild(hfTd);
      var statusTd = document.createElement('td');
      statusTd.appendChild(mkEl('span', status, 'badge ' + statusClass));
      row.appendChild(statusTd);
      tableBody.appendChild(row);
    });
  }

  slider.oninput = updateSim;
  updateSim();
}

// ==================== FLASH LOANS ====================

function initFlashLoans() {
  renderFlashHistory();
  setupFlashCalc();
  setupFlowDemo();
  setupFeeCalc();
}

function renderFlashHistory() {
  var tbody = document.getElementById('flash-history-body');
  clearChildren(tbody);
  FLASH_HISTORY.forEach(function(h) {
    var row = document.createElement('tr');
    appendTd(row, h.time);
    appendTd(row, h.token);
    appendTd(row, '$' + fmtNum(h.amount));
    appendTd(row, '$' + h.fee.toFixed(2));
    var tdStatus = document.createElement('td');
    tdStatus.appendChild(mkEl('span', 'Success', 'badge badge-success'));
    row.appendChild(tdStatus);
    appendTd(row, h.tx, 'text-mono');
    tbody.appendChild(row);
  });
  staggerRows(tbody);
}

function setupFlashCalc() {
  var amountInput = document.getElementById('flash-amount');
  var tokenSelect = document.getElementById('flash-token');

  function update() {
    var token = tokenSelect.value;
    var m = MARKETS.find(function(x) { return x.token === token; });
    var amount = parseFloat(amountInput.value) || 0;
    var fee = amount * 0.0009;
    var feeUsd = fee * m.price;

    document.getElementById('flash-liquidity').textContent = fmt(m.deposits);
    document.getElementById('flash-fee').textContent = '$' + feeUsd.toFixed(2);
    document.getElementById('flash-receive').textContent = fmtNum(amount) + ' ' + token;
    document.getElementById('flash-return').textContent = fmtNum(Math.ceil((amount + fee) * 100) / 100) + ' ' + token;
  }

  amountInput.oninput = update;
  tokenSelect.onchange = update;

  document.getElementById('flash-btn').onclick = function() {
    var amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) return;
    runFlowAnimation();
    showToast('Flash loan executed!', 'success');
  };
}

function setupFeeCalc() {
  var input = document.getElementById('fee-calc-amount');
  input.oninput = function() {
    var amount = parseFloat(input.value) || 0;
    var fee = amount * 0.0009;
    document.getElementById('fee-calc-fee').textContent = '$' + fee.toFixed(2);
    document.getElementById('fee-calc-total').textContent = '$' + (amount + fee).toFixed(2);
  };
}

function setupFlowDemo() {
  document.getElementById('demo-flash-btn').onclick = runFlowAnimation;
}

function runFlowAnimation() {
  var nodes = ['flow-pool1', 'flow-receiver', 'flow-action', 'flow-pool2'];
  var arrows = ['flow-a1', 'flow-a2', 'flow-a3'];
  var amounts = ['50,000 GLMR', '50,000 GLMR', '50,045 GLMR'];
  var amountEls = ['flow-amt1', 'flow-amt2', 'flow-amt3'];

  // Reset all
  nodes.forEach(function(id) {
    var el = document.getElementById(id);
    el.classList.remove('active', 'complete');
  });
  arrows.forEach(function(id) {
    document.getElementById(id).classList.remove('active');
  });
  amountEls.forEach(function(id, i) {
    document.getElementById(id).textContent = amounts[i];
  });

  var steps = [
    function() { document.getElementById(nodes[0]).classList.add('active'); },
    function() { document.getElementById(arrows[0]).classList.add('active'); },
    function() { document.getElementById(nodes[0]).classList.remove('active'); document.getElementById(nodes[1]).classList.add('active'); },
    function() { document.getElementById(arrows[1]).classList.add('active'); },
    function() { document.getElementById(nodes[1]).classList.remove('active'); document.getElementById(nodes[2]).classList.add('active'); },
    function() { document.getElementById(arrows[2]).classList.add('active'); },
    function() { document.getElementById(nodes[2]).classList.remove('active'); document.getElementById(nodes[3]).classList.add('complete'); },
    function() {
      nodes.forEach(function(id) {
        var el = document.getElementById(id);
        el.classList.remove('active');
        el.classList.add('complete');
      });
    },
  ];

  steps.forEach(function(fn, i) {
    setTimeout(fn, i * 400);
  });
}

// ==================== ANALYTICS ====================

function initAnalytics() {
  drawTVLChart();
  drawUtilChart();
  drawInteractiveRateChart();
  renderLeaderboards();
  setupParamSliders();
}

function generateTVLData() {
  var data = [];
  var base = 1800000;
  // Use a seeded-ish approach for consistency
  var seed = 42;
  for (var i = 0; i < 30; i++) {
    seed = (seed * 16807 + 0) % 2147483647;
    var rand = (seed / 2147483647) - 0.3;
    base += rand * 50000;
    if (base < 1500000) base = 1500000;
    data.push({ day: i + 1, value: Math.round(base) });
  }
  return data;
}

var tvlData = generateTVLData();

function drawTVLChart() {
  var canvas = document.getElementById('tvl-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  var cw = rect.width || 500;
  var ch = 280;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  ctx.scale(dpr, dpr);

  var pad = { top: 20, right: 20, bottom: 30, left: 60 };
  var plotW = cw - pad.left - pad.right;
  var plotH = ch - pad.top - pad.bottom;

  var values = tvlData.map(function(d) { return d.value; });
  var minV = Math.min.apply(null, values) * 0.95;
  var maxV = Math.max.apply(null, values) * 1.05;

  ctx.clearRect(0, 0, cw, ch);

  // Grid
  ctx.strokeStyle = '#1e2530';
  ctx.lineWidth = 0.5;
  var gi;
  for (gi = 0; gi <= 5; gi++) {
    var gy = pad.top + (gi / 5) * plotH;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(pad.left + plotW, gy); ctx.stroke();
    ctx.fillStyle = '#8b949e';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    var lbl = '$' + ((maxV - (gi / 5) * (maxV - minV)) / 1000000).toFixed(1) + 'M';
    ctx.fillText(lbl, pad.left - 8, gy + 4);
  }

  // Area fill
  ctx.beginPath();
  tvlData.forEach(function(d, i) {
    var x = pad.left + (i / (tvlData.length - 1)) * plotW;
    var y = pad.top + plotH - ((d.value - minV) / (maxV - minV)) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(230,0,122,0.1)';
  ctx.fill();

  // Line
  ctx.beginPath();
  tvlData.forEach(function(d, i) {
    var x = pad.left + (i / (tvlData.length - 1)) * plotW;
    var y = pad.top + plotH - ((d.value - minV) / (maxV - minV)) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#e6007a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // X labels
  ctx.fillStyle = '#8b949e';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  for (gi = 0; gi < 30; gi += 5) {
    var lx = pad.left + (gi / 29) * plotW;
    ctx.fillText('Day ' + (gi + 1), lx, ch - 8);
  }
}

function drawUtilChart() {
  var canvas = document.getElementById('util-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  var cw = rect.width || 500;
  var ch = 280;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  ctx.scale(dpr, dpr);

  var pad = { top: 20, right: 60, bottom: 20, left: 70 };
  var plotW = cw - pad.left - pad.right;

  var sorted = MARKETS.slice().sort(function(a, b) {
    return (b.borrows / b.deposits) - (a.borrows / a.deposits);
  });

  ctx.clearRect(0, 0, cw, ch);

  var barH = 35;
  var gap = 15;
  sorted.forEach(function(m, i) {
    var util = (m.borrows / m.deposits) * 100;
    var y = pad.top + i * (barH + gap);
    var barW = (util / 100) * plotW;

    // Bar
    ctx.fillStyle = utilColor(util);
    ctx.beginPath();
    roundRect(ctx, pad.left, y, barW, barH, 4);
    ctx.fill();

    // Token label
    ctx.fillStyle = '#e6edf3';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(m.token, pad.left - 10, y + barH / 2 + 4);

    // Percentage
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'left';
    ctx.fillText(util.toFixed(1) + '%', pad.left + barW + 8, y + barH / 2 + 4);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawInteractiveRateChart() {
  var base = parseFloat(document.getElementById('param-base').value);
  var s1 = parseFloat(document.getElementById('param-slope1').value);
  var s2 = parseFloat(document.getElementById('param-slope2').value);
  var kink = parseFloat(document.getElementById('param-kink').value);
  var canvas = document.getElementById('interactive-rate-chart');
  var rect = canvas.getBoundingClientRect();
  drawRateChart('interactive-rate-chart', rect.width || 800, 350, null, { base: base, slope1: s1, slope2: s2, kink: kink });
}

function setupParamSliders() {
  ['param-base', 'param-slope1', 'param-slope2', 'param-kink'].forEach(function(id) {
    var slider = document.getElementById(id);
    if (!slider) return;
    slider.oninput = function() {
      document.getElementById(id + '-val').textContent = slider.value + '%';
      drawInteractiveRateChart();
    };
  });

  var canvas = document.getElementById('interactive-rate-chart');
  if (!canvas) return;
  canvas.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var base = parseFloat(document.getElementById('param-base').value);
    var s1 = parseFloat(document.getElementById('param-slope1').value);
    var s2 = parseFloat(document.getElementById('param-slope2').value);
    var kink = parseFloat(document.getElementById('param-kink').value);
    drawRateChart('interactive-rate-chart', rect.width, 350, mx, { base: base, slope1: s1, slope2: s2, kink: kink });
  };
  canvas.onmouseleave = function() {
    drawInteractiveRateChart();
  };
}

function renderLeaderboards() {
  renderLeaderboard('top-depositors', TOP_DEPOSITORS);
  renderLeaderboard('top-borrowers', TOP_BORROWERS);
}

function renderLeaderboard(tbodyId, data) {
  var tbody = document.getElementById(tbodyId);
  clearChildren(tbody);
  data.forEach(function(d, i) {
    var row = document.createElement('tr');
    var rankTd = mkEl('td', String(i + 1));
    if (i === 0) rankTd.className = 'text-accent';
    rankTd.style.fontWeight = '700';
    row.appendChild(rankTd);
    appendTd(row, d.addr, 'text-mono');
    appendTd(row, '$' + fmtNum(d.amount));
    tbody.appendChild(row);
  });
  staggerRows(tbody);
}

// ==================== WALLET ====================

function connectWallet() {
  var btn = document.getElementById('connect-btn');
  if (btn.classList.contains('connected')) return;
  btn.textContent = '0x1a2b...3c4d';
  btn.classList.add('connected');
  showToast('Wallet connected', 'success');
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var page = this.getAttribute('data-page');
      window.location.hash = page;
    });
  });

  // Hamburger
  document.getElementById('hamburger').onclick = function() {
    document.getElementById('sidebar').classList.toggle('open');
  };

  // Connect wallet
  document.getElementById('connect-btn').onclick = connectWallet;

  // Rate chart hover on dashboard
  var rateCanvas = document.getElementById('rate-chart');
  if (rateCanvas) {
    rateCanvas.onmousemove = function(e) {
      var rect = rateCanvas.getBoundingClientRect();
      drawRateChart('rate-chart', rect.width, 300, e.clientX - rect.left, null);
    };
    rateCanvas.onmouseleave = function() {
      var rect = rateCanvas.getBoundingClientRect();
      drawRateChart('rate-chart', rect.width, 300, null, null);
    };
  }

  // Handle hash routing
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
});
