// ChemSafeAI - Industrial Chemical Emergency Database
// Based on NIOSH Pocket Guide, OSHA Guidelines, and DOT Emergency Response Guidebook (ERG)

const CHEMICAL_DATABASE = [
  {
    id: "chlorine",
    name: "Chlorine Gas",
    formula: "Cl₂",
    cas: "7782-50-5",
    unNumber: "UN 1017",
    hazmatClass: "2.3 Poison Gas (Oxidizer)",
    nfpa: { health: 4, flammability: 0, instability: 0, special: "OX" },
    vaporDensity: 2.49, // Heavier than air (stays low)
    physicalState: "Amber-yellow pressurized liquid / greenish-yellow pungent gas",
    pel: "1.0 ppm (Ceiling)",
    idlh: "10 ppm",
    lel: "Non-flammable",
    uel: "Non-flammable",
    dangerLevel: "critical",
    riskSummary: "Extremely toxic pulmonary irritant. Heavier than air; collects in low-lying trenches, basements, and drainage systems.",
    symptoms: [
      "Severe eye, nose, and throat burning",
      "Violent coughing, wheezing, and chest tightness",
      "Delayed pulmonary edema (fluid in lungs) up to 24-48 hrs post-exposure",
      "Skin blistering and chemical burns upon contact with liquid"
    ],
    beforeProtocols: [
      "Verify scrubber line pressure and sodium hydroxide (NaOH) neutralizing reservoir levels daily.",
      "Check dual electrochemical chlorine sensors in Storage Bay A; calibrate every 30 days.",
      "Ensure Level A fully encapsulated vapor-protective suits with Positive Pressure SCBA are stationed at exits.",
      "Inspect emergency automatic shutoff valves (Kits A & B for ton containers)."
    ],
    duringProtocols: [
      "EVACUATE IMMEDIATELY: Move crosswind, then upwind. Never seek shelter in basements or depressions.",
      "Activate emergency caustic scrubber blowers to draft vapors away from loading docks.",
      "Deploy wide-angle fog nozzles (do not spray water directly into liquid chlorine pool!).",
      "Establish initial isolation zone: Minimum 500 meters (1/3 mile) in all directions for large spills."
    ],
    afterProtocols: [
      "Decontaminate responders with 5% sodium bicarbonate solution or copious water shower.",
      "Administer 100% humidified oxygen to all exposed personnel; monitor for delayed lung injury for 48 hours.",
      "Clear soil and water runoff into hazardous containment sump; test pH before drainage.",
      "Inspect valve packings and container fusible plugs using ammonia vapor squeezer bottle (forms white NH₄Cl smoke)."
    ],
    antidote: "No specific chemical antidote. Supportive care: 100% humidified oxygen, bronchodilators (Albuterol), and nebulized sodium bicarbonate (3.75%).",
    neutralizer: "Dilute Sodium Hydroxide (NaOH) or Hydrated Lime slurry in closed scrubber loops.",
    isolationDistance: "500m Daytime / 1,600m Nighttime downwind corridor"
  },
  {
    id: "ammonia",
    name: "Anhydrous Ammonia",
    formula: "NH₃",
    cas: "7664-41-7",
    unNumber: "UN 1005",
    hazmatClass: "2.2 Non-Flammable / 2.3 Toxic Inhalation Hazard",
    nfpa: { health: 3, flammability: 1, instability: 0, special: "" },
    vaporDensity: 0.59, // Lighter than air (rises when warm)
    physicalState: "Colorless gas with extremely pungent, suffocating odor",
    pel: "50 ppm",
    idlh: "300 ppm",
    lel: "15%",
    uel: "28%",
    dangerLevel: "warning",
    riskSummary: "Corrosive alkaline gas. Extremely soluble in water and bodily moisture. Liquid creates severe cryogenic freeze burns (-33°C). Cold gas is dense and hugs ground until warm.",
    symptoms: [
      "Immediate stinging of eyes and mucous membranes; temporary or permanent blindness",
      "Laryngeal spasm, severe airway edema, and suffocation",
      "Frostbite burns from liquid flashing to gas",
      "Respiratory failure and chemical tracheobronchitis"
    ],
    beforeProtocols: [
      "Inspect refrigeration pressure relief valves and piping flanges for frost accumulation.",
      "Test emergency water spray deluge systems designed to knock down vapor clouds.",
      "Ensure full-face air-purifying respirators (green canister / ammonia approved) are accessible in control room.",
      "Verify ammonia wind direction windsock visibility from all plant vantage points."
    ],
    duringProtocols: [
      "Isolate leak source if safe to do so via remote pneumatic emergency shutoff valves.",
      "Activate water curtain deluge systems to absorb vapor clouds (Ammonia has high water affinity).",
      "Evacuate crosswind and seek elevated ground once cloud warms and rises.",
      "Contain contaminated water runoff; ammonia runoff is lethal to aquatic life."
    ],
    afterProtocols: [
      "Continuous copious water eyewash/shower for minimum 15-30 minutes.",
      "Decontaminate suits with copious fresh water; dilute runoff into retention ponds.",
      "Treat frostbite with warm water baths (38°C to 42°C); do not rub affected tissue.",
      "Ventilate enclosed buildings with high-volume explosion-proof negative pressure blowers."
    ],
    antidote: "Symptomatic treatment. Copious water irrigation for caustic burns, humidified oxygen, systemic pain management.",
    neutralizer: "Large volumes of water spray curtains (forms aqueous ammonium hydroxide); weak acid (citric/acetic) for small contained surfaces.",
    isolationDistance: "300m Initial Isolation / 1,200m Downwind evacuation zone"
  },
  {
    id: "h2s",
    name: "Hydrogen Sulfide",
    formula: "H₂S",
    cas: "7783-06-4",
    unNumber: "UN 1053",
    hazmatClass: "2.3 Poison Gas / 2.1 Flammable Gas",
    nfpa: { health: 4, flammability: 4, instability: 0, special: "" },
    vaporDensity: 1.19, // Heavier than air
    physicalState: "Colorless gas with pungent rotten egg odor at low ppm; paralyzes olfactory sense at >100 ppm",
    pel: "20 ppm (Ceiling)",
    idlh: "100 ppm",
    lel: "4.0%",
    uel: "44.0%",
    dangerLevel: "critical",
    riskSummary: "Extremely toxic chemical asphyxiant and flammable gas. Olfactory fatigue causes workers to believe leak has dissipated when concentration is deadly lethal ('Knockdown' effect).",
    symptoms: [
      "Loss of smell within seconds above 100 ppm",
      "Instantaneous collapse and unconsciousness ('knockdown effect') at >500 ppm",
      "Rapid respiratory paralysis and cardiac arrest",
      "Convulsions, cyanosis, and sudden death within minutes"
    ],
    beforeProtocols: [
      "Enforce personal 4-gas clip-on monitors for every worker entering sewer, well, or sulfur recovery units.",
      "Maintain automatic flares and catalytic iron sponge scrubbers in active operational status.",
      "Calibrate fixed optical flame and H₂S sensors at 10 ppm low-alarm and 15 ppm high-alarm.",
      "Conduct quarterly confined space rescue drills with tethered harnesses and SCBA."
    ],
    duringProtocols: [
      "DO NOT ENTER HAZARD AREA WITHOUT SCBA - 60% of H₂S fatalities are would-be rescuers!",
      "Trigger automated flare stack bypass and vapor diversion lines.",
      "Eliminate all ignition sources; H₂S is explosive across wide concentrations (4% - 44%).",
      "Deploy positive-pressure ventilation fans to purge low-lying sumps and valve pits."
    ],
    afterProtocols: [
      "Remove victim immediately to fresh air; begin CPR and supplemental 100% oxygen immediately.",
      "Administer sodium nitrite or amyl nitrite per medical direction to induce methemoglobinemia if indicated.",
      "Monitor for secondary explosions; purge lines with inert nitrogen gas before maintenance re-entry.",
      "Check explosive atmosphere levels (LEL < 1%) prior to permitting electrical tools."
    ],
    antidote: "Cyanide/Sulfide antidote kit (Amyl nitrite inhalants, Sodium nitrite IV), High-flow 100% normobaric/hyperbaric oxygen.",
    neutralizer: "Caustic soda scrubber with hydrogen peroxide (H₂O₂) or potassium permanganate (KMnO₄) oxidation.",
    isolationDistance: "500m Daytime / 2,000m Nighttime downwind corridor"
  },
  {
    id: "benzene",
    name: "Benzene",
    formula: "C₆H₆",
    cas: "71-43-2",
    unNumber: "UN 1114",
    hazmatClass: "Class 3 Flammable Liquid (Carcinogen)",
    nfpa: { health: 3, flammability: 3, instability: 0, special: "" },
    vaporDensity: 2.77, // Much heavier than air
    physicalState: "Clear, colorless to light-yellow liquid with sweet aromatic hydrocarbon odor",
    pel: "1.0 ppm (8-hr TWA)",
    idlh: "500 ppm",
    lel: "1.2%",
    uel: "7.8%",
    dangerLevel: "warning",
    riskSummary: "Group 1 known human carcinogen (leukemia, bone marrow toxicity). Flammable liquid; vapors travel substantial distances along ground to distant ignition sources and flashback.",
    symptoms: [
      "Drowsiness, dizziness, euphoria, and rapid heart rate",
      "Headaches, tremors, and loss of consciousness at high concentrations",
      "Severe eye and skin defatting/dermatitis",
      "Long term: Aplastic anemia, acute myeloid leukemia (AML)"
    ],
    beforeProtocols: [
      "Inspect double-containment piping, secondary seal floaters on petrochemical storage tanks.",
      "Maintain continuous PID (photoionization detector) monitors set to 0.5 ppm threshold.",
      "Mandate butyl rubber or Silver Shield gloves during solvent sampling operations.",
      "Maintain grounding and bonding cables at tanker rail loading terminals to prevent static discharge."
    ],
    duringProtocols: [
      "Smother liquid spill with Alcohol-Resistant Aqueous Film-Forming Foam (AR-AFFF) blanket.",
      "Eliminate all spark, motor, and electrical switches within 500m radius.",
      "Prevent liquid benzene ingress into municipal storm drains and wastewater systems.",
      "Evacuate downwind personnel; seal ventilation intakes of adjacent control rooms."
    ],
    afterProtocols: [
      "Absorb remaining liquid with non-combustible vermiculite or activated carbon booms.",
      "Bag all contaminated clothing in sealed vapor-tight drums for hazardous incineration.",
      "Conduct baseline urinary S-phenylmercapturic acid (S-PMA) biological biomonitoring on exposed workers.",
      "Perform air clearance sampling (must read < 0.1 ppm for 48 consecutive hours before re-entry)."
    ],
    antidote: "No specific antidote. Supportive therapy, decontamination, avoid epinephrine due to risk of ventricular arrhythmias.",
    neutralizer: "Activated carbon adsorption beds; containment and bio-remediation via authorized hazmat hazardous waste facility.",
    isolationDistance: "250m Initial Isolation / 800m Downwind radius"
  },
  {
    id: "phosgene",
    name: "Phosgene (Carbonyl Chloride)",
    formula: "COCl₂",
    cas: "75-44-5",
    unNumber: "UN 1076",
    hazmatClass: "2.3 Poison Gas / Corrosive",
    nfpa: { health: 4, flammability: 0, instability: 1, special: "" },
    vaporDensity: 3.4, // Over 3 times heavier than air
    physicalState: "Colorless gas with pleasant odor of freshly cut hay or green corn at low ppm",
    pel: "0.1 ppm",
    idlh: "2 ppm",
    lel: "Non-flammable",
    uel: "Non-flammable",
    dangerLevel: "critical",
    riskSummary: "Insidious choking agent. Deceptively mild initial symptoms followed by catastrophic, suffocating non-cardiogenic pulmonary edema ('dry-land drowning') 6 to 24 hours later.",
    symptoms: [
      "Mild eye/throat irritation initially (often mistaken for minor dust)",
      "Asymptomatic latency period of 6 to 24 hours during which alveolar membranes hydrolyze",
      "Sudden onset of massive dyspnea, frothy sputum, and cyanosis",
      "Severe shock, anoxia, and death from alveolar flood"
    ],
    beforeProtocols: [
      "Ensure colorimetric tape phosgene detection paper strips and continuous optical tape sensors are active.",
      "Maintain ammonia gas perimeter barrier lines to react with escaped phosgene into non-toxic urea.",
      "Conduct mandatory zero-tolerance leak checks on isocyanate production reactors.",
      "Stock nebulized steroids and acetylcysteine in site medical infirmary."
    ],
    duringProtocols: [
      "Enforce STRICT ABSOLUTE PHYSICAL REST for all exposed or suspected exposed individuals (exertion accelerates edema).",
      "Transport on stretchers only; do NOT allow exposed workers to walk or assist with response.",
      "Activate basic scrubber towers (aqueous ammonia or sodium hydroxide).",
      "Evacuate all personnel downwind immediately to higher terrain."
    ],
    afterProtocols: [
      "Mandatory 24 to 48-hour hospital observation even for asymptomatic workers.",
      "Administer early prophylactic nebulized corticosteroids (e.g. Budesonide) and intravenous NAC (N-acetylcysteine).",
      "Decontaminate skin and equipment with alkaline solution.",
      "Decontaminate gas piping with high-temperature steam or dilute caustic wash."
    ],
    antidote: "No direct antidote. Early prophylactic inhaled steroids (budesonide), N-acetylcysteine (free radical scavenger), positive end-expiratory pressure (PEEP) ventilation.",
    neutralizer: "Liquid ammonia or sodium hydroxide (NaOH) scrubber spray; forms harmless sodium chloride and sodium carbonate.",
    isolationDistance: "800m Daytime / 2,500m Nighttime downwind corridor"
  }
];

