# Mielle Kitchen Safety v3.0 — Upgrade & Go-Live Handoff

**Audience:** Claude Code (or any developer) deploying this release to the DEV/TEST project.
**From:** v2.2 (repo `miellepatisserie8-lab/Food-safety`, app `food-safety-iota.vercel.app`)
**Built & tested:** 4 July 2026. Frontend compiles clean (CRA production build); backend logic
covered by 16 passing tests (webhook create/cancel/dedupe/bad-token, order round-trip,
product seed/save/delete, v2 actions untouched).

---

## 1. What v3.0 adds

**Cake orders module** (🎂 tab, icon-only with red inbox-count badge)
- **This week** — orders grouped by collection day; overdue/uncollected flagged red; closed days labelled.
- **🌐 Inbox** — Shopify orders arrive automatically via webhook; staff set collection date/time and confirm. Closed-day warning (default Mon & Tue, override allowed) and lead-time warning (default < 3 days) fire on the date picker.
- **Kitchen** — production list: what to make today / tomorrow / rest of week, with cake message, allergy flags and notes. Orders marked Ready drop off.
- **New order** — manual phone/walk-in entry: menu search (from the shared product list) or custom items, exact cake message field, declared-allergy toggle (note required), price/deposit with auto balance.
- **Order detail** — status flow New → Confirmed → In production → Ready → Collected; allergen chips auto-shown for items matching the shared product list; Take balance button; balance-due guard at handover; 📞 Call and 💬 WhatsApp buttons; edit; cancel with reason.
- **Dashboard banner** — today's collections (pinned above the TODAY tiles), tomorrow's count, overdue in red, web orders awaiting a date. Tapping opens Orders.
- **Manager area** — new money card: orders/cancellations last 7 days, deposits held, balance still to take (behind the existing passcode).

**Shared allergen products** (fixes the v2.2 known limitation)
- The "Products & dishes" list now lives in the Google Sheet (`Allergen_Products` tab) — every device sees the same list; centrally backed up.
- Seeds itself with the 99 menu items on first load; any extra products a device added under v2.2 are migrated up automatically (one-off, toast confirms).
- Offline: devices show the last cached copy read-only.

**Layout changes (as specified by Mielle)**
- 🏠 Home button top-left in the green header (gold chip); tapping returns to the dashboard from anywhere.
- Bottom tabs: **Checks · Temps · Cleaning · 🎂 · More** (Orders is icon-only, enlarged, with badge; `aria-label="Cake orders"` kept for screen readers).
- Last-7-days strip: centred, **half size**, sits as the **last item of the page content** (not pinned).

**Backend (`apps-script/Code.gs`, now v3)**
- New tabs auto-created: `Cake_Orders`, `Allergen_Products`.
- New actions: `addOrder`, `updateOrder`, `getOrders`, `seedProducts`, `saveProduct`, `deleteProduct`.
- Shopify webhooks (order creation + cancellation) with URL-token guard; duplicate deliveries deduped by Shopify order ID; cancellations flag the existing row ⛔.
- All v2 actions unchanged.

## 2. Env vars — nothing breaks if you do nothing

| Variable | Where | Required? | Default |
|---|---|---|---|
| `REACT_APP_CLOSED_DAYS` | Vercel | Optional | `Monday,Tuesday` |
| `REACT_APP_ORDER_LEAD_DAYS` | Vercel | Optional | `3` |
| `WEBHOOK_TOKEN` | **Apps Script Script Properties** (NOT Vercel, NOT the repo) | **Required for Shopify import** | none |

The six existing v2.2 secrets are untouched. `WEBHOOK_TOKEN` deliberately lives in
Apps Script (Project Settings → Script Properties) because the repo is public.
Generate a long random one, e.g. `openssl rand -hex 24`.

## 3. Go-live steps (in order)

**Step 1 — Push the code.** This zip contains the full repo with history; v3.0 sits on
top of v2.2 as four commits. Push `main` to `miellepatisserie8-lab/Food-safety`
(force not needed). Vercel auto-builds. CRA preset, no build-setting changes.

**Step 2 — Update the Apps Script backend.**
1. Open the DEV "Mielle Kitchen Data" Google Sheet → Extensions → Apps Script.
2. Replace the code with `apps-script/Code.gs` from this repo. Save.
3. Project Settings (⚙️) → Script Properties → Add: `WEBHOOK_TOKEN` = your random token.
4. **Deploy → Manage deployments → ✏️ Edit → Version: “New version” → Deploy.**
   ⚠️ This keeps the same `/exec` URL (so `REACT_APP_GOOGLE_SCRIPT_URL` in Vercel is
   unchanged). Do NOT create a brand-new deployment or the URL changes.

**Step 3 — Add the Shopify webhooks** (Shopify admin → Settings → Notifications → Webhooks → Create webhook):
| Event | Format | URL |
|---|---|---|
| Order creation | JSON | `<exec URL>?source=shopify&topic=created&token=<WEBHOOK_TOKEN>` |
| Order cancellation | JSON | `<exec URL>?source=shopify&topic=cancelled&token=<WEBHOOK_TOKEN>` |

API version: latest stable offered. Note: while testing on DEV, real customer orders
will appear in the DEV app — harmless and read-only toward Shopify (this integration
never writes back to Shopify: no fulfilment, stock or refund changes).

**Step 4 — Verify** (hard-refresh the app after Vercel finishes):
- [ ] 🏠 header button returns to dashboard; tabs read Checks · Temps · Cleaning · 🎂 · More.
- [ ] Last-7-days ribbon: half-size, centred, bottom of the page content.
- [ ] Allergens screen shows "Shared across every device"; `Allergen_Products` tab now has ~99 rows; add a test product on one device, see it on another.
- [ ] Create a manual order → appears in This week, `Cake_Orders` tab, and the dashboard banner.
- [ ] Pick a Monday/Tuesday collection date → closed-day warning; date < 3 days → lead-time warning.
- [ ] Shopify admin → your webhook → "Send test notification" → order appears in 🌐 Inbox with badge on the 🎂 tab; confirm it with a date.
- [ ] Set deposit < price, mark Collected → balance-due guard fires.
- [ ] Kitchen view lists the order with message/allergy note; Ready removes it.
- [ ] v2 features still work: log a temp, a cleaning task, an opening check.
- [ ] Manager area: money card shows the test order's numbers.

**Step 5 — Later, production rollout** = repeat Steps 1–3 against the production repo/
Sheet/app (`mielle-kitchen-safety-app`) once Mielle signs off DEV. Point the Shopify
webhooks at the production `/exec` URL then (delete or keep the DEV ones as Mielle prefers).

## 4. Known limits (agreed with Mielle)

- One-way integration: Shopify → app only. Fulfil/refund in Shopify as normal.
- Webhooks only catch orders placed after setup; pre-existing pending orders are entered manually (a one-off import can be added later).
- Collection date isn't captured at Shopify checkout — staff set it at confirm (a product-page date picker is a possible future theme tweak).
- Apps Script can't read HTTP headers, so Shopify's HMAC can't be verified; the long URL token is the guard. Wrong/missing token → nothing is written.
- Allergen chips match by exact product name (case-insensitive); unmatched Shopify titles simply show no chips until added to the shared list.
- Customer names/phones/emails land in the Google Sheet — check the Sheet's sharing is restricted to who needs it.

## 5. Rollback

Frontend: Vercel → Deployments → previous build → "Promote to production" (or `git revert` the four v3.0 commits and push). Backend: Apps Script → Manage deployments → Edit → pick the previous version. The new Sheet tabs are additive and harmless to leave.
