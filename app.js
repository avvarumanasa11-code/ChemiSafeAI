// ChemSafeAI - Core Application Logic & Emergency Ops Engine

// Application Global State
const ChemSafeState = {
  mode: "normal", // 'normal' | 'warning' | 'critical'
  activeTab: "dashboard",
  sosActive: false,
  soundMuted: false,
  selectedChemicalId: "chlorine",
  wind: {
    speedKmh: 14,
    direction: "SE",
    degrees: 135,
    tempC: 28,
    humidity: 64
  },
  sensorReadings: {
    "S-101": 0.3,   // Cl2
    "S-204": 8.5,   // NH3
    "S-309": 0.1,   // Benzene
    "S-412": 1.2,   // H2S
    "S-500": 0.02,  // HQ Ambient
    "S-EXT-1": 0.01 // Community School
  },
  workerAccountability: {
    total: 142,
    evacuated: 142,
    atRisk: 0,
    hospitalized: 0
  },
  checklistStatus: {
    scrubberChecked: true,
    scbaInspected: true,
    sensorCalibrated: true,
    waterCurtainReady: true,
    evacRoutesClear: true,
    antidoteStocked: true
  },
  alerts: [
    {
      id: 1,
      time: "Just now",
      type: "safe",
      zone: "Sector A - Storage",
      message: "Chlorine sensor S-101 baseline nominal: 0.3 ppm (Safe threshold < 0.5 ppm).",
      indicator: "green"
    },
    {
      id: 2,
      time: "4 mins ago",
      type: "info",
      zone: "Weather Station",
      message: "Atmospheric inversion index: Moderate. Wind vector stable at 14 km/h SE.",
      indicator: "blue"
    },
    {
      id: 3,
      time: "18 mins ago",
      type: "safe",
      zone: "Plant Perimeter",
      message: "Secondary containment automated gate test completed with 100% seal integrity.",
      indicator: "green"
    }
  ]
};

// Web Audio API Emergency Siren & Sound Generator
class SoundManager {
  constructor() {
    this.ctx = null;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.isPlayingSiren = false;
    this.sirenTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playChime(type = "alert") {
    if (ChemSafeState.soundMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      if (type === "alert") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("Audio playback not permitted yet", e);
    }
  }

  startEmergencySiren() {
    if (ChemSafeState.soundMuted) return;
    this.init();
    if (!this.ctx || this.isPlayingSiren) return;

    try {
      this.isPlayingSiren = true;
      this.sirenOsc1 = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc1.type = "sawtooth";
      this.sirenGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      let high = true;
      const togglePitch = () => {
        if (!this.isPlayingSiren || !this.ctx) return;
        const now = this.ctx.currentTime;
        const targetFreq = high ? 960 : 640;
        this.sirenOsc1.frequency.setTargetAtTime(targetFreq, now, 0.22);
        high = !high;
      };

      this.sirenOsc1.frequency.setValueAtTime(640, this.ctx.currentTime);
      this.sirenOsc1.start();
      this.sirenTimer = setInterval(togglePitch, 600);
    } catch (e) {
      console.warn("Siren start error", e);
    }
  }

  stopEmergencySiren() {
    this.isPlayingSiren = false;
    if (this.sirenTimer) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenOsc1) {
      try {
        this.sirenOsc1.stop();
        this.sirenOsc1.disconnect();
      } catch (e) {}
      this.sirenOsc1 = null;
    }
  }
}

const soundManager = new SoundManager();

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  setupNavigation();
  setupScenarioButtons();
  setupSosButton();
  setupMuteToggle();
  setupChemicalsView();
  setupAICopilot();
  setupMapSimulation();
  setupBeforeChecklist();
  updateDashboardUI();
  setupLiveSensorTicker();
  window.addEventListener("resize", () => renderInteractiveMap());
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Navigation Handling
function setupNavigation() {
  const navBtns = document.querySelectorAll("[data-nav-target]");
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav-target");
      switchTab(target);
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNavMenu = document.getElementById("mobileNavMenu");
  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNavMenu.classList.toggle("hidden");
    });
  }
}

