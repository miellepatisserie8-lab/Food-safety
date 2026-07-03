import React, { useState } from "react";

const DOCS = [
  {
    id: 1,
    title: "Scope & responsibilities",
    body: `This food safety management system covers all food prepared and served at Mielle Patisserie Ltd, Unit 4, 51 Blossom Street, Ancoats, Manchester M4 6AJ: patisserie, dim sum, café food, and bar service.

Food Business Operator: Mielle Patisserie Ltd. Day-to-day responsibility: Paul Chan (Director / DPS). Kitchen lead: Eva. All staff must follow these safe methods and record checks in this app. The system is based on HACCP principles and the FSA's Safer Food, Better Business approach.

All cooking equipment is electric. There is no gas supply on the premises.`,
  },
  {
    id: 2,
    title: "Temperature control (critical limits)",
    body: `Fridges: 0–8°C (aim 5°C). Freezers: -18°C. Cellar cooler: 11–13°C (drinks only, no high-risk food).

Cooking and reheating: core temperature 75°C or above, checked with a clean, calibrated probe. Hot holding: 63°C or above. Cooling: cool food to 8°C or below within 90 minutes — use shallow containers and small batches; never cool at room temperature overnight.

Chilled deliveries: accept at 8°C or below. Frozen deliveries: reject above -15°C. Any failure must be recorded with the remedial action in this app.`,
  },
  {
    id: 3,
    title: "Cross-contamination",
    body: `Keep raw and ready-to-eat foods separate at every stage: storage, preparation, and equipment. Store raw ingredients below ready-to-eat food in fridges, covered and labelled.

Use separate, colour-coded boards and utensils for raw and ready-to-eat preparation. Wash hands thoroughly before handling ready-to-eat food, after handling raw food, after breaks, and after touching bins or cleaning materials.

Cloths: use disposable cloths or fresh sanitised cloths for each task. Never use the same cloth on raw and ready-to-eat surfaces.`,
  },
  {
    id: 4,
    title: "Allergen management (Natasha's Law)",
    body: `The 14 regulated allergens are listed in the Allergens section of this app. Allergen information sheets must be kept current for every dish and drink, and updated whenever a recipe or supplier changes.

An allergen spec sheet is required from every supplier before any new or substituted product is used — especially dim sum products when switching suppliers for deals. No spec sheet, no service.

When a customer declares an allergy: stop, check the allergen sheet, confirm with the kitchen lead, and communicate clearly back to the customer. Prevent cross-contact with cleaned surfaces, fresh gloves, and separate utensils. Any allergen incident must be recorded in Incidents immediately.

Pre-packed for direct sale (PPDS) items — e.g. boxed pastries prepared and packed on site for the counter — must carry a full ingredients label with allergens emphasised.`,
  },
  {
    id: 5,
    title: "Cleaning",
    body: `Follow the Cleaning schedule in this app: daily tasks (food contact surfaces, floors, sinks), weekly tasks (fridge interiors, shelving, extraction filters), monthly tasks (walls, freezer deep clean).

Use a two-stage clean on food contact surfaces: clean with detergent to remove grease and debris, then sanitise with a BS EN 1276 / 13697 sanitiser, observing the stated contact time. Clean as you go during service.

Store chemicals away from food. Glasswasher and dishwasher: empty, clean filters, and leave open at close.`,
  },
  {
    id: 6,
    title: "Chilling, defrosting & shelf life",
    body: `Keep high-risk food out of the danger zone (8–63°C). Prepare cream, custard and other high-risk patisserie items in small batches and return them to refrigeration promptly.

Defrost food in the fridge on the bottom shelf, in a container, never at room temperature. Label defrosted food and use within 24 hours. Never refreeze defrosted food.

Date-label all prepared food: production date plus use-by. Follow first in, first out. When in doubt, throw it out and record the waste.`,
  },
  {
    id: 7,
    title: "Deliveries & traceability",
    body: `Check every delivery using the Delivery / goods-in log in this app: supplier, invoice number, temperature between packs, packaging condition, and date codes. Reject anything outside the acceptance limits and record it.

Keep invoices and delivery notes — they are the traceability record required in a food alert or investigation. Transfer stock to correct storage immediately after acceptance.`,
  },
  {
    id: 8,
    title: "Personal hygiene & fitness to work",
    body: `Clean uniform or apron daily. Hair tied back or covered in food preparation areas. No jewellery except a plain band; cuts covered with blue plasters. No eating in food preparation areas.

Fitness to work: any staff member with vomiting or diarrhoea must report it and stay away from work until 48 hours after symptoms stop. This is recorded by the manager on duty.`,
  },
  {
    id: 9,
    title: "Pest control & waste",
    body: `Check daily for signs of pests: droppings, gnaw marks, insects, damaged packaging (part of opening checks). Keep external doors closed or screened, food off the floor, and dry goods in sealed containers.

If pests are found: inform the manager immediately, record it in Incidents with photos, protect or dispose of exposed food, and contact the pest control contractor.

Waste: empty kitchen bins at least daily, keep lids closed, and keep the external bin store tidy (bin store rear section is for outdoor furniture storage only).`,
  },
  {
    id: 10,
    title: "Probe use & calibration",
    body: `Clean and sanitise the probe with a probe wipe before and after every use. Probe the thickest part of the food, avoiding bone and container edges.

Calibrate monthly using the Probe calibration log: ice water 0°C (±1°C) and boiling water 100°C (±1°C). Take any out-of-tolerance probe out of use immediately.`,
  },
  {
    id: 11,
    title: "Incidents, complaints & recall",
    body: `Record every food incident (alleged food poisoning, allergen issue, foreign object, undercooked food) in the Incidents log with the action taken. Inform the manager on duty immediately.

In a product recall or food alert: stop using the product, quarantine remaining stock, check FSA alerts, contact the supplier, and record all actions. Serious incidents may need to be reported to Manchester City Council Environmental Health.`,
  },
  {
    id: 12,
    title: "Training & review",
    body: `All food handlers complete Level 2 Food Hygiene; the kitchen lead and manager hold Level 2 HACCP or above. Allergen awareness training is mandatory before first service. Record all training in the Staff training log.

This system is reviewed every 12 months, and sooner if the menu, suppliers, equipment or layout change significantly. The daily, weekly and monthly records in this app are the evidence that the system is working.`,
  },
];

export default function Documents({ onBack }) {
  const [open, setOpen] = useState(null);

  if (open) {
    const doc = DOCS.find((d) => d.id === open);
    return (
      <div className="screen">
        <button className="back" onClick={() => setOpen(null)}>‹ All documents</button>
        <h2>{doc.id}. {doc.title}</h2>
        {doc.body.split("\n\n").map((p, i) => (
          <p key={i} style={{ fontSize: 14.5, lineHeight: 1.55 }}>{p}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>HACCP & documents</h2>
      <p className="lead">
        Mielle Patisserie's food safety management system — the written safe methods behind the daily checks.
        Show this section, with the Records & history diary, at an EHO inspection.
      </p>
      <div className="tile-grid">
        {DOCS.map((d) => (
          <button className="tile-card" key={d.id} onClick={() => setOpen(d.id)}>
            <div className="tile-icon">📄</div>
            <div className="tile-t">{d.id}. {d.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
