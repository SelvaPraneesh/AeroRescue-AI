'use strict';

/* ============================================================
   AeroRescue-AI — app.js
   Canvas rendering engine, controls, clock, JSON viewer
   ============================================================ */

// ── MISSION DATA ──────────────────────────────────────────────
const MISSION_PAYLOAD = {
  mission_id: "AERO-7-BRB-20261014",
  timestamp_utc: "2026-10-14T16:44:58Z",
  sector: "SECTOR 7 — Brahmagiri River Basin",
  bounding_box: [45.1000, -71.5000, 45.5000, -71.0000],
  pipeline_status: "COMPLETE",
  data_confidence: "HIGH",
  confidence_basis: "GeoJSON infrastructure features corroborated by SAR radar signatures",
  severed_routes: [
    {
      id: "SR-001",
      asset: "Sector 7 Primary Bridge",
      coordinates: { lat: 45.3000, lon: -71.2000 },
      damage_type: "STRUCTURAL_COLLAPSE",
      severity: "CRITICAL",
      impassability: "COMPLETE",
      pre_flood_status: "Intact — 200m span",
      post_flood_status: "Central span missing — pillars only",
      radar_confirmation: "CONFIRMED — Deck absent per SAR return",
      direction_blocked: "NORTH",
      restoration_timeline: "UNKNOWN — Structural engineering assessment required"
    },
    {
      id: "SR-002",
      asset: "Route 9 Highway",
      coordinates: { start: { lat: 45.4000, lon: -71.1000 }, end: { lat: 45.4300, lon: -71.1000 } },
      damage_type: "SUBMERSION",
      severity: "HIGH",
      water_depth_ft: 4,
      impassability: "COMPLETE_TERRESTRIAL",
      aquatic_viability: "PARTIAL — Shallow-draft craft at low speed, debris risk HIGH",
      radar_confirmation: "CONFIRMED — Continuous water surface SAR signature",
      direction_blocked: "EAST",
      forecast_note: "Depth expected to INCREASE with +12hr sustained rainfall"
    }
  ],
  isolated_communities: [
    {
      id: "IC-001",
      name: "Riverbend Neighborhood",
      center_coordinates: { lat: 45.4000, lon: -71.3000 },
      isolation_status: "TOTAL — 360° ENCIRCLEMENT CONFIRMED",
      boundary_analysis: {
        north: "SR-001 — Sector 7 Bridge COLLAPSED",
        east:  "SR-002 — Route 9 SUBMERGED (4ft)",
        west:  "Brahmagiri River — NATURALLY IMPASSABLE",
        south: "Brahmagiri River — NATURALLY IMPASSABLE"
      },
      affected_households: 250,
      estimated_population_range: "750–1000",
      topography_risk: "CRITICAL — Geographic basin concentrates runoff",
      active_sos_beacons: 1,
      total_distress_signals: 14,
      vulnerability_classification: "EXTREME"
    }
  ],
  priority_rescue_coordinates: [
    {
      priority_rank: 1,
      id: "PRC-001",
      location_name: "Riverbend Elementary School — Rooftop",
      coordinates: { lat: 45.4200, lon: -71.3100 },
      sos_source: "Mobile SOS Beacon — ACTIVE",
      confirmed_distress_signal_count: 14,
      rationale: "Active SOS beacon with confirmed civilian presence on elevated structure. Likely vulnerable population. Immediate life-safety threat. Highest extraction priority.",
      recommended_extraction_method: ["HELICOPTER_HOIST", "ROOFTOP_EXTRACTION"],
      lz_note: "Rooftop — Structural load capacity UNVERIFIED. Hoist operation preferred over direct landing.",
      urgency: "IMMEDIATE — EXECUTE NOW"
    },
    {
      priority_rank: 2,
      id: "PRC-002",
      location_name: "Riverbend Neighborhood — Residential Grid",
      coordinates: { lat: 45.4000, lon: -71.3000 },
      rationale: "~250 households in total isolation. Basin topography will accelerate rising flood depth over next 12 hours.",
      recommended_extraction_method: ["SHALLOW_DRAFT_BOAT_SWEEP", "AERIAL_SURVEY_PRECURSOR"],
      urgency: "HIGH — ESCALATING WITH EVERY RAINFALL HOUR"
    }
  ],
  deployment_recommendations: {
    ground_assets: {
      status: "STAND DOWN",
      detail: "All terrestrial routes confirmed impassable. No wheeled or tracked vehicle deployment authorized."
    },
    air_assets: {
      status: "AUTHORIZED — IFR CREWS REQUIRED",
      conditions: { visibility_miles: 2, wind_knots: 15, wind_direction: "NW", precipitation: "Heavy rain" },
      staging_lz: { location: "Community Center Parking Lot", coordinates: { lat: 45.4500, lon: -71.0500 }, status: "CONFIRMED CLEAR" },
      primary_tasking: "Rooftop hoist extraction — PRC-001 Riverbend Elementary School",
      secondary_tasking: "Aerial thermal/visual sweep of IC-001 residential grid"
    },
    water_assets: {
      status: "AUTHORIZED — EASTERN APPROACH CORRIDOR",
      ingress_coordinates: { lat: 45.4000, lon: -71.1000 },
      approach_vector: "East → West along Route 9 corridor, then NW into Riverbend residential grid",
      recommended_craft: "Airboat (preferred) or shallow-draft inflatable rescue vessel",
      hazard_warnings: ["Submerged vehicles and signage — debris field likely", "Current velocity unassessed", "Water depth may increase during operation"]
    },
    meteorological_advisory: {
      forecast_window: "+12 hours sustained rainfall",
      operational_implication: "CRITICAL — Basin runoff will compound flood depth inside IC-001.",
      recommended_action: "INITIATE ALL ASSETS IMMEDIATELY. Do not await weather improvement.",
      hard_deadline_estimate: "6–8 hours before conditions degrade to non-operational"
    },
    communications_directive: {
      priority_action: "ESTABLISH RADIO CONTACT WITH SOS BEACON AT PRC-001",
      beacon_coordinates: { lat: 45.4200, lon: -71.3100 },
      intel_required: ["Total civilian count on rooftop", "Medical emergencies present", "Structural condition of roof", "Water level at building base"]
    }
  }
};