function switchTab(tabId) {
  ChemSafeState.activeTab = tabId;
  const sections = document.querySelectorAll(".app-section");
  sections.forEach((sec) => sec.classList.add("hidden"));

  const targetSec = document.getElementById(`section-${tabId}`);
  if (targetSec) {
    targetSec.classList.remove("hidden");
  }

  // Update Nav Button Styles
  const navBtns = document.querySelectorAll("[data-nav-target]");
  navBtns.forEach((btn) => {
    if (btn.getAttribute("data-nav-target") === tabId) {
      btn.classList.add("bg-slate-800", "text-sky-400", "border-sky-500");
      btn.classList.remove("text-slate-300", "border-transparent");
    } else {
      btn.classList.remove("bg-slate-800", "text-sky-400", "border-sky-500");
      btn.classList.add("text-slate-300", "border-transparent");
    }
  });

  // Close mobile nav if open
  const mobileNavMenu = document.getElementById("mobileNavMenu");
  if (mobileNavMenu) mobileNavMenu.classList.add("hidden");

  // Re-trigger map sizing or icons if needed
  if (tabId === "map") {
    setTimeout(renderInteractiveMap, 50);
  }
  initLucideIcons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Emergency Scenarios Controller
function setupScenarioButtons() {
  const btnNormal = document.getElementById("btnScenarioNormal");
  const btnWarning = document.getElementById("btnScenarioWarning");
  const btnCritical = document.getElementById("btnScenarioCritical");

  if (btnNormal) {
    btnNormal.addEventListener("click", () => triggerScenario("normal"));
  }
  if (btnWarning) {
    btnWarning.addEventListener("click", () => triggerScenario("warning"));
  }
  if (btnCritical) {
    btnCritical.addEventListener("click", () => triggerScenario("critical"));
  }
}

function triggerScenario(mode) {
  ChemSafeState.mode = mode;
  soundManager.playChime(mode === "normal" ? "success" : "alert");

  if (mode === "normal") {
    ChemSafeState.sosActive = false;
    soundManager.stopEmergencySiren();
    ChemSafeState.sensorReadings["S-101"] = 0.3; // Chlorine nominal
    ChemSafeState.sensorReadings["S-204"] = 8.5; // Ammonia nominal
    ChemSafeState.sensorReadings["S-412"] = 1.2;
    ChemSafeState.workerAccountability.atRisk = 0;
    ChemSafeState.workerAccountability.evacuated = 142;

    addAlert({
      type: "safe",
      zone: "Central Command",
      message: "SYSTEM RESTORED: All sensors nominal. Atmospheric ppm levels well below PEL.",
      indicator: "green"
    });
  } else if (mode === "warning") {
    ChemSafeState.sosActive = false;
    soundManager.stopEmergencySiren();
    ChemSafeState.sensorReadings["S-204"] = 68.4; // Ammonia leak
    ChemSafeState.sensorReadings["S-101"] = 0.4;
    ChemSafeState.workerAccountability.atRisk = 12;
    ChemSafeState.workerAccountability.evacuated = 130;

    addAlert({
      type: "warning",
      zone: "Sector B - Ammonia Chiller Flange",
      message: "ELEVATED VAPOR DETECTED: Ammonia concentration 68.4 ppm exceeding 50 ppm PEL. Automated water spray primed.",
      indicator: "amber"
    });
  } else if (mode === "critical") {
    ChemSafeState.sosActive = true;
    soundManager.startEmergencySiren();
    ChemSafeState.sensorReadings["S-101"] = 28.7; // Chlorine catastrophic rupture! IDLH is 10 ppm
    ChemSafeState.sensorReadings["S-204"] = 14.2;
    ChemSafeState.sensorReadings["S-EXT-1"] = 0.85; // Leak reaching perimeter
    ChemSafeState.workerAccountability.atRisk = 32;
    ChemSafeState.workerAccountability.evacuated = 110;

    addAlert({
      type: "critical",
      zone: "Sector A - Chlorine Tank #3 Rupture",
      message: "CRITICAL GAS LEAK: Chlorine levels 28.7 ppm (2.8x IDLH). Wind carrying toxic plume SE towards Highway 14 and West Residential Zone!",
      indicator: "red"
    });
  }

  updateDashboardUI();
  renderInteractiveMap();
  initLucideIcons();
}

// One-Click SOS Emergency Button
function setupSosButton() {
  const sosButtons = document.querySelectorAll(".btn-trigger-sos");
  const sosModal = document.getElementById("sosModal");
  const cancelSosBtn = document.getElementById("cancelSosModal");
  const confirmSosBtn = document.getElementById("confirmSosAction");
  const stopSirenBtn = document.getElementById("stopSirenBtn");

  sosButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (sosModal) sosModal.classList.remove("hidden");
    });
  });

  if (cancelSosBtn && sosModal) {
    cancelSosBtn.addEventListener("click", () => {
      sosModal.classList.add("hidden");
    });
  }

  if (confirmSosBtn && sosModal) {
    confirmSosBtn.addEventListener("click", () => {
      sosModal.classList.add("hidden");
      triggerScenario("critical");
      switchTab("during");
    });
  }

  if (stopSirenBtn) {
    stopSirenBtn.addEventListener("click", () => {
      soundManager.stopEmergencySiren();
      ChemSafeState.sosActive = false;
      const sirenBanner = document.getElementById("emergencySirenBanner");
      if (sirenBanner) sirenBanner.classList.add("hidden");
    });
  }
}

// Sound Mute Toggle
function setupMuteToggle() {
  const muteBtns = document.querySelectorAll(".btn-toggle-sound");
  muteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      ChemSafeState.soundMuted = !ChemSafeState.soundMuted;
      if (ChemSafeState.soundMuted) {
        soundManager.stopEmergencySiren();
      } else if (ChemSafeState.mode === "critical") {
        soundManager.startEmergencySiren();
      }
      updateSoundIcons();
    });
  });
}

