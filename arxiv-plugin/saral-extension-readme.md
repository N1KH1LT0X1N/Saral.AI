# SARALify - Chrome Extension

Browser extension for generating video explanations and podcasts from research papers directly on arXiv and other preprint servers.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Sites](#supported-sites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Overview

SARALify is a Chrome/Edge extension that adds a "SARALify" button to research paper pages on arXiv and other preprint servers. With one click, you can generate:
- 🎥 **Video explanations** - Educational videos with AI narration
- 🎧 **Podcasts** - Two-voice dialogue discussions

The extension integrates with the SARAL AI backend to process papers and deliver content directly in your browser.

---

## Features

| Feature | Description |
|---------|-------------|
| **One-Click Processing** | Generate content without leaving the paper page |
| **Format Selection** | Choose between Video or Podcast output |
| **Language Support** | English and Hindi narration |
| **Progress Tracking** | Real-time status updates during generation |
| **Direct Download** | Download generated content immediately |
| **Multi-Site Support** | Works on 7+ preprint servers |
| **Manifest V3** | Modern Chrome extension architecture |

---

## Supported Sites

| Site | URL Pattern | Status |
|------|-------------|--------|
| **arXiv** | `arxiv.org/abs/*` | ✅ Full support |
| **bioRxiv** | `biorxiv.org/content/*` | ✅ Full support |
| **medRxiv** | `medrxiv.org/content/*` | ✅ Full support |
| **chemRxiv** | `chemrxiv.org/article-details/*` | ✅ Full support |
| **EarthArXiv** | `eartharxiv.org/repository/*` | ✅ Full support |
| **SocArXiv (OSF)** | `osf.io/preprints/socarxiv/*` | ✅ Full support |
| **Preprints.org** | `preprints.org/manuscript/*` | ✅ Full support |

---

## Installation

### From Source (Developer Mode)

1. **Download the Extension**
   - Clone or download the repository
   - Locate the `arxiv-plugin` folder

2. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch (top right)

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `arxiv-plugin` folder

5. **Verify Installation**
   - The SARALify extension should appear in the list
   - Pin it to the toolbar for easy access

### From Chrome Web Store

Coming soon.

---

## Usage

### Generating Content

1. **Navigate to a Paper**
   - Go to any supported paper page
   - Example: `https://arxiv.org/abs/2301.12345`

2. **Click SARALify Button**
   - A "SARALify" button appears on the page
   - Click to open the options modal

3. **Choose Format**
   - 🎥 **Video** - Educational video with slides
   - 🎧 **Podcast** - Two-voice dialogue discussion

4. **Select Language**
   - 🇺🇸 **English** - English narration
   - 🇮🇳 **Hindi** - Hindi narration

5. **Wait for Processing**
   - Progress indicator shows current status
   - Processing typically takes 2-5 minutes

6. **Download or Watch**
   - Video opens in a modal player
   - Download button saves to your device

### Button States

| State | Appearance | Meaning |
|-------|------------|---------|
| Ready | "SARALify" | Click to start |
| Processing | Progress bar | Generation in progress |
| Complete | "✓ Done" | Ready to view/download |
| Error | "⚠ Error" | Click to retry |

---

## Configuration

### Backend URL

By default, the extension connects to the deployed SARAL AI backend. To use a local backend:

1. Open `service_worker.js`
2. Modify the `API_BASE` constant:

```javascript
// Production (default)
const API_BASE = 'https://canvas.iiit.ac.in/saralbe/api/papertovideo';

// Local development
const API_BASE = 'http://localhost:8000/api/papertovideo';
```

### Podcast Backend

For standalone podcast generation, the extension can use the lightweight Flask backend in `podcast_backend/`. See [Podcast Backend README](podcast_backend/README.md) for setup.

---

## Architecture

### Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration (MV3) |
| `content_script.js` | Page injection and UI |
| `service_worker.js` | Background processing and API calls |
| `styles.css` | Extension styles |

### Flow

```
User clicks SARALify button
        ↓
content_script.js shows options modal
        ↓
User selects format and language
        ↓
content_script.js sends message to service_worker.js
        ↓
service_worker.js calls SARAL AI backend
        ↓
Backend processes paper and returns video/podcast
        ↓
service_worker.js sends result back
        ↓
content_script.js shows video modal or triggers download
```

### Manifest V3 Features

- **Service Worker** - Replaces background pages for better performance
- **Content Scripts** - Injected into matching pages
- **Host Permissions** - Explicit permissions for API access
- **Storage API** - For settings persistence

---

## Development

### Prerequisites

- Chrome/Edge browser
- Text editor (VS Code recommended)
- Local SARAL AI backend (optional)

### Making Changes

1. Edit source files
2. Go to `chrome://extensions/`
3. Click refresh icon on SARALify extension
4. Reload the paper page

### Debugging

**Content Script:**
- Open DevTools on paper page (F12)
- Check Console for `[content_script]` logs

**Service Worker:**
- Go to `chrome://extensions/`
- Click "Service worker" link on extension
- Opens DevTools for background script

### Adding New Site Support

1. Add URL pattern to `manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": ["https://newsite.org/paper/*"],
      "js": ["content_script.js"],
      "css": ["styles.css"]
    }
  ]
}
```

2. Add host permission:

```json
{
  "host_permissions": [
    "https://newsite.org/*"
  ]
}
```

3. Add paper ID extraction in `content_script.js`:

```javascript
function getPaperIdFromUrl() {
  // Add new site pattern
  if (host.includes('newsite.org')) {
    match = path.match(/\/paper\/([^\/\?#]+)/);
    return match ? { id: match[1], site: 'newsite' } : null;
  }
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Button not appearing | Refresh page, check if URL matches supported pattern |
| "Failed to connect" | Check backend URL, ensure server is running |
| Processing stuck | Check browser console for errors, try refresh |
| Download not starting | Check browser download settings, allow downloads |
| Extension not loading | Check for manifest.json errors in extensions page |

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No arxivUrl provided" | Paper ID not detected | Ensure URL matches expected pattern |
| "Network error" | Backend unreachable | Check internet, verify backend URL |
| "429 Too Many Requests" | API quota exceeded | Wait or use different API key |
| "500 Internal Server Error" | Backend error | Check backend logs |

### Resetting Extension

1. Go to `chrome://extensions/`
2. Click "Remove" on SARALify
3. Clear browser cache
4. Reload unpacked extension

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upload_arxiv_to_video` | POST | Create video generation job |
| `/get_video/{job_id}` | GET | Retrieve generated video |
| `/generate-podcast` | POST | Generate podcast audio |

### Request Format

```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345",
  "language": "english"
}
```

### Response Format

```json
{
  "success": true,
  "video_url": "https://...",
  "download_url": "https://..."
}
```

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API documentation
- [Podcast Backend README](podcast_backend/README.md) - Standalone podcast server
- [Frontend README](../frontend/README.md) - Web application


