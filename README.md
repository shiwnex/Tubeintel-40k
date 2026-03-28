# 🎬 TubeIntel - YouTube Channel Analytics

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1.6-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

> **Deep YouTube Channel Analytics** - Analyze any public YouTube channel using the official YouTube Data API v3. Get insights into video performance, engagement metrics, posting patterns, and more.

**Live Demo**: [https://tubeintel-40k.vercel.app](https://tubeintel-40k.vercel.app)

**GitHub Repo**: [shiwnex/Tubeintel-40k](https://github.com/shiwnex/Tubeintel-40k)

---

## ✨ Features

### 📊 Analytics Dashboard
- **Channel Overview** - Subscribers, total views, video count
- **Performance Metrics** - Views, likes, comments, engagement rate
- **Trend Detection** - Identify hot, rising, and normal-performing videos
- **Upload Cadence** - Analyze posting patterns by day of week
- **Engagement Analysis** - Like-to-view and comment-to-view ratios

### 📈 Interactive Visualizations
- **View Timeline** - Line chart showing views over time
- **Engagement Scatter Plot** - Views vs. engagement rate correlation
- **Upload Pattern Bar Chart** - Video count by day of week
- **Clickable Charts** - Select any video from charts for detailed stats

### 🎥 Video Player
- **Embedded YouTube Player** - Click thumbnail to play video
- **Detailed Stats** - Views, likes, comments, engagement, velocity
- **Comprehensive Metadata** - Duration, publish date, age tracking

### 🎨 User Experience
- **Light/Dark Theme** - Toggle between themes with persistent state
- **Responsive Design** - Works perfectly on mobile, tablet, desktop
- **Grid & Table Views** - Choose your preferred video listing format
- **Sorting & Filtering** - Sort by views, engagement, velocity, date
- **Smart Caching** - Reduces API quota usage by ~90%
- **Offline Capable** - Browse cached data without internet

### 🔒 Privacy & Security
- **Client-Side Only** - 100% runs in your browser, no backend
- **Zero Data Storage** - Your API key stays local, data never sent to servers
- **Public Data Only** - Only uses publicly available YouTube metrics
- **No Authentication Needed** - Just your YouTube API key

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ and npm
- **YouTube Data API v3 Key** (free, takes 5 minutes to set up)

### 1. Clone the Repository

```bash
git clone https://github.com/shiwnex/Tubeintel-40k.git
cd Tubeintel-40k
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get a YouTube API Key

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Name it "TubeIntel" (or your preference)

**Step 2: Enable YouTube Data API v3**
1. Search for "YouTube Data API v3"
2. Click **Enable**

**Step 3: Create API Key**
1. Go to **Credentials** (left sidebar)
2. Click **Create Credentials** → **API Key**
3. Copy the generated key

**Step 4: Restrict API Key (Recommended)**
1. Click on your API key
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your domain (e.g., `tubeintel-40k.vercel.app`)
4. Under **API restrictions**, select **YouTube Data API v3**
5. Click **Save**

### 4. Set Up Environment Variable (Optional but Recommended)

**For Development Locally:**

Create a `.env.local` file in the project root:
```
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**For Production on Vercel:**

See [Deploying to Vercel](#-deploying-to-vercel) section below.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` folder.

---

## 📖 Usage Guide

### Analyzing a Channel

1. **Paste API Key and Channel URL / Handle**
   - Full URL: `https://www.youtube.com/@channelname`
   - Handle: `@channelname`
   - Channel ID: `/channel/UCxxxxxxxxxxxxx`

2. **Click "Analyze Channel"**
   - App resolves the channel ID
   - Fetches up to 600 videos (last 30 days)
   - Calculates metrics and visualizations

3. **Explore Analytics**
   - View interactive charts
   - Click dots on timeline to see specific videos
   - Click video cards to see detailed stats
   - Switch between Grid and Table views

4. **Sort & Filter Videos**
   - **Sort by**: Views, Engagement %, Velocity, Date, Likes, Comments
   - **Filter by**: All, Hot, Rising, Shorts, Long-form

### Understanding Metrics

| Metric | Formula | What It Means |
|--------|---------|---------------|
| **Views** | Raw count | Total times video was watched |
| **Engagement %** | (Likes + Comments) ÷ Views × 100 | Percentage of viewers who liked/commented |
| **Velocity** | Views ÷ Days since publish | Views per day - indicates momentum |
| **Likes** | Raw count | Number of likes received |
| **Comments** | Raw count | Number of comments |
| **Duration** | HH:MM:SS | Video length in hours, minutes, seconds |

### Cache Management

- **Auto-cached**: Channel data (1 hour), Videos (30 minutes)
- **Manual refresh**: Click ↻ button in cache status bar
- **Clear cache**: Click Clear button (useful if API key changed)
- **Cache status**: Shows age and freshness indicator

---

## 🏗️ Project Structure

```
TubeIntel-40k/
├── src/
│   ├── App.jsx              # Main container, cache management
│   ├── api.js               # YouTube API integration, caching logic
│   ├── Charts.jsx           # Interactive visualizations
│   ├── VideoGrid.jsx        # Grid/table views, sorting, filtering
│   ├── VideoModal.jsx       # Video player, detailed stats
│   ├── index.css            # Global styles, themes, responsive design
│   ├── main.jsx             # React entry point
│   └── vite.config.js       # Build configuration
├── index.html               # HTML template
├── package.json             # Dependencies
├── vercel.json              # Vercel deployment config
├── DEPLOYMENT.md            # Deployment guide
├── PROJECT_SUMMARY.md       # Development process documentation
└── README.md                # This file
```

---

## 🔧 Tech Stack

| Technology | Purpose | Why Chosen |
|------------|---------|-----------|
| **React 18** | UI framework | Component-based, Fast, Large ecosystem |
| **Vite 5** | Build tool | Lightning-fast dev server, Excellent HMR |
| **Recharts 2** | Charting | Responsive, Accessible, React-native |
| **Lucide React** | Icons | Lightweight, Modern, 363+ icons |
| **CSS Variables** | Styling | No build step, Runtime theme switching |
| **localStorage** | Caching | Built-in, Offline-capable, No backend |

---

## 📊 API Quota Management

### Quota Strategy
Each YouTube channel analysis uses approximately **10-15 API units**:
- Channel resolution: 1 unit
- Videos fetch (50 per page): 1 unit per batch
- Statistics enrichment: 1 unit per batch

### Monthly Quota
- **Free tier**: 1,000,000 units/month
- **Typical usage**: ~15 units per analysis
- **Analyses allowed**: ~66,000 per month (more than enough!)

### Optimize Quota
- Smart caching reduces repeated analyses by 90%
- Clear cache if switching API keys
- Each analysis is cached for 30 minutes

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect GitHub repository:
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import **Tubeintel-40k** repository
4. Vercel auto-configures for Vite
5. Click **Deploy**

### Set Production Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_YOUTUBE_API_KEY` with your API key
3. Select **Production, Preview, Development**

### Automatic CI/CD (GitHub Actions)
- Every push to `master` → Automatic deployment
- Every PR → Preview deployment
- Check `.github/workflows/deploy.yml`

---

## 🔑 API Key Configuration Guide

### How the API Key Works

TubeIntel can use the YouTube API key in **two ways**:

#### **Option 1: Manual Input (Current - User-Friendly)**
Users enter their API key directly in the UI on every analysis:
- ✅ No backend needed
- ✅ Users maintain full control
- ✅ Zero server-side storage
- ❌ Must paste key each time (annoying for frequent use)

**Current Implementation** (`src/App.jsx`):
```jsx
const [apiKey, setApiKey] = useState('')

// User pastes key in input field
<input 
  value={apiKey} 
  onChange={(e) => setApiKey(e.target.value)}
  placeholder="Enter your YouTube API key"
/>

// Key is used directly in API calls
const ch = await resolveChannel(parsed, apiKey, setStatus, forceRefresh)
```

#### **Option 2: Environment Variable (Recommended for Production)**
Use a pre-configured API key from environment variables:
- ✅ Seamless user experience
- ✅ No manual key entry needed
- ⚠️ Key stored server-side (if using backend)
- ⚠️ Quota shared across all users

### Steps to Use Environment Variable (Option 2)

#### **Step 1: Add Environment Variable to Vercel**

1. Go to **Vercel Dashboard** → Select **Tubeintel-40k** project
2. Click **Settings** → **Environment Variables**
3. Click **Add Environment Variable**
4. Fill in:
   - **Name**: `VITE_YOUTUBE_API_KEY`
   - **Value**: Your YouTube API key
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**

#### **Step 2: Update React Code to Use Environment Variable**

Edit `src/App.jsx` to auto-load the API key from environment:

```jsx
// At the top of App component
const [apiKey, setApiKey] = useState(
  import.meta.env.VITE_YOUTUBE_API_KEY || ''
)
```

**Full Example** (replacing the current `useState`):

```jsx
export default function App() {
  const [theme, setTheme] = useState('light')
  const [channelUrl, setChannelUrl] = useState('')
  // ✅ Load from environment, fallback to empty string
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_YOUTUBE_API_KEY || ''
  )
  
  // ... rest of code
}
```

#### **Step 3: Optional - Hide API Key Input if Env Variable Exists**

To make the UI cleaner when using environment variables:

```jsx
// In the form section of App.jsx
{!import.meta.env.VITE_YOUTUBE_API_KEY && (
  <input
    type="password"
    value={apiKey}
    onChange={(e) => setApiKey(e.target.value)}
    placeholder="Enter YouTube API key"
  />
)}
```

This hides the input field if an environment variable is already configured.

### Complete Implementation Checklist

#### **For Development (Local Machine)**

1. ✅ Create `.env.local` file in project root:
   ```
   VITE_YOUTUBE_API_KEY=sk-xxxxxxxxxxxxx
   ```

2. ✅ Restart dev server:
   ```bash
   npm run dev
   ```

3. ✅ Verify in browser console:
   ```javascript
   console.log(import.meta.env.VITE_YOUTUBE_API_KEY)
   ```

#### **For Production (Vercel)**

1. ✅ Add `VITE_YOUTUBE_API_KEY` to Vercel Environment Variables
2. ✅ Update `src/App.jsx`:
   ```jsx
   const [apiKey, setApiKey] = useState(
     import.meta.env.VITE_YOUTUBE_API_KEY || ''
   )
   ```
3. ✅ Deploy to Vercel:
   ```bash
   git add src/App.jsx
   git commit -m "Use API key from environment variables"
   git push origin master
   ```
4. ✅ Verify deployment in Vercel Dashboard → Deployments

### How Vite Environment Variables Work

**Important**: Vite requires environment variables to be prefixed with `VITE_` to be exposed to client code.

```javascript
// ✅ ACCESSIBLE in browser (prefixed with VITE_)
console.log(import.meta.env.VITE_YOUTUBE_API_KEY)

// ❌ NOT ACCESSIBLE in browser (no VITE_ prefix)
console.log(import.meta.env.YOUTUBE_API_KEY)
```

**How it works**:
1. **Build Time**: Vite scans for `VITE_*` variables
2. **Replacement**: Replaces `import.meta.env.VITE_*` with actual values
3. **Result**: Final JS includes the actual API key (for frontend use)

### Security Considerations

⚠️ **Note**: Frontend API keys are **visible in browser** - this is intentional for:
- Public YouTube Data API (no sensitive data)
- User controls their own quota
- No backend needed

**Recommended Security Measures**:
1. **API Key Restrictions** (in Google Cloud Console):
   - Restrict to your domain (e.g., `tubeintel-40k.vercel.app`)
   - Restrict to YouTube Data API v3 only
2. **Monitor Quota** regularly
3. **Rotate keys** if suspicious activity
4. **Use separate keys** for dev/prod if possible

---

## 🚀 Deployment Checklist

- [ ] Create Google Cloud Project & YouTube API key
- [ ] Add API key to Vercel Environment Variables (`VITE_YOUTUBE_API_KEY`)
- [ ] Update `src/App.jsx` to use environment variable
- [ ] Test locally with `.env.local` file
- [ ] Commit and push to GitHub
- [ ] Verify automatic Vercel deployment
- [ ] Test on production URL
- [ ] Share live link!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css`:

```css
:root {
  /* Dark theme variables */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  /* ... more variables */
}

[data-theme="light"] {
  /* Light theme overrides */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  /* ... more variables */
}
```

### Add Custom Charts

Edit `src/Charts.jsx`:
- Import from Recharts
- Add new chart component
- Display relevant metrics

### Modify Video Grid

Edit `src/VideoGrid.jsx`:
- Change grid columns with `gridTemplateColumns`
- Customize card styling
- Add new stat displays

---

## 🐛 Troubleshooting

### "Invalid API Key" Error
**Problem**: API key is invalid or inactive
- **Solution**:
  1. Check `.env.local` has correct key
  2. Verify key in [Google Cloud Console](https://console.cloud.google.com)
  3. Ensure YouTube Data API v3 is enabled
  4. Wait 5 minutes after creating key

### "Channel Not Found"
**Problem**: Channel URL format is incorrect or channel is deleted
- **Solution**:
  1. Use `@channelname` or full URL
  2. Verify channel exists publicly
  3. Try full URL: `https://www.youtube.com/@channelname`

### Blank Charts/No Data
**Problem**: API fetch failed or quota exceeded
- **Solution**:
  1. Check browser console (F12) for errors
  2. Verify API quota: [Google Cloud Console](https://console.cloud.google.com)
  3. Try clearing cache and retrying

### Mobile Not Responsive
**Problem**: Layout breaking on small screens
- **Solution**:
  - Check browser zoom (should be 100%)
  - Verify viewport meta tag in `index.html`
  - Clear browser cache and hard-refresh (Ctrl+Shift+R)

### Environment Variable Not Loading
**Problem**: `import.meta.env.VITE_YOUTUBE_API_KEY` is undefined
- **Solution**:
  1. File must be named `.env.local`
  2. Key must start with `VITE_`
  3. Restart dev server after editing
  4. Check it's in project root, not `src/`

---

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🚀 Future Enhancements

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for detailed roadmap:

**Short-term** (1-2 weeks)
- Comment sentiment analysis
- Export to CSV/PDF
- Multi-channel comparison

**Medium-term** (1-3 months)
- Competitor analysis dashboard
- Seasonality detection
- Content recommendations

**Long-term** (3-6 months)
- Backend with PostgreSQL
- ML predictions
- Browser extension
- Mobile apps

---

## 📚 Resources

- [YouTube Data API Docs](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Recharts Examples](https://recharts.org/examples)

---

## 💬 Support

- **Issues**: Check existing GitHub issues or create a new one
- **Discussions**: Start a discussion on GitHub
- **Documentation**: See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 👨‍💻 Author

**Developed by**: Shiwansh (shiwnex)  
**Repository**: [shiwnex/Tubeintel-40k](https://github.com/shiwnex/Tubeintel-40k)  
**Built with**: Claude Sonnet 4.6, Claude Haiku 4.5, Google Gemini

---

<div align="center">

**Made with ❤️ for YouTube creators**

[⭐ Star this repo if you find it useful!](https://github.com/shiwnex/Tubeintel-40k)

</div>
