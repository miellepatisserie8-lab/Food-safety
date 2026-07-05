import Guide from "../components/Guide";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { CLOSED_DAYS, ORDER_LEAD_DAYS, ORDER_STATUSES } from "../config";
import { productsFromCache, findProductByName, newId } from "../products";

/* ── date helpers ── */
function dayKey(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0); // avoid DST edge cases
  return x.toISOString().slice(0, 10);
}
function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function weekdayName(key) {
  return new Date(key + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" });
}
function niceDate(key) {
  return new Date(key + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
function daysUntil(key) {
  const today = new Date(dayKey(new Date()) + "T12:00:00");
  const target = new Date(key + "T12:00:00");
  return Math.round((target - today) / 86400000);
}
export function isClosedDay(key) {
  return CLOSED_DAYS.includes(weekdayName(key));
}

/* Order helpers shared with Dashboard */
export function isActive(o) {
  return o.status !== "Collected" && o.status !== "Cancelled";
}
export function ordersForDay(orders, key) {
  return orders
    .filter((o) => o.collectionDate === key && o.status !== "Cancelled")
    .sort((a, b) => (a.collectionTime || "99").localeCompare(b.collectionTime || "99"));
}
export function overdueOrders(orders) {
  const today = dayKey(new Date());
  return orders.filter((o) => isActive(o) && o.collectionDate && o.collectionDate < today);
}
export function inboxOrders(orders) {
  return orders.filter((o) => o.source === "web" && o.status === "New");
}

function itemsSummary(o) {
  const lines = String(o.items || "").split("\n").filter(Boolean);
  if (!lines.length) return "—";
  return lines.length === 1 ? lines[0] : `${lines[0]}  +${lines.length - 1} more`;
}
function money(n) {
  const v = Number(n || 0);
  return "£" + v.toFixed(v % 1 ? 2 : 0);
}
function telHref(phone) {
  return "tel:" + String(phone || "").replace(/[^\d+]/g, "");
}
function waHref(phone, msg) {
  let p = String(phone || "").replace(/[^\d+]/g, "");
  if (p.startsWith("0")) p = "+44" + p.slice(1);
  return "https://wa.me/" + p.replace("+", "") + "?text=" + encodeURIComponent(msg);
}
const SOURCE_ICON = { web: "🌐", phone: "📞", walkin: "🏪" };
function linkExpired(o) {
  if (!o.sumupCreatedAt) return false;
  return Date.now() - new Date(o.sumupCreatedAt).getTime() > 30 * 60 * 1000; // SumUp links live ~30 min
}

/* ══════════════════ main screen ══════════════════ */
export default function Orders({ staff, showToast, orders, refreshOrders, ordersError }) {
  const [view, setView] = useState("week"); // week | inbox | kitchen | new
  const [detail, setDetail] = useState(null); // order being viewed
  const [editing, setEditing] = useState(null); // order being edited (or "new")
  const list = orders || [];
  const inbox = inboxOrders(list);

  useEffect(() => {
    refreshOrders && refreshOrders();
  }, []);

  const openDetail = (o) => setDetail(o);
  const closeDetail = () => setDetail(null);

  // keep the open detail in sync after a save/refresh
  const liveDetail = detail ? list.find((o) => o.id === detail.id) || detail : null;

  if (editing) {
    return (
      <OrderForm
        staff={staff}
        showToast={showToast}
        refreshOrders={refreshOrders}
        existing={editing === "new" ? null : editing}
        onDone={(saved) => {
          setEditing(null);
          setView("week");
          if (saved) setDetail(saved);
        }}
      />
    );
  }

  if (liveDetail) {
    return (
      <OrderDetail
        order={liveDetail}
        staff={staff}
        showToast={showToast}
        refreshOrders={refreshOrders}
        onBack={closeDetail}
        onEdit={() => {
          setEditing(liveDetail);
          setDetail(null);
        }}
      />
    );
  }

  return (
    <div className="screen">
      <h2>Cake orders 🎂</h2>
      <p className="lead">Pre-orders for collection — web, phone and walk-in.</p>
      <Guide id="orders" />

      <div className="seg-row">
        <button className={view === "week" ? "sel" : ""} onClick={() => setView("week")}>This week</button>
        <button className={view === "inbox" ? "sel" : ""} onClick={() => setView("inbox")}>
          🌐 Inbox{inbox.length ? ` (${inbox.length})` : ""}
        </button>
        <button className={view === "kitchen" ? "sel" : ""} onClick={() => setView("kitchen")}>Kitchen</button>
      </div>

      {ordersError && <div className="warn">Orders aren't loading: {ordersError}</div>}

      {view === "week" && <WeekView orders={list} onOpen={openDetail} />}
      {view === "inbox" && <InboxView orders={list} onOpen={openDetail} />}
      {view === "kitchen" && <KitchenView orders={list} onOpen={openDetail} />}

      <button className="btn gold" onClick={() => setEditing("new")}>+ New order (phone / walk-in)</button>
    </div>
  );
}

/* ══════════════════ This week ══════════════════ */
function WeekView({ orders, onOpen }) {
  const todayKey = dayKey(new Date());
  const overdue = overdueOrders(orders);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const key = dayKey(addDays(new Date(), i));
    days.push({ key, list: ordersForDay(orders, key) });
  }
  const later = orders
    .filter((o) => isActive(o) && o.collectionDate && daysUntil(o.collectionDate) > 6)
    .sort((a, b) => a.collectionDate.localeCompare(b.collectionDate));

  const nothing = !overdue.length && days.every((d) => !d.list.length) && !later.length;

  return (
    <>
      {overdue.length > 0 && (
        <>
          <div className="section-title" style={{ color: "var(--fail)" }}>⛔ Overdue / uncollected</div>
          {overdue.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} overdue />)}
        </>
      )}
      {days.map(({ key, list }) => (
        <React.Fragment key={key}>
          <div className="section-title">
            {key === todayKey ? "Today" : niceDate(key)}
            {isClosedDay(key) && <span className="closed-tag"> · closed day</span>}
          </div>
          {list.length === 0 ? (
            <div className="empty small">No collections</div>
          ) : (
            list.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)
          )}
        </React.Fragment>
      ))}
      {later.length > 0 && (
        <>
          <div className="section-title">Later</div>
          {later.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} showDate />)}
        </>
      )}
      {nothing && <div className="empty">No upcoming orders. Web orders appear in the 🌐 Inbox first.</div>}
    </>
  );
}