function updateSoundIcons() {
  const muteBtns = document.querySelectorAll(".btn-toggle-sound");
  muteBtns.forEach((btn) => {
    if (ChemSafeState.soundMuted) {
      btn.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4 text-rose-400"></i><span class="text-xs text-rose-400">Muted</span>`;
    } else {
      btn.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i><span class="text-xs text-emerald-400">Audio On</span>`;
    }
  });
  initLucideIcons();
}

// Add real-time alerts
function addAlert(alertObj) {
  const newAlert = {
    id: Date.now(),
    time: "Just now",
    ...alertObj
  };
  ChemSafeState.alerts.unshift(newAlert);
  if (ChemSafeState.alerts.length > 8) {
    ChemSafeState.alerts.pop();
  }
  renderAlertsFeed();
}

function renderAlertsFeed() {
  const container = document.getElementById("alertsFeedContainer");
  if (!container) return;

  container.innerHTML = ChemSafeState.alerts
    .map((alert) => {
      let badgeClass = "indicator-green";
      let icon = "check-circle-2";
      if (alert.indicator === "red") {
        badgeClass = "indicator-red";
        icon = "alert-triangle";
      } else if (alert.indicator === "amber") {
        badgeClass = "indicator-amber";
        icon = "alert-circle";
      } else if (alert.indicator === "blue") {
        badgeClass = "indicator-blue";
        icon = "info";
      }

      return `
      <div class="p-3 rounded-lg border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/80 transition-all flex items-start gap-3">
        <div class="mt-0.5">
          <i data-lucide="${icon}" class="w-5 h-5 ${alert.indicator === 'red' ? 'text-red-400 animate-pulse' : alert.indicator === 'amber' ? 'text-amber-400' : alert.indicator === 'blue' ? 'text-sky-400' : 'text-emerald-400'}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-semibold text-slate-200 truncate">${alert.zone}</span>
            <span class="text-[10px] text-slate-400 shrink-0">${alert.time}</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${alert.message}</p>
        </div>
        <div>
          <span class="indicator-pill ${badgeClass}">${alert.indicator.toUpperCase()}</span>
        </div>
      </div>
    `;
    })
    .join("");

  initLucideIcons();
}

// Live Sensor Telemetry Background Jitter
function setupLiveSensorTicker() {
  setInterval(() => {
    // Slight realistic sensor reading jitter
    if (ChemSafeState.mode === "normal") {
      ChemSafeState.sensorReadings["S-101"] = +(0.28 + Math.random() * 0.08).toFixed(2);
      ChemSafeState.sensorReadings["S-204"] = +(8.2 + Math.random() * 0.6).toFixed(1);
      ChemSafeState.sensorReadings["S-309"] = +(0.08 + Math.random() * 0.04).toFixed(2);
      ChemSafeState.sensorReadings["S-412"] = +(1.1 + Math.random() * 0.2).toFixed(1);
    } else if (ChemSafeState.mode === "warning") {
      ChemSafeState.sensorReadings["S-204"] = +(67.0 + Math.random() * 3.5).toFixed(1);
    } else if (ChemSafeState.mode === "critical") {
      ChemSafeState.sensorReadings["S-101"] = +(28.0 + Math.random() * 2.8).toFixed(1);
      ChemSafeState.sensorReadings["S-EXT-1"] = +(0.8 + Math.random() * 0.15).toFixed(2);
    }
    updateTelemetryCards();
  }, 3500);
}

function updateTelemetryCards() {
  const cl2Val = document.getElementById("valSensorCl2");
  const nh3Val = document.getElementById("valSensorNh3");
  const c6h6Val = document.getElementById("valSensorC6h6");
  const h2sVal = document.getElementById("valSensorH2s");

  if (cl2Val) cl2Val.innerText = ChemSafeState.sensorReadings["S-101"] + " ppm";
  if (nh3Val) nh3Val.innerText = ChemSafeState.sensorReadings["S-204"] + " ppm";
  if (c6h6Val) c6h6Val.innerText = ChemSafeState.sensorReadings["S-309"] + " ppm";
  if (h2sVal) h2sVal.innerText = ChemSafeState.sensorReadings["S-412"] + " ppm";
}

// Master Dashboard UI Sync
function updateDashboardUI() {
  const statusBadge = document.getElementById("masterStatusBadge");
  const bannerAlert = document.getElementById("emergencySirenBanner");
  const activeIncidentHeader = document.getElementById("activeIncidentHeader");

  // Mode based UI
  if (ChemSafeState.mode === "normal") {
    if (statusBadge) {
      statusBadge.className = "indicator-pill indicator-green";
      statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> ALL SYSTEMS SECURE - NOMINAL`;
    }
    if (bannerAlert) bannerAlert.classList.add("hidden");
    if (activeIncidentHeader) {
      activeIncidentHeader.innerText = "Current Plant State: Baseline Secure (Continuous Monitoring)";
      activeIncidentHeader.className = "text-emerald-400 text-sm font-medium";
    }
  } else if (ChemSafeState.mode === "warning") {
    if (statusBadge) {
      statusBadge.className = "indicator-pill indicator-amber";
      statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> LEVEL 1 WARNING - NH₃ ELEVATION`;
    }
    if (bannerAlert) {
      bannerAlert.classList.remove("hidden");
      bannerAlert.className = "p-3 bg-amber-950/80 border border-amber-600 text-amber-200 flex items-center justify-between";
      bannerAlert.innerHTML = `
        <div class="flex items-center gap-3">
          <i data-lucide="alert-triangle" class="w-6 h-6 text-amber-400"></i>
          <div>
            <p class="font-bold text-sm">SECTOR B: Ammonia Leak Detected (68.4 ppm)</p>
            <p class="text-xs text-amber-300/80">Ventilation scrubbers engaged. Workers ordered to don Level C escape respirators.</p>
          </div>
        </div>
        <button onclick="switchTab('during')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold">View Action Protocol</button>
      `;
    }
  } else if (ChemSafeState.mode === "critical") {
    if (statusBadge) {
      statusBadge.className = "indicator-pill indicator-red animate-emergency-pulse";
      statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> HAZMAT LEVEL 3 EMERGENCY - ACTIVE GAS LEAK`;
    }
    if (bannerAlert) {
      bannerAlert.classList.remove("hidden");
      bannerAlert.className = "p-3 active-siren-strobe border-2 border-red-500 text-white flex items-center justify-between shadow-2xl";
      bannerAlert.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="p-2 bg-red-600 rounded-full animate-bounce"><i data-lucide="siren" class="w-6 h-6 text-white"></i></span>
          <div>
            <p class="font-black text-sm tracking-wide text-red-100 uppercase">CATASROPHIC TOXIC GAS BREACH: CHLORINE (28.7 PPM)</p>
            <p class="text-xs text-red-200">Wind SE @ 14 km/h carrying plume toward Highway 14. Initial 1.6 km downwind evacuation active!</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="stopSirenBtn" onclick="soundManager.stopEmergencySiren()" class="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-200 rounded text-xs font-semibold border border-slate-700">Mute Siren</button>
          <button onclick="switchTab('during')" class="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold shadow-lg animate-pulse">Execute Protocol</button>
        </div>
      `;
    }
  }

  // Update Headcount & Metrics
  const totalElem = document.getElementById("headcountTotal");
  const evacElem = document.getElementById("headcountEvacuated");
  const riskElem = document.getElementById("headcountAtRisk");
  if (totalElem) totalElem.innerText = ChemSafeState.workerAccountability.total;
  if (evacElem) evacElem.innerText = ChemSafeState.workerAccountability.evacuated;
  if (riskElem) {
    riskElem.innerText = ChemSafeState.workerAccountability.atRisk;
    riskElem.className = ChemSafeState.workerAccountability.atRisk > 0 ? "text-2xl font-bold text-red-400" : "text-2xl font-bold text-emerald-400";
  }

  renderAlertsFeed();
  updateTelemetryCards();
  renderInteractiveMap();
  initLucideIcons();
}

// Chemical Directory Component
function setupChemicalsView() {
  renderChemicalGrid();
  selectChemical(ChemSafeState.selectedChemicalId);

  const searchInput = document.getElementById("chemicalSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      renderChemicalGrid(q);
    });
  }
}

function renderChemicalGrid(filter = "") {
  const grid = document.getElementById("chemicalCardsGrid");
  if (!grid) return;

  const filtered = CHEMICAL_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(filter) ||
      c.formula.toLowerCase().includes(filter) ||
      c.cas.includes(filter)
  );

  grid.innerHTML = filtered
    .map((chem) => {
      const isSelected = chem.id === ChemSafeState.selectedChemicalId;
      const borderClass = isSelected ? "border-sky-500 bg-slate-800/90 ring-2 ring-sky-500/30" : "border-slate-700/80 bg-slate-900/80 hover:border-slate-500";

      return `
      <div onclick="selectChemical('${chem.id}')" class="cursor-pointer p-4 rounded-xl border ${borderClass} transition-all">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-white text-base">${chem.name}</h4>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300">${chem.formula}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">CAS: ${chem.cas} | ${chem.unNumber}</p>
          </div>
          <span class="indicator-pill ${chem.dangerLevel === 'critical' ? 'indicator-red' : 'indicator-amber'}">
            ${chem.dangerLevel === 'critical' ? 'POISON GAS' : 'HAZMAT'}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-2.5">
          <div>
            <span class="text-slate-400">IDLH:</span>
            <span class="font-semibold text-rose-400">${chem.idlh}</span>
          </div>
          <div>
            <span class="text-slate-400">Vapor Density:</span>
            <span class="font-semibold text-amber-300">${chem.vaporDensity} (${chem.vaporDensity > 1 ? 'Heavy/Sinks' : 'Light/Rises'})</span>
          </div>
          <div>
            <span class="text-slate-400">PEL:</span>
            <span class="font-semibold text-emerald-300">${chem.pel}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function selectChemical(id) {
  ChemSafeState.selectedChemicalId = id;
  const chem = CHEMICAL_DATABASE.find((c) => c.id === id);
  if (!chem) return;

  renderChemicalGrid(); // re-render cards for active highlight

  const detailsContainer = document.getElementById("chemicalDetailView");
  if (!detailsContainer) return;

  detailsContainer.innerHTML = `
    <div class="p-6 rounded-2xl border border-slate-700 bg-slate-900/95 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black text-white">${chem.name}</h3>
            <span class="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 text-sm font-mono font-bold">${chem.formula}</span>
            <span class="indicator-pill ${chem.dangerLevel === 'critical' ? 'indicator-red' : 'indicator-amber'}">${chem.hazmatClass}</span>
          </div>
          <p class="text-sm text-slate-400 mt-1.5">${chem.riskSummary}</p>
        </div>

        <!-- NFPA 704 Diamond -->
        <div class="shrink-0 flex flex-col items-center">
          <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NFPA 704</div>
          <div class="nfpa-diamond-container">
            <div class="nfpa-quadrant nfpa-health"><span>${chem.nfpa.health}</span></div>
            <div class="nfpa-quadrant nfpa-flammability"><span>${chem.nfpa.flammability}</span></div>
            <div class="nfpa-quadrant nfpa-instability"><span>${chem.nfpa.instability}</span></div>
            <div class="nfpa-quadrant nfpa-special"><span>${chem.nfpa.special || '-'}</span></div>
          </div>
          <div class="text-[9px] text-slate-400 text-center font-mono mt-2">
            H:Health | F:Flamm | I:Instab
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70">
          <span class="text-xs text-slate-400">IDLH Limit</span>
          <p class="text-lg font-bold text-red-400">${chem.idlh}</p>
          <span class="text-[10px] text-slate-500">Immed. Dangerous to Life/Health</span>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70">
          <span class="text-xs text-slate-400">Vapor Density (Air=1.0)</span>
          <p class="text-lg font-bold ${chem.vaporDensity > 1 ? 'text-amber-400' : 'text-cyan-400'}">${chem.vaporDensity}</p>
          <span class="text-[10px] text-slate-500">${chem.vaporDensity > 1 ? 'Heavier: Hugs Ground' : 'Lighter: Rises Upward'}</span>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70">
          <span class="text-xs text-slate-400">OSHA PEL (Permissible)</span>
          <p class="text-lg font-bold text-emerald-400">${chem.pel}</p>
          <span class="text-[10px] text-slate-500">8-hour exposure limit</span>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70">
          <span class="text-xs text-slate-400">Recommended Isolation</span>
          <p class="text-sm font-bold text-sky-300 mt-1">${chem.isolationDistance}</p>
          <span class="text-[10px] text-slate-500">DOT ERG Guidance</span>
        </div>
      </div>

      <!-- Symptoms & First Aid Accordion -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20">
          <h5 class="text-sm font-bold text-rose-300 flex items-center gap-2 mb-2">
            <i data-lucide="activity" class="w-4 h-4 text-rose-400"></i> Exposure Symptoms
          </h5>
          <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            ${chem.symptoms.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div class="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
          <h5 class="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-2">
            <i data-lucide="cross" class="w-4 h-4 text-emerald-400"></i> Antidote & Medical Protocol
          </h5>
          <p class="text-xs text-slate-300 leading-relaxed font-medium mb-2">${chem.antidote}</p>
          <div class="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded border border-slate-700">
            <strong class="text-slate-200">Chemical Neutralizer:</strong> ${chem.neutralizer}
          </div>
        </div>
      </div>
    </div>
  `;

  initLucideIcons();
}

// Before Leakage Checklist Logic
function setupBeforeChecklist() {
  const checkboxes = document.querySelectorAll(".checklist-item");
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      calculateChecklistScore();
    });
  });
  calculateChecklistScore();
}

