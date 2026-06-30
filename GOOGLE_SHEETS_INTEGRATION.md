# Connecting the App to Google Sheets

> ✅ **Already set up.** This sheet is connected and live — the URL is
> already in `src/config.js`. The steps below are kept for reference in case
> you ever need to redeploy or move to a different sheet.

This makes every entry from any phone or tablet drop straight into your
**Mielle Kitchen Data** spreadsheet — no login needed on the device.

It uses a small Google Apps Script attached to your sheet. You set it up
once (about 5 minutes). Until it's connected, the app still saves every
entry on the device and sends it automatically the moment you finish setup.

---

## What goes where

| App screen        | Sheet tab        | Columns written                                                    |
|-------------------|------------------|--------------------------------------------------------------------|
| Hygiene Checklist | `Hygiene_Logs`   | Timestamp, Date, Time, Staff, Freezer1-4, Fridge1-6, KitchenCleaned, AllergenChecked, Notes |
| Staff Training    | `Staff_Training` | Timestamp, Date, Staff, Topics, Notes                              |
| Allergens         | `Allergens`      | Timestamp, Supplier, Version, DateUpdated, Status, Link            |

Header rows are created automatically the first time an entry arrives, so
you don't need to add them yourself.

---

## Step 1 — Open the Script editor

1. Open your sheet: **Mielle Kitchen Data**
2. Menu: **Extensions → Apps Script**
3. Delete anything in the editor.

## Step 2 — Paste the script

1. Open the file `google-apps-script/Code.gs` from this project.
2. Copy **all** of it and paste it into the Apps Script editor.
3. The sheet ID is already filled in for your spreadsheet. Click the
   **Save** icon (💾).

## Step 3 — Deploy as a Web App

1. Top right: **Deploy → New deployment**.
2. Click the gear ⚙️ next to "Select type" → choose **Web app**.
3. Settings:
   - **Description:** Mielle Kitchen
   - **Execute as:** **Me** (your account — this is what lets phones write without signing in)
   - **Who has access:** **Anyone**
4. Click **Deploy**.
5. Click **Authorize access**, pick your Google account, and allow it.
   (You may see a "Google hasn't verified this app" screen — click
   **Advanced → Go to … (unsafe)**. It's your own script, so it's safe.)

## Step 4 — Copy the Web App URL

After deploying you'll see a **Web app URL** ending in `/exec`, e.g.

```
https://script.google.com/macros/s/AKfycb...XYZ/exec
```

Copy it.

## Step 5 — Paste it into the app

1. Open `src/config.js` in the project.
2. Put the URL between the quotes:

   ```js
   export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb...XYZ/exec';
   ```

3. Save, then redeploy the app (or just `npm start` locally to test).

Done. Submit a hygiene check — a new row appears in `Hygiene_Logs` within
a second or two.

---

## Testing it quickly

- Paste the `/exec` URL into a browser with `?sheet=Hygiene_Logs` on the
  end. You should see `{"ok":true,"rows":[...]}`. That confirms the script
  is live.
- Submit a test entry from the app, then refresh the sheet.

## If you change the script later

Apps Script keeps the **same URL** only if you use
**Deploy → Manage deployments → Edit (pencil) → Version: New version**.
If you create a brand-new deployment you get a new URL and must update
`src/config.js` again.

## Notes

- Entries are also saved on the device, so nothing is lost if the Wi-Fi
  drops mid-shift — they sync next time the app loads with signal.
- "Execute as: Me" means rows are written by your account, so the sheet
  itself does **not** need to be shared publicly. You can set the sheet
  back to private if you prefer.
