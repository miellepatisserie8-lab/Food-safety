import { SCRIPT_URL } from "./config";

// Apps Script web apps accept form-encoded POSTs without a CORS preflight.
async function post(action, payload) {
  if (!SCRIPT_URL) throw new Error("Backend not configured. Set REACT_APP_GOOGLE_SCRIPT_URL.");
  const body = new URLSearchParams({ action, payload: JSON.stringify(payload) });
  const res = await fetch(SCRIPT_URL, { method: "POST", body });
  if (!res.ok) throw new Error("Could not save. Check your connection and try again.");
  return res.json().catch(() => ({}));
}

async function get(action, params = {}) {
  if (!SCRIPT_URL) throw new Error("Backend not configured. Set REACT_APP_GOOGLE_SCRIPT_URL.");
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(`${SCRIPT_URL}?${qs}`);
  if (!res.ok) throw new Error("Could not load records. Check your connection and try again.");
  return res.json();
}

export const api = {
  logTemp: (row) => post("logTemp", row),
  logFoodTemp: (row) => post("logFoodTemp", row),
  logDelivery: (row) => post("logDelivery", row),
  logCalibration: (row) => post("logCalibration", row),
  logFoodTemp: (row) => post("logFoodTemp", row),
  logDelivery: (row) => post("logDelivery", row),
  logCalibration: (row) => post("logCalibration", row),
  logDailyCheck: (row) => post("logDailyCheck", row),
  logCleaning: (row) => post("logCleaning", row),
  logHygiene: (row) => post("logHygiene", row),
  logIncident: (row) => post("logIncident", row),
  logTraining: (row) => post("logTraining", row),
  getHistory: (days = 31) => get("getHistory", { days }),
  getStaff: () => get("getStaff"),
};
