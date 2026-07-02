import Guide from "../components/Guide";
import React from "react";

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard({ staff, history, goto }) {
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

  return (
    <div className="screen">
      <h2>{staff ? `Hi ${staff} 👋` : "Welcome"}</h2>
      <p className="lead">Today's food safety tasks at a glance.</p>
      <Guide id="dashboard" />

      <div className="section-title">Last 7 days</div>
      <div className="today-strip">
        {strip.map((s) => (
          <div className="day-dot" key={s.k}>
            <div className={`c ${s.cls}`}>{s.mark}</div>
            {s.label}
          </div>
        ))}
      </div>

      <div className="section-title">Today</div>
      {tasks.map((task, i) => (
        <button className="tap-card" key={i} onClick={() => goto(task.id)}>
          <div className="icon">{task.icon}</div>
          <div className="grow">
            <div className="t">{task.title}</div>
            <div className="d">{task.desc}</div>
          </div>
          <span className={`pill ${task.done ? "ok" : "due"}`}>{task.done ? "Done" : "Due"}</span>
        </button>
      ))}

      {history && history.error && (
        <div className="warn">Records aren't loading: {history.error}</div>
      )}
    </div>
  );
}
