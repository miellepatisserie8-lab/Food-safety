# Mielle Kitchen Safety App (v2.1)

> **v3.0** adds the Cake orders module (Shopify web orders via webhook, phone/walk-in
> orders, kitchen production list, collections banner) and moves the shared allergen
> product list into the Google Sheet. See `V3-UPGRADE-HANDOFF.md` for rollout steps.

Mobile-first food safety and compliance app for Mielle Patisserie Ltd, Ancoats, Manchester.
React frontend (Vercel) + Google Apps Script / Google Sheets backend — zero running cost.

## Features
- **Dashboard** — today's tasks with done/due status and a 7-day compliance strip
- **Daily checks** — opening and closing checklists, tap Yes/No, notes required on any No
- **Temperature logs** — per-appliance readings with safe-range pass/fail and remedial actions (electric-only kitchen, incl. cellar cooler 11–13°C)
- **Food probe checks** — cooking / reheating (75°C+), hot holding (63°C+), cooling (8°C within 90 min) with fail actions
- **Delivery / goods-in log** — supplier, invoice, probe temp between packs, accept/reject with reasons
- **Probe calibration** — monthly ice water / boiling water test with tolerance pass/fail
- **HACCP & documents** — 12-section written food safety management system (English), in-app for inspections
- **Cleaning schedule** — daily / weekly / monthly tasks with one-tap sign-off
- **Food probe checks** — cooking, reheating, hot holding (63°C+), cooling, with critical limits and required actions on failures
- **Delivery goods-in log** — supplier, invoice, probe temp between packs, accept/reject with traceability
- **Probe calibration** — monthly ice water / boiling water test with tolerance check
- **HACCP & documents** — 12-section written food safety management system (English), in-app
- **Records & history** — 28-day diary view for EHO inspections
- **Staff attribution** — every record carries the staff member's name
- **Hygiene walk-round, incidents, staff training, bilingual allergen reference, manager area**

## Quick start (local)
```bash
cp .env.example .env    # fill in real values
npm install
npm start
```

## Deploying
See **DEPLOYMENT.md** — step-by-step guide for GitHub + Vercel + Apps Script, including secret handling and verification checklist.

**Never commit `.env`.** All secrets live in environment variables.