// ── MAP NODES ─────────────────────────────────────────────────
const NODES = [
  { id: 'staging',    label: 'Staging Area (Parking Lot)',  lat: 45.45,  lon: -71.05,  color: '#00ff9d', size: 7,  type: 'lz' },
  { id: 'route9',     label: 'Route 9 Junction',             lat: 45.40,  lon: -71.10,  color: '#00e5ff', size: 6,  type: 'junction' },
  { id: 'elementary', label: 'Elementary School (SOS)',       lat: 45.42,  lon: -71.31,  color: '#ff3b30', size: 9,  type: 'sos' },
  { id: 'riverbend',  label: 'Riverbend Crossing',            lat: 45.395, lon: -71.295, color: '#4db8ff', size: 6,  type: 'zone' },
  { id: 'bridge',     label: 'Sector 7 Bridge',               lat: 45.30,  lon: -71.20,  color: '#ff3b30', size: 6,  type: 'destroyed' },
];

// ── ROUTES ────────────────────────────────────────────────────
// Each route: from/to node ids + viability function per asset at a given water level
const ROUTES = [
  {
    from: 'staging', to: 'route9',
    ground: wl => wl === 0 ? 'safe' : wl <= 3 ? 'marginal' : 'impassable',
    boat:   wl => wl >= 1 ? 'safe' : 'impassable',
    heli:   ()  => 'safe'
  },
  {
    from: 'route9', to: 'elementary',
    ground: wl => wl <= 1 ? 'marginal' : 'impassable',
    boat:   wl => wl >= 2 && wl <= 8 ? 'marginal' : 'impassable',
    heli:   ()  => 'safe'
  },
  {
    from: 'elementary', to: 'riverbend',
    ground: wl => wl === 0 ? 'safe' : 'impassable',
    boat:   wl => wl >= 1 && wl <= 7 ? 'marginal' : 'impassable',
    heli:   ()  => 'safe'
  },
  {
    from: 'riverbend', to: 'bridge',
    ground: ()  => 'impassable',
    boat:   ()  => 'impassable',
    heli:   ()  => 'safe'
  },
  {
    from: 'bridge', to: 'route9',
    ground: ()  => 'impassable',
    boat:   ()  => 'impassable',
    heli:   ()  => 'safe'
  },
  {
    from: 'staging', to: 'riverbend',
    ground: wl => wl === 0 ? 'safe' : wl <= 2 ? 'marginal' : 'impassable',
    boat:   wl => wl >= 1 ? 'marginal' : 'impassable',
    heli:   ()  => 'safe'
  },
];

