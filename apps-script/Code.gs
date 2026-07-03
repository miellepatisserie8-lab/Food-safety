/**
 * Mielle Kitchen Safety — Google Apps Script backend (v2)
 *
 * Setup:
 * 1. Open the "Mielle Kitchen Data" Google Sheet.
 * 2. Extensions → Apps Script → paste this file, replacing old code.
 * 3. Deploy → New deployment → Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the Web App URL into Vercel as REACT_APP_GOOGLE_SCRIPT_URL.
 *
 * Sheets are created automatically with headers on first use.
 */

var SHEETS = {
  Temp_Logs: ["Timestamp", "Staff", "Appliance", "TempC", "Status", "Action"],
  Food_Temp_Logs: ["Timestamp", "Staff", "CheckType", "Food", "TempC", "Status", "Action"],
  Deliveries: ["Timestamp", "Staff", "Supplier", "Invoice", "Category", "TempC", "Intact", "Status", "Note"],
  Calibration_Logs: ["Timestamp", "Staff", "Probe", "IceC", "BoilC", "Status", "Action"],
  Daily_Checks: ["Timestamp", "Staff", "CheckType", "Item", "Result", "Note"],
  Cleaning_Logs: ["Timestamp", "Staff", "Task", "Frequency"],
  Hygiene_Logs: ["Timestamp", "Staff", "Item", "Result", "Note"],
  Incidents: ["Timestamp", "Staff", "Type", "Description", "Action"],
  Staff_Training: ["Timestamp", "RecordedBy", "Trainee", "Course", "Provider", "Expiry"],
  Settings: ["Key", "Value"]
};

function getSheet_(name) {
  var ss = SpreadsheetApp.openById('1QFUdOM6tp4cxVqjQgHEC9l45kKvGlsk1GGKajQXVDN0');
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    var action = e.parameter.action;
    var p = JSON.parse(e.parameter.payload || "{}");
    var now = new Date();

    if (action === "logTemp") {
      getSheet_("Temp_Logs").appendRow([now, p.staff, p.appliance, p.tempC, p.status, p.action || ""]);
    } else if (action === "logFoodTemp") {
      getSheet_("Food_Temp_Logs").appendRow([now, p.staff, p.checkType, p.food, p.tempC, p.status, p.action || ""]);
    } else if (action === "logDelivery") {
      getSheet_("Deliveries").appendRow([now, p.staff, p.supplier, p.invoice || "", p.category, p.tempC, p.intact, p.status, p.note || ""]);
    } else if (action === "logCalibration") {
      getSheet_("Calibration_Logs").appendRow([now, p.staff, p.probe, p.iceC, p.boilC, p.status, p.action || ""]);
    } else if (action === "logDailyCheck") {
      var sh = getSheet_("Daily_Checks");
      (p.results || []).forEach(function (r) {
        sh.appendRow([now, p.staff, p.checkType, r.item, r.result, p.note || ""]);
      });
    } else if (action === "logCleaning") {
      getSheet_("Cleaning_Logs").appendRow([now, p.staff, p.task, p.freq]);
    } else if (action === "logHygiene") {
      var hs = getSheet_("Hygiene_Logs");
      (p.results || []).forEach(function (r) {
        hs.appendRow([now, p.staff, r.item, r.result, p.note || ""]);
      });
    } else if (action === "logIncident") {
      getSheet_("Incidents").appendRow([now, p.staff, p.type, p.description, p.action]);
    } else if (action === "logTraining") {
      getSheet_("Staff_Training").appendRow([now, p.staff, p.trainee, p.course, p.provider || "", p.expiry || ""]);
    } else {
      return json_({ ok: false, error: "Unknown action" });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === "getStaff") {
      var sh = getSheet_("Settings");
      var rows = sh.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toLowerCase() === "staff") {
          return json_({ staff: String(rows[i][1]).split(",").map(function (s) { return s.trim(); }).filter(String) });
        }
      }
      return json_({ staff: [] });
    }
    if (action === "getHistory") {
      return json_(buildHistory_(Number(e.parameter.days) || 31));
    }
    return json_({ ok: true, service: "Mielle Kitchen Safety backend v2" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function dayKey_(d) {
  return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function buildHistory_(days) {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  var byDay = {};
  var recent = [];
  var todayKey = dayKey_(new Date());
  var cleaningToday = [];

  function ensure(k) {
    if (!byDay[k]) byDay[k] = { opening: false, closing: false, temps: 0, cleaning: 0, hygiene: 0, incidents: 0 };
    return byDay[k];
  }

  function scan(sheetName, fn) {
    var sh = SpreadsheetApp.openById('1QFUdOM6tp4cxVqjQgHEC9l45kKvGlsk1GGKajQXVDN0').getSheetByName(sheetName);
    if (!sh || sh.getLastRow() < 2) return;
    var rows = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
    rows.forEach(function (r) {
      var ts = new Date(r[0]);
      if (isNaN(ts) || ts < cutoff) return;
      fn(r, ts, dayKey_(ts));
    });
  }

  scan("Daily_Checks", function (r, ts, k) {
    var d = ensure(k);
    if (r[2] === "opening") d.opening = true;
    if (r[2] === "closing") d.closing = true;
  });
  scan("Temp_Logs", function (r, ts, k) {
    ensure(k).temps++;
    recent.push({ ts: ts, summary: r[2] + ": " + r[3] + "°C (" + r[4] + ")", staff: r[1] });
  });
  scan("Food_Temp_Logs", function (r, ts, k) {
    ensure(k).foodTemps = (ensure(k).foodTemps || 0) + 1;
    recent.push({ ts: ts, summary: r[2] + " — " + r[3] + ": " + r[4] + "°C (" + r[5] + ")", staff: r[1] });
  });
  scan("Deliveries", function (r, ts, k) {
    ensure(k).deliveries = (ensure(k).deliveries || 0) + 1;
    recent.push({ ts: ts, summary: "Delivery: " + r[2] + " (" + r[7] + ")", staff: r[1] });
  });
  scan("Calibration_Logs", function (r, ts, k) {
    recent.push({ ts: ts, summary: "Calibration: " + r[2] + " (" + r[5] + ")", staff: r[1] });
  });
  scan("Cleaning_Logs", function (r, ts, k) {
    ensure(k).cleaning++;
    if (k === todayKey) cleaningToday.push(String(r[2]));
    recent.push({ ts: ts, summary: "Cleaned: " + r[2], staff: r[1] });
  });
  scan("Hygiene_Logs", function (r, ts, k) {
    ensure(k).hygiene++;
  });
  scan("Incidents", function (r, ts, k) {
    ensure(k).incidents++;
    recent.push({ ts: ts, summary: "Incident: " + r[2], staff: r[1] });
  });

  recent.sort(function (a, b) { return b.ts - a.ts; });
  recent = recent.slice(0, 15).map(function (r) {
    return {
      summary: r.summary,
      staff: r.staff,
      when: Utilities.formatDate(r.ts, Session.getScriptTimeZone(), "d MMM HH:mm")
    };
  });

  return { days: byDay, recent: recent, cleaningToday: cleaningToday };
}
