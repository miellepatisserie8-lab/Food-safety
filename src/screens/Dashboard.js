import Guide from "../components/Guide";
import React from "react";
import { ordersForDay, overdueOrders, inboxOrders } from "./Orders";

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard({ staff, history, goto, orders = [] }) {
  const days = history && history.days ? history.days : {};
  const today = dayKey(new Date());
  const t = days[today] || {};

  const tasks = [
    { id: "checks", icon: "🌅", title: "Opening checks", done: t.opening, desc: t.opening ? "Completed today" : "Not done yet" },
    { id: "temps", icon: "🌡️", title: "Temperature logs", done: (t.temps || 0) >= 2, desc: `${t.temps || 0} recorded today (aim for AM + PM)` },
    { id: "cleaning", icon: "🧽", title: "Cleaning tasks", done: (t.cleaning || 0) >= 3, desc: `${t.cleaning || 0} signed off today` },
    { id: "checks", icon: "🌙", title: "Closing checks", done: t.closing, desc: t.closing ? "Completed today" : "Do before lock-up" },
  ];

  const strip = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const rec = days[k];
    let cls = "miss";
    let mark = "–";
    if (rec) {
      const full = rec.opening && rec.closing && (rec.temps || 0) > 0;
      const some = rec.opening || rec.closing || (rec.temps || 0) > 0 || (rec.cleaning || 0) > 0;
      if (full) { cls = "ok"; mark = "✓"; }
      else if (some) { cls = "part"; mark = "•"; }
    }
    if (i === 0 && cls === "miss") { cls = ""; mark = "…"; }
    strip.push({ k, label: d.toLocaleDateString("en-GB", { weekday: "short" }), cls, mark });
  }

  // v3.0 — cake collections banner (today / tomorrow / overdue + web inbox)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueToday = ordersForDay(orders, today).filter((o) => o.status !== "Collected");
  const dueTomorrow = ordersForDay(orders, dayKey(tomorrow)).filter((o) => o.status !== "Collected");
  const overdue = overdueOrders(orders);
  const inbox = inboxOrders(orders);
  const showBanner = dueToday.length || dueTomorrow.length || overdue.length || inbox.length;

  const summarise = (list) =>
    list
      .slice(0, 3)
      .map((o) => `${(o.customer || "No name").split(" ")[0]}${o.collectionTime ? ` (${o.collectionTime})` : ""}`)
      .join(", ") + (list.length > 3 ? ` +${list.length - 3} more` : "");

  return (
    <div className="screen">
      <h2>{staff ? `Hi ${staff} 👋` : "Welcome"}</h2>
      <p className="lead">Today's food safety tasks at a glance.</p>
      <Guide id="dashboard" />

      {showBanner ? (
        <button className="orders-banner" onClick={() => goto("orders")}>
          {overdue.length > 0 && (
            <div className="ob-line overdue">⛔ {overdue.length} uncollected from a previous day — deal with today</div>
          )}
          {dueToday.length > 0 && (
            <div className="ob-line">🎂 {dueToday.length} collection{dueToday.length > 1 ? "s" : ""} today — {summarise(dueToday)}</div>
          )}
          {dueToday.length === 0 && overdue.length === 0 && <div className="ob-line">🎂 No collections today</div>}
          {dueTomorrow.length > 0 && (
            <div className="ob-line sub">Tomorrow: {dueTomorrow.length} collection{dueTomorrow.length > 1 ? "s" : ""} — {summarise(dueTomorrow)}</div>
          )}
          {inbox.length > 0 && (
            <div className="ob-line sub">🌐 {inbox.length} web order{inbox.length > 1 ? "s" : ""} waiting for a collection date</div>
          )}
        </button>
      ) : null}

      <div className="section-title">Today</div>
      <div className="tile-grid">
        {tasks.map((task, i) => (
          <button className="tile-card" key={i} onClick={() => goto(task.id)}>
            <span className={`tile-pill ${task.done ? "ok" : "due"}`}>{task.done ? "Done" : "Due"}</span>
            <div className="tile-icon">{task.icon}</div>
            <div className="tile-t">{task.title}</div>
            <div className="tile-d">{task.desc}</div>
          </button>
        ))}
      </div>

      {history && history.error && (
        <div className="warn">Records aren't loading: {history.error}</div>
      )}

      {/* v3.0 — slim centred 7-day ribbon, last item of the page content */}
      <div className="ribbon-wrap">
        <div className="ribbon-label">Last 7 days</div>
        <div className="today-strip mini">
          {strip.map((s) => (
            <div className="day-dot" key={s.k}>
              <div className={`c ${s.cls}`}>{s.mark}</div>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