// Emergency Service Directory for Chemical Disasters
const EMERGENCY_SERVICES = [
  {
    id: "hazmat-1",
    name: "Industrial Hazmat Rapid Response Unit 9",
    category: "Hazmat",
    phone: "1-800-424-9300 (CHEMTREC) / 911-HAZMAT",
    internalExt: "Ext. 9911",
    channel: "VHF Hazmat TAC-4 (154.280 MHz)",
    eta: "4 - 7 mins",
    leadOfficer: "Commander Sarah Vance (Hazmat Specialist)",
    status: "On Standby - Station 4"
  },
  {
    id: "fire-rescue",
    name: "Metropolitan Chemical Fire & Rescue District 12",
    category: "Fire & Rescue",
    phone: "911 / (555) 019-FIRE",
    internalExt: "Ext. 9912",
    channel: "VHF Fire Dispatch (154.190 MHz)",
    eta: "5 - 8 mins",
    leadOfficer: "Chief Marcus Brody",
    status: "Active Alert Ready"
  },
  {
    id: "poison-control",
    name: "National Chemical Poison Center & Medical Toxicologists",
    category: "Medical / Poison",
    phone: "1-800-222-1222 (24/7 Hotline)",
    internalExt: "Ext. 8844",
    channel: "Direct Dedicated Landline",
    eta: "Immediate (Phone Consult)",
    leadOfficer: "Dr. Elena Rostova, MD (Toxicology Fellowship)",
    status: "24/7 Tele-Toxicology Open"
  },
  {
    id: "trauma-hospital",
    name: "St. Jude Regional Trauma & Hazmat Burns Center",
    category: "Hospital / Decon",
    phone: "(555) 019-8700 (ER Desk)",
    internalExt: "Ext. 8899",
    channel: "HEAR Radio (155.340 MHz)",
    eta: "11 mins (Transport)",
    leadOfficer: "Dr. David Chen (Emergency Dept Director)",
    status: "Decon Bays Ready / 14 Burn Beds Available"
  },
  {
    id: "community-admin",
    name: "Municipal Emergency Management Agency (EMA)",
    category: "Civil Defense",
    phone: "(555) 019-3322 (Disaster Ops)",
    internalExt: "Ext. 7701",
    channel: "EAS Broadcast Link / WEA Alert",
    eta: "Instant Wireless Alerts",
    leadOfficer: "Director Raymond Ortiz",
    status: "EAS Satellite Uplink Live"
  },
  {
    id: "plant-command",
    name: "ChemSafe Chief Safety Officer (CSO) & War Room",
    category: "Plant Leadership",
    phone: "(555) 019-9000 (Internal Priority)",
    internalExt: "Ext. 1000",
    channel: "Plant Security Trunk 1",
    eta: "On-site (Bldg C Command)",
    leadOfficer: "Evelyn Reed, CSP (Chief Safety Officer)",
    status: "Active Monitoring"
  }
];

