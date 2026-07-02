import Guide from "../components/Guide";
import React from "react";

const ALLERGENS = [
  ["Celery", "芹菜"], ["Cereals containing gluten", "含麩質穀物"], ["Crustaceans", "甲殼類"],
  ["Eggs", "蛋類"], ["Fish", "魚類"], ["Lupin", "羽扇豆"], ["Milk", "奶類"],
  ["Molluscs", "軟體動物"], ["Mustard", "芥末"], ["Peanuts", "花生"],
  ["Sesame", "芝麻"], ["Soybeans", "大豆"], ["Sulphur dioxide / sulphites", "二氧化硫 / 亞硫酸鹽"],
  ["Tree nuts", "堅果"],
];

export default function Allergens({ onBack }) {
  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Allergens 過敏原</h2>
      <p className="lead">
        The 14 allergens under Natasha's Law. Always check the current bilingual allergen sheets for each dish,
        and request a spec sheet from every dim sum supplier before switching products.
      </p>
      <Guide id="allergens" />
      {ALLERGENS.map(([en, zh]) => (
        <div className="card" key={en} style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{en}</strong>
          <span>{zh}</span>
        </div>
      ))}
      <div className="warn">
        If a customer declares an allergy: stop, check the allergen sheet, and confirm with the kitchen lead before serving. Never guess.
      </div>
    </div>
  );
}
