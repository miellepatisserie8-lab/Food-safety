// All secrets come from environment variables — never hardcode them here.
// Local dev: put values in .env (gitignored). Production: set in Vercel.
export const SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "";
export const MANAGER_PASSCODE = process.env.REACT_APP_MANAGER_PASSCODE || "";

// Optional per-staff PINs for accountability when signing off checks.
// Format in Vercel: REACT_APP_STAFF_PINS = "Paul:1234,Eva:2345,Ryan:3456,Aiden:4567"
// If a name has no PIN configured here, picking that name needs no PIN (unchanged behaviour).
export const STAFF_PINS = (() => {
  const raw = process.env.REACT_APP_STAFF_PINS || "";
  const map = {};
  raw.split(",").forEach((pair) => {
    const [name, pin] = pair.split(":").map((s) => (s || "").trim());
    if (name && pin) map[name] = pin;
  });
  return map;
})();

// Manager-area emergency contacts. This repo is public, so real names/numbers
// live only in Vercel env vars, never in committed code.
// REACT_APP_FIRE_MARSHAL_CONTACT e.g. "Ryan Chan — 07835 268903"
// REACT_APP_MANAGER_PHONE e.g. "07514 272558"
export const FIRE_MARSHAL_CONTACT = process.env.REACT_APP_FIRE_MARSHAL_CONTACT || "";
export const MANAGER_PHONE = process.env.REACT_APP_MANAGER_PHONE || "";

export const BRAND = {
  navy: "#0B3D2E",
  gold: "#B8860B",
  ivory: "#F5F5F5",
};

// Appliances for temperature logging. Edit to match the kitchen.
export const APPLIANCES = [
  { id: "barfridge1", name: "Bar Fridge 1", type: "fridge", min: 0, max: 8 },
  { id: "barfridge2", name: "Bar Fridge 2", type: "fridge", min: 0, max: 8 },
  { id: "barfridge3", name: "Bar Fridge 3", type: "fridge", min: 0, max: 8 },
  { id: "barfridge4", name: "Bar Fridge 4", type: "fridge", min: 0, max: 8 },
  { id: "barfridge5", name: "Bar Fridge 5", type: "fridge", min: 0, max: 8 },
  { id: "barfridge6", name: "Bar Fridge 6", type: "fridge", min: 0, max: 8 },
  { id: "fridge1", name: "Fridge 1 (Kitchen)", type: "fridge", min: 0, max: 8 },
  { id: "fridge2", name: "Fridge 2 (Cake Display)", type: "fridge", min: 0, max: 8 },
  { id: "freezer1", name: "Freezer 1", type: "freezer", min: -25, max: -18 },
  { id: "freezer2", name: "Freezer 2", type: "freezer", min: -25, max: -18 },
  { id: "cellar", name: "Cellar Cooler", type: "cellar", min: 11, max: 13 },
];

export const OPENING_CHECKS = [
  "Fridges and freezers working and at safe temperatures",
  "Food prep areas clean and sanitised before use",
  "Hand wash basins stocked with soap and paper towels",
  "Probe thermometer clean and working",
  "No evidence of pests (droppings, damage, insects)",
  "Staff fit for work, clean uniform, no uncovered cuts",
  "All food in date and stored covered / off the floor",
];

export const CLOSING_CHECKS = [
  "All food labelled, covered and stored correctly",
  "Work surfaces and equipment cleaned and sanitised",
  "Floors swept and mopped",
  "Bins emptied and bin area tidy",
  "Fridge and freezer doors closed properly",
  "Dishwasher / glasswasher emptied and left open",
  "Electric equipment off (no gas on premises)",
];

export const CLEANING_TASKS = [
  { id: "surfaces", name: "Food contact surfaces", freq: "Daily" },
  { id: "floors", name: "Kitchen floors", freq: "Daily" },
  { id: "sinks", name: "Sinks and hand basins", freq: "Daily" },
  { id: "fridges", name: "Fridge interiors", freq: "Weekly" },
  { id: "shelving", name: "Dry store shelving", freq: "Weekly" },
  { id: "extraction", name: "Extraction filters", freq: "Weekly" },
  { id: "walls", name: "Walls and doors", freq: "Monthly" },
  { id: "freezer", name: "Freezer deep clean", freq: "Monthly" },
];

// Food probe temperature checks (England FSA guidance).
// Entries with `min` must read at or above it; entries with `max` at or below it.
export const FOOD_TEMP_TYPES = [
  { id: "cooking", name: "Cooking", icon: "🍳", rule: "Core temperature 75°C or above", min: 75 },
  { id: "reheating", name: "Reheating", icon: "♨️", rule: "Reheat to 75°C or above — reheat once only", min: 75 },
  { id: "hot-holding", name: "Hot holding", icon: "🍲", rule: "Keep hot food at 63°C or above", min: 63 },
  { id: "cooling", name: "Cooling", icon: "🧊", rule: "Cool to 8°C or below within 90 minutes", max: 8 },
];

// Delivery acceptance limits by category. `ambient` needs no temperature probe.
export const DELIVERY_LIMITS = {
  chilled: { label: "Chilled", target: "Accept at 8°C or below (aim for 0–5°C)", max: 8 },
  frozen: { label: "Frozen", target: "Accept at −15°C or below and hard frozen (target −18°C)", max: -15 },
  ambient: { label: "Ambient", target: "No probe needed — check packaging, dates and condition" },
};

export const INCIDENT_TYPES = [
  "Food poisoning allegation",
  "Allergen issue",
  "Foreign object",
  "Undercooked food",
  "Accident / injury",
  "Other",
];
