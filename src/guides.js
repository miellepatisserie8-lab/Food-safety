// "What's required" guidance shown on each screen. English only.
// Each entry: legal/why, how often, and what to do — kept short enough to read in the kitchen.

export const GUIDES = {
  dashboard: {
    title: "How to use this app day to day",
    points: [
      "Every day: opening checks before service, appliance temps AM + PM, closing checks at lock-up.",
      "During service: probe cooking, reheating, hot-holding and cooling — record every check.",
      "On every delivery: complete the goods-in log before signing the driver's paperwork.",
      "Green on the 7-day strip means the day is fully evidenced. Amber or red days weaken your records at inspection.",
    ],
  },
  checks: {
    title: "Why daily checks are required",
    points: [
      "Your food safety management system (Regulation (EC) 852/2004 & FSA guidance) must be evidenced daily — these checks are that evidence.",
      "Opening checks: before any food preparation starts. Closing checks: before lock-up, every trading day.",
      "Any item answered No must have the problem and the fix recorded — a No with a good note is fine; a missing day is not.",
      "Repeated No on the same item means the safe method needs changing — raise it with the kitchen lead.",
    ],
  },
  deliveries: {
    title: "What's required at goods-in",
    points: [
      "Check every delivery before accepting: temperature between packs, packaging intact, dates legible and in date.",
      "Chilled: accept at 8°C or below. Frozen: reject above −15°C or if defrosting. Ambient: check condition and dates.",
      "Reject and record anything that fails — never 'accept and see'. Note what was rejected and why.",
      "New or substituted product? No allergen spec sheet from the supplier, no service. Keep invoices — they are your traceability record.",
    ],
  },
  temps: {
    title: "Temperature monitoring requirements",
    points: [
      "Appliance temps: record every fridge, freezer and the cellar cooler at least twice daily (AM and PM).",
      "Food probe checks: every batch cooked, reheated, hot-held or cooled during service.",
      "Probe calibration: monthly, ice water and boiling water — an uncalibrated probe makes every reading challengeable.",
      "Any failure needs the remedial action recorded at the time, not at the end of the day.",
    ],
  },
  appliance: {
    title: "If an appliance is out of range",
    points: [
      "Fridge above 8°C: check the door and seals, move high-risk food to a working unit, re-check in 30 minutes.",
      "Food held above 8°C for over 4 hours must be thrown away — record the disposal.",
      "Freezer warming: keep the door shut, move stock if it continues to rise, call the engineer.",
      "Record every action in the log — the record of what you did matters as much as the reading.",
    ],
  },
  food: {
    title: "Food probe rules",
    points: [
      "Cooking and reheating: 75°C or above at the core. Reheat once only — never twice.",
      "Hot holding: 63°C or above. Below that, use within 2 hours or discard.",
      "Cooling: down to 8°C or below within 90 minutes — shallow trays, small batches, never room temperature overnight.",
      "Sanitise the probe with a probe wipe before and after every use.",
    ],
  },
  calibration: {
    title: "Why calibrate monthly",
    points: [
      "Ice water should read 0°C (±1°C); boiling water 100°C (±1°C).",
      "A probe outside tolerance goes out of use immediately — mark it and use the spare.",
      "Do this monthly and after any drop or damage to the probe.",
      "EHOs commonly ask for the calibration record — it validates every other temperature in your diary.",
    ],
  },
  cleaning: {
    title: "Cleaning standard required",
    points: [
      "Two-stage clean on food contact surfaces: detergent first, then a BS EN 1276/13697 sanitiser left on for its stated contact time.",
      "Daily tasks every trading day; weekly and monthly tasks as scheduled — the sign-off with your name is the record.",
      "Clean as you go during service; chemicals stored away from food.",
      "If a task keeps being missed, tell the manager — the schedule gets changed, not skipped.",
    ],
  },
  hygiene: {
    title: "The weekly walk-round",
    points: [
      "A structured weekly inspection of the whole kitchen — this catches what daily checks miss.",
      "Look actively for pest signs: droppings, gnaw marks, damaged packaging. Any sign is an immediate incident.",
      "Anything marked No needs the fix recorded, and re-checked the following week.",
      "Do it on the same day each week so it never slips — checks feed your food hygiene rating.",
    ],
  },
  training: {
    title: "Training requirements",
    points: [
      "Every food handler needs Level 2 Food Hygiene before working unsupervised with food; refresh every 3 years.",
      "Allergen awareness training is mandatory before anyone takes a customer order.",
      "Induction on this app counts as training — record it here for each new starter.",
      "Keep certificates on file; an EHO can ask to see them alongside this log.",
    ],
  },
  incidents: {
    title: "When and how to report",
    points: [
      "Record every incident the same day: alleged food poisoning, allergen reaction, foreign object, undercooked food, injury.",
      "Tell the manager on duty (07514 272558) immediately — before responding to the customer.",
      "Keep the evidence: the dish, packaging, batch or delivery details. Don't dispose until told.",
      "Serious incidents may need reporting to Manchester City Council Environmental Health — the manager decides, never guess.",
    ],
  },
  history: {
    title: "Why records matter",
    points: [
      "Under food law you must be able to show your system works — this diary is that proof (due diligence defence).",
      "Aim for green every trading day: opening + closing checks and at least one temperature log.",
      "At an inspection, open this screen and the HACCP & documents section — together they are your food safety management system.",
      "Records stay in the Google Sheet — export CSVs from there if a paper copy is requested.",
    ],
  },
  allergens: {
    title: "Allergen procedure (Natasha's Law)",
    points: [
      "Customer declares an allergy: stop, check the allergen sheet, confirm with the kitchen lead, confirm back to the customer.",
      "Prevent cross-contact: cleaned surface, fresh gloves, separate utensils, and no shared fryers or steamers for that order.",
      "PPDS items (packed on site for the counter) must carry a full ingredient label with allergens emphasised.",
      "Recipe or supplier changed? Update the allergen sheet before the item is sold again.",
    ],
  },
};