function calculateChecklistScore() {
  const checkboxes = document.querySelectorAll(".checklist-item");
  let checked = 0;
  checkboxes.forEach((cb) => {
    if (cb.checked) checked++;
  });
  const percent = Math.round((checked / checkboxes.length) * 100);

  const scoreText = document.getElementById("checklistScoreText");
  const progressBar = document.getElementById("checklistProgressBar");
  if (scoreText) scoreText.innerText = `${percent}% Ready`;
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    if (percent === 100) {
      progressBar.className = "h-2 rounded-full bg-emerald-500 transition-all duration-500";
    } else if (percent > 60) {
      progressBar.className = "h-2 rounded-full bg-amber-500 transition-all duration-500";
    } else {
      progressBar.className = "h-2 rounded-full bg-red-500 transition-all duration-500";
    }
  }
}

// Interactive Map & Plume Simulation
function setupMapSimulation() {
  renderInteractiveMap();

  const changeWindBtn = document.getElementById("btnToggleWind");
  if (changeWindBtn) {
    changeWindBtn.addEventListener("click", () => {
      // Rotate wind direction
      const dirs = ["SE", "S", "SW", "E", "NE"];
      const degs = [135, 180, 225, 90, 45];
      const curIdx = dirs.indexOf(ChemSafeState.wind.direction);
      const nextIdx = (curIdx + 1) % dirs.length;

      ChemSafeState.wind.direction = dirs[nextIdx];
      ChemSafeState.wind.degrees = degs[nextIdx];
      ChemSafeState.wind.speedKmh = Math.floor(12 + Math.random() * 10);

      const windDisplay = document.getElementById("mapWindDisplay");
      if (windDisplay) {
        windDisplay.innerHTML = `${ChemSafeState.wind.direction} (${ChemSafeState.wind.speedKmh} km/h)`;
      }

      renderInteractiveMap();
    });
  }
}