// ── STATE ─────────────────────────────────────────────────────
let currentAsset = 'ground';
let currentWaterLevel = 4.0;
let scanAngle = 0;
let floodT = 0;
let animId = null;

// ── CANVAS ────────────────────────────────────────────────────
const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');

const BBOX = { latMin: 45.10, latMax: 45.50, lonMin: -71.50, lonMax: -71.00 };
const PAD = 42;

function geoToCanvas(lat, lon) {
  const W = canvas.width, H = canvas.height;
  const x = PAD + ((lon - BBOX.lonMin) / (BBOX.lonMax - BBOX.lonMin)) * (W - PAD * 2);
  const y = PAD + ((BBOX.latMax - lat) / (BBOX.latMax - BBOX.latMin)) * (H - PAD * 2);
  return { x, y };
}

function getPositions() {
  const pos = {};
  NODES.forEach(n => { pos[n.id] = geoToCanvas(n.lat, n.lon); });
  return pos;
}

function routeStatus(route) {
  const wl = currentWaterLevel;
  if (currentAsset === 'ground') return route.ground(wl);
  if (currentAsset === 'boat')   return route.boat(wl);
  return route.heli(wl);
}

function statusColor(s) {
  return s === 'safe' ? '#4db8ff' : s === 'marginal' ? '#ffb300' : '#ff3b30';
}

// ── DRAW ──────────────────────────────────────────────────────
function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pos = getPositions();

  drawGrid(W, H);
  drawFloodZone(pos, W, H);
  drawRiverBanks(pos, W, H);
  ROUTES.forEach(r => drawRoute(pos[r.from], pos[r.to], routeStatus(r), r));
  if (currentAsset === 'helicopter') drawHelicopterArc(pos);
  NODES.forEach(n => drawNode(pos[n.id], n));
  drawRadar(W, H);
  drawCornerLabels(W, H);

  floodT += 0.025;
  scanAngle += 0.006;
  animId = requestAnimationFrame(draw);
}

