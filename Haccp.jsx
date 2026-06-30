import { GOOGLE_SCRIPT_URL } from '../config';

// Keys used in localStorage
const QUEUE_KEY = 'mielle_queue';
const LOCAL_PREFIX = 'mielle_';

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage full or unavailable - ignore */
  }
}

// ---- Per-device history (survives refresh / phone restart) ----
export function loadLocal(name) {
  return readLS(LOCAL_PREFIX + name, []);
}

export function saveLocal(name, data) {
  writeLS(LOCAL_PREFIX + name, data);
}

// ---- Offline queue ----
function enqueue(payload) {
  const q = readLS(QUEUE_KEY, []);
  q.push(payload);
  writeLS(QUEUE_KEY, q);
}

export function queueLength() {
  return readLS(QUEUE_KEY, []).length;
}

// Fire the request. 'no-cors' lets any phone POST to Apps Script
// without a CORS pre-flight; we can't read the reply, but the
// row is written. A thrown error (offline) drops us into the queue.
async function send(payload) {
  await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
}

// Push one row to a given tab. Always returns - never throws.
export async function pushRow(sheet, data) {
  const payload = { sheet, data };
  if (!GOOGLE_SCRIPT_URL) {
    enqueue(payload);
    return { queued: true, reason: 'no-url' };
  }
  try {
    await send(payload);
    return { ok: true };
  } catch (e) {
    enqueue(payload);
    return { queued: true, error: String(e) };
  }
}

// Try to resend anything that was queued while offline / before setup.
export async function flushQueue() {
  if (!GOOGLE_SCRIPT_URL) return;
  const q = readLS(QUEUE_KEY, []);
  if (!q.length) return;
  const remaining = [];
  for (const payload of q) {
    try {
      await send(payload);
    } catch (e) {
      remaining.push(payload);
    }
  }
  writeLS(QUEUE_KEY, remaining);
}

// ---- Row mappers: app data -> exact Google Sheet column names ----
export function toHygieneRow(d) {
  return {
    Date: d.date,
    Time: d.time,
    Staff: d.staff,
    Freezer1: d.freezer1,
    Freezer2: d.freezer2,
    Freezer3: d.freezer3,
    Freezer4: d.freezer4,
    Fridge1: d.fridge1,
    Fridge2: d.fridge2,
    Fridge3: d.fridge3,
    Fridge4: d.fridge4,
    Fridge5: d.fridge5,
    Fridge6: d.fridge6,
    KitchenCleaned: d.kitchenCleaned,
    ToiletCleaned: d.toiletCleaned,
    AllergenChecked: d.allergenChecked,
    Notes: d.notes,
  };
}

export function toTrainingRow(d) {
  return {
    Date: d.date,
    Staff: d.staff,
    Topics: (d.topics || []).join(', '),
    Notes: d.notes,
  };
}

export function toAllergenRow(d) {
  return {
    Supplier: d.name,
    Version: d.version,
    DateUpdated: d.date,
    Status: d.status,
    Link: d.link,
  };
}

export function toIncidentRow(d) {
  return {
    Type: d.type,
    Date: d.date,
    Customer: d.customer,
    Contact: d.contact,
    Product: d.product,
    Description: d.description,
    ReportedBy: d.reportedBy,
  };
}

export function toHaccpRow(d) {
  return {
    ProcessStep: d.processStep,
    Hazard: d.hazard,
    ControlMeasure: d.controlMeasure,
    CriticalLimit: d.criticalLimit,
    Monitoring: d.monitoring,
    CorrectiveAction: d.correctiveAction,
    Date: d.date,
    AddedBy: d.addedBy,
  };
}

export function toHaccpDocRow(d) {
  return { Name: d.name, Link: d.link, AddedBy: d.addedBy };
}

export function toCertRow(d) {
  return { Name: d.name, Holder: d.holder, Expiry: d.expiry, Link: d.link };
}
