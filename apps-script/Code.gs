/**
 * Mielle Kitchen Safety — Google Apps Script backend (v3)
 *
 * v3 adds:
 *  - Cake_Orders tab + addOrder / updateOrder / getOrders
 *  - Allergen_Products tab (shared product list) + seed/save/delete/get
 *  - Shopify webhooks (order creation + cancellation), protected by a
 *    WEBHOOK_TOKEN stored in Project Settings → Script Properties
 *    (never in this file — the repo is public).
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
  Cake_Orders: ["OrderID", "CreatedAt", "UpdatedAt", "Source", "ShopifyOrderNo", "ShopifyOrderId",
    "Customer", "Phone", "Email", "Items", "CakeMessage", "AllergyFlag", "AllergyNote", "CustomerNote",
    "CollectionDate", "CollectionTime", "PriceGBP", "DepositGBP", "Status", "Staff", "CancelReason"],
  Allergen_Products: ["ProductID", "Name", "Category", "Contains", "MayContain", "UpdatedAt", "UpdatedBy"],
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
    // Shopify webhooks arrive as JSON with ?source=shopify&topic=…&token=… on the URL.
    if (e.parameter.source === "shopify") {
      return handleShopifyWebhook_(e);
    }
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

    /* ── v3: cake orders ── */
    } else if (action === "addOrder") {
      appendOrder_(orderRowFromApp_(p, now));
    } else if (action === "updateOrder") {
      var updated = updateOrderRow_(p, now);
      if (!updated) return json_({ ok: false, error: "Order not found: " + p.id });

    /* ── v3: shared allergen products ── */
    } else if (action === "seedProducts") {
      var ps = getSheet_("Allergen_Products");
      if (ps.getLastRow() <= 1) {
        (p.products || []).forEach(function (pr) {
          ps.appendRow([pr.id, pr.name, pr.category || "",
            (pr.contains || []).join("|"), (pr.may || []).join("|"), now, "seed"]);
        });
      }
    } else if (action === "saveProduct") {
      saveProduct_(p, now);
    } else if (action === "deleteProduct") {
      deleteProductRow_(p.id);
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
    if (action === "getOrders") {
      return json_({ orders: readOrders_() });
    }
    if (action === "getProducts") {
      return json_(readProducts_());
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


/* ═══════════════════ v3 — cake orders ═══════════════════ */

var ORDER_COLS = SHEETS.Cake_Orders;

function colIx_(name) {
  return ORDER_COLS.indexOf(name);
}

function appendOrder_(row) {
  getSheet_("Cake_Orders").appendRow(row);
}

function orderRowFromApp_(p, now) {
  return [
    p.id, now, now, p.source || "walkin", "", "",
    p.customer || "", p.phone || "", p.email || "",
    p.items || "", p.cakeMessage || "", p.allergyFlag ? "true" : "false", p.allergyNote || "",
    p.customerNote || "", p.collectionDate || "", p.collectionTime || "",
    Number(p.price || 0), Number(p.deposit || 0),
    p.status || "Confirmed", p.staff || "", ""
  ];
}

// Patch an existing order row by OrderID. Only fields present in the
// payload are changed, so status taps never wipe other columns.
function updateOrderRow_(p, now) {
  var sh = getSheet_("Cake_Orders");
  if (sh.getLastRow() < 2) return false;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(p.id)) {
      var rowN = i + 2;
      var row = sh.getRange(rowN, 1, 1, ORDER_COLS.length).getValues()[0];
      var map = {
        source: "Source", customer: "Customer", phone: "Phone", email: "Email",
        items: "Items", cakeMessage: "CakeMessage", allergyNote: "AllergyNote",
        customerNote: "CustomerNote", collectionDate: "CollectionDate",
        collectionTime: "CollectionTime", status: "Status", staff: "Staff",
        cancelReason: "CancelReason"
      };
      for (var key in map) {
        if (p[key] !== undefined) row[colIx_(map[key])] = p[key];
      }
      if (p.allergyFlag !== undefined) row[colIx_("AllergyFlag")] = p.allergyFlag ? "true" : "false";
      if (p.price !== undefined) row[colIx_("PriceGBP")] = Number(p.price || 0);
      if (p.deposit !== undefined) row[colIx_("DepositGBP")] = Number(p.deposit || 0);
      row[colIx_("UpdatedAt")] = now;
      sh.getRange(rowN, 1, 1, ORDER_COLS.length).setValues([row]);
      return true;
    }
  }
  return false;
}

function fmtDate_(v, pattern) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), pattern);
  return String(v || "");
}