function renderInteractiveMap() {
  const canvasIds = ["plantMapCanvas", "plantMapCanvasLarge"];

  canvasIds.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-dpi sizing
    const width = canvas.parentElement.clientWidth || 800;
    const isLarge = id === "plantMapCanvasLarge";
    const height = isLarge ? 520 : 340;
    canvas.width = width;
    canvas.height = height;

    // Background Grid
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(30, 41, 59, 0.6)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Scale factors
    const scale = isLarge ? 1.15 : 1.0;
    const plantCenterX = width * 0.36;
    const plantCenterY = height * 0.48;

    // Sectors definitions
    const sectors = [
      { name: "Sector A (Cl₂ Tanks)", x: plantCenterX - 95 * scale, y: plantCenterY - 75 * scale, w: 115 * scale, h: 80 * scale, color: "#1e293b", sensor: "S-101", isLeaking: ChemSafeState.mode === "critical" },
      { name: "Sector B (NH₃ Chiller)", x: plantCenterX + 40 * scale, y: plantCenterY - 75 * scale, w: 125 * scale, h: 75 * scale, color: "#1e293b", sensor: "S-204", isLeaking: ChemSafeState.mode === "warning" },
      { name: "Sector C (Benzene Bay)", x: plantCenterX - 95 * scale, y: plantCenterY + 30 * scale, w: 115 * scale, h: 85 * scale, color: "#1e293b", sensor: "S-309", isLeaking: false },
      { name: "Sector D (Sulfur Unit)", x: plantCenterX + 40 * scale, y: plantCenterY + 30 * scale, w: 125 * scale, h: 85 * scale, color: "#1e293b", sensor: "S-412", isLeaking: false },
      { name: "Sector E (Control HQ)", x: plantCenterX - 215 * scale, y: plantCenterY - 30 * scale, w: 85 * scale, h: 100 * scale, color: "#0f172a", sensor: "S-500", isHQ: true }
    ];

    // Draw Sectors
    sectors.forEach((sec) => {
      ctx.fillStyle = sec.isLeaking ? "rgba(239, 68, 68, 0.28)" : "rgba(30, 41, 59, 0.85)";
      ctx.strokeStyle = sec.isLeaking ? "#ef4444" : "#475569";
      ctx.lineWidth = sec.isLeaking ? 2.5 : 1.5;
      ctx.strokeRect(sec.x, sec.y, sec.w, sec.h);
      ctx.fillRect(sec.x, sec.y, sec.w, sec.h);

      ctx.fillStyle = sec.isLeaking ? "#fca5a5" : "#cbd5e1";
      ctx.font = `bold ${isLarge ? '12px' : '11px'} Inter, sans-serif`;
      ctx.fillText(sec.name, sec.x + 6, sec.y + 18);

      // Sensor badge inside
      const ppmVal = ChemSafeState.sensorReadings[sec.sensor] || 0;
      ctx.fillStyle = sec.isLeaking ? "#ef4444" : "#38bdf8";
      ctx.font = `${isLarge ? '11px' : '10px'} monospace`;
      ctx.fillText(`${sec.sensor}: ${ppmVal} ppm`, sec.x + 6, sec.y + sec.h - 10);
    });

    // Surrounding Residential Community Zone
    const communityX = width * 0.82;
    const communityY = height * 0.68;
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(communityX - 75 * scale, communityY - 55 * scale, 150 * scale, 110 * scale);
    ctx.fillRect(communityX - 75 * scale, communityY - 55 * scale, 150 * scale, 110 * scale);

    ctx.fillStyle = "#38bdf8";
    ctx.font = `bold ${isLarge ? '13px' : '11px'} Inter, sans-serif`;
    ctx.fillText("Residential Ward 4", communityX - 65 * scale, communityY - 30 * scale);
    ctx.fillStyle = "#94a3b8";
    ctx.font = `${isLarge ? '11px' : '10px'} Inter, sans-serif`;
    ctx.fillText("Pop: ~4,200 | St. Jude Hosp", communityX - 65 * scale, communityY - 12 * scale);
    ctx.fillText("Distance: 1.2 km SE", communityX - 65 * scale, communityY + 6 * scale);

    // Buffer Zone Ring
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(plantCenterX, plantCenterY, 200 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Evacuation Assembly Points (Green UPWIND)
    const assemblyPoints = [
      { name: "Assembly 1 (Upwind NW)", x: plantCenterX - 180 * scale, y: plantCenterY - 120 * scale, safe: true },
      { name: "Assembly 2 (North Gate)", x: plantCenterX + 40 * scale, y: plantCenterY - 130 * scale, safe: true },
      { name: "Assembly 3 (SE Perimeter)", x: plantCenterX + 160 * scale, y: plantCenterY + 120 * scale, safe: false } // downwind!
    ];

    assemblyPoints.forEach((pt) => {
      const isSafe = pt.safe && ChemSafeState.mode !== "normal" ? true : pt.safe;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = isSafe ? "#10b981" : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = isSafe ? "#34d399" : "#f87171";
      ctx.font = `bold ${isLarge ? '11px' : '10px'} Inter, sans-serif`;
      ctx.fillText(pt.name, pt.x - 45, pt.y - 15);
    });

    // Gas Plume Dispersion Rendering (Dynamic Cone when leak active!)
    if (ChemSafeState.mode === "critical" || ChemSafeState.mode === "warning") {
      const originX = ChemSafeState.mode === "critical" ? plantCenterX - 35 * scale : plantCenterX + 100 * scale;
      const originY = ChemSafeState.mode === "critical" ? plantCenterY - 30 * scale : plantCenterY - 32 * scale;

      const angleRad = (ChemSafeState.wind.degrees * Math.PI) / 180;
      const plumeLength = ChemSafeState.mode === "critical" ? 360 * scale : 200 * scale;
      const spreadAngle = 0.48; // cone spread

      const plumeGrad = ctx.createRadialGradient(
        originX,
        originY,
        10,
        originX + Math.cos(angleRad) * plumeLength * 0.7,
        originY + Math.sin(angleRad) * plumeLength * 0.7,
        plumeLength
      );

      if (ChemSafeState.mode === "critical") {
        plumeGrad.addColorStop(0, "rgba(220, 38, 38, 0.88)"); // Center lethal
        plumeGrad.addColorStop(0.35, "rgba(239, 68, 68, 0.55)"); // Mandatory evac
        plumeGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.35)"); // Shelter in place
        plumeGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      } else {
        plumeGrad.addColorStop(0, "rgba(245, 158, 11, 0.75)");
        plumeGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.35)");
        plumeGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      }

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.arc(originX, originY, plumeLength, angleRad - spreadAngle, angleRad + spreadAngle);
      ctx.closePath();
      ctx.fillStyle = plumeGrad;
      ctx.fill();

      // Pulsing Leak Epicenter Circle
      ctx.beginPath();
      ctx.arc(originX, originY, 14, 0, Math.PI * 2);
      ctx.fillStyle = ChemSafeState.mode === "critical" ? "#ef4444" : "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("LEAK SOURCE", originX - 35, originY - 18);
    }

    // Draw Wind Vector Indicator in Top Right
    const windBoxX = width - 160;
    const windBoxY = 25;
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(windBoxX, windBoxY, 140, 72);
    ctx.fillRect(windBoxX, windBoxY, 140, 72);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("WIND VECTOR", windBoxX + 12, windBoxY + 18);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText(`${ChemSafeState.wind.direction} • ${ChemSafeState.wind.speedKmh} km/h`, windBoxX + 12, windBoxY + 38);

    // Compass arrow
    const arrowCenterX = windBoxX + 115;
    const arrowCenterY = windBoxY + 36;
    const windRad = (ChemSafeState.wind.degrees * Math.PI) / 180;
    ctx.save();
    ctx.translate(arrowCenterX, arrowCenterY);
    ctx.rotate(windRad);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 10);
    ctx.closePath();
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#64748b";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText("Plume: Downwind Cone", windBoxX + 12, windBoxY + 58);
  });
}

