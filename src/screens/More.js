import React, { useState } from "react";
import Hygiene from "./Hygiene";
import Training from "./Training";
import Allergens from "./Allergens";
import Incidents from "./Incidents";
import History from "./History";
import Manager from "./Manager";
import Documents from "./Documents";

const ITEMS = [
  { id: "documents", icon: "📋", title: "HACCP & documents", desc: "Written safe methods — the food safety system" },
  { id: "hygiene", icon: "🧼", title: "Hygiene checklist", desc: "Full weekly hygiene walk-round" },
  { id: "incidents", icon: "⚠️", title: "Incidents", desc: "Food incidents and accidents" },
  { id: "history", icon: "📅", title: "Records & history", desc: "Diary view — show this to an inspector" },
  { id: "training", icon: "🎓", title: "Staff training", desc: "Training log and certificates" },
  { id: "allergens", icon: "🥜", title: "Allergens", desc: "Bilingual allergen sheets (Natasha's Law)" },
  { id: "manager", icon: "🔐", title: "Manager area", desc: "Certificates, settings and exports" },
];

export default function More(props) {
  const [view, setView] = useState(null);
  const back = () => setView(null);

  if (view === "documents") return <Documents onBack={back} />;
  if (view === "hygiene") return <Hygiene {...props} onBack={back} />;
  if (view === "training") return <Training {...props} onBack={back} />;
  if (view === "allergens") return <Allergens onBack={back} />;
  if (view === "incidents") return <Incidents {...props} onBack={back} />;
  if (view === "history") return <History {...props} onBack={back} />;
  if (view === "manager") return <Manager onBack={back} />;

  return (
    <div className="screen">
      <h2>More</h2>
      <p className="lead">Records, training, allergens and manager tools.</p>
      {ITEMS.map((it) => (
        <button className="tap-card" key={it.id} onClick={() => setView(it.id)}>
          <div className="icon">{it.icon}</div>
          <div className="grow">
            <div className="t">{it.title}</div>
            <div className="d">{it.desc}</div>
          </div>
          <span className="chev">›</span>
        </button>
      ))}
    </div>
  );
}