// Return orders as objects. Keeps the payload sane: everything still
// open, plus anything created or collected in the last 120 days.
function readOrders_() {
  var sh = getSheet_("Cake_Orders");
  if (sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, ORDER_COLS.length).getValues();
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 120);
  var out = [];
  rows.forEach(function (r) {
    var status = String(r[colIx_("Status")]);
    var created = new Date(r[colIx_("CreatedAt")]);
    var open = status !== "Collected" && status !== "Cancelled";
    if (!open && !isNaN(created) && created < cutoff) return;
    out.push({
      id: String(r[colIx_("OrderID")]),
      createdAt: fmtDate_(r[colIx_("CreatedAt")], "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: fmtDate_(r[colIx_("UpdatedAt")], "yyyy-MM-dd'T'HH:mm:ss"),
      source: String(r[colIx_("Source")] || "walkin"),
      shopifyNo: String(r[colIx_("ShopifyOrderNo")] || ""),
      shopifyId: String(r[colIx_("ShopifyOrderId")] || ""),
      customer: String(r[colIx_("Customer")] || ""),
      phone: String(r[colIx_("Phone")] || ""),
      email: String(r[colIx_("Email")] || ""),
      items: String(r[colIx_("Items")] || ""),
      cakeMessage: String(r[colIx_("CakeMessage")] || ""),
      allergyFlag: String(r[colIx_("AllergyFlag")]) === "true",
      allergyNote: String(r[colIx_("AllergyNote")] || ""),
      customerNote: String(r[colIx_("CustomerNote")] || ""),
      collectionDate: fmtDate_(r[colIx_("CollectionDate")], "yyyy-MM-dd"),
      collectionTime: fmtDate_(r[colIx_("CollectionTime")], "HH:mm"),
      price: Number(r[colIx_("PriceGBP")] || 0),
      deposit: Number(r[colIx_("DepositGBP")] || 0),
      status: status || "New",
      staff: String(r[colIx_("Staff")] || ""),
      cancelReason: String(r[colIx_("CancelReason")] || "")
    });
  });
  return out;
}

/* ── Shopify webhooks ──
 * Set up in Shopify admin → Settings → Notifications → Webhooks:
 *   Order creation      → <web app URL>?source=shopify&topic=created&token=<WEBHOOK_TOKEN>
 *   Order cancellation  → <web app URL>?source=shopify&topic=cancelled&token=<WEBHOOK_TOKEN>
 * WEBHOOK_TOKEN lives in Apps Script → Project Settings → Script Properties.
 * Note: Apps Script cannot read request headers, so Shopify's HMAC header
 * cannot be verified here — the long random URL token is the guard instead.
 */
function handleShopifyWebhook_(e) {
  var expected = PropertiesService.getScriptProperties().getProperty("WEBHOOK_TOKEN");
  if (!expected || e.parameter.token !== expected) {
    return json_({ ok: false, error: "Bad token" });
  }
  var order;
  try {
    order = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "Bad payload" });
  }
  var topic = e.parameter.topic || "created";
  var shopifyId = String(order.id || "");
  if (!shopifyId) return json_({ ok: false, error: "No order id" });

  var sh = getSheet_("Cake_Orders");
  var existingRow = findByShopifyId_(sh, shopifyId);

  if (topic === "cancelled") {
    if (existingRow) {
      var now = new Date();
      var row = sh.getRange(existingRow, 1, 1, ORDER_COLS.length).getValues()[0];
      row[colIx_("Status")] = "Cancelled";
      row[colIx_("CancelReason")] = "Cancelled in Shopify" +
        (order.cancel_reason ? " (" + order.cancel_reason + ")" : "");
      row[colIx_("UpdatedAt")] = now;
      sh.getRange(existingRow, 1, 1, ORDER_COLS.length).setValues([row]);
    }
    return json_({ ok: true });
  }

  // created — ignore duplicates (Shopify retries deliveries)
  if (existingRow) return json_({ ok: true, duplicate: true });

  var now2 = new Date();
  var cust = order.customer || {};
  var addr = order.shipping_address || order.billing_address || {};
  var name = ((cust.first_name || addr.first_name || "") + " " + (cust.last_name || addr.last_name || "")).trim()
    || order.email || "Web customer";
  var phone = order.phone || cust.phone || addr.phone || "";
  var items = (order.line_items || []).map(function (li) {
    var v = li.variant_title && li.variant_title !== "Default Title" ? " — " + li.variant_title : "";
    return li.quantity + " × " + li.title + v;
  }).join("\n");
  var price = Number(order.current_total_price || order.total_price || 0);
  var outstanding = Number(order.total_outstanding || 0);
  var paid = Math.max(0, price - outstanding);

  appendOrder_([
    "shopify-" + shopifyId, now2, now2, "web",
    String(order.order_number || order.name || "").replace("#", ""), shopifyId,
    name, phone, order.email || order.contact_email || "",
    items, "", "false", "", order.note || "",
    "", "", price, paid, "New", "Shopify", ""
  ]);
  return json_({ ok: true });
}

function findByShopifyId_(sh, shopifyId) {
  if (sh.getLastRow() < 2) return 0;
  var col = colIx_("ShopifyOrderId") + 1;
  var vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === shopifyId) return i + 2;
  }
  return 0;
}

/* ═══════════════ v3 — shared allergen products ═══════════════ */

function readProducts_() {
  var sh = getSheet_("Allergen_Products");
  if (sh.getLastRow() < 2) return { seeded: false, products: [] };
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  var products = rows.filter(function (r) { return r[0]; }).map(function (r) {
    return {
      id: String(r[0]),
      name: String(r[1] || ""),
      category: String(r[2] || ""),
      contains: String(r[3] || "").split("|").filter(String),
      may: String(r[4] || "").split("|").filter(String)
    };
  });
  return { seeded: true, products: products };
}

function saveProduct_(p, now) {
  var sh = getSheet_("Allergen_Products");
  var row = [p.id, p.name || "", p.category || "",
    (p.contains || []).join("|"), (p.may || []).join("|"), now, p.staff || ""];
  if (sh.getLastRow() >= 2) {
    var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(p.id)) {
        sh.getRange(i + 2, 1, 1, 7).setValues([row]);
        return;
      }
    }
  }
  sh.appendRow(row);
}

function deleteProductRow_(id) {
  var sh = getSheet_("Allergen_Products");
  if (sh.getLastRow() < 2) return;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sh.deleteRow(i + 2);
      return;
    }
  }
}
