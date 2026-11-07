# ChemSafeAI - Industrial Chemical Leakage Emergency Management System

**ChemSafeAI** is a modern, responsive, AI-powered emergency management platform engineered to safeguard factory workers, first responders, and surrounding residential communities against toxic industrial chemical releases.

---

## 🌟 Key Highlights & Architecture

### 1. Three Core Emergency Management Phases
- **Before Leakage (Prevention & Preparedness)**:
  - Interactive daily pre-shift inspection checklist with automated readiness scoring.
  - Fixed electrochemical toxic gas detector health & optical calibration countdowns (Chlorine, Ammonia, Benzene, $H_2S$).
  - Storage tank inventory risk assessment matrix (ton containers, capacities, vapor pressures).
  - OSHA PPE selection hierarchy (Level A encapsulating suits with positive-pressure SCBA, Level B, and Level C).
  - On-site infirmary antidote stocking verification.

- **During Leakage (Active Crisis Response & Containment)**:
  - Dynamic gas plume dispersion calculation (crosswind and downwind hazard corridors based on real-time wind speed, direction, and chemical vapor density).
  - Automated containment controls: pneumatic container isolation valves, caustic soda scrubber draft blowers, and high-volume water fog deluge systems.
  - Real-time worker headcount & muster accountability tracker (142 total shift personnel).
  - Emergency Alert System (EAS / SMS) broadcast generator with one-click copy and dispatch for nearby residential wards and schools.

- **After Leakage (Recovery, Decontamination & Medical Triage)**:
  - 3-step gross decontamination protocol (Strip, Copious 15-minute Deluge Wash, Clinical Triage).
  - START protocol medical triage classification (Immediate Red, Delayed Yellow, Minor Green, Expectant Black).
  - Chemical-specific neutralizers (e.g. Caustic soda for Chlorine, water curtains for Ammonia).
  - Safe re-entry environmental air sampling limits.
  - Automated AI Root-Cause Hazmat Incident Investigation Report generator (printable for OSHA/EPA compliance).

---

### 2. One-Click SOS Emergency Button
- Prominently placed high-visibility emergency trigger with safety confirmation modal.
- Synthesizes industrial dual-tone emergency sirens using the **Web Audio API** (no external audio files required, fully reliable and portable).
- Includes instant audio mute/unmute control and flashing visual strobe warnings.

---

### 3. Interactive Emergency Response Map & Plume Dispersion
- **Dual Map Modes**:
  - **Industrial Schematic Blueprint (Canvas)**: Dynamic ALOHA dispersion cone showing IDLH lethal zones, mandatory evacuation zones, and upwind safe assembly points.
  - **Satellite GIS Tactical Map (Leaflet.js)**: Real-world geospatial coordinates on CartoDB Dark Matter tiles with interactive clickable markers, 500m/1.6km safety buffer rings, and dynamic polygon plume vectors.
- **Interactive Plume Controls**:
  - Live wind direction selector (NW, N, NE, E, SE, S, SW, W).
  - Wind velocity slider ($5\text{ km/h}$ to $50\text{ km/h}$) with real-time dispersion updates.

---

### 4. Interactive Hazmat Chemical Database
Comprehensive chemical profile cards featuring:
- **NFPA 704 Standard Hazard Diamonds** (Blue Health, Red Flammability, Yellow Instability, White Special Hazard).
- **CAS & UN Numbers**: ($Cl_2$ UN 1017, $NH_3$ UN 1005, $H_2S$ UN 1053, Benzene UN 1114, Phosgene UN 1076).
- **Vapor Density Indicators**: Demonstrating whether gases hug the ground (Chlorine 2.49) or rise into the atmosphere (Ammonia 0.59).
- **Exposure Limits**: Immediately Dangerous to Life or Health (IDLH) and OSHA Permissible Exposure Limits (PEL).
- **Clinical Symptoms & Antidotes**: Specialized medical treatments (e.g., nebulized sodium bicarbonate and humidified oxygen).
- **Report Export**: Instant print and downloadable `.txt` Hazmat Incident Reports compliant with OSHA 1910.119 / EPA Title III.

---

### 5. ChemSafeAI Safety Copilot
- Intelligent emergency assistant capable of calculating downwind evacuation radii, advising on containment chemistry, recommending medical first-aid antidotes, and drafting civil defense public broadcasts.

---

### 6. Emergency Services Directory
Direct contact and dispatch simulation cards for:
- **Hazmat Unit 9 (Heavy Decon)**: VHF TAC-4 / CHEMTREC 1-800-424-9300.
- **Metropolitan Chemical Fire & Rescue District 12**: VHF 154.190 MHz.
- **National Poison Control Center**: 1-800-222-1222 (24/7 tele-toxicology).
- **St. Jude Regional Trauma & Burns Center**: 14 decontamination bays.
- **Municipal Emergency Management Agency (EMA)**: Public EAS satellite uplink.
- **Plant Chief Safety Officer (CSO)**: Direct command link.

---

## 🚀 How to Run the Application

### Option 1: One-Click Windows Launcher (Fastest)
Double-click:
```
C:\Users\avvar\.gemini\antigravity\scratch\chemsafe-ai\start_chemsafe.bat
```

### Option 2: Direct Browser Launch
Open in any modern browser:
```
C:\Users\avvar\.gemini\antigravity\scratch\chemsafe-ai\index.html
```

---

## 📂 Project Structure
```
chemsafe-ai/
├── start_chemsafe.bat # One-click Windows desktop launcher
├── index.html         # Master responsive application UI & navigation
├── styles.css         # Emergency strobe, NFPA 704 diamond, radar & HUD styling
├── app.js             # Emergency Ops engine, Leaflet GIS, siren synthesizer, telemetry
├── chemicals.js       # Authentic industrial Hazmat database (NIOSH / DOT ERG standards)
└── README.md          # Technical and operational documentation
```
├── chemicals.js     # Authentic industrial Hazmat database (NIOSH / DOT ERG standards)
└── README.md        # Technical and operational documentation
```