// AI Safety Copilot Logic
function setupAICopilot() {
  const sendBtn = document.getElementById("btnSendAiPrompt");
  const input = document.getElementById("aiPromptInput");
  const chatFeed = document.getElementById("aiChatFeed");
  const quickQueryBtns = document.querySelectorAll(".ai-quick-query");

  if (sendBtn && input) {
    sendBtn.addEventListener("click", () => {
      const q = input.value.trim();
      if (!q) return;
      handleUserAiQuery(q);
      input.value = "";
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = input.value.trim();
        if (!q) return;
        handleUserAiQuery(q);
        input.value = "";
      }
    });
  }

  quickQueryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      if (prompt) handleUserAiQuery(prompt);
    });
  });
}

function handleUserAiQuery(query) {
  const chatFeed = document.getElementById("aiChatFeed");
  if (!chatFeed) return;

  // Add User Message
  const userMsg = `
    <div class="flex items-start gap-3 justify-end">
      <div class="bg-sky-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] text-xs shadow-md">
        <p class="font-medium">${escapeHtml(query)}</p>
      </div>
      <div class="w-7 h-7 rounded-full bg-sky-500/30 flex items-center justify-center shrink-0 border border-sky-400">
        <i data-lucide="user" class="w-4 h-4 text-sky-200"></i>
      </div>
    </div>
  `;
  chatFeed.insertAdjacentHTML("beforeend", userMsg);
  initLucideIcons();
  chatFeed.scrollTop = chatFeed.scrollHeight;

  // Generate AI Response
  setTimeout(() => {
    const aiResponse = generateAIAnswer(query);
    const aiMsg = `
      <div class="flex items-start gap-3">
        <div class="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 border border-emerald-400">
          <i data-lucide="bot" class="w-4 h-4 text-emerald-300"></i>
        </div>
        <div class="bg-slate-800 border border-slate-700 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-xs shadow-xl leading-relaxed">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="font-bold text-emerald-400">ChemSafeAI Copilot</span>
            <span class="indicator-pill indicator-blue">AI Verified</span>
          </div>
          ${aiResponse}
        </div>
      </div>
    `;
    chatFeed.insertAdjacentHTML("beforeend", aiMsg);
    initLucideIcons();
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }, 450);
}

function generateAIAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes("evacuation") || q.includes("radius") || q.includes("distance")) {
    return `
      <p class="mb-2"><strong>AI Dispersion Calculation (DOT ERG 2024 / ALOHA Model):</strong></p>
      <ul class="list-disc list-inside space-y-1 text-slate-300">
        <li><strong>Current Chemical:</strong> Chlorine Gas ($Cl_2$), Vapor Density 2.49 (Heavy cloud).</li>
        <li><strong>Wind Conditions:</strong> ${ChemSafeState.wind.speedKmh} km/h toward ${ChemSafeState.wind.direction} (135°).</li>
        <li><strong>Initial Isolation Zone:</strong> Immediate 500 meters (1/3 mile) in all directions.</li>
        <li><strong>Downwind Protection Distance:</strong> 1,600 meters (1.0 mile) in direction of SE corridor.</li>
        <li><span class="text-rose-400 font-bold">Action Order:</span> Evacuate crosswind toward North-West Assembly Point 1. Residential Ward 4 must Shelter-In-Place with windows taped and HVAC shut off!</li>
      </ul>
    `;
  }

  if (q.includes("antidote") || q.includes("medical") || q.includes("first aid") || q.includes("symptoms")) {
    return `
      <p class="mb-2"><strong>Hazmat Medical Treatment Directive:</strong></p>
      <div class="p-2.5 rounded bg-slate-900 border border-slate-700 space-y-1.5">
        <p><strong class="text-emerald-400">Chlorine ($Cl_2$):</strong> No specific antidote. Immediate 100% humidified oxygen, nebulized 3.75% sodium bicarbonate solution, and bronchodilators (Albuterol 2.5mg). Keep victim completely at physical rest to prevent acute pulmonary edema.</p>
        <p><strong class="text-sky-400">Ammonia ($NH_3$):</strong> Continuous high-volume eyewash/skin irrigation for minimum 15-30 minutes. Copious warm water for freeze burns.</p>
        <p><strong class="text-amber-400">Hydrogen Sulfide ($H_2S$):</strong> High-flow oxygen, Cyanide/Sulfide kit (Amyl Nitrite inhalation, IV Sodium Nitrite).</p>
      </div>
    `;
  }

  if (q.includes("neutraliz") || q.includes("contain") || q.includes("stop leak")) {
    return `
      <p class="mb-2"><strong>Chemical Neutralization & Physical Containment Protocol:</strong></p>
      <ol class="list-decimal list-inside space-y-1 text-slate-300">
        <li><strong>Chlorine:</strong> Engage caustic soda scrubber (NaOH 10-15% concentration). Spray fine water fog curtain *above* cloud to knock down vapor, but <em>NEVER spray water directly into liquid pool</em> (accelerates vapor boil-off).</li>
        <li><strong>Ammonia:</strong> Wide-angle water deluge curtains absorb gas readily (forms aqueous ammonium hydroxide). Ensure runoff is diverted into containment basin.</li>
        <li><strong>Personnel Entry:</strong> Strictly Level A gas-tight encapsulating suits with positive pressure SCBA. Entry buddy system mandatory.</li>
      </ol>
    `;
  }

  if (q.includes("community") || q.includes("broadcast") || q.includes("sms") || q.includes("alert message")) {
    return `
      <p class="mb-2"><strong>Automated Emergency Public Broadcast Draft (Ready to push to EAS / SMS):</strong></p>
      <div class="p-3 bg-red-950/40 border border-red-500 rounded text-red-100 font-mono text-[11px] leading-relaxed">
        EMERGENCY ALERT SYSTEM (EAS): TOXIC INDUSTRIAL CHEMICAL LEAK DETECTED AT CHEMSAFE INDUSTRIAL COMPLEX. RESIDENTS WITHIN 2 KM DOWNWIND (SECTOR SE / RESIDENTIAL WARD 4) MUST IMMEDIATELY SHELTER IN PLACE. CLOSE ALL DOORS AND WINDOWS. TURN OFF AIR CONDITIONING AND HVAC. DO NOT ENTER OUTDOORS. MONITOR LOCAL RADIO / CHEMSAFEAI PORTAL FOR ALL-CLEAR.
      </div>
      <button onclick="copyAlertMessage(this)" class="mt-2 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold">Copy EAS Draft</button>
    `;
  }

  // Default intelligent safety assistant fallback
  return `
    <p><strong>ChemSafeAI Analysis for: "${escapeHtml(query)}"</strong></p>
    <p class="mt-1 text-slate-300">Sensor status: Chlorine S-101 is at ${ChemSafeState.sensorReadings["S-101"]} ppm. Wind is blowing at ${ChemSafeState.wind.speedKmh} km/h toward the ${ChemSafeState.wind.direction}.</p>
    <p class="mt-1.5 text-slate-300">Recommended standard operating procedure is to verify containment seals, confirm all assembly muster points, and notify Municipal Hazmat Response Unit 9 via the Contact Hub.</p>
  `;
}