function OrderCard({ o, onOpen, overdue, showDate }) {
  const statusCls =
    o.status === "Collected" ? "ok" : o.status === "Cancelled" ? "fail" : o.status === "Ready" ? "ok" : "due";
  return (
    <button className={`order-card ${overdue ? "overdue" : ""} ${o.status === "Cancelled" ? "cancelled" : ""}`} onClick={() => onOpen(o)}>
      <div className="oc-time">
        {showDate || overdue ? <span className="oc-date">{niceDate(o.collectionDate)}</span> : null}
        {o.collectionTime || "—"}
      </div>
      <div className="oc-main">
        <div className="oc-name">
          {SOURCE_ICON[o.source] || ""} {o.customer || "No name"}
          {String(o.allergyFlag) === "true" || o.allergyFlag === true ? " ⚠️" : ""}
        </div>
        <div className="oc-items">{itemsSummary(o)}</div>
      </div>
      <span className={`pill ${statusCls}`}>{o.status === "Cancelled" ? "⛔ Cancelled" : o.status}</span>
    </button>
  );
}

/* ══════════════════ Web inbox ══════════════════ */
function InboxView({ orders, onOpen }) {
  const inbox = inboxOrders(orders).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return (
    <>
      <p className="lead" style={{ marginTop: 4 }}>
        New Shopify orders land here automatically. Tap one to set its collection date and confirm.
      </p>
      {inbox.length === 0 && <div className="empty">Inbox clear — every web order has been confirmed. ✅</div>}
      {inbox.map((o) => (
        <button className="order-card inboxed" key={o.id} onClick={() => onOpen(o)}>
          <div className="oc-time">🌐</div>
          <div className="oc-main">
            <div className="oc-name">
              {o.customer || "No name"} {o.shopifyNo ? <span className="oc-no">#{o.shopifyNo}</span> : null}
            </div>
            <div className="oc-items">{itemsSummary(o)}</div>
            {o.customerNote && <div className="oc-note">📝 {o.customerNote}</div>}
          </div>
          <span className="pill due">Set date</span>
        </button>
      ))}
    </>
  );
}

/* ══════════════════ Kitchen production list ══════════════════ */
function KitchenView({ orders, onOpen }) {
  const groups = [
    { label: "Make for today", key: dayKey(new Date()) },
    { label: "Make for tomorrow", key: dayKey(addDays(new Date(), 1)) },
  ];
  const restOfWeek = [];
  for (let i = 2; i < 7; i++) restOfWeek.push(dayKey(addDays(new Date(), i)));

  const production = (key) =>
    ordersForDay(orders, key).filter((o) => isActive(o) && o.status !== "Ready");

  const restList = restOfWeek.flatMap((k) => production(k));

  return (
    <>
      <p className="lead" style={{ marginTop: 4 }}>
        What the kitchen needs to make, by collection day. Orders marked Ready drop off this list.
      </p>
      {groups.map((g) => {
        const list = production(g.key);
        return (
          <React.Fragment key={g.key}>
            <div className="section-title">
              {g.label} <span className="closed-tag">· {niceDate(g.key)}</span>
            </div>
            {list.length === 0 ? (
              <div className="empty small">Nothing to make ✅</div>
            ) : (
              list.map((o) => <KitchenCard key={o.id} o={o} onOpen={onOpen} />)
            )}
          </React.Fragment>
        );
      })}
      {restList.length > 0 && (
        <>
          <div className="section-title">Rest of the week</div>
          {restList.map((o) => <KitchenCard key={o.id} o={o} onOpen={onOpen} showDate />)}
        </>
      )}
    </>
  );
}

function KitchenCard({ o, onOpen, showDate }) {
  const lines = String(o.items || "").split("\n").filter(Boolean);
  return (
    <button className="card kitchen-card" onClick={() => onOpen(o)}>
      <div className="kc-head">
        <strong>
          {showDate ? niceDate(o.collectionDate) + " · " : ""}
          {o.collectionTime || "time TBC"} — {o.customer || "No name"}
        </strong>
        {(String(o.allergyFlag) === "true" || o.allergyFlag === true) && <span className="pill fail">⚠️ Allergy</span>}
      </div>
      <ul className="kc-items">
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
      {o.cakeMessage && <div className="kc-msg">✍️ On the cake: “{o.cakeMessage}”</div>}
      {(String(o.allergyFlag) === "true" || o.allergyFlag === true) && o.allergyNote && (
        <div className="warn small">Allergy: {o.allergyNote}</div>
      )}
      {o.customerNote && <div className="oc-note">📝 {o.customerNote}</div>}
    </button>
  );
}

/* ══════════════════ Order detail ══════════════════ */
function OrderDetail({ order: o, staff, showToast, refreshOrders, onBack, onEdit }) {
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const products = productsFromCache();
  const balance = Math.max(0, Number(o.price || 0) - Number(o.deposit || 0));

  const patch = async (fields, msg) => {
    setBusy(true);
    try {
      await api.updateOrder({ id: o.id, staff, ...fields });
      showToast(msg);
      refreshOrders && refreshOrders();
    } catch (e) {
      showToast("Not saved — " + e.message);
    }
    setBusy(false);
  };

  const nextStatus = () => {
    const i = ORDER_STATUSES.indexOf(o.status);
    return i >= 0 && i < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[i + 1] : null;
  };

  const advance = (to) => {
    if (to === "Collected" && balance > 0) {
      // Balance-due guard at handover
      if (!window.confirm(`Balance of ${money(balance)} is still due.\n\nTake payment before handing over.\n\nMark as Collected anyway?`)) return;
    }
    patch({ status: to }, to === "Collected" ? "Handed over ✅" : `Status: ${to}`);
  };

  const takeBalance = () => {
    if (!window.confirm(`Take the remaining balance of ${money(balance)} now?`)) return;
    patch({ deposit: Number(o.price || 0) }, "Balance taken — paid in full ✅");
  };

  // ── SumUp payment link (remote card / Apple Pay / Google Pay) ──
  const requestLink = async () => {
    const suggested = balance > 0 ? balance : Number(o.price || 0);
    const raw = window.prompt("Amount to request by payment link (£):", suggested.toFixed(2));
    if (raw === null) return;
    const amount = Number(raw);
    if (!(amount > 0)) { showToast("Enter an amount above £0"); return; }
    setBusy(true);
    try {
      const res = await api.createPaymentLink(o.id, amount, balance > 0 && Number(o.deposit || 0) > 0 ? "balance" : "deposit");
      if (res.ok) {
        showToast("Payment link created ✅ — send it to the customer");
        refreshOrders && refreshOrders();
      } else {
        showToast(res.error || "SumUp link failed");
      }
    } catch (e) {
      showToast("Not created — " + e.message);
    }
    setBusy(false);
  };

  const checkPaid = async () => {
    setChecking(true);
    try {
      const res = await api.checkPayment(o.id);
      if (res.ok && res.status === "PAID") {
        showToast(res.alreadyCredited ? "Already paid ✅" : `Paid ✅ — £${Number(res.credited || 0).toFixed(2)} added`);
        refreshOrders && refreshOrders();
      } else if (res.ok) {
        showToast(res.status === "FAILED" ? "Payment failed — send a fresh link" : "Not paid yet — ask the customer to check the link");
        refreshOrders && refreshOrders();
      } else {
        showToast(res.error || "Could not check");
      }
    } catch (e) {
      showToast("Could not check — " + e.message);
    }
    setChecking(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(o.sumupUrl);
      showToast("Link copied 📋");
    } catch {
      window.prompt("Copy the payment link:", o.sumupUrl);
    }
  };

  const cancelOrder = () => {
    const reason = window.prompt("Reason for cancelling this order?");
    if (reason === null) return;
    patch({ status: "Cancelled", cancelReason: reason || "No reason given" }, "Order cancelled");
  };

  const needsDate = !o.collectionDate;
  const lines = String(o.items || "").split("\n").filter(Boolean);
  const nxt = nextStatus();

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Orders</button>
      <h2>
        {o.customer || "No name"}{" "}
        {o.shopifyNo ? <span className="oc-no">#{o.shopifyNo}</span> : null}
      </h2>
      <p className="lead">
        {SOURCE_ICON[o.source]} {o.source === "web" ? "Shopify order" : o.source === "phone" ? "Phone order" : "Walk-in order"}
        {o.collectionDate ? ` · collect ${niceDate(o.collectionDate)} ${o.collectionTime || ""}` : " · collection date not set"}
      </p>

      {o.status === "Cancelled" && (
        <div className="warn">⛔ Cancelled{o.cancelReason ? ` — ${o.cancelReason}` : ""}. Do not make this order.</div>
      )}

      <div className="card">
        <strong>Items</strong>
        <ul className="kc-items">
          {lines.map((l, i) => {
            const name = l.replace(/^\d+\s*×\s*/, "").split(" — ")[0];
            const prod = findProductByName(products, name);
            return (
              <li key={i}>
                {l}
                {prod && (prod.contains?.length || prod.may?.length) ? (
                  <div className="chip-row">
                    {(prod.contains || []).map((a) => <span className="allergen-chip" key={"c" + a}>{a}</span>)}
                    {(prod.may || []).map((a) => <span className="allergen-chip maybe" key={"m" + a}>may: {a}</span>)}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {o.cakeMessage && <div className="kc-msg">✍️ On the cake: “{o.cakeMessage}”</div>}
        {o.customerNote && <div className="oc-note">📝 Customer note: {o.customerNote}</div>}
      </div>

      {(String(o.allergyFlag) === "true" || o.allergyFlag === true) && (
        <div className="warn">⚠️ Customer declared an allergy: {o.allergyNote || "see notes"}. Check with the kitchen lead — never guess.</div>
      )}

      <div className="card">
        <strong>Payment</strong>
        <div className="pay-row"><span>Price</span><span>{money(o.price)}</span></div>
        <div className="pay-row"><span>Paid so far</span><span>{money(o.deposit)}</span></div>
        <div className="pay-row total"><span>Balance due</span><span>{balance > 0 ? money(balance) : "Paid in full ✅"}</span></div>
        {balance > 0 && o.status !== "Cancelled" && (
          <button className="btn gold" disabled={busy} onClick={takeBalance}>Take balance {money(balance)} (in person)</button>
        )}

        {o.status !== "Cancelled" && (
          <div className="sumup-box">
            {o.sumupUrl && o.sumupStatus === "PAID" ? (
              <div className="sumup-status paid">💳 SumUp: {money(o.sumupAmount)} paid online ✅</div>
            ) : o.sumupUrl && o.sumupStatus === "PENDING" && !linkExpired(o) ? (
              <>
                <div className="sumup-status">💳 SumUp link for {money(o.sumupAmount)} — awaiting payment (valid ~30 min)</div>
                <div className="contact-row">
                  {o.phone && (
                    <a
                      className="btn ghost half"
                      href={waHref(o.phone, `Hi ${(o.customer || "").split(" ")[0]}, here's the secure payment link for your Mielle Patisserie order (${money(o.sumupAmount)}): ${o.sumupUrl} — it's valid for 30 minutes 🎂 Thank you!`)}
                      target="_blank" rel="noreferrer"
                    >💬 Send link</a>
                  )}
                  <button className="btn ghost half" onClick={copyLink}>📋 Copy link</button>
                </div>
                <button className="btn half" style={{ width: "100%" }} disabled={checking} onClick={checkPaid}>
                  {checking ? "Checking…" : "🔄 Check payment"}
                </button>
              </>
            ) : o.sumupUrl && (o.sumupStatus === "FAILED" || linkExpired(o)) ? (
              <>
                <div className="sumup-status expired">
                  💳 {o.sumupStatus === "FAILED" ? "Payment failed" : "Link expired (30 min)"} — send a fresh one
                </div>
                <button className="btn ghost" disabled={busy} onClick={requestLink}>💳 New SumUp payment link…</button>
                <button className="btn ghost" style={{ marginTop: 8 }} disabled={checking} onClick={checkPaid}>🔄 Check anyway</button>
              </>
            ) : balance > 0 ? (
              <button className="btn ghost" disabled={busy} onClick={requestLink}>💳 Request payment by link (SumUp)…</button>
            ) : null}
          </div>
        )}
      </div>

      {o.phone && (
        <div className="contact-row">
          <a className="btn ghost half" href={telHref(o.phone)}>📞 Call</a>
          <a
            className="btn ghost half"
            href={waHref(o.phone, `Hi ${o.customer || ""}, your order from Mielle Patisserie is ready for collection 🎂`)}
            target="_blank" rel="noreferrer"
          >
            💬 WhatsApp
          </a>
        </div>
      )}
      {o.email && <div className="oc-note" style={{ marginTop: 6 }}>✉️ {o.email}</div>}

      {o.status !== "Cancelled" && (
        <>
          <div className="section-title">Status — {o.status}</div>
          {needsDate ? (
            <div className="warn small">Set a collection date first (Edit below) — the closed-day check runs there.</div>
          ) : (
            nxt && (
              <button className="btn" disabled={busy} onClick={() => advance(nxt)}>
                {nxt === "Collected" ? "✅ Mark collected (handed over)" : `Move to “${nxt}”`}
              </button>
            )
          )}
          <div className="status-row">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                className={`status-dot ${o.status === s ? "sel" : ""}`}
                disabled={busy || needsDate}
                onClick={() => s !== o.status && advance(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="btn ghost" onClick={onEdit}>✏️ Edit order{needsDate ? " / set date" : ""}</button>
          <button className="btn ghost danger-line" disabled={busy} onClick={cancelOrder}>Cancel this order…</button>
        </>
      )}
    </div>
  );
}

/* ══════════════════ New / edit order form ══════════════════ */
function OrderForm({ staff, showToast, refreshOrders, existing, onDone }) {
  const isEdit = !!existing;
  const products = productsFromCache();
  const [source, setSource] = useState(existing?.source || "walkin");
  const [customer, setCustomer] = useState(existing?.customer || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [items, setItems] = useState(() =>
    existing ? String(existing.items || "").split("\n").filter(Boolean).map((line) => {
      const m = line.match(/^(\d+)\s*×\s*(.*)$/);
      return m ? { qty: Number(m[1]), name: m[2] } : { qty: 1, name: line };
    }) : []
  );
  const [search, setSearch] = useState("");
  const [cakeMessage, setCakeMessage] = useState(existing?.cakeMessage || "");
  const [notes, setNotes] = useState(existing?.customerNote || "");
  const [allergyFlag, setAllergyFlag] = useState(String(existing?.allergyFlag) === "true" || existing?.allergyFlag === true);
  const [allergyNote, setAllergyNote] = useState(existing?.allergyNote || "");
  const [date, setDate] = useState(existing?.collectionDate || "");
  const [time, setTime] = useState(existing?.collectionTime || "");
  const [price, setPrice] = useState(existing?.price ?? "");
  const [deposit, setDeposit] = useState(existing?.deposit ?? "");
  const [busy, setBusy] = useState(false);

  const balance = Math.max(0, Number(price || 0) - Number(deposit || 0));

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, products]);

  const addItem = (name) => {
    setItems((cur) => {
      const i = cur.findIndex((x) => x.name === name);
      if (i >= 0) return cur.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x));
      return [...cur, { qty: 1, name }];
    });
    setSearch("");
  };
  const bumpQty = (i, d) =>
    setItems((cur) => cur.map((x, j) => (j === i ? { ...x, qty: Math.max(1, x.qty + d) } : x)).filter(Boolean));
  const removeItem = (i) => setItems((cur) => cur.filter((_, j) => j !== i));

  const closedWarn = date && isClosedDay(date);
  const leadWarn = date && daysUntil(date) >= 0 && daysUntil(date) < ORDER_LEAD_DAYS;
  const pastWarn = date && daysUntil(date) < 0;

  const canSave =
    customer.trim() && items.length > 0 && date && (!allergyFlag || allergyNote.trim());

  const save = async () => {
    if (closedWarn) {
      const day = weekdayName(date);
      if (!window.confirm(`⚠️ You're normally closed on ${day}s.\n\nCall the customer to agree a different day, or tap OK to keep ${niceDate(date)} (e.g. a special opening).`)) return;
    }
    setBusy(true);
    const itemsText = items.map((x) => `${x.qty} × ${x.name}`).join("\n");
    const payload = {
      id: existing?.id || newId(),
      source,
      customer: customer.trim(),
      phone: phone.trim(),
      email: existing?.email || "",
      items: itemsText,
      cakeMessage: cakeMessage.trim(),
      customerNote: notes.trim(),
      allergyFlag,
      allergyNote: allergyFlag ? allergyNote.trim() : "",
      collectionDate: date,
      collectionTime: time,
      price: Number(price || 0),
      deposit: Number(deposit || 0),
      status: existing ? (existing.status === "New" ? "Confirmed" : existing.status) : "Confirmed",
      staff,
    };
    try {
      if (isEdit) await api.updateOrder(payload);
      else await api.addOrder(payload);
      showToast(isEdit ? "Order updated ✅" : "Order saved ✅");
      refreshOrders && refreshOrders();
      onDone(payload);
    } catch (e) {
      showToast("Not saved — " + e.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <button className="back" onClick={() => onDone(null)}>‹ Cancel</button>
      <h2>{isEdit ? "Edit order" : "New order"}</h2>
      <p className="lead">{isEdit ? "Update the details and save." : "Phone or walk-in pre-order. Web orders arrive in the 🌐 Inbox by themselves."}</p>

      {!isEdit && (
        <div className="seg-row">
          <button className={source === "walkin" ? "sel" : ""} onClick={() => setSource("walkin")}>🏪 Walk-in</button>
          <button className={source === "phone" ? "sel" : ""} onClick={() => setSource("phone")}>📞 Phone</button>
        </div>
      )}

      <label className="fl">Customer name *</label>
      <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Mrs Wong" />
      <label className="fl">Phone</label>
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" />

      <label className="fl">Items *</label>
      {items.map((x, i) => (
        <div className="item-row" key={i}>
          <div className="ir-qty">
            <button onClick={() => bumpQty(i, -1)}>−</button>
            <span>{x.qty}</span>
            <button onClick={() => bumpQty(i, 1)}>+</button>
          </div>
          <div className="ir-name">{x.name}</div>
          <button className="ir-x" onClick={() => removeItem(i)} aria-label="Remove">✕</button>
        </div>
      ))}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search the menu, or type a custom cake…"
      />
      {matches.map((p) => (
        <button className="staff-option" key={p.id} onClick={() => addItem(p.name)}>
          + {p.name} <span className="oc-note">{p.category}</span>
        </button>
      ))}
      {search.trim() && !matches.some((p) => p.name.toLowerCase() === search.trim().toLowerCase()) && (
        <button className="staff-option" onClick={() => addItem(search.trim())}>
          + Add custom: “{search.trim()}”
        </button>
      )}

      <label className="fl">Message on the cake (exact wording)</label>
      <input type="text" value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value)} placeholder='e.g. "Happy 30th Birthday Amy!"' />

      <label className="fl">Decoration / other notes</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Colours, candles, box, who's collecting…" />

      <div className="allergy-toggle">
        <label>
          <input type="checkbox" checked={allergyFlag} onChange={(e) => setAllergyFlag(e.target.checked)} />
          ⚠️ Customer declared an allergy
        </label>
      </div>
      {allergyFlag && (
        <>
          <label className="fl">Allergy details * (shows on the kitchen list)</label>
          <input type="text" value={allergyNote} onChange={(e) => setAllergyNote(e.target.value)} placeholder="e.g. severe peanut allergy — no nuts anywhere near" />
        </>
      )}

      <label className="fl">Collection date *</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {pastWarn && <div className="warn small">That date is in the past — double-check it.</div>}
      {closedWarn && (
        <div className="warn small">
          ⚠️ You're normally closed on {weekdayName(date)}s ({CLOSED_DAYS.join(" & ")}). Agree it with the customer or pick another day — you can still save if you're opening specially.
        </div>
      )}
      {!pastWarn && leadWarn && (
        <div className="warn small">⏱️ Less than {ORDER_LEAD_DAYS} days away — check the kitchen can do it in time.</div>
      )}

      <label className="fl">Collection time</label>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

      <label className="fl">Price (£)</label>
      <input type="number" inputMode="decimal" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
      <label className="fl">Deposit taken (£)</label>
      <input type="number" inputMode="decimal" min="0" step="0.5" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="0.00" />
      <div className="pay-row total" style={{ marginTop: 8 }}>
        <span>Balance due at collection</span><span>{money(balance)}</span>
      </div>

      <button className="btn" disabled={!canSave || busy} onClick={save}>
        {isEdit ? "Save changes" : "Save order"}
      </button>
      {!canSave && (
        <div className="oc-note" style={{ textAlign: "center", marginTop: 8 }}>
          Needs: customer name, at least one item, a collection date{allergyFlag ? ", allergy details" : ""}.
        </div>
      )}
    </div>
  );
}