function drawGrid(W, H) {
  ctx.strokeStyle = 'rgba(0,90,180,0.055)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function drawFloodZone(pos, W, H) {
  const el = pos.elementary, rb = pos.riverbend, br = pos.bridge, r9 = pos.route9;
  const pulse = Math.sin(floodT) * 0.08 + 0.28;

  // Main flood polygon
  ctx.beginPath();
  ctx.moveTo(el.x - 35, el.y - 25);
  ctx.lineTo(el.x + 10,  el.y + 22);
  ctx.lineTo(rb.x + 5,   rb.y + 32);
  ctx.lineTo(br.x - 5,   br.y + 18);
  ctx.lineTo(br.x + 28,  br.y);
  ctx.lineTo(r9.x - 8,   r9.y + 24);
  ctx.lineTo(r9.x - 35,  r9.y - 18);
  ctx.lineTo(el.x - 12,  el.y + 10);
  ctx.closePath();

  const cx = (el.x + rb.x + br.x) / 3;
  const cy = (el.y + rb.y + br.y) / 3;
  const gr = ctx.createRadialGradient(cx, cy, 8, cx, cy, 130);
  gr.addColorStop(0, `rgba(0,110,220,${pulse})`);
  gr.addColorStop(1, `rgba(0,55,170,${pulse * 0.28})`);
  ctx.fillStyle = gr;
  ctx.fill();

  ctx.strokeStyle = `rgba(0,160,255,${0.28 + Math.sin(floodT) * 0.1})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Flood label
  ctx.font = '500 10px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(0,190,255,0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('◈ FLOOD ZONE', cx, cy + 22);
  ctx.textAlign = 'left';
}

function drawRiverBanks(pos, W, H) {
  // Stylised river running west and south of the flood zone
  ctx.strokeStyle = 'rgba(0,100,200,0.22)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);
  const el = pos.elementary, br = pos.bridge;

  // West bank
  ctx.beginPath();
  ctx.moveTo(el.x - 55, 0);
  ctx.quadraticCurveTo(el.x - 50, H * 0.4, br.x - 60, H);
  ctx.stroke();

  // South bank
  ctx.beginPath();
  ctx.moveTo(0, br.y + 40);
  ctx.quadraticCurveTo(W * 0.4, br.y + 30, br.x + 20, H);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.lineCap = 'butt';
}

function drawRoute(from, to, status, route) {
  if (!from || !to) return;
  const color = statusColor(status);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  ctx.lineWidth = status === 'impassable' ? 2 : 2.8;
  ctx.strokeStyle = color;
  ctx.setLineDash(status === 'impassable' ? [7, 5] : []);
  ctx.shadowColor = status === 'safe' ? color : 'transparent';
  ctx.shadowBlur  = status === 'safe' ? 8 : 0;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
}

function drawHelicopterArc(pos) {
  const s = pos.staging, e = pos.elementary;
  const mx = (s.x + e.x) / 2, my = Math.min(s.y, e.y) - 50;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.quadraticCurveTo(mx, my, e.x, e.y);
  ctx.strokeStyle = 'rgba(0,255,157,0.75)';
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 5]);
  ctx.shadowColor = '#00ff9d';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  ctx.font = '600 10px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(0,255,157,0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('🚁 AERIAL ROUTE', mx, my - 10);
  ctx.textAlign = 'left';

  // Boat route arrow along Route 9
  const r9 = pos.route9, el = pos.elementary;
  ctx.beginPath();
  ctx.moveTo(r9.x, r9.y);
  ctx.lineTo(el.x, el.y);
  ctx.strokeStyle = 'rgba(0,229,255,0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawNode(p, node) {
  if (!p) return;
  const isSOS  = node.type === 'sos';
  const isDestroyed = node.type === 'destroyed';

  // Pulse rings for SOS
  if (isSOS) {
    [16, 24, 32].forEach((r, i) => {
      const t = (floodT * 1.8 + i * 0.8) % (Math.PI * 2);
      const opacity = Math.max(0, 0.7 - t / 4 - i * 0.15);
      ctx.beginPath();
      ctx.arc(p.x, p.y, node.size + r * (0.5 + Math.abs(Math.sin(floodT + i))), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,59,48,${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Main dot
  ctx.beginPath();
  ctx.arc(p.x, p.y, node.size, 0, Math.PI * 2);
  ctx.fillStyle = node.color;
  ctx.shadowColor = node.color;
  ctx.shadowBlur = isSOS ? 18 : 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Destroyed X
  if (isDestroyed) {
    const d = node.size + 5;
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = node.color; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(p.x - d, p.y - d); ctx.lineTo(p.x + d, p.y + d); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x + d, p.y - d); ctx.lineTo(p.x - d, p.y + d); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Label background
  const labelX = p.x + node.size + 7;
  const labelY = p.y + 4;
  ctx.font = '600 11px Outfit, sans-serif';
  const tw = ctx.measureText(node.label).width;
  ctx.fillStyle = 'rgba(6,10,18,0.72)';
  ctx.fillRect(labelX - 2, labelY - 12, tw + 6, 16);

  ctx.fillStyle = 'rgba(232,238,248,0.95)';
  ctx.fillText(node.label, labelX, labelY);

  // SOS badge
  if (isSOS) {
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ SOS × 14', p.x, p.y + node.size + 15);
    ctx.textAlign = 'left';
  }
}

function drawRadar(W, H) {
  const cx = W * 0.58, cy = H * 0.38;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(scanAngle);
  const sweep = ctx.createLinearGradient(0, 0, Math.max(W, H) * 0.7, 0);
  sweep.addColorStop(0, 'rgba(0,229,255,0.10)');
  sweep.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, Math.max(W, H) * 0.75, -0.18, 0.18);
  ctx.closePath();
  ctx.fillStyle = sweep;
  ctx.fill();
  ctx.restore();
}

function drawCornerLabels(W, H) {
  ctx.font = '400 9.5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(74,96,128,0.6)';
  ctx.textAlign = 'left';
  ctx.fillText('45.50°N / 71.50°W', 6, 14);
  ctx.textAlign = 'right';
  ctx.fillText('45.10°N / 71.00°W', W - 6, H - 6);
  ctx.textAlign = 'right';
  ctx.font = '500 9.5px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(0,255,157,0.45)';
  ctx.fillText('▲ CONFIDENCE: HIGH', W - 6, 14);
  ctx.textAlign = 'left';
}

// ── CANVAS RESIZE ─────────────────────────────────────────────
function resizeCanvas() {
  const c = document.getElementById('canvas-container');
  const rect = c.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
}

const ro = new ResizeObserver(() => { resizeCanvas(); });
ro.observe(document.getElementById('canvas-container'));

// ── CONTROLS ──────────────────────────────────────────────────
function setAsset(type) {
  currentAsset = type;
  const map = { ground: 'btn-ground', boat: 'btn-boat', helicopter: 'btn-heli' };
  document.querySelectorAll('.asset-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(map[type]).classList.add('active');

  const labels = { ground: 'Ground Vehicle', boat: 'Shallow Boat', helicopter: 'Helicopter' };
  document.getElementById('active-asset-lbl').textContent = labels[type];
  refreshRouteStatus();
}

function setWaterLevel(val) {
  currentWaterLevel = parseFloat(val);
  const display = parseFloat(val).toFixed(1) + ' ft';
  document.getElementById('slider-val-display').textContent = display;
  document.getElementById('flood-depth-lbl').textContent = display;

  // Recolour slider track
  const slider = document.getElementById('water-slider');
  const pct = (currentWaterLevel / 10) * 100;
  const trackColor = currentWaterLevel >= 7 ? '#ff3b30' : currentWaterLevel >= 4 ? '#ffb300' : '#00aaff';
  slider.style.background = `linear-gradient(90deg, ${trackColor} ${pct}%, rgba(0,168,255,0.18) ${pct}%)`;

  refreshRouteStatus();
}

function refreshRouteStatus() {
  const statuses = ROUTES.map(r => routeStatus(r));
  const safe = statuses.filter(s => s === 'safe').length;
  const marg = statuses.filter(s => s === 'marginal').length;

  let txt, cls;
  if (safe >= 4)       { txt = 'Multiple Paths'; cls = ''; }
  else if (safe >= 2)  { txt = 'Two Paths';      cls = ''; }
  else if (safe >= 1)  { txt = 'Single Path';    cls = 'warn'; }
  else if (marg >= 1)  { txt = 'Marginal Only';  cls = 'warn'; }
  else                 { txt = 'NO ROUTES';      cls = 'crit'; }

  const el = document.getElementById('route-status-lbl');
  el.textContent = txt;
  el.className = 'ms-val ' + cls;
}

// ── JSON VIEWER ───────────────────────────────────────────────
function syntaxHighlight(json) {
  return JSON.stringify(json, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      m => {
        if (/^"/.test(m)) return /:$/.test(m) ? `<span class="jk">${m}</span>` : `<span class="js">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="jb">${m}</span>`;
        if (/null/.test(m))  return `<span class="jl">${m}</span>`;
        return `<span class="jn">${m}</span>`;
      }
    );
}

function toggleJSON() {
  const sec = document.getElementById('json-section');
  const btn = document.getElementById('json-expand-btn');
  sec.classList.toggle('expanded');
  btn.textContent = sec.classList.contains('expanded') ? '▲ COLLAPSE' : '▼ EXPAND';
}

// ── CLOCK ─────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  document.getElementById('live-clock').textContent = `${h}:${m}:${s}`;

  // Countdown: 6h from mission start
  const missionStart = new Date('2026-10-14T16:44:58Z');
  const deadline = new Date(missionStart.getTime() + 6 * 3600 * 1000);
  const remaining = deadline - now;

  const el = document.getElementById('rescue-deadline');
  if (remaining > 0) {
    const rh = Math.floor(remaining / 3600000);
    const rm = Math.floor((remaining % 3600000) / 60000);
    const rs = Math.floor((remaining % 60000) / 1000);
    el.textContent = `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}:${String(rs).padStart(2,'0')}`;
    el.style.color = '';
  } else {
    el.textContent = 'EXPIRED';
    el.style.color = '#ff3b30';
  }
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  resizeCanvas();

  // JSON viewer
  document.getElementById('json-output').innerHTML = syntaxHighlight(MISSION_PAYLOAD);

  // Start draw loop
  if (animId) cancelAnimationFrame(animId);
  draw();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Initial slider gradient
  setWaterLevel(4.0);
  refreshRouteStatus();
}

window.addEventListener('load', init);