// Plant zones and telemetry points
const PLANT_ZONES = [
  { id: "A", name: "Sector A: Gas Storage & Tank Farm", chemical: "Chlorine Gas", sensorId: "S-101", basePpm: 0.3, maxSafePpm: 0.5, criticalPpm: 10.0, workers: 18 },
  { id: "B", name: "Sector B: Ammonia Synthesis & Refrigeration", chemical: "Anhydrous Ammonia", sensorId: "S-204", basePpm: 8.5, maxSafePpm: 25.0, criticalPpm: 150.0, workers: 34 },
  { id: "C", name: "Sector C: Hydrocarbon & Benzene Loading Bay", chemical: "Benzene", sensorId: "S-309", basePpm: 0.1, maxSafePpm: 0.5, criticalPpm: 5.0, workers: 22 },
  { id: "D", name: "Sector D: Sulfur Scrubbing & Flue Gas", chemical: "Hydrogen Sulfide", sensorId: "S-412", basePpm: 1.2, maxSafePpm: 5.0, criticalPpm: 20.0, workers: 14 },
  { id: "E", name: "Sector E: Central Control & Administrative HQ", chemical: "Ambient Air Quality", sensorId: "S-500", basePpm: 0.0, maxSafePpm: 0.1, criticalPpm: 1.0, workers: 52 },
  { id: "F", name: "Surrounding Residential Ward & Schools (South-East)", chemical: "Community Buffer", sensorId: "S-EXT-1", basePpm: 0.0, maxSafePpm: 0.05, criticalPpm: 0.5, workers: 1200 }
];
