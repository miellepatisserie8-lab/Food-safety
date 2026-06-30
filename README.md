# Mielle Kitchen Management App

A mobile-first React app for hygiene checks, staff training, and allergen tracking at Mielle Patisserie, Manchester.

## Features

✅ **Hygiene Checklist**
- 4 Freezer temperature tracking (target ≤-18°C)
- 6 Fridge temperature tracking (target ≤4°C)
- Visual status indicators (✓ OK, ⚠️ Warning, 🔴 Fail)
- Kitchen cleaning & allergen label checks
- Notes field for additional comments

✅ **Staff Training**
- Log training for: Allergen Protocols, Fire Safety, Food Hygiene Level 2, Cold/Hot Holding, Cleaning
- Bilingual staff names: Paul, Eva, Ryan, Aiden
- Track completion dates

✅ **Allergen Library**
- Track supplier allergen specs by version and date
- Auto-calculate "Current" (≤30 days) vs "Overdue" status
- Store document links

✅ **Dashboard**
- Hygiene compliance percentage
- Recent checks summary
- Connection status indicator

✅ **Mobile-First Design**
- Fully responsive (375px phone → 768px tablet → 1024px desktop)
- Hamburger ☰ navigation drawer
- Touch-friendly buttons (min 44px height)
- Bilingual English/中文 labels throughout
- Navy (#001F3F), Gold (#B8860B), Ivory (#F5F5F5) branding

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Navigation
- **CSS3** - Mobile-first responsive styling
- **Vercel** - Free hosting

## Getting Started

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version recommended)

### 2. Set Up Project
```bash
cd mielle-kitchen-app
npm install
```

### 3. Update Logo URL
In `src/components/Header.jsx` (line 23), replace with your Google Drive image URL:
```jsx
src="https://drive.google.com/uc?id=YOUR_FILE_ID"
```

### 4. Run Locally
```bash
npm start
```
Opens at http://localhost:3000

### 5. Deploy to Vercel
See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions

## Project Structure

```
mielle-kitchen-app/
├── public/
│   └── index.html
├── src/
│   ├── components/       # React components
│   ├── styles/          # CSS files
│   ├── App.jsx          # Main app routing
│   └── index.jsx        # Entry point
├── package.json
└── DEPLOYMENT.md        # Deployment guide
```

## Usage

### Home Page
- Select staff member
- View last hygiene check
- Quick access to all features

### Hygiene Checklist
1. Select staff
2. Enter temperatures for each freezer/fridge
3. Check cleaning & allergen labels
4. Add optional notes
5. Click SUBMIT

**Temperature Status:**
- ✓ Green: Within target
- ⚠️ Yellow: Warning range
- 🔴 Red: Out of specification

### Staff Training
1. Select staff member
2. Check training topics completed
3. Add notes (optional)
4. Click LOG TRAINING

### Allergens
1. Add supplier name
2. Enter version (e.g., v1.0)
3. Set update date
4. (Optional) Add document link
5. System auto-calculates status

### Dashboard
- View compliance metrics
- Check recent activity
- Monitor online/offline status

## Data Storage

Every entry is saved on the device (localStorage, survives refresh) **and**
pushed to the **Mielle Kitchen Data** Google Sheet so all phones write to
one central record. If a device is offline the entry is queued and sent
automatically next time the app loads with signal.

**Set up the Google Sheet link (one-time, ~5 min):** see
[GOOGLE_SHEETS_INTEGRATION.md](./GOOGLE_SHEETS_INTEGRATION.md). Until the
script URL is added in `src/config.js`, entries simply queue on the device.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Bilingual Support

All labels, buttons, and menus support English and Traditional Chinese (繁體中文).

To switch language at runtime, components can be updated to accept a `language` prop.

## Known Limitations

- No authentication/user login yet
- Per-device in-app history (Dashboard/Recent) is local to each device; the
  Google Sheet is the shared master record across all devices
- Reading history back into the app from the Sheet is not wired up yet
  (writes are)

## Future Features

- Google Sheets real-time sync
- User authentication
- Email alerts for temp failures
- Multi-location support
- PDF reports export

## Branding

- **Colors:** Navy #001F3F, Gold #B8860B, Ivory #F5F5F5
- **Font:** Calibri, Arial (system fonts, no custom fonts)
- **Logo:** Located in Google Drive (update URL in Header.jsx)

## Support

For help with:
- **Deployment:** See DEPLOYMENT.md
- **React issues:** https://reactjs.org/docs
- **Styling:** Check CSS files in src/styles/
- **Features:** Review component files in src/components/

## License

Internal use only - Mielle Patisserie Ltd

---

**Version:** 1.0.0  
**Last Updated:** June 2026  
**Environment:** Mobile-first, Responsive, Progressive Web App ready
