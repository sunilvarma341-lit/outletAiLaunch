# KiranaGoLive App Launch Page

A professional web landing page for launching your mobile app with configurable countdown timer, QR code, click tracking, and a dedicated configuration panel for reviewers.

## 🚀 Features

### User-Facing Features
- ⏱️ **Configurable Countdown Timer** - Set any duration from 1-60 seconds
- 📱 **QR Code** - Users can scan to download from Play Store (can be toggled)
- 🎯 **Manual Launch Button** - Users can launch immediately
- 🔄 **Smart Deep Linking** - Tries app deep link first, then falls back to Play Store
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🌓 **Dark Mode Support** - Adapts to user's system preferences

### Admin/Reviewer Features
- ⚙️ **Configuration Panel** - Separate admin interface at `/config`
- 🎛️ **All Settings Configurable** - No code changes needed
- 📊 **Real-time Analytics Dashboard** - Track all user interactions
- 📈 **Statistics & Insights** - Understand user behavior
- 💾 **Export/Download Data** - Get CSV reports for review
- 🔍 **Recent Activity Log** - See latest 10 interactions

## 📋 Quick Start

```
┌─────────────────────────────────────┐
│         [App Logo]                  │
│                                     │
│      KiranaGoLive                   │
│   Your Digital Store Assistant      │
│                                     │
│   Launching your app in             │
│          ⭕ 5                        │
│                                     │
│   [ Open App Now ]                  │
│                                     │
│   ─────────────────────             │
│   Or scan to download               │
│   [QR Code]                         │
│   Available on Google Play Store    │
│                                     │
│   View in Play Store →              │
└─────────────────────────────────────┘
```

## 📋 How It Works

1. **User opens the webpage**
   - 5-second countdown starts automatically
   - Animated countdown circle shows progress

2. **User has 3 options:**
   - Wait for auto-launch (countdown reaches 0)
   - Click "Open App Now" button
   - Scan QR code or click direct link

3. **App Launch Flow:**
   ```
   Try Deep Link: kiranagolive://home
        ↓
   If fails (app not installed)
        ↓
   Redirect to Play Store
   ```

4. **All interactions are tracked** for review

## 🛠️ Setup & Development

### Run Development Server

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📊 Tracking & Analytics

### What Gets Tracked?

Every interaction is logged with:
- **Source**: `auto`, `manual`, or `direct-link`
- **Timestamp**: When the action occurred
- **Countdown**: Time remaining when user clicked (if manual)

### Viewing Analytics

Open browser console (F12) and use:

```javascript
// Get statistics
window.kiranaAnalytics.getStats()
// Returns:
// {
//   total: 25,
//   manual: 15,
//   auto: 8,
//   directLink: 2,
//   byDate: { "6/24/2026": 25 },
//   averageCountdown: "3.20"
// }

// View all launches
window.kiranaAnalytics.getLaunches()

// Download CSV report
window.kiranaAnalytics.download()

// Clear all data
window.kiranaAnalytics.clear()
```

### CSV Export

Download a CSV file with all tracking data:

```javascript
window.kiranaAnalytics.download()
```

The CSV includes:
- Source (auto/manual/direct-link)
- Full timestamp
- Countdown remaining
- Date and time

### Example Analytics Data

```json
[
  {
    "source": "manual",
    "timestamp": "2026-06-24T10:30:45.123Z",
    "countdown": 3
  },
  {
    "source": "auto",
    "timestamp": "2026-06-24T10:31:12.456Z",
    "countdown": 0
  },
  {
    "source": "direct-link",
    "timestamp": "2026-06-24T10:32:00.789Z"
  }
]
```

## 🔧 Customization

### Update App Link

Edit [AppLaunch.jsx](src/AppLaunch.jsx):

```javascript
const PLAY_STORE_URL = "YOUR_PLAY_STORE_URL";
```

### Change Deep Link

```javascript
window.location.href = "your-app://home";
```

### Adjust Countdown Duration

```javascript
const [countdown, setCountdown] = useState(5); // Change to 3, 10, etc.
```

### Replace App Logo

Replace the SVG in [AppLaunch.jsx](src/AppLaunch.jsx) or add your own image:

```jsx
<img src="/your-logo.png" alt="KiranaGoLive" />
```

### Customize Colors

Edit [AppLaunch.css](src/AppLaunch.css):

```css
.launch-container {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

## 🎯 User Behavior Insights

The tracking helps you understand:

- **Conversion Rate**: How many users click vs wait?
- **User Patience**: Average countdown when users click manually
- **Peak Times**: When are users most active?
- **Popular Actions**: Which method do users prefer?

### Example Analysis

If most users click at countdown=4 or 5, they're impatient → Consider shorter countdown or instant launch option.

If most launches are "auto", users trust the countdown → Current UX is working well.

## 📱 Testing

### Test Deep Link

1. Build and deploy the web page
2. Open on mobile device with app installed
3. Should open your app directly

### Test Fallback

1. Open on device without app installed
2. Should redirect to Play Store after 1.5 seconds

### Test QR Code

1. Scan QR code with phone camera
2. Should open Play Store link

## 🚀 Deployment

### Deploy to Vercel/Netlify

```bash
npm run build
# Upload dist/ folder
```

### Update Deep Link

Make sure your app handles:
```
kiranagolive://home
```

Or use Universal Links:
```
https://app.kiranagolive.com
```

## 📝 Notes

- Data is stored in **localStorage** (persists across sessions)
- Data is **local to each device/browser**
- For production analytics, consider:
  - Google Analytics
  - Mixpanel
  - PostHog
  - Custom backend API

## 🔒 Privacy

All tracking is **client-side only** and stored in browser's localStorage. No data is sent to external servers from this code.

To integrate with analytics service:

```javascript
// In handleAppLaunch function
analytics.track('app_launch', {
  source: source,
  countdown: countdown
});
```

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Play Store URL is correct
3. Test deep link on actual device
4. Check localStorage in DevTools

## ✨ Enhancement Ideas

- Add app screenshots carousel
- Show app features/benefits
- Add social proof (ratings, downloads)
- Include app demo video
- Add "Coming Soon to iOS" banner
- Email capture before launch
- Share buttons for social media
- Multi-language support

---

**Built with React + Vite** ⚡