function copyAlertMessage(btn) {
  const text = `EMERGENCY ALERT: TOXIC CHEMICAL LEAK DETECTED AT CHEMSAFE COMPLEX. RESIDENTS WITHIN 2 KM DOWNWIND MUST IMMEDIATELY SHELTER IN PLACE. CLOSE WINDOWS & TURN OFF HVAC.`;
  navigator.clipboard.writeText(text).then(() => {
    btn.innerText = "Copied to Clipboard!";
    setTimeout(() => {
      btn.innerText = "Copy EAS Draft";
    }, 2000);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

// Leaflet Tactical GIS Map Engine
let leafletMapInstance = null;
let leafletPlumePolygon = null;
let leafletBufferCircle = null;

function switchMapView(mode) {
  const containerSchematic = document.getElementById("containerSchematicMap");
  const containerGis = document.getElementById("containerGisMap");
  const btnSchematic = document.getElementById("btnViewSchematic");
  const btnGis = document.getElementById("btnViewGis");

  if (mode === "schematic") {
    if (containerSchematic) containerSchematic.classList.remove("hidden");
    if (containerGis) containerGis.classList.add("hidden");

    if (btnSchematic) {
      btnSchematic.className = "px-3 py-1 rounded-lg font-bold bg-sky-600 text-white transition-all flex items-center gap-1.5";
    }
    if (btnGis) {
      btnGis.className = "px-3 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5";
    }
    renderInteractiveMap();
  } else if (mode === "gis") {
    if (containerSchematic) containerSchematic.classList.add("hidden");
    if (containerGis) containerGis.classList.remove("hidden");

    if (btnGis) {
      btnGis.className = "px-3 py-1 rounded-lg font-bold bg-sky-600 text-white transition-all flex items-center gap-1.5";
    }
    if (btnSchematic) {
      btnSchematic.className = "px-3 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5";
    }
    initLeafletMap();
  }
}

function initLeafletMap() {
  if (!window.L) return;
  const mapElement = document.getElementById("leafletMapElement");
  if (!mapElement) return;

  if (!leafletMapInstance) {
    // Industrial Chemical Complex Coordinates
    const plantLat = 29.7285;
    const plantLng = -95.1482;

    leafletMapInstance = L.map("leafletMapElement", {
      center: [plantLat, plantLng],
      zoom: 14,
      zoomControl: true
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(leafletMapInstance);

    // Custom Icon Generator
    const createMapIcon = (color, iconName) => {
      return L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}; border: 2px solid #fff;"><span style="color:#fff; font-size:12px; font-weight:bold;">●</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    };

    // Plant Markers
    const locations = [
      { name: "Sector A (Chlorine Tank Farm)", lat: 29.7285, lng: -95.1482, color: "#ef4444", desc: "4x 20-ton Liquid Ton Containers | Sensor S-101" },
      { name: "Sector B (Ammonia Chiller Loop)", lat: 29.7315, lng: -95.1435, color: "#f59e0b", desc: "Refrigeration System | Sensor S-204" },
      { name: "Sector C (Benzene Rail Bay)", lat: 29.7245, lng: -95.1455, color: "#38bdf8", desc: "Solvent Loading Bay | Sensor S-309" },
      { name: "Sector D (Sulfur Gas Unit)", lat: 29.7305, lng: -95.1525, color: "#a855f7", desc: "Flue Gas Scrubber | Sensor S-412" },
      { name: "EOC Command Bunker", lat: 29.7265, lng: -95.1540, color: "#0284c7", desc: "Blast-Resistant Emergency War Room" },
      { name: "Assembly Zone 1 (NW Gate - Upwind)", lat: 29.7355, lng: -95.1565, color: "#10b981", desc: "Primary Safe Evacuation & Triage Staging Area" },
      { name: "Residential Ward 4 & Community", lat: 29.7180, lng: -95.1320, color: "#e11d48", desc: "Pop: ~4,200 | Downwind Shelter-In-Place Ward" },
      { name: "Greenfield Elementary School", lat: 29.7150, lng: -95.1360, color: "#f43f5e", desc: "School Evacuation Safe Room Activated" },
      { name: "St. Jude Regional Trauma & Burns", lat: 29.7220, lng: -95.1270, color: "#10b981", desc: "14 Emergency Decontamination Bays Open" }
    ];

    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMapIcon(loc.color, loc.name)
      }).addTo(leafletMapInstance);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-weight: bold; color: #38bdf8; font-size: 13px;">${loc.name}</h4>
          <p style="margin: 4px 0 0; font-size: 11px; color: #cbd5e1;">${loc.desc}</p>
        </div>
      `);
    });

    // 500m Initial Isolation Circle
    leafletBufferCircle = L.circle([plantLat, plantLng], {
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.12,
      radius: 500,
      dashArray: "6, 6"
    }).addTo(leafletMapInstance);

    // 1600m Protective Action Zone Circle
    L.circle([plantLat, plantLng], {
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: 0.05,
      radius: 1600,
      dashArray: "4, 8"
    }).addTo(leafletMapInstance);
  }

  setTimeout(() => {
    leafletMapInstance.invalidateSize();
    updateLeafletPlume();
  }, 100);
}

function updateLeafletPlume() {
  if (!leafletMapInstance) return;

  if (leafletPlumePolygon) {
    leafletMapInstance.removeLayer(leafletPlumePolygon);
    leafletPlumePolygon = null;
  }

  if (ChemSafeState.mode === "critical" || ChemSafeState.mode === "warning") {
    const originLat = ChemSafeState.mode === "critical" ? 29.7285 : 29.7315;
    const originLng = ChemSafeState.mode === "critical" ? -95.1482 : -95.1435;

    // Convert wind heading to downwind trajectory
    const headingRad = (ChemSafeState.wind.degrees * Math.PI) / 180;
    const plumeKm = (ChemSafeState.mode === "critical" ? 2.4 : 1.2) * (ChemSafeState.wind.speedKmh / 14);

    // Earth geometry approximation for cone points
    const latKm = 1 / 110.574;
    const lngKm = 1 / (111.32 * Math.cos((originLat * Math.PI) / 180));

    const halfAngle = 0.35; // cone spread
    const tipLat = originLat + Math.cos(headingRad) * plumeKm * latKm;
    const tipLng = originLng + Math.sin(headingRad) * plumeKm * lngKm;

    const leftLat = originLat + Math.cos(headingRad - halfAngle) * plumeKm * latKm;
    const leftLng = originLng + Math.sin(headingRad - halfAngle) * plumeKm * lngKm;

    const rightLat = originLat + Math.cos(headingRad + halfAngle) * plumeKm * latKm;
    const rightLng = originLng + Math.sin(headingRad + halfAngle) * plumeKm * lngKm;

    const color = ChemSafeState.mode === "critical" ? "#dc2626" : "#f59e0b";

    leafletPlumePolygon = L.polygon(
      [
        [originLat, originLng],
        [leftLat, leftLng],
        [tipLat, tipLng],
        [rightLat, rightLng]
      ],
      {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2
      }
    ).addTo(leafletMapInstance);

    leafletPlumePolygon.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <h4 style="margin: 0; color: #ef4444; font-weight: bold;">Active Toxic Vapor Plume</h4>
        <p style="margin: 4px 0 0; font-size: 11px;">Agent: ${ChemSafeState.mode === 'critical' ? 'Chlorine (Cl₂)' : 'Ammonia (NH₃)'}<br/>Downwind: ${ChemSafeState.wind.direction} @ ${ChemSafeState.wind.speedKmh} km/h</p>
      </div>
    `);
  }
}

// Interactive Wind Direction & Velocity Modifiers
function setWindDirection(dir, deg) {
  ChemSafeState.wind.direction = dir;
  ChemSafeState.wind.degrees = deg;

  const windButtons = document.querySelectorAll(".wind-dir-btn");
  windButtons.forEach((btn) => {
    if (btn.innerText.trim() === dir) {
      btn.className = "wind-dir-btn px-2 py-1 rounded bg-sky-600 text-white font-mono font-bold shadow-md";
    } else {
      btn.className = "wind-dir-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono";
    }
  });

  const display = document.getElementById("mapWindDisplay");
  if (display) {
    display.innerText = `${dir} (${ChemSafeState.wind.speedKmh} km/h)`;
  }

  renderInteractiveMap();
  updateLeafletPlume();
}

function setWindSpeed(val) {
  const speed = parseInt(val, 10);
  ChemSafeState.wind.speedKmh = speed;

  const label = document.getElementById("labelWindSpeed");
  if (label) label.innerText = `${speed} km/h`;

  const display = document.getElementById("mapWindDisplay");
  if (display) {
    display.innerText = `${ChemSafeState.wind.direction} (${speed} km/h)`;
  }

  renderInteractiveMap();
  updateLeafletPlume();
}

// Downloadable Hazmat Incident Report Generator
function downloadIncidentReport() {
  const now = new Date().toISOString();
  const chem = CHEMICAL_DATABASE.find((c) => c.id === ChemSafeState.selectedChemicalId) || CHEMICAL_DATABASE[0];

  const reportText = `========================================================================
CHEMSAFEAI - INDUSTRIAL CHEMICAL EMERGENCY INCIDENT REPORT
OSHA 1910.119 / EPA TITLE III COMPLIANT INCIDENT DOCUMENTATION
========================================================================
Generated At: ${now}
Facility: ChemSafe Industrial Chemical Processing & Storage Complex
Current Operational State: ${ChemSafeState.mode.toUpperCase()}
Emergency Siren Active: ${ChemSafeState.sosActive ? "YES (ACTIVE)" : "NO"}

1. CHEMICAL HAZARD PROFILE
------------------------------------------------------------------------
Primary Chemical: ${chem.name} (${chem.formula})
CAS Number: ${chem.cas} | UN Number: ${chem.unNumber}
Hazmat Class: ${chem.hazmatClass}
IDLH Concentration: ${chem.idlh} | OSHA PEL: ${chem.pel}
Vapor Density: ${chem.vaporDensity} (${chem.vaporDensity > 1 ? "Heavier than air - collects low" : "Lighter than air - rises"})
NFPA 704 Diamond: [Health: ${chem.nfpa.health}, Flammability: ${chem.nfpa.flammability}, Instability: ${chem.nfpa.instability}, Special: ${chem.nfpa.special || "None"}]

2. SENSOR TELEMETRY & ATMOSPHERIC CONDITIONS
------------------------------------------------------------------------
Sector A (Cl2 Tank Farm) [S-101]: ${ChemSafeState.sensorReadings["S-101"]} ppm
Sector B (NH3 Refrigeration) [S-204]: ${ChemSafeState.sensorReadings["S-204"]} ppm
Sector C (Benzene Rail Bay) [S-309]: ${ChemSafeState.sensorReadings["S-309"]} ppm
Sector D (Sulfur Recovery) [S-412]: ${ChemSafeState.sensorReadings["S-412"]} ppm
Ambient Weather: Wind ${ChemSafeState.wind.speedKmh} km/h toward ${ChemSafeState.wind.direction} (${ChemSafeState.wind.degrees} deg), 28 deg C, 64% Humidity

3. PERSONNEL ACCOUNTABILITY & CASUALTY REPORT
------------------------------------------------------------------------
Total Shift Workers: ${ChemSafeState.workerAccountability.total}
Successfully Accounted / Evacuated: ${ChemSafeState.workerAccountability.evacuated}
Personnel in Active Hazard Perimeter: ${ChemSafeState.workerAccountability.atRisk}
Primary Upwind Muster Point: Assembly Zone 1 (NW Gate)

4. MEDICAL & CONTAINMENT DIRECTIVES
------------------------------------------------------------------------
Recommended Antidote / First Aid:
${chem.antidote}

Neutralizing Counter-Measure:
${chem.neutralizer}

Initial Isolation Distance:
${chem.isolationDistance}

5. EMERGENCY DISPATCH DISCLOSURE
------------------------------------------------------------------------
- Hazmat Unit 9 Dispatched (Commander Sarah Vance)
- Metropolitan Fire Dept Engine 12 En Route
- Poison Control Tele-Toxicology Consult Initiated (1-800-222-1222)
- St. Jude Trauma & Burns Center Mass Casualty Decon Bay Notified
- Municipal Emergency Management Agency (EMA) EAS Satellite Uplink Armed

========================================================================
END OF INCIDENT REPORT - CHEMSAFEAI EMERGENCY OPERATIONS CENTER
========================================================================`;

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ChemSafe_Hazmat_Report_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Global functions for inline HTML calls
window.switchTab = switchTab;
window.selectChemical = selectChemical;
window.triggerScenario = triggerScenario;
window.copyAlertMessage = copyAlertMessage;
window.soundManager = soundManager;
window.switchMapView = switchMapView;
window.setWindDirection = setWindDirection;
window.setWindSpeed = setWindSpeed;
window.downloadIncidentReport = downloadIncidentReport;
window.initLeafletMap = initLeafletMap;
