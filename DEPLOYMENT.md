# Mielle Kitchen App - Deployment Guide

## Quick Start: Deploy to Vercel (FREE)

### Step 1: Prepare Your Google Drive Logo URL

1. Upload your Mielle logo to Google Drive
2. Right-click → Share → Change to "Anyone with link"
3. Copy the shareable link
4. Extract the FILE ID from the URL:
   ```
   https://drive.google.com/file/d/[FILE_ID_HERE]/view?usp=sharing
   ```
5. Your image URL becomes:
   ```
   https://drive.google.com/uc?id=[FILE_ID_HERE]
   ```

**Then update in Header.jsx** (line 23):
```jsx
src="https://drive.google.com/uc?id=YOUR_ACTUAL_FILE_ID"
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# 1. Install Node.js from nodejs.org if you haven't

# 2. Open Terminal/Command Prompt and navigate to the app folder:
cd path/to/mielle-kitchen-app

# 3. Install dependencies:
npm install

# 4. Install Vercel CLI:
npm install -g vercel

# 5. Deploy:
vercel

# 6. Follow the prompts - choose default settings
# Your app will be live at: https://mielle-kitchen-app.vercel.app
```

#### Option B: GitHub + Vercel Web (Even Easier)
1. Create a GitHub account (free at github.com)
2. Create a new repository
3. Upload all files from mielle-kitchen-app folder
4. Go to vercel.com and sign in with GitHub
5. Click "New Project" → select your repository
6. Click "Deploy"
7. Done! Your app is live.

### Step 3: Configure Google Sheets Integration

**IMPORTANT:** The app currently logs data to the browser console. To connect to Google Sheets, you'll need to:

1. Create a Google Apps Script as a "doGet" endpoint
2. Update the app to POST data to that endpoint

See "GOOGLE_SHEETS_INTEGRATION.md" for detailed instructions.

### Step 4: Access Your App

- **Desktop:** https://your-app-name.vercel.app
- **Mobile:** Open the URL on any phone's browser
- **Create shortcut:** On iOS/Android, add to home screen for app-like experience

---

## File Structure

```
mielle-kitchen-app/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── components/         # All React components
│   │   ├── App.jsx
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── Home.jsx
│   │   ├── HygieneChecklist.jsx
│   │   ├── StaffTraining.jsx
│   │   ├── Allergens.jsx
│   │   └── Dashboard.jsx
│   ├── styles/            # All CSS files
│   │   ├── App.css
│   │   ├── Header.css
│   │   ├── Navigation.css
│   │   ├── Home.css
│   │   ├── HygieneChecklist.css
│   │   ├── StaffTraining.css
│   │   ├── Allergens.css
│   │   └── Dashboard.css
│   └── index.jsx          # React entry point
├── package.json           # Dependencies
└── DEPLOYMENT.md          # This file
```

---

## Troubleshooting

### Logo not showing?
- Check the Google Drive URL is correct
- Make sure it's shared as "Anyone with link"
- Test the URL directly in browser to ensure it works

### Data not saving?
- Currently data saves to browser localStorage only
- See "GOOGLE_SHEETS_INTEGRATION.md" to connect to Google Sheets

### App not loading?
- Clear browser cache (Ctrl+Shift+Delete)
- Try on a different browser
- Check Vercel deployment logs at vercel.com

---

## Next Steps

1. ✅ Deploy app to Vercel
2. Test on phone/tablet
3. Update Google Drive logo URL in Header.jsx
4. Follow "GOOGLE_SHEETS_INTEGRATION.md" to connect Google Sheets
5. Train staff on using the app

---

## Support

For issues with:
- **Vercel:** Visit vercel.com support
- **React:** See reactjs.org docs
- **Google Sheets:** See GOOGLE_SHEETS_INTEGRATION.md

Questions? Ask!
